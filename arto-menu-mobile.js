/**
 * Created by ArtoCreative on 06.04.2019.
 */

/* global jQuery:{} */

/* global artoDebug:{} */
/* global artoEvents:{} */
/* global artoSidebars:{} */

var artoMenuMobile;

(function($, undefined) {

    'use strict';

    artoMenuMobile = {

        // It allows logging messages to console (@see artoDebug)
        _debugMode: false,

        toString: function () {
            return 'Mobile Menu';
        },

        _beforePreviousPosition: undefined, // 0 - hidden, 1 - transition, 2 - shown
        _previousPosition: undefined, // 0 - hidden, 1 - transition, 2 - shown
        _previousScrolledPosition: undefined,

        _currentTypeMenu: undefined,
        _currentTypeMove: undefined,
        _currentTypeTopBar: undefined,

        $_menu: undefined,
        $_topMenu: undefined,
        $_pageContent: undefined,

        _topMenuHeight: 0,

        // top distance where menu does nothing
        _inactiveTopDistance: 300,

        // extra top distance where the menu catches
        _extraTopDistanceCatchMenu: 100,

        // Here we set the height of the wp admin bar
        _extraTopDistance: 0,

        // Timeout used to recompute the sidebars positions (some sidebars' position depend of menu position)
        // This timeout is necessary because the menu transition can finish after the sidebar is set to the new position.
        // And because of this, the sidebar
        _timerMenuShow: undefined,

        _timerResize: undefined,

        // Stop execution under 768px width
        _doJob: true,

        // The class that will apply to the menu when it's made sticky (the modified menu)
        cssClsSticky: 'arto-sticky-menu',

        _isInitialized: false,


        /**
         * It gives specifications (height, fonts, etc) for different types
         * Info (here will be all menu descriptions) :
         * 1. type0 - right the normal menu
         * 2. type1 - the modified menu in simple form
         */
        typeMenu: {
            type0: {

                info: function() {
                    return 'type0';
                },

                // This should be set at init
                height: -1,

                // The css class that defines how menu shows
                cssClsShow: 'arto-type0-show'
            },
            type1: {

                info: function() {
                    return 'type1';
                },

                height: 60,

                // The css class that add the menu style
                cssClsStyle0: 'arto-type1-style0',

                cssClsStyle1: 'arto-type1-style1',
                cssClsStyle1_revert: 'arto-type1-style1-revert',

                // The css class that defines how menu shows
                cssClsShow0: 'arto-type1-show0',
                cssClsShow1: 'arto-type1-show1'
            }
        },


        /**
         * Menu typeMove gives specification on how the menu moves from shown to hidden and vice-versa
         */
        typeMove: {
            type0: {
                // it appears immediately when it's on

                info: function() {
                    return 'type0';
                }
            },
            type1: {
                // it appears on scroll up and hides at scroll down (with transition)

                info: function() {
                    return 'type1';
                }
            }
        },


        /**
         * Menu typeTopBar gives specification on how the top bar is included in the menu
         */
        typeTopBar: {
            type0: {
                // it's hidden in the sticky menu

                info: function() {
                    return 'type0';
                }
            },
            type1: {
                // it's shown in the sticky menu

                info: function() {
                    return 'type1';
                }
            }
        },


        /**
         *
         * @param menuSelector - it's mandatory
         * @param contentSelector - it's mandatory
         * @param topMenuSelector - it's optional (for the moment)
         */
        init: function( menuSelector, contentSelector, topMenuSelector ) {

            $.extend( true, artoMenuMobile, artoDebug );

            if ( undefined === menuSelector || ( artoMenuMobile.$_menu = $( menuSelector ) ) && ! artoMenuMobile.$_menu.length ) {
                artoMenuMobile._logConsole( 'Menu jQuery object cound not be set!' );
                return;
            } else if ( undefined === contentSelector || ( artoMenuMobile.$_pageContent = $( contentSelector ) ) && ! artoMenuMobile.$_pageContent.length ) {
                artoMenuMobile._logConsole( 'Content Menu jQuery object cound not be set!' );
                return;
            } else if ( undefined === topMenuSelector || ( artoMenuMobile.$_topMenu = $( topMenuSelector ) ) && ! artoMenuMobile.$_topMenu.length ) {
                artoMenuMobile._logConsole( 'Top Menu jQuery object cound not be set!' );
            }


            // Keep the menu height (this is used when the 'normal' menu is entirely made 'modified')
            artoMenuMobile.typeMenu.type0.height = artoMenuMobile.$_menu.outerHeight( true );

            var
            // These are the default settings (They are overwritten from theme panel header settings)
                typeMenu,
                typeMove,
                typeTopBar;

            if ( 'undefined' !== typeof window.artoSettings &&
                'undefined' !== typeof window.artoSettings.header_menu &&
                3 === window.artoSettings.header_menu.length ) {

                var headerMenuSettings = window.artoSettings.header_menu.split('');

                typeMenu = 'type' + headerMenuSettings[0];
                typeMove = 'type' + headerMenuSettings[1];
                typeTopBar = 'type' + headerMenuSettings[2];

            } else {
                return;
            }


            // The menu current type doesn't change over time
            if ( ! artoMenuMobile.setCurrentType( 'typeMenu', '_currentTypeMenu', typeMenu ) ||
                ! artoMenuMobile.setCurrentType( 'typeMove', '_currentTypeMove', typeMove ) ||
                ! artoMenuMobile.setCurrentType( 'typeTopBar', '_currentTypeTopBar', typeTopBar ) ) {
                return;
            }

            // Top menu height doesn't change, so it's set only here
            artoMenuMobile.setTopMenuHeight();

            // Check for extra top distance
            //artoMenuMobile._checkWPAdminBar();

            artoMenuMobile._isInitialized = true;

            if ( artoEvents.windowInnerWidth > 767 ) {

                // Initialize menu (to be ready for responsive at resize) but stop it going further on mobile
                artoMenuMobile._doJob = false;
            }
        },

        setCurrentType: function( type, menuProp, typeValue ) {
            var currentTypeHasBeenSet = false;

            if ( artoMenuMobile.hasOwnProperty( type ) &&
                artoMenuMobile.hasOwnProperty( menuProp ) &&
                artoMenuMobile[ type ].hasOwnProperty( typeValue ) ) {
                artoMenuMobile[ menuProp ] = artoMenuMobile[ type ][ typeValue ];
                currentTypeHasBeenSet = true;
            } else {
                artoMenuMobile._logConsole( menuProp + ' could not be set!' );
            }

            return currentTypeHasBeenSet;
        },


        setTopMenuHeight: function() {
            if ( 'undefined' === typeof artoMenuMobile.$_topMenu ) {
                artoMenuMobile._topMenuHeight = 0;
            } else {
                artoMenuMobile._topMenuHeight = artoMenuMobile.$_topMenu.outerHeight( true );
            }
        },


        _checkWPAdminBar: function() {
            var wpAdminBar = $( '#wpadminbar' );
            if ( wpAdminBar.length ) {
                artoMenuMobile._extraTopDistance = wpAdminBar.outerHeight( true );
            }
        },


        resize: function() {

            clearTimeout( artoMenuMobile._timerResize );

            if ( artoEvents.windowInnerWidth > 767 ) {

                if ( artoMenuMobile._isInitialized ) {
                    artoMenuMobile._doJob = false;

                    artoMenuMobile.$_pageContent.css({
                        'padding-top': ''
                    });
                }
            } else {

                artoMenuMobile._timerResize = setTimeout(function () {
                    if ( artoMenuMobile._isInitialized ) {
                        artoMenuMobile._doJob = true;
                        artoMenuMobile.typeMenu.type0.height = artoMenuMobile.$_menu.outerHeight(true);
                        artoMenuMobile.$_pageContent.css({
                            'padding-top': artoMenuMobile.typeMenu.type0.height
                        });

                        // Recompute the top menu height (it can be miscomputed at initialization - maybe the menu was initialized on mobile)
                        artoMenuMobile.setTopMenuHeight();

                        jQuery('#arto-body').removeClass(" arto-menu-mobile-active"); //used to overflow hidden when mobile menu active

                        artoMenuMobile.scroll();
                    }
                }, 200);
            }
        },



        scroll: function() {

            if (!artoMenuMobile._isInitialized || !artoMenuMobile._doJob) {
                return;
            }

            artoMenuMobile._logConsole(
                ' Type: ' + artoMenuMobile._currentTypeMenu.info() +
                ' Move: ' + artoMenuMobile._currentTypeMove.info() +
                ' TopBar: ' + artoMenuMobile._currentTypeTopBar.info());

            artoMenuMobile._logWindow(artoMenuMobile._previousPosition);


            artoMenuMobile._beforePreviousPosition = artoMenuMobile._previousPosition;


            // Internal variable
            var topDistance;


            switch ( artoMenuMobile._currentTypeMenu ) {

                // case 1: The modified menu is like the normal menu
                case artoMenuMobile.typeMenu.type0:
                    switch ( artoMenuMobile._currentTypeMove ) {
                        case artoMenuMobile.typeMove.type0:
                            switch ( artoMenuMobile._currentTypeTopBar ) {
                                case artoMenuMobile.typeTopBar.type0:

                                    if ( artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenuMobile._extraTopDistance + artoMenuMobile.typeMenu.type0.height &&
                                        artoEvents.windowScrollTop < artoMenuMobile._inactiveTopDistance + artoMenuMobile._extraTopDistance + artoMenuMobile.typeMenu.type0.height + artoMenuMobile._extraTopDistanceCatchMenu ) {

                                        var newMenuHeight = artoMenuMobile.$_menu.outerHeight( true );

                                        topDistance = artoMenuMobile._extraTopDistance - newMenuHeight;

                                        artoMenuMobile.$_menu.css({
                                            'position': 'fixed',
                                            'top': topDistance
                                        });

                                        artoMenuMobile.$_pageContent.css({
                                            'padding-top': artoMenuMobile.typeMenu.type0.height
                                        });

                                        // The general sticky menu css class is added
                                        artoMenuMobile.$_menu.addClass(artoMenuMobile.cssClsSticky);

                                    } else if ( artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenuMobile._extraTopDistance + artoMenuMobile.typeMenu.type0.height + artoMenuMobile._extraTopDistanceCatchMenu ) {

                                        // The general sticky menu css class is added
                                        artoMenuMobile.$_menu.addClass( artoMenuMobile.cssClsSticky );

                                        var distance = artoMenuMobile._extraTopDistance - artoMenuMobile._topMenuHeight;

                                        artoMenuMobile.$_menu.css({
                                            'position': 'fixed',
                                            'top': distance,
                                            'transition': 'top 0.3s'
                                        });

                                        artoMenuMobile.$_pageContent.css({
                                            'padding-top': artoMenuMobile.typeMenu.type0.height
                                        });

                                        artoMenuMobile._doJob = false;

                                        setTimeout(function() {
                                            artoMenuMobile._doJob = true;
                                        });

                                    } else {

                                        // The general sticky menu css class is removed
                                        artoMenuMobile.$_menu.removeClass( artoMenuMobile.cssClsSticky );

                                        artoMenuMobile.$_menu.css({
                                            'position': '',
                                            'top': '',
                                            'transition': 'none'
                                        });

                                        artoMenuMobile.$_pageContent.css({
                                            'padding-top': ''
                                        });
                                    }

                                    break;
                                case artoMenuMobile.typeTopBar.type1:
                                    // For further development
                                    break;
                            }
                            break;


                        case artoMenuMobile.typeMove.type1:
                            switch ( artoMenuMobile._currentTypeTopBar ) {
                                case artoMenuMobile.typeTopBar.type0:

                                    if ( artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenuMobile._extraTopDistance + artoMenuMobile.typeMenu.type0.height + artoMenuMobile._extraTopDistanceCatchMenu ) {

                                        if (undefined === artoMenuMobile._previousPosition) {

                                            // This is the case when no previous position was computed

                                            // The shown position is set
                                            artoMenuMobile._previousPosition = 0;
                                            // The scrolled position is preserved for the next scroll computation
                                            artoMenuMobile._previousScrolledPosition = artoEvents.windowScrollTop;

                                            var newMenuHeight = artoMenuMobile.$_menu.outerHeight(true);

                                            topDistance = artoMenuMobile._extraTopDistance - newMenuHeight;

                                            artoMenuMobile.$_menu.css({
                                                'position': 'fixed',
                                                'top': topDistance
                                            });

                                            artoMenuMobile.$_pageContent.css({
                                                'padding-top': artoMenuMobile.typeMenu.type0.height
                                            });

                                            // The general sticky menu css class is added
                                            artoMenuMobile.$_menu.addClass(artoMenuMobile.cssClsSticky);

                                        } else {

                                            switch (artoMenuMobile._previousPosition) {
                                                // hidden
                                                case 0:
                                                    switch (artoMenuMobile._getScrollDirection()) {

                                                        // not scroll
                                                        case 0:
                                                            // Do nothing!
                                                            break;

                                                        // down
                                                        case 1:

                                                            // The general sticky menu css class is added
                                                            artoMenuMobile.$_menu.addClass(artoMenuMobile.cssClsSticky);

                                                            break;

                                                        // up
                                                        case 2:

                                                            topDistance = artoMenuMobile._extraTopDistance - artoMenuMobile._topMenuHeight;

                                                            artoMenuMobile.$_menu.css({
                                                                'position': 'fixed',
                                                                'top': topDistance,
                                                                'transition': 'top 0.3s'
                                                            });

                                                            artoMenuMobile.$_pageContent.css({
                                                                'padding-top': artoMenuMobile.typeMenu.type0.height
                                                            });

                                                            // Prepare the next step

                                                            // Mark the menu as it's shown
                                                            artoMenuMobile._previousPosition = 2;

                                                            // The general sticky menu css class is added
                                                            artoMenuMobile.$_menu.addClass(artoMenuMobile.cssClsSticky);

                                                            break;

                                                    }
                                                    break;

                                                // in transition - this should not be present for trasition moving of the menu
                                                case 1:
                                                    switch (artoMenuMobile._getScrollDirection()) {

                                                    }
                                                    break;

                                                // shown
                                                case 2:
                                                    switch (artoMenuMobile._getScrollDirection()) {

                                                        // not scroll
                                                        case 0:
                                                            // Do nothing!
                                                            break;

                                                        // down
                                                        case 1:

                                                            var newMenuHeight = artoMenuMobile.$_menu.outerHeight(true);

                                                            topDistance = artoMenuMobile._extraTopDistance - newMenuHeight;

                                                            artoMenuMobile.$_menu.css({
                                                                'position': 'fixed',
                                                                'top': topDistance,
                                                                'transition': 'top 0.3s'
                                                            });

                                                            artoMenuMobile.$_pageContent.css({
                                                                'padding-top': artoMenuMobile.typeMenu.type0.height
                                                            });

                                                            // Prepare the next step

                                                            // Mark the menu as it's hidden
                                                            artoMenuMobile._previousPosition = 0;

                                                            break;

                                                        // up
                                                        case 2:
                                                            // Do nothing!
                                                            break;
                                                    }
                                                    break;
                                            }

                                            artoMenuMobile._previousScrolledPosition = artoEvents.windowScrollTop;
                                        }





                                    } else if ( artoEvents.windowScrollTop < artoMenuMobile._inactiveTopDistance + artoMenuMobile._extraTopDistance + artoMenuMobile.typeMenu.type0.height + artoMenuMobile._extraTopDistanceCatchMenu &&
                                        artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenuMobile._extraTopDistance + artoMenuMobile.typeMenu.type0.height ) {

                                        if (undefined === artoMenuMobile._previousPosition) {

                                            // This is the case when no previous position was computed

                                            // The shown position is set
                                            artoMenuMobile._previousPosition = 0;
                                            // The scrolled position is preserved for the next scroll computation
                                            artoMenuMobile._previousScrolledPosition = artoEvents.windowScrollTop;

                                            var newMenuHeight = artoMenuMobile.$_menu.outerHeight(true);

                                            topDistance = artoMenuMobile._extraTopDistance - newMenuHeight;

                                            artoMenuMobile.$_menu.css({
                                                'position': 'fixed',
                                                'top': topDistance
                                            });

                                            artoMenuMobile.$_pageContent.css({
                                                'padding-top': artoMenuMobile.typeMenu.type0.height
                                            });

                                            // The general sticky menu css class is added
                                            artoMenuMobile.$_menu.addClass(artoMenuMobile.cssClsSticky);

                                        } else {

                                            var newMenuHeight = artoMenuMobile.$_menu.outerHeight(true);

                                            topDistance = artoMenuMobile._extraTopDistance - newMenuHeight;

                                            artoMenuMobile.$_menu.css({
                                                'position': 'fixed',
                                                'top': topDistance,
                                                'transition': 'top 0.3s'
                                            });

                                            artoMenuMobile.$_pageContent.css({
                                                'padding-top': artoMenuMobile.typeMenu.type0.height
                                            });

                                            // Mark the menu as it's hidden
                                            artoMenuMobile._previousPosition = 0;

                                            artoMenuMobile._previousScrolledPosition = artoEvents.windowScrollTop;
                                        }




                                    } else {

                                        // Mark the menu as it's hidden
                                        artoMenuMobile._previousPosition = undefined;

                                        // The general sticky menu css class is removed
                                        artoMenuMobile.$_menu.removeClass( artoMenuMobile.cssClsSticky );

                                        //artoMenuMobile.$_menu.removeClass( artoMenuMobile.typeMenu.type0.cssClsShow );
                                        artoMenuMobile.$_menu.css({
                                            'position': '',
                                            'top': '',
                                            'transition': 'none'
                                        });

                                        artoMenuMobile.$_pageContent.css({
                                            'padding-top': ''
                                        });
                                    }

                                    break;
                                case artoMenuMobile.typeTopBar.type1:
                                    // For further development
                                    break;
                            }
                            break;
                    }
                    break;

                //case artoMenuMobile.typeMenu.type1:
                //
                //    // For further development
                //
                //    switch ( artoMenuMobile._currentTypeMove ) {
                //        case artoMenuMobile.typeMove.type0:
                //            switch ( artoMenuMobile._currentTypeTopBar ) {
                //                case artoMenuMobile.typeTopBar.type0:
                //                    break;
                //                case artoMenuMobile.typeTopBar.type1:
                //                    // For further development
                //                    break;
                //            }
                //            break;
                //        case artoMenuMobile.typeMove.type1:
                //            switch ( artoMenuMobile._currentTypeTopBar ) {
                //                case artoMenuMobile.typeTopBar.type0:
                //                    break;
                //                case artoMenuMobile.typeTopBar.type1:
                //                    // For further development
                //                    break;
                //            }
                //            break;
                //    }
                //    break;
            }


            /**
             * Very Important!
             *
             * If the menu was shown (it was hidden before: 0 === artoMenuMobile._beforePreviousPosition and now is shown: 2 === artoMenuMobile._previousPosition), we are ready
             * to reposition sidebars according to the menu.
             *
             * It's necessary only for those sidebars higher than viewport! @see artoSidebar.repositionToMenu
             *
             */

            if ( 2 === artoMenuMobile._previousPosition && 0 === artoMenuMobile._beforePreviousPosition ) {

                if ( undefined !== artoMenuMobile._timerMenuShow ) {
                    clearTimeout( artoMenuMobile._timerMenuShow );
                }

                artoMenuMobile._timerMenuShow = setTimeout(function () {
                    // Set sidebars initial positions
                    if (artoSidebars.length) {
                        jQuery.each(artoSidebars, function (index, artoSidebar) {
                            artoSidebar.repositionToMenu();
                        });
                    }
                }, 300);
            }
        },


        _getScrollDirection: function() {

            // This case should not happened
            if ( undefined === artoMenuMobile._previousScrolledPosition ) {
                return 0;
            }

            // Important! We need here -1 because it happens at scroll down to exist a little scroll up of 1 (or 0.5) pixels
            if ( artoMenuMobile._previousScrolledPosition < artoEvents.windowScrollTop - 0.5 ) {
                return 1; // down
            } else if ( artoMenuMobile._previousScrolledPosition > artoEvents.windowScrollTop ) {
                return 2; // up
            } else {
                return 0; // no scroll!
            }
        },



        /**
         * Helper used mainly by artoSidebar to position the sidebar considering the menu position.
         * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type)
         *
         * Important! This should be rewritten to reuse the precedent value if it has't been changed (now it's computed all the times)
         *
         * @param sidebarHeightLowerThanContainer
         * @param isThemeSidebar
         * @returns {Number}
         */
        getMenuTopDistance: function( sidebarHeightLowerThanContainer, isThemeSidebar ) {

            var contentPaddingTop = parseInt( artoMenuMobile.$_pageContent.css( 'padding-top').replace( 'px', '' ), 10 );
            var topMenu = parseInt( artoMenuMobile.$_menu.css( 'top').replace( 'px', '' ), 10 );

            // For 'type0' typeMenu, there's an extra gap added, to position the sidebar lower
            //if ( artoMenuMobile._currentTypeMenu === artoMenuMobile.typeMenu.type0 ) {
            //    contentPaddingTop += 30;
            //}

            if ( true === isThemeSidebar ) {

                //// These are for the theme sidebar, which needs to remove some padding-top pixels (try to remove it, to see the difference)
                //
                //if ( artoMenuMobile._currentTypeMenu === artoMenuMobile.typeMenu.type0 ) {
                //    contentPaddingTop -= 40;
                //} else {
                //    contentPaddingTop -= 70;
                //}

                contentPaddingTop += 20;

            } else {

                // This is for Visual Composer 'wpb_widgetised_column' component, which doesn't need padding-top pixels removing
                // Update: 'wpb_widgetised_column' has been replaced
                contentPaddingTop += 20;
            }

            switch ( artoMenuMobile._currentTypeMove ) {
                case artoMenuMobile.typeMove.type0:
                    if ( sidebarHeightLowerThanContainer ) {
                        return contentPaddingTop + topMenu;
                    } else {
                        return contentPaddingTop + topMenu;
                    }
                    break;

                case artoMenuMobile.typeMove.type1:
                    if ( sidebarHeightLowerThanContainer ) {
                        return contentPaddingTop + topMenu;
                    } else {
                        return contentPaddingTop + topMenu;
                    }
                    break;
            }

            // This case is when menu is not sticky
            return 20;
        }
    };


    jQuery(window).ready(function(){

        // We init at ready for having knowledge about the wp admin bar. Don't we need a top menu?
        artoMenuMobile.init( '#arto-menu-mobile-bar', '#arto-wrapper' );
    });

})(jQuery);