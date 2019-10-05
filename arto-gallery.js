

/* global jQuery:{} */
/* global _:{} */
/* global artoEvents:{} */
/* global artoUtility:{} */

var artoGallery;

( function( $, undefined ) {

    'use strict';

    $(document).ready(function() {

        if ( 'undefined' !== typeof window.artoSettings.postSettings.popupGallery && window.artoSettings.postSettings.popupGallery ) {

            // Run artoGallery only for the following selectors
            $('.arto-content').each(function() {
                var $this = $(this);
                $this.magnificPopup({
                    delegate: 'a.arto-modal-image',
                    type: 'image',
                    image: {
                        titleSrc: function(item) {
                            var caption = '',
                                $figure = item.el.parent( 'figure');
                            if ( $figure.length && $figure.find( 'figcaption').length ) {
                                caption = $figure.find( 'figcaption').html();
                            }
                            return caption;
                        }
                    },
                    closeOnContentClick: true,
                    closeBtnInside: true,
                    //fixedBgPos: false,
                    // Class that is added to popup wrapper and background
                    // make it unique to apply your CSS animations just to this exact popup
                    mainClass: 'mfp-fade mfp-no-margins mfp-with-zoom',
                    gallery: {
                        enabled:true,
                        preload: [0,1], // read about this option in next Lazy-loading section

                        navigateByImgClick: true,

                        arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>', // markup of an arrow button

                        tPrev: 'Previous (Left arrow key)', // title for left button
                        tNext: 'Next (Right arrow key)', // title for right button
                        tCounter: '<span class="mfp-counter">%curr% of %total%</span>' // markup of counter
                    },

                    zoom: {
                        enabled: true, // By default it's false, so don't forget to enable it

                        duration: 300, // duration of the effect, in milliseconds
                        easing: 'ease-in-out', // CSS transition easing function
                    },

                    callbacks: {

                        open: function() {

                            if ( artoEvents.windowInnerWidth > 1140 ) {
                                var magnificPopup = $.magnificPopup.instance;

                                // Do not scroll if the gallery didn't change, or the gallery is at the first opened element
                                if ( 'undefined' !== typeof magnificPopup.artoItemIndex && magnificPopup.currItem.index === magnificPopup.artoItemIndex ) {
                                    return;
                                }

                                if ( magnificPopup.currItem.el.length ) {

                                    var offsetTop = magnificPopup.currItem.el.offset().top;

                                    artoUtility.scrollUtility.scrollToYPrecise( offsetTop - 150, 1000, 'easeInOutCubic' );
                                }
                            }
                        },

                        // Scroll the body content when the gallery change
                        markupParse: function( template, values, item ) {

                            if ( artoEvents.windowInnerWidth > 1140 ) {
                                var magnificPopup = $.magnificPopup.instance;

                                if (magnificPopup.currItem.el.length) {

                                    var offsetTop = magnificPopup.currItem.el.offset().top;

                                    artoUtility.scrollUtility.scrollToYPrecise(offsetTop - 150, 1000, 'easeInOutCubic');
                                }
                            }
                        },

                        close: function() {

                            if ( artoEvents.windowInnerWidth > 1140 ) {
                                var magnificPopup = $.magnificPopup.instance;

                                //console.log(magnificPopup.currItem.index + ' : ' + magnificPopup.artoItemIndex);

                                // Do not scroll if the gallery didn't change, or the gallery is at the first opened element
                                if ( 'undefined' !== typeof magnificPopup.artoItemIndex && magnificPopup.currItem.index === magnificPopup.artoItemIndex ) {
                                    return;
                                }

                                if ( magnificPopup.currItem.el.length ) {

                                    var offsetTop = magnificPopup.currItem.el.offset().top;

                                    artoUtility.scrollUtility.scrollToYPrecise( offsetTop - 150, 1000, 'easeInOutCubic' );
                                }

                                // clear the 'artoIndex' - the first opened element
                                delete $.magnificPopup.instance.artoItemIndex;
                            }
                        }
                    }
                });
            });
        }
    });

})( jQuery );


