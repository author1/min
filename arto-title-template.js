/**
 * Created by ArtoCreative on 13.01.2018.
 */

/* global artoEvents:{} */
/* global artoDebug:{} */
/* global artoUtility:{} */

/* global jQuery:{} */

var artoTitleTemplate;

(function($, undefined) {

    'use strict';

    artoTitleTemplate = {

        // It allows logging messages to console (@see artoDebug)
        _debugMode: false,

        _timerTitleTemplatePlayer: undefined,

        do: function() {

            $.extend( true, artoTitleTemplate, artoDebug );

            // arrow scroll down
            $( '.arto-title-arrow').on( 'click', function() {
                var $this = $( this ),
                    $artoTitleWrapper = $this.closest( '.arto-title-wrapper' ),
                    position = $artoTitleWrapper.offset().top + $artoTitleWrapper.outerHeight();

                artoUtility.scrollUtility.scrollToY( position );
            });


            var $artoTitleWrapper = $( '.arto-title-wrapper' );
            if ( $artoTitleWrapper.length ) {
                $artoTitleWrapper.removeClass( 'arto-title-wrapper-hidden' );
            }

            var $artoTitleImageWrapper = $( '.arto-title-image-wrapper' );
            if ( $artoTitleImageWrapper.length ) {
                $artoTitleImageWrapper.removeClass( 'arto-title-wrapper-hidden' );
            }
        },


        _resizeTitleTemplatePlayer: function() {

            var $artoPlayerInTitleTemplate = $( '.arto-player-in-title-template' );
            if ( $artoPlayerInTitleTemplate.length ) {

                var $iframePlayer = $artoPlayerInTitleTemplate.find('iframe');

                if ( $iframePlayer.length && 0 !== $iframePlayer ) {

                    var aspectRatio = $iframePlayer.height() / $iframePlayer.width();
                    $iframePlayer.attr( 'aspect-ratio', aspectRatio );

                    //artoTitleTemplate._logConsole($iframePlayer.width());
                    //artoTitleTemplate._logConsole($iframePlayer.height());
                    //artoTitleTemplate._logConsole($iframePlayer.height() / $iframePlayer.width());

                    var $artoContentWrapper = $iframePlayer.closest( '.arto-content-wrapper' );

                    if ( $artoContentWrapper.length ) {

                        var $artoTitleWrapper = $artoContentWrapper.find('.arto-title-shape');

                        if (!$artoTitleWrapper.length) {
                            $artoTitleWrapper = $artoContentWrapper.find('.arto-title-wrapper');
                        }

                        if ($artoTitleWrapper.length) {

                            //artoTitleTemplate._logConsole($artoTitleWrapper.outerWidth( true ));
                            //artoTitleTemplate._logConsole($artoTitleWrapper.outerHeight( true ));

                            window.artoStretch.applyClass = false;
                            var dim = window.artoStretch.stretchImage($iframePlayer, $artoTitleWrapper);

                            artoTitleTemplate._logConsole(dim.width + ' : ' + dim.height);
                            artoTitleTemplate._logConsole(dim.height / dim.width);

                            $iframePlayer.css({
                                width: dim.width,
                                height: dim.height,
                                'max-width': 'none',
                                left: '50%',
                                transform: 'translate(-50%)',
                                opacity: 1
                            });

                            window.artoStretch.applyClass = true;
                        }
                    }
                }
            }
        },


        /**
         * Check players rendered in post title templates. Actually it hides the player, resize it and then show it.
         * @param now - bool - does in instant resize or with timer
         */
        checkTitleTemplatePlayer: function( now ) {

            var $artoPlayerInTitleTemplate = $( '.arto-player-in-title-template' );
            if ( $artoPlayerInTitleTemplate.length ) {

                var $iframePlayer = $artoPlayerInTitleTemplate.find('iframe');

                if ( $iframePlayer.length && 0 !== $iframePlayer ) {

                    $iframePlayer.css({
                        opacity: 0
                    });

                    if ( 'undefined' !== typeof now && true === now ) {
                        artoTitleTemplate._resizeTitleTemplatePlayer();
                    } else {

                        if ( 'undefined' !== typeof artoTitleTemplate._timerTitleTemplatePlayer ) {
                            clearTimeout( artoTitleTemplate._timerTitleTemplatePlayer );
                        }

                        artoTitleTemplate._timerTitleTemplatePlayer = setTimeout(function() {
                            artoTitleTemplate._resizeTitleTemplatePlayer();
                        }, 500);
                    }
                }
            }
        },

        resize: function() {

            // Check players rendered in post title template - but with timer
            artoTitleTemplate.checkTitleTemplatePlayer();
        }
    };

})( jQuery );