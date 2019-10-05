/**
 * Created by ArtoCreative on 26.07.2018.
 */

/* global jQuery:{} */
/* global artoUtility:{} */
/* global artoEvents:{} */

var artoBackToTop;

(function( $, undefined ) {

    'use strict';

    artoBackToTop = {

        _initialized: false,

        _itemSelector: '#arto-back-to-top',

        _itemShowSelector: 'arto-back-to-top-show',

        _inScroll: false,

        $_item: undefined,

        init: function() {

            if ( artoBackToTop._initialized ) {
                return;
            }

            artoBackToTop.$_item = jQuery( artoBackToTop._itemSelector );

            artoBackToTop._bindEvents();

            artoBackToTop._initialized = true;
        },

        _bindEvents: function() {

            jQuery( 'body').on( 'mousedown touchstart', artoBackToTop._itemSelector, function( event ) {

                event.preventDefault();

                if ( artoBackToTop._inAnimation ) {
                    return;
                }

                artoBackToTop._inAnimation = true;

                artoUtility.scrollUtility.scrollToYPrecise( 0, 2000, 'easeInOutCubic' );

                setTimeout(function() {
                    artoBackToTop._inAnimation = false;
                }, 2000);

            }).on( 'wheel', function( event ) {

                cancelAnimationFrame( artoUtility.currentRequestAnimFrame );

                artoBackToTop._inAnimation = false;

            }).on( 'touchstart', function( event ) {

                if ( jQuery( event.target ).attr( 'id' ) === artoBackToTop._itemSelector ) {
                    return;
                }

                cancelAnimationFrame( artoUtility.currentRequestAnimFrame );

                artoBackToTop._inAnimation = false;
            });
        },

        checkLazyLoadItem: function() {

            if ( artoEvents.windowScrollTop > artoEvents.windowInnerWidth / 2 ) {
                artoBackToTop.$_item.addClass( artoBackToTop._itemShowSelector );
            } else {
                artoBackToTop.$_item.removeClass( artoBackToTop._itemShowSelector );
            }
        }
    };

    artoBackToTop.init();

})( jQuery );
