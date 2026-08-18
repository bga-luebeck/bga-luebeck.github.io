$(function () {
  // 1. Tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // 2. Reading Progress Bar
  $(window).on('scroll', function () {
    var winScroll = $(window).scrollTop();
    var height = $(document).height() - $(window).height();
    if (height > 0) {
      var scrolled = (winScroll / height) * 100;
      $('#reading-progress').css('width', scrolled + '%');
    }
  });

  // 3. Category Filter
  $('.category-filter-btn').on('click', function () {
    var category = $(this).data('category');
    $('.category-filter-btn').removeClass('active btn-dark').addClass('btn-outline-secondary');
    $(this).removeClass('btn-outline-secondary').addClass('active btn-dark');

    if (category === 'all') {
      $('.post-card-item').fadeIn(200);
    } else {
      $('.post-card-item').hide();
      $('.post-card-item.cat-' + category).fadeIn(200);
    }
  });

  // 4. Web Share API & Copy Fallback
  $('#webShareBtn').on('click', function () {
    var title = $(this).data('title') || document.title;
    var url = $(this).data('url') || window.location.href;

    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch(function (err) {
        console.log('Share canceled/failed:', err);
      });
    } else {
      // Fallback: Copy to Clipboard
      var dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.value = url;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      
      var $btn = $(this);
      var origText = $btn.html();
      $btn.html('<i class="fa fa-check mr-1"></i> Link kopiert!');
      setTimeout(function () {
        $btn.html(origText);
      }, 2500);
    }
  });

  // 5. Lightbox for Images in Post Content
  $('.post-content figure img, .post-content img').addClass('img-clickable').on('click', function () {
    var src = $(this).attr('src');
    var alt = $(this).attr('alt') || '';
    var caption = $(this).siblings('figcaption').text() || alt;

    $('#lightboxImg').attr('src', src);
    $('#lightboxCaption').text(caption);
    $('#imageLightboxModal').modal('show');
  });
});

