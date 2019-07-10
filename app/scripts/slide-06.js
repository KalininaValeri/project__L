/* global cegedim*/
$(function() {
    var dataClick = 0;

   var tab = function () {
        if (dataClick === 0) {
            document.getElementsByClassName('state-1')[0].classList.add('active');
            document.getElementsByClassName('state-3')[0].classList.add('active');
            document.getElementsByClassName('state-4')[0].classList.add('active');
        }

       if (dataClick === 1) {
           document.getElementsByClassName('pack')[0].classList.add('active');
       }

       if (dataClick === 2) {
           document.getElementsByClassName('state-2')[0].classList.add('active');
       }

       if (dataClick === 3) {
           document.getElementsByClassName('state-2')[0].classList.remove('active');
       }
       if (dataClick === 4) {
           document.getElementsByClassName('state-1')[0].classList.remove('active');
       }
       if (dataClick === 5) {
           document.getElementsByClassName('state-3')[0].classList.remove('active');
       }

       dataClick = dataClick + 1;
    }

    document.getElementsByClassName('slide-06')[0].addEventListener('click', tab);
});