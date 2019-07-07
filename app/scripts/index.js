$(function() {
  var items = [];
  var $iframe = $('#slide-frame');
  var selectedItem;

  var slides = {};

  var sequenceName = 'pres';
  var presentationName = 'pres';

  function getSlideNameById(slideID) {
    for (var name in slides) {
      if (slides.hasOwnProperty(name)) {
        if (slides[name] === slideID) {
          return name;
        }
      }
    }
  }

  function getSlideIdByName(name) {
    return slides[name];
  }

  function toSlide(slide) {
    window.location.hash = slide;
    $iframe.prop('src', slide.replace('#', ''));
  }

  window.parent.getCurrentSequence = function() {
    return sequenceName;
  };

  window.parent.getCurrentPresentation = function() {
    return presentationName;
  };

  window.parent.addData = function(key, stringVal) {
    window.parent.context.presentations[presentationName].sequences[sequenceName].data.push({
      id: key,
      value: stringVal
    });
  };

  window.parent.navigateToSequence = function(slideID, options) {
    window.parent.context.presentations[presentationName].sequences[sequenceName].externalid = slideID;
    toSlide('#' + slides[slideID] + '.html');
  };

  // Init
  window.parent.context = {
    'presentations': {}
  };
  window.parent.context.presentations[presentationName] = {
    '__history': [],
    'sequences': {}
  };
  window.parent.context.presentations[presentationName].sequences[sequenceName] = {
    'externalid': '',
    'data': []
  };

  window.parent.getSlideNameById = getSlideNameById;
  window.parent.getSlideIdByName = getSlideIdByName;

  var lang = $('body').data('lang');

  $.ajax({
    url: '/slides.' + lang + '.json',
    dataType: 'json',
    type: 'get',
    cache: false,
    async: false,
    success: function(data) {
      window.parent.slides = [];
      for (var key in data) {
        window.parent.slides.push(key);
        slides[data[key][0]] = key;
        for (var i in data[key]) {
          slides[data[key][i]] = key;
        }
      }

      var sID = window.location.hash.replace('#', '').replace('.html', '');
      window.parent.context.presentations[presentationName].sequences[sequenceName].externalid = getSlideNameById(sID);
    }
  });

  var item = window.location.hash || '#slide-00.html';
  toSlide(item);

  $(window).on('hashchange', function() {
    var item = window.location.hash || '#slide-00.html';
    toSlide(item);
  });

  function initKeyboardNav() {
    var arrowLeft = 37;
    var arrowRight = 39;
    var keyZ = 90;
    var keyX = 88;

    function keydownHandler(e) {
      if (e.keyCode === arrowLeft || e.keyCode === keyZ) {
        // Prev slide
        if (window.parent.cegedim.slide.config.prev) {
          window.parent.navigateToSequence(window.parent.cegedim.slide.config.prev);
        }

      } else if (e.keyCode === arrowRight || e.keyCode === keyX) {
        // Next slide
        if (window.parent.cegedim.slide.config.next) {
          window.parent.navigateToSequence(window.parent.cegedim.slide.config.next);
        }
      }
    }

    $('body').keydown(keydownHandler);
    $iframe.on('load', function() {
      $(document.getElementById('slide-frame').contentWindow).keydown(keydownHandler);
    });
  }

  initKeyboardNav();
});
