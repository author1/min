/**
 * Created by ArtoCreative on 21.05.2015.
 */

/* global jQuery:{} */
/* global artoViewport:{} */
/* global artoSidebars:{} */

var artoGlobal = {},
    artoEvents = {},
    artoEffect = {},
    artoParallaxHeader = {};

(function( $, undefined ){

    'use strict';

    artoGlobal = {

        /**
         * - the artoGlobal init
         */
        init: function() {
        },


        ARTO_EARLY_TIMER: 100,
        ARTO_LATE_TIMER: 500,

        arto_early_scroll: false,
        arto_early_resize: false,

        arto_late_scroll: false,
        arto_late_resize: false,

        rise_arto_main_events: function() {
            artoGlobal.rise_arto_scroll_events();
            artoGlobal.rise_arto_resize_events();
        },

        rise_arto_scroll_events: function() {
            artoGlobal.arto_early_scroll = true;
            artoGlobal.arto_late_scroll = true;
        },

        rise_arto_resize_events: function() {
            artoGlobal.arto_early_resize = true;
            artoGlobal.arto_late_resize = true;
        },

        recomputeSidebarsAtIntervals: function() {

            if ( artoViewport.beforePreviousInterval > 767 && artoViewport.previousInterval <= 767 ) {

                // console.log( 'to mobile' );

                artoSidebars.forEach( function ( sidebar ) {
                    sidebar.resetPosition();
                    sidebar.resetWidth();
                    sidebar.reposition();
                });

            } else if ( artoViewport.beforePreviousInterval <= 767 && artoViewport.previousInterval > 767 ) {

                // console.log( 'from mobile' );

                artoSidebars.forEach( function ( sidebar ) {
                    sidebar.resetPosition();
                    sidebar.resetWidth();
                    sidebar.recomputeWidth();
                    sidebar.reposition();
                });

            } else {

                artoSidebars.forEach( function ( sidebar ) {
                    sidebar.recomputeWidth();
                });
            }
        },

        /**
         *
         */
        recomputeSidebars: function() {

            // Not for mobile
            if ( artoViewport.previousInterval <= 767 ) {

                // We need only width to be recomputed on mobile
                artoSidebars.forEach( function ( sidebar ) {
                    sidebar.recomputeWidth();
                });

                return;
            }

            artoSidebars.forEach( function ( sidebar ) {
                sidebar.recomputeWidth();
            });

            artoSidebars.forEach( function ( sidebar ) {
                sidebar.reposition();
            });
        }
    };


})( jQuery );
