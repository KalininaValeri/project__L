/* global FastClick, cegedim */
'use strict';

$(function() {
    FastClick.attach(document.body);

    // adding 'flag' for CSS animations
    $(window).load(function() {
        $('.js-slide-wrap').addClass('slide-active');
    });

    // inactivating non-active popup buttons
    (function () {
      var popus_btn = $('[data-popup]');
      for (var i = 0; i < popus_btn.length; i++) {
        var id = popus_btn[i].dataset.popup;
        if (!$('#'+id).length) {
           $(popus_btn[i])[0].classList.add('inactivepopup');
        };
      };
    })();

    // open popup on button click
    $('[data-popup]').click(function() {
      var popup = $('#' + this.dataset.popup);
      // config settings for video popups (if it available)
      if ($(this).data('vidName') && $('video')[0]) {
        $('video')[0].src = $('video').data('src')+$(this).data('vidName');
      }
      // open target popup
      if (popup.length) {
        popup.addClass('active');
        $('.popup-bg').addClass('active');
      }
      return false;
    });

    // close popup on close or bg click
    $('.close, .popup-bg').on('click', function() {
      //if popup contains video - stopping it
      if ($('video')[0]) {
        $('video')[0].pause();
        $('video')[0].currentTime = 0;
      }
      if ($('.active[data-level]')[0]) {
        $('.active[data-level]').removeClass('active');
      } else {
        $('.popup').removeClass('active');
        $('.popup-bg').removeClass('active');
      }
    });

});
