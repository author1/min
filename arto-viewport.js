/**
 * Created by ArtoCreative on 09.12.2016.
 */

/**
 * Created by ArtoCreative on 21.05.2015.
 */

/* global jQuery:{} */

var artoViewport = {},
    artoEvents = {},
    artoEffect = {},
    artoParallaxHeader = {};

(function( $, undefined ){

    'use strict';

    /**
     * - artoViewport keeps the settings of the viewport
     */
    artoViewport = {

        intervals: undefined,

        beforePreviousInterval: undefined,

        previousInterval: undefined,

        previousIntervalSettings: undefined,

        /**
         * - the arto_viewport init
         */
        init: function( intervals ) {
            this.intervals = intervals;
        },

        /**
         * Check to see if we are on changing viewports intervals.
         * Set the 'previousInterval'
         * @returns {boolean}
         */
        checkIntervals: function() {

            var currentInterval,
                currentIntervalSettings;

            for ( var prop in artoViewport.intervals ) {
                var intValue = parseInt( prop, 10 );
                if ( artoEvents.windowInnerWidth < intValue  ) {
                    currentInterval = intValue;
                    currentIntervalSettings = artoViewport.intervals[ prop ];
                    break;
                }
            }

            if ( 'undefined' === typeof currentInterval ) {
                // Set the maximum interval
                currentInterval = parseInt( prop, 10 );
                currentIntervalSettings = artoViewport.intervals[ prop ];
            }

            if ( 'undefined' === typeof artoViewport.beforePreviousInterval ) {
                artoViewport.beforePreviousInterval = currentInterval;
            } else {
                artoViewport.beforePreviousInterval = artoViewport.previousInterval;
            }



            if ( ( 'undefined' === typeof artoViewport.previousInterval ) || ( artoViewport.previousInterval !== currentInterval ) ) {
                artoViewport.previousInterval = currentInterval;
                artoViewport.previousIntervalSettings = currentIntervalSettings;

                // The viewport has been changed (even though at the first server request)
                return true;
            }

            artoViewport.previousInterval = currentInterval;
            artoViewport.previousIntervalSettings = currentIntervalSettings;

            // The viewport hasn't been changed (it was actually initialized, or maintained)
            return false;
        },


        checkHeaderPlayer: function( wrapperClass ) {

            var $artoPlayerHolder = $( '.arto-player-holder');

            if ( $artoPlayerHolder.length ) {

                var selectedWrapper;

                // Check the selected sermon icons
                var $artoIconsSelected = $( '.arto-sermon-icon-files > .arto-icons.selected' );
                if ( $artoIconsSelected.length ) {
                    selectedWrapper = $artoIconsSelected.data('wrapper');
                }

                var $artoYoutubeWrap = $artoPlayerHolder.find( '.' + wrapperClass + ':first' );

                if ( $artoYoutubeWrap.length ) {

                    var newWidth,
                        newHeight;

                    // Width has priority over height
                    if ( 'undefined' !== typeof artoViewport.previousIntervalSettings[ wrapperClass ].width ) {
                        newWidth = artoViewport.previousIntervalSettings[ wrapperClass ].width;
                    }

                    if ( 'undefined' !== typeof artoViewport.previousIntervalSettings[ wrapperClass ].height ) {
                        newHeight = artoViewport.previousIntervalSettings[wrapperClass].height;
                    }



                    if ( 'undefined' !== typeof artoViewport.previousIntervalSettings[ wrapperClass ].$ref ) {

                        var $refEl = $artoYoutubeWrap.find( artoViewport.previousIntervalSettings[ wrapperClass ].$ref );

                        var artoYoutubeWrapTimeout = setTimeout(function() {

                            clearInterval( artoYoutubeWrapInterval );

                        }, artoViewport.previousIntervalSettings[ wrapperClass ].refTimeout );

                        var artoYoutubeWrapInterval = setInterval(function() {

                            $refEl = $artoYoutubeWrap.find(artoViewport.previousIntervalSettings[ wrapperClass ].$ref);

                            if ( $refEl.length ) {

                                clearInterval( artoYoutubeWrapInterval );
                                clearTimeout( artoYoutubeWrapTimeout );

                                // Check if we have calculated the aspectRatio for player
                                if ( 'undefined' === typeof artoViewport.previousIntervalSettings[ wrapperClass ].aspectRatio ) {
                                    artoViewport.previousIntervalSettings[ wrapperClass ].aspectRatio = $refEl.width() / $refEl.height();
                                }

                                var aspectRatio = artoViewport.previousIntervalSettings[ wrapperClass ].aspectRatio;

                                if ( 'undefined' === typeof newHeight && 'undefined' !== typeof newWidth ) {
                                    newHeight = parseInt( newWidth / aspectRatio, 10 ) + 'px';
                                    newWidth += 'px';
                                } else if ( 'undefined' === typeof newWidth && 'undefined' !== typeof newHeight ) {
                                    newWidth = parseInt( newHeight * aspectRatio, 10 ) + 'px';
                                    newHeight += 'px';
                                } else if ( 'undefined' !== typeof newWidth && 'undefined' !== typeof newHeight ) {
                                    newWidth += 'px';
                                    newHeight += 'px';
                                }

                                var cssZIndexOpacity = 0;

                                if ( 'undefined' !== typeof selectedWrapper && wrapperClass === selectedWrapper ) {
                                    cssZIndexOpacity = 1;
                                }

                                $artoYoutubeWrap.find( '.mejs-container').attr( 'style', 'z-index: 1; opacity: 1; height:' + newHeight + ' !important; width: ' + newWidth + ' !important');
                                $artoYoutubeWrap.attr( 'style', 'z-index: ' + cssZIndexOpacity + '; opacity: ' + cssZIndexOpacity + '; height:' + newHeight + ' !important; width: ' + newWidth + ' !important');
                                $refEl.attr( 'style', 'height:' + newHeight + ' !important; width: ' + newWidth + ' !important; position: static; visibility: visible;' );

                                $artoPlayerHolder.height( newHeight );

                                // The header changes, so all items of the artoEffect must be reinitialized, their markers moving up or down
                                artoEffect.reinitialize_all_items( true );

                                // artoEffect items of headers having parallax must reattach their properties
                                artoParallaxHeader.reattachItemsProperties();

                                // All artoEffect elements are recomputed, their markers were up or down
                                artoEffect.compute_all_items();
                            }

                        }, artoViewport.previousIntervalSettings[ wrapperClass ].refInterval);

                    } else {
                        if ( 'undefined' === typeof artoViewport.previousIntervalSettings[ wrapperClass ].width ) {
                            newWidth = '100%';
                        }

                        if ( 'undefined' === typeof artoViewport.previousIntervalSettings[ wrapperClass ].height ) {
                            newHeight = '100%';
                        }

                        var cssZIndexOpacity = 0;

                        if ( 'undefined' !== typeof selectedWrapper && wrapperClass === selectedWrapper ) {
                            cssZIndexOpacity = 1;
                        }

                        $artoYoutubeWrap.find( '.mejs-container').attr( 'style', 'z-index: 1; opacity: 1; height:' + newHeight + ' !important; width: ' + newWidth + ' !important');
                        $artoYoutubeWrap.attr( 'style', 'z-index: ' + cssZIndexOpacity + '; opacity: ' + cssZIndexOpacity + '; height:' + newHeight + ' !important; width: ' + newWidth + ' !important');

                        $artoPlayerHolder.height( newHeight );

                        // The header changes, so all items of the artoEffect must be reinitialized, their markers moving up or down
                        artoEffect.reinitialize_all_items( true );

                        // artoEffect items of headers having parallax must reattach their properties
                        artoParallaxHeader.reattachItemsProperties();

                        // All artoEffect elements are recomputed, their markers were up or down
                        artoEffect.compute_all_items();
                    }
                }
            }
        }
    };

    artoViewport.init( window.artoSettings.artoViewports );

})( jQuery );
