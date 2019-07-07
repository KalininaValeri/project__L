/* global cegedim*/
$(function() {
  var x0 = 0;
  document.addEventListener('touchstart',function (e) {x0 = e.touches["0"].screenX;})
  document.addEventListener('touchmove',function (e) {
    if (x0 <= e.touches["0"].screenX) {
      // your code by swipe
    }
  })
});
