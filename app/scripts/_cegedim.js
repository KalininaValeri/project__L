/* global cegedim */
'use strict';

(function(window, document, undefined) {
  var cegedim = {};

  cegedim.pdf = {
    open: function(url, done) {
      if (window.parent.PDFHelper && window.parent.PDFHelper.OpenPDF) {
          window.parent.PDFHelper.OpenPDF(url, window, true);

          if (done) {
            window.parent.bind(this, 'pdfclosed', done);
          }
      } else {
          window.open(url);
      }
    }
  };

  cegedim.flow = (function() {
    function Flow() {
      this.config = {};
    }

    function getNext(next) {
      if (typeof next === 'function') {
        next = next();
      }

      return next;
    }

    function getPrev(prev) {
      if (typeof prev === 'function') {
        prev = prev();
      }

      if (Array.isArray(prev)) {
        prev = prev.map(function(slideID) {
          return [cegedim.presentation.history.lastIndexOf(slideID), slideID];
        }).sort(function(a, b) {
          return b[0] - a[0];
        })[0][1];
      }

      return prev;
    }

    Flow.prototype.init = function(config) {
      this.config = $.extend(this.config, config);


      Object.keys(config).forEach(function(slideID) {
        if (cegedim.slide.ID === slideID) {
          var slideConfig = cegedim.slide.config = config[slideID];

          var next = getNext(slideConfig.next);
          if (next) {
            cegedim.gesture.overrideLeftSwipe(function(e) {
              if (!($(e.gesture.target).parents('.prevent-left-swipe').length || $(e.gesture.target).hasClass('prevent-left-swipe'))) {
                cegedim.navigation.go(next);
              }
            });
          } else if (next === false) {
            cegedim.gesture.disableLeftSwipe();
            cegedim.gesture.defaultLeftSwipePrevented = true;
          }

          var prev = getPrev(slideConfig.prev);
          if (prev) {
            cegedim.gesture.overrideRightSwipe(function(e) {
              if (!($(e.gesture.target).parents('.prevent-right-swipe').length || $(e.gesture.target).hasClass('prevent-right-swipe'))) {
                cegedim.navigation.go(prev, {animation: 'swipeleft'});
              }
            });
          } else if (prev === false) {
            cegedim.gesture.disableRightSwipe();
            cegedim.gesture.defaultRightSwipePrevented = true;
          }
        }
      });
    };

    Flow.prototype.initSequence = function(mostPrev, sequence, mostNext) {
      var config = {};

      sequence.forEach(function(slide, idx) {
        if (slide.hasOwnProperty('id')) {
          config[slide.id] = {
            prev: slide.prev,
            next: slide.next
          };
        } else {
          var prev, next,
              prevSlide = sequence[idx - 1],
              nextSlide = sequence[idx + 1];

          if (prevSlide) {
            prev = prevSlide.hasOwnProperty('id') ? prevSlide.id : prevSlide;
          } else {
            prev = mostPrev;
          }

          if (nextSlide) {
            next = nextSlide.hasOwnProperty('id') ? nextSlide.id : nextSlide;
          } else {
            next = mostNext;
          }

          config[slide] = {
            prev: prev,
            next: next
          };
        }
      });

      cegedim.flow.init(config);
    };

    Flow.prototype.getLastSlideID = function() {
      var history = cegedim.presentation.history;
      if (Array.isArray(history)) {
        return history[history.length - 2];
      }
    };

    return new Flow();
  })();

  cegedim.gesture = (function() {

    function preventDefaultLeftSwipe(prevent) {
      if (arguments.length === 0) {
        prevent = 'true';
      }

      document.getElementsByTagName('body')[0].dataset.preventLeftSwipe = prevent;
    }

    function preventDefaultRightSwipe(prevent) {
      if (arguments.length === 0) {
        prevent = 'true';
      }

      document.getElementsByTagName('body')[0].dataset.preventRightSwipe = prevent;
    }

    var boundCallbacks = {};

    function bind($element, eventName, callback) {
      var callbacks = boundCallbacks[eventName] = boundCallbacks[eventName] || [];

      if (callback === true) {
        $(function() {
          $element.hammer().off(eventName);
          callbacks.forEach(function(callback) {
            $element.hammer().on(eventName, callback);
          });
        });
      } else if (callback === false) {
        $(function() {
          $element.hammer().off(eventName);
        });
      } else {
        callbacks.push(callback);

        $(function() {
          $element.hammer().on(eventName, callback);
        });
      }
    }

    function onSwipeLeft(callback) {
      return bind($('body'), 'swipeleft.slide', callback);
    }

    function onSwipeRight(callback) {
      return bind($('body'), 'swiperight.slide', callback);
    }

    function Gesture() {
      this.leftSwipeOverridden = false;
      this.rightSwipeOverridden = false;
      var dataset = document.getElementsByTagName('body')[0].dataset;
      this.defaultLeftSwipePrevented = (dataset.preventLeftSwipe === 'true');
      this.defaultRightSwipePrevented = (dataset.preventRightSwipe === 'true');
    }

    Gesture.prototype.overrideLeftSwipe = function(callback) {
      preventDefaultLeftSwipe();
      onSwipeLeft(callback);
      this.leftSwipeOverridden = true;
      this.defaultLeftSwipePrevented = true;
    };

    Gesture.prototype.overrideRightSwipe = function(callback) {
      preventDefaultRightSwipe();
      onSwipeRight(callback);
      this.rightSwipeOverridden = true;
      this.defaultRightSwipePrevented = true;
    };

    Gesture.prototype.disableLeftSwipe = function() {
      if (this.leftSwipeOverridden) {
        onSwipeLeft(false);
      } else {
        preventDefaultLeftSwipe();
      }
    };

    Gesture.prototype.disableRightSwipe = function() {
      if (this.rightSwipeOverridden) {
        onSwipeRight(false);
      } else {
        preventDefaultRightSwipe();
      }
    };

    Gesture.prototype.disableSlideSwipe = function() {
      this.disableLeftSwipe();
      this.disableRightSwipe();
    };

    Gesture.prototype.restoreLeftSwipe = function() {
      if (this.leftSwipeOverridden) {
        onSwipeLeft(true);
      } else {
        preventDefaultLeftSwipe(this.defaultLeftSwipePrevented ? 'true' : 'false');
      }
    };

    Gesture.prototype.restoreRightSwipe = function() {
      if (this.rightSwipeOverridden) {
        onSwipeRight(true);
      } else {
        preventDefaultRightSwipe(this.defaultRightSwipePrevented ? 'true' : 'false');
      }
    };

    Gesture.prototype.restoreSlideSwipe = function() {
      this.restoreLeftSwipe();
      this.restoreRightSwipe();
    };

    return new Gesture();
  })();

  function Slide(idx) {
    this.idx = idx;

    function getAttr(attrName) {
      if (idx !== undefined) {
        return cegedim.presentation.sequences[idx][attrName];
      }
    }

    this.ID = getAttr('externalid');
    this.config = {};
  }

  Slide.prototype.data = function(key, val) {
    var data = {};

    if (cegedim.presentation.sequences) {
      var wrappedData = cegedim.presentation.sequences[this.idx].data;
      for (var i = 0, l = wrappedData.length; i < l; i++) {
        var bit = wrappedData[i];
        data[bit.id] = bit.value;
      }
    }

    if (arguments.length === 0) {
      var parsedData = {};

      Object.keys(data).forEach(function(key) {
        if (data[key] !== undefined) {
          parsedData[key] = JSON.parse(data[key]);
        }
      });

      return parsedData;
    }

    if (arguments.length === 1) {
      val = data[key];
      if (val !== undefined) {
        return JSON.parse(val);
      }
      return undefined;
    }

    if (val !== undefined) {
      var stringVal = JSON.stringify(val);

      if (window.parent.addData) {
        window.parent.addData(key, stringVal);
      }

      data[key] = stringVal;

      // console.log('Store data: ' + key + ', ' + stringVal);
    }

    return val;
  };

  cegedim.presentation = (function() {
    function Presentation() {
      if (window.parent.getCurrentPresentation) {
        this._wrapped = window.parent.context.presentations[window.parent.getCurrentPresentation()];
        this._wrapped.__history = this._wrapped.__history || [];
        this.history = this._wrapped.__history;
        this.sequences = this._wrapped.sequences;
      }
    }

    Presentation.prototype.getSlide = function(slideID) {
      if (window.parent.getIndexSequence) {
        var idx = window.parent.getIndexSequence(slideID);
        if (idx !== -1) {
          return new Slide(idx);
        }
      }

      return new Slide();
    };

    return new Presentation();
  })();

  cegedim.slide = (function() {
    if (cegedim.presentation._wrapped) {
      var idx = window.parent.getCurrentSequence();
      if (idx !== -1) {
        var slide = new Slide(idx);
        cegedim.presentation.history.push(slide.ID);
        return slide;
      }
    }

    return new Slide();
  })();

  cegedim.navigation = {
    go: function(slideID, options) {
      options = $.extend({
        animation: 'swiperight'
      }, options);

      setTimeout(function() {
        if (window.parent.navigateToSequence) {
          window.parent.navigateToSequence(slideID, options.animation);
        }
      }, 50);
    }
  };

  window.cegedim = cegedim;

})(window, document);


$(function() {
  $('[data-pdf]').click(function() {
    cegedim.pdf.open($(this).data('pdf'));
    return false;
  });

  $(document).on('click', '[data-navigate]', function() {
    var slideID = $(this).data('navigate');
    cegedim.slide.data('navigate', slideID);
    cegedim.navigation.go(slideID);
    return false;
  });

  $(document).on('click', '[data-navigate-back]', function() {
    var slideID = $(this).data('navigate-back');
    cegedim.slide.data('navigate', slideID);
    cegedim.navigation.go(slideID, {animation: 'swipeleft'});
    return false;
  });
});
