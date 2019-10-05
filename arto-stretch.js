/**
 * Created by ArtoCreative on 24.12.2017.
 */

/* global jQuery:{} */

/* global artoEvents:{} */
/* global artoDebug:{} */
/* global artoParallaxHeader:{} */

var artoStretch;

(function($, undefined) {

    'use strict';

    artoStretch = {

        heightClass: 'arto-scale-height',
        widthClass: 'arto-scale-width',

        applyClass: true,

        stretchImage: function( $img, $ref, $target, heightClass, widthClass ) {

            var imgWidth = $img.width(),
                imgHeight = $img.height(),
                refWidth = $ref.outerWidth( true ),
                refHeight = $ref.outerHeight( true ),
                imgAspectRatio = (imgWidth / imgHeight).toFixed(2);

            // Go with 'width' first
            if ( imgWidth < refWidth ) {

                var newImgWidth = refWidth,
                    newImgHeight = (newImgWidth / imgAspectRatio).toFixed(2);

                if ( newImgHeight > refHeight ) {

                    if ( artoStretch.applyClass ) {

                        // remove existing settings
                        if ('undefined' === typeof heightClass) {
                            //console.log( '2remove ' + artoStretch.heightClass);
                            $target.removeClass(artoStretch.heightClass);
                        } else {
                            $target.removeClass(heightClass);
                        }

                        // portrait img
                        if ('undefined' === typeof widthClass) {
                            //console.log( '2add ' + artoStretch.widthClass);
                            $target.addClass(artoStretch.widthClass);
                        } else {
                            $target.addClass(widthClass);
                        }
                    }

                } else {

                    // Not good! Use the height

                    newImgHeight = refHeight;
                    newImgWidth = (newImgHeight * imgAspectRatio).toFixed(2);

                    if ( artoStretch.applyClass ) {

                        // remove existing settings
                        if ('undefined' === typeof widthClass) {
                            //console.log( '1remove ' + artoStretch.widthClass);
                            $target.removeClass(artoStretch.widthClass);
                        } else {
                            $target.removeClass(widthClass);
                        }
                        // landscape img
                        if ('undefined' === typeof heightClass) {
                            //console.log( '1add ' + artoStretch.heightClass);
                            $target.addClass(artoStretch.heightClass);
                        } else {
                            $target.addClass(heightClass);
                        }
                    }
                }

            } else {

                // Try go with 'height' first
                if ( imgHeight < refHeight ) {

                    var newImgHeight = refHeight,
                        newImgWidth = (newImgHeight * imgAspectRatio).toFixed(2);

                    if ( newImgWidth > refWidth ) {

                        if ( artoStretch.applyClass ) {

                            // remove existing settings
                            if ('undefined' === typeof widthClass) {
                                //console.log( '4remove ' + artoStretch.widthClass);
                                $target.removeClass(artoStretch.widthClass);
                            } else {
                                $target.removeClass(widthClass);
                            }

                            // landscape img
                            if ('undefined' === typeof heightClass) {
                                //console.log( '4add ' + artoStretch.heightClass);
                                $target.addClass(artoStretch.heightClass);
                            } else {
                                $target.addClass(heightClass);
                            }
                        }

                    } else {

                        // Not good! Use the width

                        newImgWidth = refWidth;
                        newImgHeight = (newImgWidth / imgAspectRatio).toFixed(2);

                        if ( artoStretch.applyClass ) {

                            // remove existing settings
                            if ('undefined' === typeof heightClass) {
                                //console.log( '3remove ' + artoStretch.heightClass);
                                $target.removeClass(artoStretch.heightClass);
                            } else {
                                $target.removeClass(heightClass);
                            }

                            // portrait img
                            if ('undefined' === typeof widthClass) {
                                //console.log( '3add ' + artoStretch.widthClass);
                                $target.addClass(artoStretch.widthClass);
                            } else {
                                $target.addClass(widthClass);
                            }
                        }
                    }

                } else if ( imgHeight > refHeight ) {

                    var newImgHeight = refHeight;
                        newImgWidth = (newImgHeight * imgAspectRatio).toFixed(2);

                    if ( newImgWidth > refWidth ) {

                        if ( artoStretch.applyClass ) {

                            // landscape img
                            if ('undefined' === typeof heightClass) {
                                //console.log( '6add ' + artoStretch.heightClass);
                                $target.addClass(artoStretch.heightClass);
                            } else {
                                $target.addClass(heightClass);
                            }
                        }

                    } else {

                        // Not good! Use the width

                        newImgWidth = refWidth;
                        newImgHeight = (newImgWidth / imgAspectRatio).toFixed(2);

                        if ( artoStretch.applyClass ) {

                            // portrait img
                            if ('undefined' === typeof widthClass) {
                                //console.log( '5add ' + artoStretch.widthClass);
                                $target.addClass(artoStretch.widthClass);
                            } else {
                                $target.addClass(widthClass);
                            }
                        }
                    }

                } else {
                    // imgHeight === refHeight

                    if ( artoStretch.applyClass ) {

                        // landscape img
                        if ('undefined' === typeof heightClass) {
                            //console.log( '7add ' + artoStretch.heightClass);
                            $target.addClass(artoStretch.heightClass);
                        } else {
                            $target.addClass(heightClass);
                        }
                    }
                }
            }

                //console.log(imgWidth + ' : ' + imgHeight + ' : ' + refWidth + ' : ' + refHeight );
                //console.log(newImgWidth + ' : ' + newImgHeight);
                //console.log($target);

            return {
                width: newImgWidth,
                height: newImgHeight
            };
        },



        stretchImages: function() {

            //console.log('stretch');

            // post title template 7
            // post tilte template 9
            // post title template audio 5
            // post title template gallery 5
            (function() {

                var $artoPostTitleTemplate = $(
                    '.arto-post-title-template-7, ' +
                    '.arto-post-title-template-9, ' +
                    '.arto-post-title-template-audio-5' );

                if ( $artoPostTitleTemplate.length ) {

                    artoStretch.stretchImage(
                        $artoPostTitleTemplate.find( '.arto-title-wrapper .arto-title-image' ),

                        //$artoPostTitleTemplate.find( '.arto-title-image-wrapper' ),
                        $artoPostTitleTemplate.find( '.arto-title-wrapper' ),

                        $artoPostTitleTemplate.find( '.arto-title-wrapper' )
                    );
                }

            })();


            // post title template 10
            var $artoPostTitleTemplate10 = $( '.arto-post-title-template-10' );
            if ( $artoPostTitleTemplate10.length ) {

                artoStretch.stretchImage(
                    $artoPostTitleTemplate10.find( '.arto-title-image-wrapper .arto-title-image' ),
                    $( window ),
                    $artoPostTitleTemplate10.find( '.arto-title-image-wrapper' )
                );
            }


            // post title template 11
            // page title template 3
            //
            // Obs: It's a self executed function because it's a particular case of stretching image.
            // Maybe it would be better to also use a self executed function for the rest of the streching methods.
            (function() {
                var $artoPostTitleTemplate = $( '.arto-post-title-template-11, .arto-page-title-template-3' );
                if ( $artoPostTitleTemplate.length ) {

                    var $artoTitleWrapper = $artoPostTitleTemplate.find( '.arto-title-wrapper' ),
                        $ref = $( window ),
                        $artoHeader = $( '#arto-header'),
                        $artoMenuMobileBar = $( '#arto-menu-mobile-bar'),
                        $wpadminbar = $( '#wpadminbar' ),
                        extraHeight = 0;

                    if ( artoEvents.windowInnerWidth > 767 && $artoHeader.length ) {
                        extraHeight += $artoHeader.height();
                    }

                    if ( artoEvents.windowInnerWidth <= 767 && $artoMenuMobileBar.length ) {
                        extraHeight += $artoMenuMobileBar.height();
                    }

                    if ( $wpadminbar.length ) {
                        extraHeight += $wpadminbar.height();
                    }

                    if ( $artoPostTitleTemplate.hasClass( 'arto-boxed' ) ) {
                        $ref = {
                            //width: function() {
                            //    if ( $artoPostTitleTemplate.hasClass( 'arto-boxed' ) ) {
                            //        return $artoPostTitleTemplate.width();
                            //    }
                            //    return $(window).width();
                            //},
                            height: function() {
                                return $(window).height();
                            }
                        };
                    }

                    // Width will be set to 100% by css
                    //$artoTitleWrapper.width( $ref.width() );

                    $artoTitleWrapper.height( $ref.height() - extraHeight ) ;

                    artoStretch.stretchImage(
                        $artoPostTitleTemplate.find( '.arto-title-wrapper .arto-title-image' ),
                        $artoTitleWrapper,
                        $artoPostTitleTemplate.find( '.arto-title-wrapper' )
                    );
                }
            })();

        },


        /**
         * This method is used only at viewport changing, and especially because the menu has a transition on height. And because of this
         * the stretch library must do computing late enough to be sure that all transitions are done.
         *
         * We must consider that a transition can stop and immediately a new one can start. So the stretch must come late enough for this.
         */
        lateStretchImages: function() {

            if ('undefined' !== typeof artoStretch.checkInterval ) {
                clearInterval(artoStretch.checkInterval);
            }

            if ('undefined' !== typeof artoStretch.checkTimer) {
                clearTimeout(artoStretch.checkTimer);
            }


            // At every 200ms a new set stretch dimensions are computed
            artoStretch.checkInterval = setInterval(function () {
                artoStretch.stretchImages();
            }, 200);

            // Stop this bundle of computing - we choose 800ms to have 4 intervals and we know the menu transition is at 400ms
            artoStretch.checkTimer = setTimeout(function() {

                // Stop any existing interval
                clearInterval(artoStretch.checkInterval);

                // This parallax reinit must come late enough to recompute its calculations, because it depends of stretch
                artoParallaxHeader.reinit();

            }, 800);
        }
    };

})(jQuery);
