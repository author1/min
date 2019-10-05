/**
 * Created by ArtoCreative on 06.01.2016.
 */

/* global jQuery:{} */
/* global YT:{} */
/* global $f:{} */

/* global artoTitleTemplate:{} */

var artoYoutubePlayers = {};
var artoVimeoPlayers = {};
var artoSoundCloudPlayers = {};

(function($) {

    'use strict';


    artoYoutubePlayers = {

        playerId: 'arto_youtube_',

        players: [],

        do: function() {
            var currentJqPlayerWrapper,
                currentDataFile,
                currentYoutubePlayer,
                artoYoutubeWrap = $( '.arto-youtube-wrap' );

            for ( var i = 0; i < artoYoutubeWrap.length; i++ ) {
                currentJqPlayerWrapper = $( artoYoutubeWrap[ i ] );
                currentDataFile = currentJqPlayerWrapper.data( 'file' );
                if ( undefined !== currentDataFile ) {
                    currentYoutubePlayer = artoYoutubePlayers._createPlayer( artoYoutubePlayers.playerId + i, currentJqPlayerWrapper, currentDataFile );
                    artoYoutubePlayers.players.push( currentYoutubePlayer );
                    currentYoutubePlayer.playVideo();
                }
            }
        },

        _createPlayer: function( playerId, jqPlayerWrapper, videoId ) {

            var youtubePlayer = {

                playerId: playerId,

                jqPlayerWrapper: jqPlayerWrapper,

                videoId: videoId,

                // the real youtube player
                player: '',

                autoplay: 0,


                playVideo: function() {

                    youtubePlayer.autoplay = 1;

                    if ( 'undefined' === typeof( YT ) || 'undefined' === typeof( YT.Player ) ) {

                        $.getScript( 'https://www.youtube.com/player_api').done(function( script, textStatus ) {
                            //alert(textStatus);
                            if ( 'success' === textStatus ) {
                                window.onYouTubePlayerAPIReady = function () {
                                    for ( var i = 0; i < artoYoutubePlayers.players.length; i++ ) {
                                        artoYoutubePlayers.players[ i ].loadPlayer();
                                    }
                                };
                            }
                        });

                    } else {
                        youtubePlayer.loadPlayer();
                    }

                    youtubePlayer.autoplay = 0;
                },


                loadPlayer: function() {

                    var autoplay = 0,
                        playerVars;

                    var $jqPlayerWrapper = jQuery( youtubePlayer.jqPlayerWrapper );
                    if ( $jqPlayerWrapper.length && $jqPlayerWrapper.parent().hasClass( 'arto-grid-player' ) ) {

                        // We are in grid playlist
                        var $artoGrid = $jqPlayerWrapper.closest( '.arto-grid' ),
                            $artoPlayerControl = $artoGrid.find( '.arto-grid-control-item' ),
                            dataAutoplay = $jqPlayerWrapper.data( 'autoplay' );

                        if ( ( 'undefined' !== dataAutoplay && 'on' === dataAutoplay ) || 1 === youtubePlayer.autoplay )  {
                            autoplay = 1;
                            $artoPlayerControl.html( 'Pause' );
                        }
                    } else {

                        // Check the player is inside of title template
                        if ( $jqPlayerWrapper.hasClass( 'arto-player-in-title-template' ) ) {

                            // Add custom player vars
                            playerVars = {
                                autoplay: 1,
                                mute: 1,
                                loop: 1,
                                modestbranding: 1,
                                showinfo: 0,
                                controls: 0,
                                playlist: youtubePlayer.videoId
                            };

                        } else {

                            if ( 'undefined' !== $jqPlayerWrapper.data( 'autoplay' ) ) {
                                var dataAutoplay = $jqPlayerWrapper.data( 'autoplay' );

                                if ( 'on' === dataAutoplay ) {
                                    autoplay = 1;
                                }
                            }
                        }
                    }

                    if ( 'undefined' === typeof playerVars ) {
                        playerVars = {
                            autoplay: autoplay
                        };
                    }

                    youtubePlayer.autoplay = autoplay;

                    youtubePlayer.jqPlayerWrapper.html( '<div id="' + youtubePlayer.playerId + '"></div>' );
                    youtubePlayer.player = new YT.Player( youtubePlayer.playerId, {
                            playerVars: playerVars,
                            width: '100%',
                            height: '100%',
                            videoId: youtubePlayer.videoId,
                            events: {
                                'onReady': youtubePlayer.onPlayerReady,
                                'onStateChange': youtubePlayer.onPlayerStateChange
                            }
                        }
                    );
                },

                onPlayerReady: function( playerStatus ) {
                    //youtubePlayer.player.loadVideoByUrl({
                    //    mediaContentUrl: 'http://www.youtube.com/v/YQHsXMglC9A?version=3',
                    //    suggestedQuality: 'large'
                    //});

                    artoTitleTemplate.checkTitleTemplatePlayer();
                },

                onPlayerStateChange: function( playerStatus ) {
                    // This method must reimplement artoOnPlayerStateChange on each player. This is why we didn't use it!
                    //youtubePlayer.artoOnPlayerStateChange.call( youtubePlayer, playerStatus );

                    // Step 1 - Try to see if player is inside of grid (that means we are in grid playlist)
                    //console.log( playerStatus );
                    //console.log( playerStatus.data );
                    //console.log( youtubePlayer );
                    //console.log( youtubePlayer.playerId );

                    var $jqPlayerWrapper = jQuery( youtubePlayer.jqPlayerWrapper );
                    if ( $jqPlayerWrapper.length && $jqPlayerWrapper.parent().hasClass( 'arto-grid-player' ) ) {
                        // We are in grid playlist

                        var $artoGrid = $jqPlayerWrapper.closest( '.arto-grid' ),
                            $artoPlayerControl = $artoGrid.find( '.arto-grid-control-item' ),
                            $artoGridVideoItemCurrent = $artoGrid.find( '.arto-grid-video-item-current' );

                        if ( 1 === playerStatus.data ) {
                            $artoPlayerControl.html( 'Pause' );
                        } else if ( 2 === playerStatus.data ) {
                            $artoPlayerControl.html( 'Play' );
                        } else if ( 0 === playerStatus.data ) {
                            // Play next video

                            if ( 1 === youtubePlayer.autoplay && $artoGridVideoItemCurrent.length && $artoGridVideoItemCurrent.next().length ) {
                                $artoGridVideoItemCurrent.next().trigger( 'click' );
                            } else {
                                $artoPlayerControl.html( 'Play' );
                            }
                        }
                    }
                }

            };

            return youtubePlayer;
        }
    };











    artoVimeoPlayers = {

        playerId: 'arto_vimeo_',

        players: [],

        do: function() {
            var currentJqPlayerWrapper,
                currentDataFile,
                currentVimeoPlayer,
                artoVimeoWrap = $( '.arto-vimeo-wrap' );

            for ( var i = 0; i < artoVimeoWrap.length; i++ ) {
                currentJqPlayerWrapper = $( artoVimeoWrap[ i ] );
                currentDataFile = currentJqPlayerWrapper.data( 'file' );
                if ( undefined !== currentDataFile ) {
                    currentVimeoPlayer = artoVimeoPlayers._createPlayer( artoVimeoPlayers.playerId + i, currentJqPlayerWrapper, currentDataFile );
                    artoVimeoPlayers.players.push( currentVimeoPlayer );
                    currentVimeoPlayer.playVideo();
                }
            }
        },

        _createPlayer: function( playerId, jqPlayerWrapper, videoId ) {

            var vimeoPlayer = {

                playerId: playerId,

                jqPlayerWrapper: jqPlayerWrapper,

                videoId: videoId,

                // the real vimeo player
                player: '',

                autoplay: 0,


                /**
                 * @param startPlaying - start playing. It's different from autoplay, because it plays and stop. It does not continue playing
                 */
                playVideo: function( startPlaying ) {

                    // Default - do not autoplay
                    var autoplay = 0,
                        inGrid = false,

                        $artoGrid,
                        $artoPlayerControl,
                        dataAutoplay,
                        $artoGridVideoItemCurrent;

                    // Try to see if player is inside of grid (that means we are in grid playlist)
                    if ( vimeoPlayer.jqPlayerWrapper.length && vimeoPlayer.jqPlayerWrapper.parent().hasClass( 'arto-grid-player' ) ) {

                        inGrid = true;

                        // We are in grid playlist
                        $artoGrid = vimeoPlayer.jqPlayerWrapper.closest( '.arto-grid' );
                        $artoPlayerControl = $artoGrid.find( '.arto-grid-control-item' );
                        dataAutoplay = vimeoPlayer.jqPlayerWrapper.data( 'autoplay' );

                        if ( 'undefined' !== dataAutoplay && 'on' === dataAutoplay ) {
                            autoplay = 1;
                            $artoPlayerControl.html( 'Pause' );
                        }
                    }

                    vimeoPlayer.autoplay = autoplay;

                    vimeoPlayer.jqPlayerWrapper.html( '<iframe id="' + vimeoPlayer.playerId + '" src="https://player.vimeo.com/video/' + vimeoPlayer.videoId + '?api=1&autoplay=' + autoplay + '&player_id=' + vimeoPlayer.playerId + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' );

                    if ( inGrid ) {
                        // Create ref player @see https://github.com/vimeo/player.js - to control it from grid
                        vimeoPlayer.player = new Vimeo.Player( $('#' + vimeoPlayer.playerId) );

                        if ( 'undefined' !== typeof startPlaying && true === startPlaying ) {

                            vimeoPlayer.player.ready().then(function() {
                                // the player is ready
                                vimeoPlayer.player.play();
                            });
                        }

                        vimeoPlayer.player.on('pause', function () {
                            $artoPlayerControl.html('Play');
                        });

                        vimeoPlayer.player.on('play', function () {
                            $artoPlayerControl.html('Pause');
                        });

                        vimeoPlayer.player.on('finish', function () {
                            $artoGridVideoItemCurrent = $artoGrid.find( '.arto-grid-video-item-current' );

                            if ( 1 === vimeoPlayer.autoplay && $artoGridVideoItemCurrent.length && $artoGridVideoItemCurrent.next().length ) {
                                $artoGridVideoItemCurrent.next().trigger( 'click' );
                            } else {
                                $artoPlayerControl.html( 'Play' );
                            }
                        });
                    }
                }
            };

            return vimeoPlayer;
        }
    };














    artoSoundCloudPlayers = {

        playerId: 'arto_soundcloud_',

        players: [],

        do: function() {
            var currentJqPlayerWrapper,
                currentDataFile,
                currentSoundCloudPlayer,
                artoSoundCloudWrap = $( '.arto-soundcloud-wrap' );

            for ( var i = 0; i < artoSoundCloudWrap.length; i++ ) {
                currentJqPlayerWrapper = $( artoSoundCloudWrap[ i ] );
                currentDataFile = currentJqPlayerWrapper.data( 'file' );
                if ( undefined !== currentDataFile ) {
                    currentSoundCloudPlayer = artoSoundCloudPlayers._createPlayer( artoSoundCloudPlayers.playerId + i, currentJqPlayerWrapper, currentDataFile );
                    artoSoundCloudPlayers.players.push( currentSoundCloudPlayer );
                    currentSoundCloudPlayer.playVideo();
                }
            }
        },

        _createPlayer: function( playerId, jqPlayerWrapper, videoUrl ) {

            var soundcloudPlayer = {

                playerId: playerId,

                jqPlayerWrapper: jqPlayerWrapper,

                videoUrl: videoUrl,

                // the real vimeo player
                player: '',


                playVideo: function() {

                    soundcloudPlayer.jqPlayerWrapper.html( '<iframe id="' + soundcloudPlayer.playerId + '" style="width: 100%; height: 100%;" scrolling="no" frameborder="no"></iframe>' );

                    var soundcloudWidget,
                        iframeElement   = $( '#' + soundcloudPlayer.playerId );

                    if ( 'undefined' === typeof( SC ) || 'undefined' === typeof( SC.Widget ) ) {

                        $.getScript( 'https://w.soundcloud.com/player/api.js' ).done(function( script, textStatus ) {
                            //alert(textStatus);
                            if ( 'success' === textStatus ) {
                                iframeElement.attr( 'src', 'https://w.soundcloud.com/player/?url=' + soundcloudPlayer.videoUrl + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true');
                            }
                        });

                    } else {
                        soundcloudWidget = SC.Widget( iframeElement );
                    }
                }
            };

            return soundcloudPlayer;
        }
    };

})(jQuery);

