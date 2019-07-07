/* global cegedim */
'use strict';

function showArea(always) {
  $('.prezentationarea').addClass('show');
  if (!always) {
    setTimeout(function() {
      if ( (localStorage.getItem('prezentationarea') || 'false') === 'false') {
        $('.prezentationarea').removeClass('show');
      }
    }, 5000);
  }
}

function devMessage(text, time) {
  $('.slide-wrap').append('<div class="devmessage">' + text + '</div>');

  $('.devmessage').addClass('show');

  setTimeout(function() {
    $('.devmessage').removeClass('show');
  }, time);
  setTimeout(function() {
    $('.devmessage').detach();
  }, time + 500);
}

$(function() {
  window.parent.cegedim = cegedim;

  var lang = $('body').data('lang');
  var alllangs = $('body').data('alllangs').split(',');
  var screenshot = localStorage.getItem(cegedim.slide.ID + '_screenshot') || 'true';
  var prezentationarea = localStorage.getItem('prezentationarea') || 'false';

  var slides = window.parent.slides;
  var slideHtml = '<ul class="slides_list">';
  for (var i = 0; i < slides.length; i++) {
    slideHtml += '<li style="background-image: url(\'../media/screenshots/'+lang+'/'+slides[i]+'.png\')" data-id='+slides[i]+'></li>';
  }
  slideHtml += '</ul>';

  $('.slide-wrap').append($('<div class="prezentationarea" id="top_area">' +
    '<ul id="buttons">' +
    '<li class="buttons_info"></li>' +
    '<li class="buttons_lock"></li>' +
    '<li class="buttons_translate"></li>' +
    '<li class="buttons_visibility"></li>' +
    '<li class="buttons_slides">'+slideHtml+'</li>' +
    '</ul>' +
    '</div>'));
  $('.slide-wrap').append($('<div class="screenshot" style="background-image: url(\'../media/screenshots/'+lang+'/'+window.parent.getSlideIdByName(cegedim.slide.ID)+'.png\')"></div>'));


  $('.slide-wrap').append($('<div class="prezentationarea" id="bottom_area"></div>'));

  var langs = '<ul>';
  for (var l of alllangs) {
    langs += '<li class="lang_' + l + '">' + l + '</li>';
  }
  langs += '</ul>';
  $('#top_area .buttons_translate').html(langs);
  $('#top_area .lang_' + lang).addClass('active');

  $('#top_area .buttons_translate').on('click', function() {
    $('#top_area .buttons_translate').toggleClass('active');
  });
  $('#top_area .buttons_translate li').on('click', function() {
    var l = $(this).text();

    if (l !== lang) {
      $('#top_area .buttons_translate li.active').removeClass('active');
      $(this).addClass('active');

      lang = l;
      $('.' + lang).removeClass('hide');

      for (l of alllangs) {
        if (lang === l) {
          continue;
        }

        $('.' + l).addClass('hide');
      }
    }
  });

  if (screenshot === 'true') {
    $('.screenshot').show();
  } else {
    $('#top_area .visibility').addClass('off');
    $('.screenshot').hide();
  }
  $('#top_area .buttons_visibility').on('click', function() {
    if (screenshot === 'true') {
      screenshot = 'false';
      $(this).addClass('off');
      $('.screenshot').hide();
    } else {
      screenshot = 'true';
      $(this).removeClass('off');
      $('.screenshot').show();
    }
    localStorage.setItem(cegedim.slide.ID + '_screenshot', screenshot);
  });

  $('#top_area .buttons_slides').on('click', function() {
    $('#top_area .slides_list').toggleClass('active');
  });
  $('#top_area .slides_list li').on('click', function() {
    cegedim.navigation.go(window.parent.getSlideNameById($(this).data('id')), null);
  });

  if (prezentationarea === 'true') {
    $('.prezentationarea').addClass('show');
  } else {
    $('#top_area .buttons_lock').addClass('open');
  }
  $('#top_area .buttons_lock').on('click', function() {
    if (prezentationarea === 'true') {
      prezentationarea = 'false';
      $(this).addClass('open');
      $('.prezentationarea').removeClass('show');
    } else {
      prezentationarea = 'true';
      $(this).removeClass('open');
      $('.prezentationarea').addClass('show');
    }
    localStorage.setItem('prezentationarea', prezentationarea);
  });

  var message = 'Area is reserved! Add data-prevent-tap="true" to your element an to unlock.',
    height = 768,
    topAreaLine = 30,
    bottomAreaLine = height - 60;

  $('html')[0].addEventListener('click', function(e) {
    if (!e.target.dataset.preventTap) {
      if (e.pageY >= bottomAreaLine) {
        devMessage(message, 2000);
        showArea(false);
        return false;
      } else if (e.pageY <= topAreaLine && e.target.offsetParent.id !== 'top_area') {
        e.preventDefault();
        devMessage(message, 2000);
        showArea(false);
        return false;
      }
    }
  }, true);
});
