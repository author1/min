/* global jQuery:{} */

var artoTopList;

(function( $, undefined ) {

    'use strict';

    artoTopList = {

        init: function() {
            /* some custom settings */
            var $artoPostTopList = $( '.arto-post-top-list-items' );

            if ( $artoPostTopList.length ) {

                var isRoyalSlider = $artoPostTopList.closest( '.arto-post-top-list-2').length;

                if ( isRoyalSlider ) {

                    var $artoPostTopListNavPrev = $('.arto-post-top-list-nav-prev'),
                        $artoPostTopListNavNext = $('.arto-post-top-list-nav-next'),
                        $artoPostTopListNavNr = $('.arto-post-top-list-nav-nr');

                    $artoPostTopList.royalSlider({
                        // options go here
                        autoHeight: true,
                        loop: true,
                        navigateByClick: false,
                        startSlideId: parseInt(window.artoCurrentTopList.pageNumber, 10)

                        // Deeplinking not good enough - because it uses '#' hash inside, and we need clean pagination
//                        deeplinking: {
//                            // deep linking options go gere
//                            enabled: true,
//                            change: true
//                        }
                    });

                    var artoSlider = $artoPostTopList.data('royalSlider');

                    $artoPostTopListNavPrev.on('click', function () {
                        artoSlider.prev();
                        artoTopList.showSliderPagination();
                    });

                    $artoPostTopListNavNext.on('click', function () {
                        artoSlider.next();
                        artoTopList.showSliderPagination();
                    });

                    artoTopList.showSliderPagination = function () {
                        $artoPostTopListNavNr.find('span').html(( artoSlider.currSlideId + 1 ) + '/' + artoSlider.numSlides);
                    };

                    artoSlider.ev.on('rsAfterSlideChange', function (event) {
                        // triggers after slide change
                        // console.log(event);
                        window.history.pushState("", "", event.currentTarget.currSlide.content.context.attributes['data-url'].value);
                    });

                    artoSlider.ev.on('rsAfterSlideChange', function (event) {
                        // mouse/touch drag end
                        // console.log(event);
                        artoTopList.showSliderPagination();
                    });

                    artoTopList.showSliderPagination();

                    $artoPostTopList.find('.arto-post-top-list-item').show();
                }
            }
        }
    };

    artoTopList.init();

})(jQuery);