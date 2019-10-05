

/* global jQuery:{} */
/* global artoGlobal:{} */
/* global artoMenuAffix:{} */
/* global artoSidebars:[] */
/* global artoMenu:{} */
/* global artoUtility:{} */
/* global artoPagination:{} */
/* global artoEffect:{} */
/* global artoAgent:{} */
/* global artoParallaxHeader:{} */
/* global artoStretch:{} */
/* global artoTitleTemplate:{} */
/* global artoYoutubePlayers:{} */
/* global artoVimeoPlayers:{} */
/* global artoSoundCloudPlayers:{} */
/* global artoSidebar:{} */
/* global artoMenuMobile:{} */
/* global artoViewport:{} */
/* global artoListMore:{} */
/* global artoBackToTop:{} */


/* global artoMenu:{} */

/* global headerSearch:Function */

var artoShortcodes = {};

var artoEvents = {};

(function(){

    'use strict';

    artoEvents = {
        windowScrollTop: 0,
        windowPageXOffset: window.pageXOffset,
        windowPageYOffset: window.pageYOffset,
        windowInnerHeight: window.innerHeight,
        windowInnerWidth: window.innerWidth,
    };

    jQuery( window ).ready(function($) {

        // We trigger scroll to inform any dependent library (ex artoMenu)
        jQuery( window ).trigger( 'scroll' );

        // We trigger resize to inform the elements dependant of the viewports settings
        //jQuery( window ).trigger( 'resize' );


        // Center sharing dialogs
        jQuery( '.arto-share-button').on( 'click', function( event ) {
            event.preventDefault();
            var left  = ( jQuery(window).width() - 900 ) / 2,
                top = ( jQuery(window).height() - 600 ) / 2;
            window.open( jQuery(this).attr( 'href' ), 'Sharing Dialog','left=' + left + ',top=' + top + ',width=900,height=600,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0');
        });


        // Superfish Init
        // -----------------------------------------------------------------------------
        // When there is no space for submenu levels, they must be rendered in opposite position to be all in viewport
        jQuery('.arto-menu-primary, .arto-menu-top').superfish({
            delay: 500,         // the delay in milliseconds that the mouse can remain outside a submenu without it closing
            speed: 'fast',      // speed of the opening animation. Equivalent to second parameter of jQuery’s .animate() method
            speedOut: 'fast',   // speed of the closing animation. Equivalent to second parameter of jQuery’s .animate() method
            cssArrows: false    // set to false if you want to remove the CSS-based arrow triangles
        });


        //Line indicator
        if ( window.innerWidth > 767 ) {
            jQuery('.arto-menu-primary > li > a .arto-menu-text').each(function(){
                jQuery(this).prepend('<span class="arto-menu-line-indicator"></span>');
            });
        }




        // Mobile Navigation
        // -----------------------------------------------------------------------------
        // Toggle nav
        jQuery('#arto-menu-open').on( 'click', function(){
            jQuery('#arto-body').addClass(" arto-menu-mobile-active");
            return false;
        });

        jQuery('#arto-menu-close').on( 'click', function(){
            jQuery('#arto-body').removeClass(" arto-menu-mobile-active");
            return false;
        });


        // Dropdown indicators - plus sign
        jQuery('.arto-menu-mobile-holder li').each(function(){
            if(jQuery(this).find('> ul').length > 0) {
                jQuery(this).find('> a').append('<span class="sf-with-ul"></span>');
            }
        });


        jQuery('.arto-menu-mobile-holder li > a .sf-with-ul').on( 'click', function(){
            jQuery(this).toggleClass(' arto-mobile-submenu-active');
            jQuery(this).parent().parent().toggleClass(' arto-menu-open');
            jQuery(this).parent().parent().find('> ul').stop(true,true).slideToggle();
            return false;
        });


        // When mobile menu is open adjust the top spacing based on the social icons visible
        if ( window.innerWidth < 768 ) {
            var $mobileMenuTop = jQuery('.arto-menu-mobile-top').outerHeight();

            jQuery('.arto-menu-mobile-holder').css('margin-top', $mobileMenuTop);
        }


        // WP Media Embed & Iframe
        // -----------------------------------------------------------------------------
        // Oh! Load in ready. Amazing...
        jQuery(window).load(function(){

            jQuery('audio, video').css('visibility','visible');


            // Arto style gallery - royal slider
            // -----------------------------------------------------
            var $sliderStyleGallery = jQuery( '.arto_style_gallery');

            if ( $sliderStyleGallery.length ) {
                $sliderStyleGallery.css({
                    'visibility': 'visible',
                    'opacity': '1'
                });

                var sliderStyleGallery = $sliderStyleGallery.royalSlider({
                    fullscreen: {
                        enabled: true,
                        nativeFS: false
                    },
                    controlNavigation: 'thumbnails',
                    autoScaleSlider: true,
                    autoScaleSliderWidth: 960,
                    autoScaleSliderHeight: 640,
                    loop: true,
                    imageScaleMode: 'fit-if-smaller',
                    navigateByClick: true,
                    numImagesToPreload: 2,
                    arrowsNav: true,
                    arrowsNavAutoHide: true,
                    arrowsNavHideOnTouch: true,
                    keyboardNavEnabled: true,
                    fadeinLoadedSlide: true,
                    globalCaption: true,
                    globalCaptionInside: false,
                    imageScalePadding: 20,
                    thumbs: {
                        appendSpan: true,
                        firstMargin: true
                    }
                }).data('royalSlider');

                if ( sliderStyleGallery && 'undefined' !== typeof sliderStyleGallery.ev ) {
                    sliderStyleGallery.ev.on('rsAfterContentSet', function (e, slideObject) {

                        // Add alt attr from thumb to the main slider image
                        var img = slideObject.holder.find('img').eq(0);
                        if (img && img.length) {
                            var alt = '',
                                $thumbnail = jQuery(slideObject.thumbnail);
                            if ($thumbnail.length) {
                                alt = $thumbnail.attr('alt');
                            }
                            img.attr('alt', alt);
                        }
                    });
                }
            }

        });

        /* help any external iframe embed fit & resize correctly */
        function wrapIframe(){
            $('iframe').each(function(){

                var $this = $(this),
                    attrId = $this.attr( 'id');

                // do nothing for google iframes (maybe there are adsense)
                if ( 'undefined' !== typeof attrId && -1 === attrId.indexOf( 'google' ) ) {

                    //make sure the iframe has a src (things like adsense don't)
                    if (typeof $this.attr('src') !== 'undefined' && !$this.parent().hasClass('arto-iframe-wrap') && !$this.hasClass('wp-embedded-content')) {

                        $this.wrap('<div class="arto-iframe-wrap"/>');

                        //add wmode=transparent to all youytube embeds to fix z-index issues in IE
                        if ($this.attr('src').indexOf('wmode=transparent') === -1) {
                            if ($this.attr('src').indexOf('?') === -1) {
                                $this.attr('src', $this.attr('src') + '?wmode=transparent');
                            } else {
                                $this.attr('src', $this.attr('src') + '&wmode=transparent');
                            }
                        }
                    }
                }
            });
        }
        function wrapEmbed(){
            $('embed').each(function(){
                var $this = $(this);
                // do nothing for google iframes (maybe there are adsense)
                if ( -1 === $this.attr( 'id').indexOf( 'google' ) ) {
                    $this.wrap('<div class="arto-iframe-wrap"/>');
                }
            });
        }
        wrapEmbed();
        wrapIframe();




        artoShortcodes = {

            arrVideoEmbeded: [],

            arrAudioEmbeded: [],

            init: function() {

                // Get video embeded shortcodes
                var videoShortcodes = $( '.wp-video-shortcode' );
                if ( videoShortcodes.length ) {
                    videoShortcodes.each(function( index, el ) {
                        artoShortcodes.addVideoEmbeded( $(el) );
                    });
                }

                // Get audio embeded shortcodes
                var audioShortcodes = $( '.wp-audio-shortcode' );
                if ( audioShortcodes.length ) {
                    audioShortcodes.each(function( index, el ) {
                        artoShortcodes.addAudioEmbeded( $(el) );
                    });
                }
            },

            addVideoEmbeded: function( jqVideoEl ) {
                var videoEmbeded = {
                    jqVideoEl: jqVideoEl,
                    jqVideoWrapper: jqVideoEl.closest( '.wp-video' ).parent(),

                    aspectRatio: artoShortcodes._getAspectRatio( jqVideoEl )
                };
                artoShortcodes.arrVideoEmbeded.push( videoEmbeded );
            },

            addAudioEmbeded: function( jqVideoEl ) {
                var audioEmbeded = {
                    jqAudioEl: jqVideoEl,
                    jqAudioWrapper: jqVideoEl.closest( '.wp-video' )
                };
                artoShortcodes.arrAudioEmbeded.push( audioEmbeded );
            },

            resizeShortcodes: function() {
                artoShortcodes._resizeVideoEmbeded();
                artoShortcodes._resizeAudioEmbeded();
            },

            _resizeVideoEmbeded: function() {
                //console.log(artoShortcodes.arrVideoEmbeded.length);
                for (var i = 0; i < artoShortcodes.arrVideoEmbeded.length; i++ ) {
                    var currentVideoEmbeded = artoShortcodes.arrVideoEmbeded[ i ];
                    if ( undefined !== currentVideoEmbeded.aspectRatio ) {

                        var wrapperWidth = currentVideoEmbeded.jqVideoWrapper.width(),
                            wrapperHeight = currentVideoEmbeded.jqVideoWrapper.height();

                        if ( undefined === wrapperWidth || undefined === wrapperHeight || null === wrapperWidth || null === wrapperHeight ) {
                            continue;
                        }

                        wrapperWidth = parseInt( currentVideoEmbeded.jqVideoWrapper.width().toString().replace( 'px', '' ), 10 );
                        wrapperHeight = parseInt( currentVideoEmbeded.jqVideoWrapper.height().toString().replace( 'px', '' ), 10 );

                        if ( undefined !== wrapperHeight && undefined !== wrapperWidth && 0 !== wrapperHeight ) {
                            var
                                newWidth,
                                newHeight,
                                wrapperAspectRatio = wrapperWidth / wrapperHeight;

                            if ( wrapperAspectRatio > currentVideoEmbeded.aspectRatio ) {

                                // 1. wrapper width > video width => consider wrapper height as reference and adjust wrapper width

                                newHeight = wrapperHeight,
                                    newWidth = newHeight * currentVideoEmbeded.aspectRatio;

                            } else {

                                // 2. wrapper width <= video width => consider wrapper width as reference and adjust wrapper height

                                newWidth = wrapperWidth,
                                    newHeight = newWidth / currentVideoEmbeded.aspectRatio;
                            }

                            if ( undefined !== newWidth && undefined !== newHeight ) {
                                currentVideoEmbeded.jqVideoEl.css({
                                    width: newWidth + 'px'
                                });
                            }
                        }
                    }
                }
            },

            _resizeAudioEmbeded: function() {
                for ( var i = 0; i < artoShortcodes.arrAudioEmbeded.length; i++ ) {

                    var
                        currentAudioEmbeded = artoShortcodes.arrAudioEmbeded[ i ],
                        wrapperWidth = currentAudioEmbeded.jqAudioWrapper.width();

                    if ( undefined === wrapperWidth || null === wrapperWidth ) {
                        continue;
                    }

                    wrapperWidth = parseInt( currentAudioEmbeded.jqAudioWrapper.width().toString().replace( 'px', '' ), 10 );

                    if ( undefined !== wrapperWidth ) {
                        currentAudioEmbeded.jqAudioEl.css({
                            width: wrapperWidth + 'px'
                        });
                    }
                }
            },

            _getAspectRatio: function( element ) {
                var
                    width = parseInt( element.width().toString().replace( 'px', '' ), 10 ),
                    height = parseInt( element.height().toString().replace( 'px', '' ), 10 );

                if ( undefined !== height && undefined !== width && 0 !== height ) {
                    return width / height;
                }
                return undefined;
            }
        };

        // It looks for the shortcodes
        artoShortcodes.init();





        var $owlCarousel = $('.arto-grid .owl-carousel');

        if ( $owlCarousel.length ) {
            $owlCarousel.each(function() {

                var  owlCarouselSettings = {
                        loop: true,
                        nav: true,
                        dots: false,
                        margin: 10,
                        navText: ["<span class=\"arto-icons-svg\"><svg><use xlink:href=\"#arto-icons-arrow-12\"></use></svg></span>","<span class=\"arto-icons-svg\"><svg><use xlink:href=\"#arto-icons-arrow-12\"></use></svg></span>"],
                        //autoplayHoverPause: true, // When it's set to true, it causes a bug on mobile (it start autoplay after user initiate a slide)
                        smartSpeed: 1000,
                        responsive: {
                            // breakpoint from 0 up
                            0:{
                                items:1,
                                stagePadding: 0
                                // nav:true
                            },
                            // breakpoint from 768px up
                            768:{
                                items:2
                                // nav:false
                            },
                            // breakpoint from 1141 up
                            1141:{
                                items:3
                                // nav:true,
                                // loop:false
                            }
                        }
                    };

                //owlCarouselSettings.autoWidth = true;

                var $this = $(this);

                if ( 2 > $this.find( '.arto-grid-element').length ) {

                    owlCarouselSettings.autoWidth = true;
                    owlCarouselSettings.loop = false;
                    owlCarouselSettings.navText = ["",""];
                    owlCarouselSettings.nav = false;

                    $this.owlCarousel( owlCarouselSettings);

                    $this.addClass( 'owl-no-pagination' );

                } else {

                    var dataItemsOnDesktop = $this.data( 'items_on_desktop'),
                        dataItemsOnTablet = $this.data( 'items_on_tablet'),
                        dataType = $this.data( 'type' ),
                        dataMargin = $this.data( 'margin' ),
                        dataStagePadding = $this.data( 'stage_padding' ),
                        dataDots = $this.data( 'dots' );

                    if ( 'undefined' !== typeof dataItemsOnTablet ) {
                        owlCarouselSettings.responsive[768].items = parseInt(dataItemsOnTablet, 10);
                    }
                    if ( 'undefined' !== typeof dataItemsOnDesktop ) {
                        owlCarouselSettings.responsive[1141].items = parseInt(dataItemsOnDesktop, 10);
                    }
                    if ( 'undefined' !== typeof dataType ) {

                        if ( '' === dataType ) {

                            // Navigatia fiind automata nu mai e nevoie de navigatie. Sliderul din grid ar trebui sa se intinda full, lasand loc doar pentru titlu.
                            //owlCarouselSettings.nav = false;

                            // Astea se aplica doar cand ai 1 item. Face fade, nu scroll. Cand afisezi mai multe deodata nu are cum sa mearga, logic. Dar nici astia n-au specificat asta pe undeva
                            //owlCarouselSettings.animateOut = 'fadeOut';
                            //owlCarouselSettings.animateIn = 'fadeIn';

                            // Aceste setari is pentru a face scroll continuu
                            // owlCarouselSettings.autoplay = true;
                            // owlCarouselSettings.slideTransition = 'linear';
                            // owlCarouselSettings.autoplayTimeout = 12000;
                            // owlCarouselSettings.smartSpeed = 8000;

                            //// Aceste setari is pentru a face scroll unul cate unul
                            owlCarouselSettings.autoplay = true;
                            owlCarouselSettings.autoplayTimeout = 10000;
                        }
                    }
                    if ( 'undefined' !== typeof dataMargin ) {
                        owlCarouselSettings.margin = dataMargin;
                    }
                    if ( 'undefined' !== typeof dataStagePadding ) {
                        owlCarouselSettings.stagePadding = dataStagePadding;
                    }
                    if ( 'undefined' !== typeof dataDots && dataDots.toString().length ) {
                        owlCarouselSettings.dots = dataDots;
                    }

                    var currentCarousel = $this.owlCarousel( owlCarouselSettings);

                    if ( 'undefined' !== typeof dataType && '' === dataType ) {
                        currentCarousel.trigger( 'play.owl.autoplay' );
                    }

                    currentCarousel.on('changed.owl.carousel', function(event) {

                        if ( 'undefined' !== typeof event &&
                            'undefined' !== typeof event.property &&
                            'undefined' !== typeof event.property.value &&
                            'undefined' !== typeof event.property.name &&
                            'settings' === event.property.name ) {

                            // Check if the current viewport is for 'tablet'
                            if ( event.property.value.items === owlCarouselSettings.responsive[768].items ) {

                                $this.find('[data-desktop-style]').each(function() {

                                    var dataTabletStyle = $(this).data('tablet-style'),
                                        dataStyleAttr = $(this).data('style-attr');

                                    if ( 'undefined' !== typeof dataTabletStyle && 'undefined' !== typeof dataStyleAttr ) {
                                        $(this).attr( dataStyleAttr, dataTabletStyle );
                                    }
                                });

                            // Check if the current viewport is for 'desktop'
                            } else if ( event.property.value.items === owlCarouselSettings.responsive[1141].items ) {

                                $this.find('[data-tablet-style]').each(function() {

                                    var dataDesktopStyle = $(this).data('desktop-style'),
                                        dataStyleAttr = $(this).data('style-attr');

                                    if ( 'undefined' !== typeof dataDesktopStyle && 'undefined' !== typeof dataStyleAttr ) {
                                        $(this).attr( dataStyleAttr, dataDesktopStyle );
                                    }
                                });
                            }
                        }
                    });

                    $this.find( 'button' ).each(function() {
                        var _$this = $(this);
                        _$this.get(0).addEventListener('click', function(event) {
                            if ( 'undefined' === typeof currentCarousel.artoTimerChanged ) {
                                currentCarousel.artoTimerChanged = setTimeout(function(){
                                    currentCarousel.artoTimerChanged = undefined;
                                }, 700);
                            } else {
                                if (event.preventDefault) {
                                    event.preventDefault();
                                } else {
                                    event.returnValue = false;
                                }

                                if (event.stopPropagation) {
                                    event.stopPropagation();
                                } else {
                                    event.cancelBubble = true;
                                }

                                return false;
                            }
                        }, true);
                    });

                    // Important!
                    // The events must be captured on .owl-nav to not allow multiple navigation click on slider (This is necessary only on IE!)
                    if ( artoAgent.isIE10 || artoAgent.isIE11 ) {
                        $this.find('.owl-nav').each(function () {
                            var _$this = $(this);
                            _$this.get(0).addEventListener('click', function (event) {
                                if ('undefined' === typeof currentCarousel.artoTimerChanged) {
                                    currentCarousel.artoTimerChanged = setTimeout(function () {
                                        currentCarousel.artoTimerChanged = undefined;
                                    }, 700);
                                } else {
                                    if (event.preventDefault) {
                                        event.preventDefault();
                                    } else {
                                        event.returnValue = false;
                                    }

                                    if (event.stopPropagation) {
                                        event.stopPropagation();
                                    } else {
                                        event.cancelBubble = true;
                                    }

                                    return false;
                                }
                            }, true);
                        });
                    }
                }
            });
        }




        // Remove loader from grid sliders
        // Owl events were not reliable to remove it, and window.onload is too late (even it is set to remove the class if it's fast enough!)
        $( '.arto-grid .arto-loader.arto-pos-slider' ).each(function(index, el ) {

            if ( 'undefined' === typeof window.artoSettings.postSliders ) {
                window.artoSettings.postSliders = {};
            }

            var sliderInterval = setInterval(function( $this ) {

                var $artoGrid = $this.closest( '.arto-grid' );
                if ( $artoGrid.length ) {
                    var $owlCarousel = $artoGrid.find( '.owl-carousel' );
                    if ( $owlCarousel.length && $owlCarousel.hasClass( 'owl-loaded' ) ) {
                        window.clearInterval( sliderInterval );

                        // This class is finally removed by window onload (@see arto-grid.js)
                        $this.removeClass( 'arto-loading-show' );
                    }
                }

            }, 100, $(this));

        });

    });


    jQuery( window ).load(function() {

        // We trigger scroll to inform any dependent library (ex artoMenu)
        jQuery( window ).trigger( 'scroll' );

        setTimeout(function() {

            // We are on load, so we have to wait for ArtoStretch js library to finish its work! (ex. it's necessary for title template 11, because the image wrapper dimensions changes)
            artoParallaxHeader.init();
        }, 100);

        //artoParallaxImage.init();


        artoStretch.stretchImages();
        jQuery('#arto-body').removeClass( 'arto-body-hidden' );


        artoTitleTemplate.do();


        artoYoutubePlayers.do();
        artoVimeoPlayers.do();
        artoSoundCloudPlayers.do();


        /*
         Important!
         For the moment it is on load. It should be moved on ready, and to monitor permanently the growing of
         the arto-main-container and arto-sidebar-container
         */

        // Important! This timeout is necessary to wait for any transition to finish (ex. opacity of stretched title template image)
        // Without it, the sidebar can position itself over the title template
        setTimeout(function() {

            var $artoSidebarHolder = jQuery( '.arto-sidebar-holder:first' );
            if ( $artoSidebarHolder.length ) {

                var $artoMainContainer = $artoSidebarHolder.closest( '.arto-row' ).find( '.arto-main-container' );
                if ( $artoMainContainer.length ) {

                    var $artoSidebarContainer = $artoSidebarHolder.closest( '.arto-sidebar-container' );
                    if ( $artoSidebarContainer.length ) {

                        // Ready to init the sidebar
                        var themeArtoSidebar = new artoSidebar();

                        // We mark it that's the theme sidebar, to know it
                        themeArtoSidebar.is_theme_sidebar = true;

                        // Register it
                        artoSidebars.push( themeArtoSidebar );

                        // Initialize it
                        themeArtoSidebar.init( $artoSidebarHolder, $artoMainContainer );
                    }
                }
            }


            jQuery( '.vc_column_container.is-sticky').each(function(index, element) {

                // The wrapper that should move, all sidebar properties being applied over it, because into the same column, it could be more elements,
                // not only the 'wpb_widgetiset_column', and all must scroll as an entire sidebar content
                var $vcColumnContainer = jQuery( element ),
                    $vcColumnInner = $vcColumnContainer.find( '.vc_column-inner:first' );

                if ( ! $vcColumnInner.length ) {
                    return;
                }

                var $vcRow = $vcColumnContainer.closest( '.vc_row' );

                if ( $vcColumnContainer.length && $vcRow.length ) {
                    var newSidebar = new artoSidebar();
                    artoSidebars.push( newSidebar );
                    newSidebar.init( $vcColumnInner, $vcRow );
                }
            });


            // Set sidebars initial positions
            if ( artoSidebars.length ) {
                jQuery.each( artoSidebars, function( index, artoSidebar ) {
                    artoSidebar.reposition();
                });
            }

        }, 400);
    });


    jQuery( window ).scroll(function() {
        artoGlobal.rise_arto_scroll_events();

        artoEvents.windowScrollTop = jQuery( window ).scrollTop();
        artoEvents.windowPageYOffset = window.pageYOffset;
        artoEvents.windowPageXOffset = window.pageXOffset;

        artoUtility.scroll();

        //artoMenuAffix.scroll();

        artoMenu.scroll();
        artoMenuMobile.scroll();

        if ( artoSidebars.length ) {
            jQuery.each( artoSidebars, function( index, artoSidebar ) {
                artoSidebar.scroll();
            });
        }

        artoEffect.compute_all_items();
    });


    jQuery( window ).resize(function() {
        artoGlobal.rise_arto_resize_events();

        artoEvents.windowInnerHeight = window.innerHeight;
        artoEvents.windowInnerWidth = window.innerWidth;


        artoTitleTemplate.resize();

        artoMenu.resize();
        artoMenuMobile.resize();
    });


    setInterval(function(){
        if ( artoGlobal.arto_early_resize ) {
            artoGlobal.arto_early_resize = false;

            //console.log('early resize');

            artoEffect.arto_events_resize();

            // Stretch template title images
            artoStretch.stretchImages();

            if ( artoViewport.checkIntervals() ) {

                // Stretch template title images
                artoStretch.lateStretchImages();

                artoGlobal.recomputeSidebarsAtIntervals();

                //console.log(artoViewport.previousInterval);

            } else {

                // Recompute sidebars
                artoGlobal.recomputeSidebars();
            }
        }

        if ( artoGlobal.arto_early_scroll ) {
            artoGlobal.arto_early_scroll = false;

            //console.log('early scroll');
        }

    }, artoGlobal.ARTO_EARLY_TIMER );


    setInterval(function(){
        if ( artoGlobal.arto_late_resize ) {
            artoGlobal.arto_late_resize = false;

            // Check the wpadminbar position
            //artoMenuAffix.setWPAdminBarPosition();
            //artoMenuAffix.reposition();

            artoShortcodes.resizeShortcodes();

            if ( artoViewport.checkIntervals() ) {

                // Here should be what we need at viewport changes

                var $artoIconSelected = jQuery( '.arto-sermon-icon-files > .arto-icons.selected' );

                if ( $artoIconSelected.length ) {
                    artoViewport.checkHeaderPlayer( $artoIconSelected.data( 'wrapper' ) );
                }

                // Stretch template title images
                artoStretch.lateStretchImages();

                //console.log(artoViewport.previousInterval);
            }

            artoParallaxHeader.reinit();

            artoListMore.resize();

            //console.log('late resize');
        }

        if ( artoGlobal.arto_late_scroll ) {
            artoGlobal.arto_late_scroll = false;

            // Check lazy load pagination items
            artoPagination.checkLazyLoadItems();

            artoBackToTop.checkLazyLoadItem();

            //console.log('late scroll');
        }
    }, artoGlobal.ARTO_LATE_TIMER );


    // Important! Usually this call it should be done on resize or scroll event - AT READY OR LOAD, but we need it call it earlier because other libraries
    // use its settings (ex. artoPlayers already uses the current interval settings)
    artoViewport.checkIntervals();

})();
