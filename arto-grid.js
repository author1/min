/**
 * Created by ArtoCreative on 27.01.2017.
 */

/* global jQuery:{} */
/* global artoListMore:{} */

var artoGrid = {};

(function( $, undefined ){

    'use strict';

    artoGrid = {

        init: function() {

            // add events

            var $body = $( 'body' );

            $body.on( 'click', '.arto-grid .page-numbers', function(event) {
                event.preventDefault();

                var $this = $(this),
                    $artoGrid = $this.closest( '.arto-grid' );

                if ( $artoGrid.hasClass( 'arto-grid-loop' ) ) {
                    window.location = $this.attr( 'href' );
                    return;
                }

                var $artoGridContainer = $artoGrid.children( '.arto-grid-container' ),
                    $artoNavigationWrapper = $this.closest( '.arto-navigation-wrapper' ),
                    artoUID = $artoGrid.data( 'arto_uid' ),
                    $artoLoader = $artoGrid.children( '.arto-loading-grid ').children( '.arto-loader' );

                // Prev links
                if ( $this.hasClass( 'prev' ) ) {

                    if ( 'undefined' !== typeof artoUID ) {
                        var artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

                        if ( 'undefined' === typeof artoUIDElement ) {
                            return;
                        }

                        var currentPage = parseInt( artoUIDElement.paged, 10 );

                        if ( currentPage > 1 ) {
                            // Make a new request for the next posts

                            artoUIDElement.paged = currentPage - 1;

                            $artoLoader.addClass( 'arto-loading-show' );
                            $artoGridContainer.addClass( 'arto-grid-loading' );

                            $.ajax({
                                url: window.artoSettings.ajaxUrl,
                                method: 'POST',
                                data: {
                                    action: 'arto_get_post',
                                    typeContainer: artoUIDElement.type,
                                    args: artoUIDElement,
                                    gridNonce: window.artoSettings.gridNonce
                                }
                            }).done(function(data, textStatus, jqXHR) {

                                $artoLoader.removeClass( 'arto-loading-show' );
                                $artoGridContainer.removeClass( 'arto-grid-loading' );

                                if (textStatus === 'success') {

                                    if ( '' !== data ) {
                                        data = JSON.parse( data );
                                        $artoGridContainer.html( data.output );
                                        $artoNavigationWrapper.html( data.pagination );

                                        if ( 'undefined' !== typeof data.script && '' !== data.script ) {
                                            // Here data.script should be interpreted, being a supplementary response from server.
                                        }
                                    }
                                }
                            });
                        }
                    }

                    // Next links
                } else if ( $this.hasClass( 'next' ) ) {

                    if ( 'undefined' !== typeof artoUID ) {
                        var artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

                        if ( 'undefined' === typeof artoUIDElement ) {
                            return;
                        }

                        var currentPage = parseInt( artoUIDElement.paged, 10 ),
                            maxNumPages = parseInt( artoUIDElement.max_num_pages, 10 );

                        if ( currentPage < maxNumPages ) {
                            // Make a new request for the next posts

                            artoUIDElement.paged = currentPage + 1;

                            $artoLoader.addClass( 'arto-loading-show' );
                            $artoGridContainer.addClass( 'arto-grid-loading' );

                            $.ajax({
                                url: window.artoSettings.ajaxUrl,
                                method: 'POST',
                                data: {
                                    action: 'arto_get_post',
                                    typeContainer: artoUIDElement.type,
                                    args: artoUIDElement,
                                    gridNonce: window.artoSettings.gridNonce
                                }
                            }).done(function(data, textStatus, jqXHR) {

                                $artoLoader.removeClass( 'arto-loading-show' );
                                $artoGridContainer.removeClass( 'arto-grid-loading' );

                                if (textStatus === 'success') {

                                    if ( '' !== data ) {
                                        data = JSON.parse( data );
                                        //console.log(data.output)
                                        $artoGridContainer.html( data.output );
                                        $artoNavigationWrapper.html( data.pagination );

                                        if ( 'undefined' !== typeof data.script && '' !== data.script ) {
                                            // Here data.script should be interpreted, being a supplementary response from server.
                                        }
                                    }
                                }
                            });
                        }
                    }

                // Intermediate links (those with numbers)
                } else {

                    if ( $this.hasClass( 'dots' ) || $this.hasClass( 'current' ) ) {
                        return;
                    }

                    if ( 'undefined' !== typeof artoUID ) {
                        var artoUIDElement = window.artoSettings.artoContainers[ artoUID ],
                            clickedPage = parseInt( $this.html(), 10 );

                        // Make a new request for the next posts

                        artoUIDElement.paged = clickedPage;

                        $artoLoader.addClass( 'arto-loading-show' );
                        $artoGridContainer.addClass( 'arto-grid-loading' );

                        $.ajax({
                            url: window.artoSettings.ajaxUrl,
                            method: 'POST',
                            data: {
                                action: 'arto_get_post',
                                typeContainer: artoUIDElement.type,
                                args: artoUIDElement,
                                gridNonce: window.artoSettings.gridNonce
                            }
                        }).done(function(data, textStatus, jqXHR) {

                            $artoLoader.removeClass( 'arto-loading-show' );
                            $artoGridContainer.removeClass( 'arto-grid-loading' );

                            if (textStatus === 'success') {

                                if ( '' !== data ) {
                                    data = JSON.parse( data );
                                    //console.log(data.output)
                                    $artoGridContainer.html( data.output );
                                    $artoNavigationWrapper.html( data.pagination );
                                }
                            }
                        });
                    }
                }
            });


            $body.on( 'click', '.arto-grid .arto-grid-control-item', function(event) {
                var $this = jQuery( this ),
                    $artoGrid = $this.closest( '.arto-grid' ),
                    $artoPlayerWrap = $artoGrid.find( '.arto-player-wrap' ),
                    dataService = $artoPlayerWrap.data( 'service' ),
                    playerId = $artoPlayerWrap.children( 'iframe' ).attr( 'id' ),
                    player;

                switch( dataService ) {
                    case 'youtube':
                        for ( var i = 0; i < window.artoYoutubePlayers.players.length; i++ ) {
                            var currentPlayer = window.artoYoutubePlayers.players[ i ];

                            if ( currentPlayer.playerId === playerId ) {
                                player = currentPlayer.player;
                                break;
                            }
                        }

                        var playerState = player.getPlayerState();
                        if ( 1 === playerState ) {
                            player.pauseVideo();
                            $this.html( 'Play' );

                        } else {
                            player.playVideo();
                            $this.html( 'Pause' );
                        }
                        break;

                    case 'vimeo':
                        for ( var i = 0; i < window.artoVimeoPlayers.players.length; i++ ) {
                            var currentPlayer = window.artoVimeoPlayers.players[ i ];

                            if ( currentPlayer.playerId === playerId ) {
                                player = currentPlayer.player;
                                break;
                            }
                        }

                        player.getPaused().then(function(paused) {
                            if ( paused ) {
                                player.play();
                                $this.html( 'Pause' );

                            } else {
                                player.pause();
                                $this.html( 'Play' );
                            }
                        });
                        break;
                }
            });

            $body.on( 'click', '.arto-grid .arto-grid-video-item', function(event) {
                var $this = jQuery( this ),
                    $artoGrid = $this.closest( '.arto-grid' ),
                    $artoPlayerWrap = $artoGrid.find( '.arto-player-wrap' ),
                    $artoPlayerControl = $artoGrid.find( '.arto-grid-control-item' ),
                    $artoPlayerControlInfoTitle = $artoGrid.find( '.arto-grid-control-info-title' ),
                    $artoPlayerControlInfoTime = $artoGrid.find( '.arto-grid-control-info-time' ),
                    existingDataFile = $artoPlayerWrap.data( 'file' ),
                    newDataFile = $this.data( 'file' ),
                    dataService = $artoPlayerWrap.data( 'service' ),
                    playerId = $artoPlayerWrap.children( 'iframe' ).attr( 'id' ),
                    player;

                if ( newDataFile === existingDataFile ) {
                    return;
                }

                try {

                    $artoPlayerWrap.data('file', newDataFile);

                    $artoPlayerControl.html('Pause');
                    $artoPlayerControlInfoTitle.html($this.find('.arto-grid-video-item-title').html());
                    $artoPlayerControlInfoTime.html($this.find('.arto-grid-video-item-time').html());

                    $artoGrid.find( '.arto-grid-video-item-current' ).removeClass( 'arto-grid-video-item-current' );
                    $this.addClass( 'arto-grid-video-item-current' );

                    var currentPlayer;

                    switch( dataService ) {
                        case 'youtube':

                            for ( var i = 0; i < window.artoYoutubePlayers.players.length; i++ ) {
                                currentPlayer = window.artoYoutubePlayers.players[ i ];

                                if ( currentPlayer.playerId === playerId ) {
                                    player = currentPlayer.player;
                                    break;
                                }
                            }

                            if ( 'undefined' !== typeof currentPlayer ) {
                                currentPlayer.videoId = newDataFile;
                                currentPlayer.playVideo();
                            }

                            // Important! We used "player.loadVideoById" but it's not reliable on IE (That's why we used "currentPlayer.loadPlayer()", even the first is better because does not load the entire player again)

                            //if ( 'undefined' !== typeof window.xxaa ) {
                            //    clearTimeout( window.xxaa );
                            //}
                            //
                            //if ( artoAgent.isIE10 || artoAgent.isIE11 ) {
                            //    player.stopVideo();
                            //}
                            //window.xxaa = setTimeout(function() {
                            //    player.loadVideoById( newDataFile );
                            //}, 500);

                            break;

                        case 'vimeo':

                            for ( var i = 0; i < window.artoVimeoPlayers.players.length; i++ ) {
                                currentPlayer = window.artoVimeoPlayers.players[ i ];

                                if ( currentPlayer.playerId === playerId ) {
                                    player = currentPlayer.player;
                                    break;
                                }
                            }

                            if ( 'undefined' !== typeof currentPlayer ) {
                                currentPlayer.videoId = newDataFile;
                                currentPlayer.playVideo(true);
                                player.play();
                            }

                            // Important! We used "player.loadVideo", but it's not reliable on IE (That's why we used "currentPlayer.playVideo()", even the first method is better because does not load the player again)

                            //player.loadVideo( newDataFile ).then(function(id) {
                            //    // the video successfully loaded
                            //}).catch(function(error) {
                            //    switch (error.name) {
                            //        case 'TypeError':
                            //            // the id was not a number
                            //            break;
                            //
                            //        case 'PasswordError':
                            //            // the video is password-protected and the viewer needs to enter the
                            //            // password first
                            //            break;
                            //
                            //        case 'PrivacyError':
                            //            // the video is password-protected or private
                            //            break;
                            //
                            //        default:
                            //            // some other error occurred
                            //            break;
                            //    }
                            //});
                            //
                            //setTimeout(function() {
                            //    player.play();
                            //}, 500);

                            break;
                    }

                } catch( ex ) {
                    // Do not show anything for now!
                }
            });




            jQuery(window).load(function() {

                // Important! This must be on window load because all css must be applied.
                $body.find( '.arto-grid' ).each(function(index, el ) {
                    var $artoGrid = jQuery(el),
                        $artoListMore = $artoGrid.find( '.arto-list-more:first' );

                    if ( $artoListMore.length ) {
                        var artoListMoreItem = new artoListMore.item();
                        artoListMoreItem.$headerWrapper = $artoGrid.find( '.arto-grid-header-wrapper:first' );
                        artoListMoreItem.$wrapper = $artoListMore;
                        artoListMoreItem.$HList = $artoListMore.find( '.arto-grid-cat-list' );
                        artoListMoreItem.$VList = $artoListMore.find( '.arto-grid-cat-more' );
                        artoListMoreItem.HCssSelector = 'arto-grid-cat';
                        artoListMoreItem.excludedFromWrapper = [ artoListMoreItem.$headerWrapper.find( '.arto-grid-title-inner' )];
                        artoListMoreItem.extraHSpace = 200;
                        artoListMoreItem.HList = [];
                        artoListMoreItem.VList = [];
                        artoListMoreItem.$VHeader = $artoListMore.find( '.arto-grid-more-head' );

                        if ( artoListMoreItem.$headerWrapper.children( '.arto-navigation-wrapper').length ) {
                            artoListMoreItem.extraHSpace += 50;
                        }

                        // Callback to be executed before computing item
                        artoListMoreItem.computeBeforeCallback = function() {

                            // 'this' is artoListMoreItem
                            var $artoGridTitle = this.$headerWrapper.find( '.arto-grid-title' );
                            if ( $artoGridTitle.length ) {
                                $artoGridTitle.css( 'margin-right', ''  );
                            }
                        };

                        // Callback to be executed after computing item
                        artoListMoreItem.computeAfterCallback = function() {

                            // 'this' is artoListMoreItem
                            var $artoGridTitle = this.$headerWrapper.find( '.arto-grid-title' ),
                                $artoNavigationWrapper = this.$headerWrapper.find( '.arto-navigation-wrapper' );

                            if ( $artoGridTitle.length ) {
                                if ( $artoNavigationWrapper.length ) {
                                    $artoGridTitle.css( 'margin-right', this.$wrapper.width() + 75 );
                                } else {
                                    $artoGridTitle.css( 'margin-right', this.$wrapper.width());
                                }
                            }

                        };

                        artoListMore.addItem( artoListMoreItem );
                    }

                });


                $body.find( '.arto-grid .arto-loader.arto-pos-slider' ).each(function(index, el ) {

                    // This class is removed using a timer that waits for '.owl-loaded' class
                    $(this).removeClass( 'arto-loading-show' );
                });
            });

        }

    };

    artoGrid.init();

})( jQuery);
