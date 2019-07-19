/* global cegedim*/
$(function() {
    var dataClick = 0;
    var doc = document

    var tab = function () {
        var killer = doc.getElementById('killer');
        var bads = doc.getElementsByClassName('bads');
        var spiders = doc.getElementById('spiders');
        var bitmat = doc.getElementById('bitmat');
        var ys = doc.getElementById('ys');
        var ys2 = doc.getElementById('ys--2');
        var cocs = doc.getElementsByClassName('cock');
        var ysLight = doc.getElementById('ysLight');
        var mackrofag = doc.getElementById('mackrofag');
        var mackrofagYellow = doc.getElementById('mackrofagYellow');

        if (dataClick === 0) {
            killer.classList.add('animate');
            for (var i=0; i < bads.length; i++) {
                bads[i].classList.add('not-active');
            }
        }
        if (dataClick === 1) {
           spiders.classList.add('active');
           bitmat.classList.add('active');
           ys.classList.add('active');
           ys2.classList.add('active');
        }

        if (dataClick === 2) {
            ysLight.classList.add('active');
            mackrofagYellow.classList.add('active');
            for (var j=0; j < cocs.length; j++) {
                cocs[j].classList.add('active');
            }
        }

        if (dataClick === 3) {
            spiders.classList.remove('active');
            ys2.classList.remove('active');
            ys.classList.remove('active');
            mackrofag.classList.add('not-active');
            mackrofagYellow.classList.add('animate');
            ysLight.classList.remove('active');
            for (var k=0; k < cocs.length; k++) {
                cocs[k].classList.remove('active');
            }
        }

        dataClick = dataClick +1;
    }

    document.getElementsByClassName('slide-07')[0].addEventListener('click', tab);

});