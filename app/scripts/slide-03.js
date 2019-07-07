/* global cegedim*/
$(function() {

    var arrItems = document.getElementsByClassName('list__item');
    var arrImags = document.getElementsByClassName('list__img')
    var list = document.getElementById('list');

    list.addEventListener('click', function (event) {
        var numberElement = event.target.getAttribute('data-number-element');
        if (numberElement) {
            for (var i=0; i < arrItems.length; i++) {
                arrItems[i].classList.remove('active');
                arrImags[i].classList.remove('active');

                if (+numberElement === i+1) {
                    arrItems[i].classList.add('active');
                    arrImags[i].classList.add('active');
                }
            }

        }
    });
});