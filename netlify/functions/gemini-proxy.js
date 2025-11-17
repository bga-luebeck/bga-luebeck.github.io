// Netlify Function (Node.js) zur sicheren Weiterleitung von Anfragen an die Gemini API.
// DIESER CODE LÄUFT AUF DEM SERVER VON NETLIFY und HÄLT DEN API_KEY GEHEIM.

const fetch = require('node-fetch');

// Die Netlify Function empfängt die Anfrage vom Frontend
exports.handler = async (event) => {
    // Stellen Sie sicher, dass es sich um eine POST-Anfrage handelt
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Methode nicht erlaubt' };
    }

    // Holen Sie den API-Schlüssel aus der Umgebungsvariable (sicher auf Netlify gespeichert)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return { statusCode: 500, body: 'Serverfehler: API-Schlüssel fehlt.' };
    }

    try {
        // Der Body enthält die Daten (userQuery, systemInstruction) aus dem Frontend
        const { userQuery, systemInstruction, eventTitle, eventDate, eventType } = JSON.parse(event.body);

        // Erstellen des spezifischen System-Prompts und der Nutzer-Query (wie im Frontend)
        const systemPrompt = "Du bist ein historischer Analytiker, spezialisiert auf die Geschichte des Antisemitismus und seine moderne Relevanz. Antworte in klarem, sachlichem Deutsch. Dein Ziel ist es, historische Zusammenhänge respektvoll und lehrreich zu erklären. Die Antwort sollte kurz und auf den Punkt sein (max. 4 Sätze).";
        let finalUserQuery = '';

        if (eventType === 'relevance') {
            finalUserQuery = `Erkläre kurz (max. 4 Sätze), welche historischen Lektionen oder welche aktuelle Relevanz das Ereignis '${eventTitle}' vom ${eventDate} heute für den Kampf gegen Antisemitismus hat. Nutze Google Search Grounding für aktuelle Bezüge.`;
        } else if (eventType === 'comparative') {
            finalUserQuery = `Analysiere kurz (max. 4 Sätze), welche Mechanismen oder Muster des Antisemitismus im Ereignis '${eventTitle}' vom ${eventDate} sichtbar werden und ob es vergleichbare historische oder moderne Phänomene gibt. Nutze Google Search Grounding für aktuelle Bezüge.`;
        } else {
            return { statusCode: 400, body: 'Ungültiger Anfragetyp.' };
        }

        // Gemini API Payload erstellen
        const payload = {
            contents: [{ parts: [{ text: finalUserQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: [{ "google_search": {} }],
        };

        // Aufruf der Google Gemini API
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini API Error:', result);
            return {
                statusCode: result.error?.code || 500,
                body: JSON.stringify({ error: result.error?.message || 'Fehler beim Aufruf der Gemini API.' })
            };
        }

        const resultText = result.candidates?.[0]?.content?.parts?.[0]?.text || "FEHLER: Die KI konnte keine sinnvolle Antwort generieren.";

        // Antwort an das Frontend zurücksenden
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: resultText })
        };

    } catch (error) {
        console.error('Proxy Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Interner Serverfehler beim Verarbeiten der Anfrage.' })
        };
    }
};
