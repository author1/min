/**
 * Created by ArtoCreative on 02.04.2019.
 */

/* global jQuery:{} */

/* global artoDebug:{} */
/* global artoEvents:{} */
/* global artoMenuMobile:{} */
/* global artoSidebars:{} */


var artoMenu;

(function($, undefined) {

    'use strict';

    artoMenu = {

        // It allows logging messages to console (@see artoDebug)
        _debugMode: false,

        toString: function () {
            return 'Menu';
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
        _extraTopDistanceCatchMenu: 500,

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

            $.extend( true, artoMenu, artoDebug );

            if ( undefined === menuSelector || ( artoMenu.$_menu = $( menuSelector ) ) && ! artoMenu.$_menu.length ) {
                artoMenu._logConsole( 'Menu jQuery object cound not be set!' );
                return;
            } else if ( undefined === contentSelector || ( artoMenu.$_pageContent = $( contentSelector ) ) && ! artoMenu.$_pageContent.length ) {
                artoMenu._logConsole( 'Content Menu jQuery object cound not be set!' );
                return;
            } else if ( undefined === topMenuSelector || ( artoMenu.$_topMenu = $( topMenuSelector ) ) && ! artoMenu.$_topMenu.length ) {
                artoMenu._logConsole( 'Top Menu jQuery object cound not be set!' );
            }


            // Keep the menu height (this is used when the 'normal' menu is entirely made 'modified')
            artoMenu.typeMenu.type0.height = artoMenu.$_menu.outerHeight( true );

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
            if ( ! artoMenu.setCurrentType( 'typeMenu', '_currentTypeMenu', typeMenu ) ||
                ! artoMenu.setCurrentType( 'typeMove', '_currentTypeMove', typeMove ) ||
                ! artoMenu.setCurrentType( 'typeTopBar', '_currentTypeTopBar', typeTopBar ) ) {
                return;
            }

            // Top menu height doesn't change, so it's set only here
            artoMenu.setTopMenuHeight();

            // Check for extra top distance
            artoMenu._checkWPAdminBar();

            artoMenu._isInitialized = true;

            if ( artoEvents.windowInnerWidth <= 767 ) {

                // Initialize menu (to be ready for responsive at resize) but stop it going further on mobile
                artoMenu._doJob = false;
            }
        },

        setCurrentType: function( type, menuProp, typeValue ) {
            var currentTypeHasBeenSet = false;

            if ( artoMenu.hasOwnProperty( type ) &&
                artoMenu.hasOwnProperty( menuProp ) &&
                artoMenu[ type ].hasOwnProperty( typeValue ) ) {
                artoMenu[ menuProp ] = artoMenu[ type ][ typeValue ];
                currentTypeHasBeenSet = true;
            } else {
                artoMenu._logConsole( menuProp + ' could not be set!' );
            }

            return currentTypeHasBeenSet;
        },


        setTopMenuHeight: function() {
            if ( 'undefined' === typeof artoMenu.$_topMenu ) {
                artoMenu._topMenuHeight = 0;
            } else {
                artoMenu._topMenuHeight = artoMenu.$_topMenu.outerHeight( true );
            }
        },


        _checkWPAdminBar: function() {
            var wpAdminBar = $( '#wpadminbar' );
            if ( wpAdminBar.length ) {
                artoMenu._extraTopDistance = wpAdminBar.outerHeight( true );
            }
        },


        resize: function() {

            clearTimeout( artoMenu._timerResize );

            if ( artoEvents.windowInnerWidth <= 767 ) {

                if ( artoMenu._isInitialized ) {
                    artoMenu._doJob = false;

                    artoMenu.$_pageContent.css({
                        'padding-top': ''
                    });
                }
            } else {

                artoMenu._timerResize = setTimeout(function () {
                    if ( artoMenu._isInitialized ) {
                        artoMenu._doJob = true;
                        artoMenu.typeMenu.type0.height = artoMenu.$_menu.outerHeight(true);
                        artoMenu.$_pageContent.css({
                            'padding-top': artoMenu.typeMenu.type0.height
                        });

                        // Recompute the top menu height (it can be miscomputed at initialization - maybe the menu was initialized on mobile)
                        artoMenu.setTopMenuHeight();

                        jQuery('#arto-body').removeClass(" arto-menu-mobile-active"); //used to overflow hidden when mobile menu active

                        artoMenu.scroll();
                    }
                }, 200);
            }
        },



        scroll: function() {

            if (!artoMenu._isInitialized || !artoMenu._doJob) {
                return;
            }

            artoMenu._logConsole(
                ' Type: ' + artoMenu._currentTypeMenu.info() +
                ' Move: ' + artoMenu._currentTypeMove.info() +
                ' TopBar: ' + artoMenu._currentTypeTopBar.info());

            artoMenu._logWindow(artoMenu._previousPosition);


            artoMenu._beforePreviousPosition = artoMenu._previousPosition;


            // Internal variable
            var topDistance;


            switch ( artoMenu._currentTypeMenu ) {

                // case 1: The modified menu is like the normal menu
                case artoMenu.typeMenu.type0:
                    switch ( artoMenu._currentTypeMove ) {
                        case artoMenu.typeMove.type0:
                            switch ( artoMenu._currentTypeTopBar ) {
                                case artoMenu.typeTopBar.type0:

                                    if ( artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenu._extraTopDistance + artoMenu.typeMenu.type0.height &&
                                        artoEvents.windowScrollTop < artoMenuMobile._inactiveTopDistance + artoMenu._extraTopDistance + artoMenu.typeMenu.type0.height + artoMenu._extraTopDistanceCatchMenu ) {

                                        var newMenuHeight = artoMenu.$_menu.outerHeight( true );

                                        topDistance = artoMenu._extraTopDistance - newMenuHeight;

                                        artoMenu.$_menu.css({
                                            'position': 'fixed',
                                            'top': topDistance
                                        });

                                        artoMenu.$_pageContent.css({
                                            'padding-top': artoMenu.typeMenu.type0.height
                                        });

                                        // The general sticky menu css class is added
                                        artoMenu.$_menu.addClass(artoMenu.cssClsSticky);

                                    } else if ( artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenu._extraTopDistance + artoMenu.typeMenu.type0.height + artoMenu._extraTopDistanceCatchMenu ) {

                                        var distance = artoMenu._extraTopDistance - artoMenu._topMenuHeight;

                                        if ( ! artoMenu.$_menu.hasClass( 'arto-menu-layout-1' ) ) {
                                            distance -= artoMenu.$_menu.find( '.arto-navigation-bg').prev( 'div').outerHeight( true);
                                        }

                                        artoMenu.$_menu.css({
                                            'position': 'fixed',
                                            'top': distance,
                                            'transition': 'top 0.3s'

                                        });

                                        artoMenu.$_pageContent.css({
                                            'padding-top': artoMenu.typeMenu.type0.height
                                        });

                                        // The general sticky menu css class is added
                                        artoMenu.$_menu.addClass( artoMenu.cssClsSticky );



                                    } else {

                                        // The general sticky menu css class is removed
                                        artoMenu.$_menu.removeClass( artoMenu.cssClsSticky );

                                        artoMenu.$_menu.css({
                                            'position': '',
                                            'top': '',
                                            'transition': 'none'
                                        });

                                        artoMenu.$_pageContent.css({
                                            'padding-top': ''
                                        });
                                    }

                                    break;
                                case artoMenu.typeTopBar.type1:
                                    // For further development
                                    break;
                            }
                            break;


                        case artoMenu.typeMove.type1:
                            switch ( artoMenu._currentTypeTopBar ) {
                                case artoMenu.typeTopBar.type0:

                                    if ( artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenu._extraTopDistance + artoMenu.typeMenu.type0.height + artoMenu._extraTopDistanceCatchMenu ) {

                                        if (undefined === artoMenu._previousPosition) {

                                            // This is the case when no previous position was computed

                                            // The general sticky menu css class is added.
                                            // Important! This class must be added because it can target some header elements that show customized on sticky
                                            artoMenu.$_menu.addClass(artoMenu.cssClsSticky);

                                            // The shown position is set
                                            artoMenu._previousPosition = 0;
                                            // The scrolled position is preserved for the next scroll computation
                                            artoMenu._previousScrolledPosition = artoEvents.windowScrollTop;

                                            var newMenuHeight = artoMenu.$_menu.outerHeight(true);

                                            topDistance = artoMenu._extraTopDistance - newMenuHeight;

                                            artoMenu.$_menu.css({
                                                'position': 'fixed',
                                                'top': topDistance
                                            });

                                            artoMenu.$_pageContent.css({
                                                'padding-top': artoMenu.typeMenu.type0.height
                                            });

                                        } else {

                                            switch (artoMenu._previousPosition) {
                                                // hidden
                                                case 0:
                                                    switch (artoMenu._getScrollDirection()) {

                                                        // not scroll
                                                        case 0:
                                                            // Do nothing!
                                                            break;

                                                        // down
                                                        case 1:

                                                            // The general sticky menu css class is added
                                                            artoMenu.$_menu.addClass(artoMenu.cssClsSticky);

                                                            break;

                                                        // up
                                                        case 2:

                                                            topDistance = artoMenu._extraTopDistance - artoMenu._topMenuHeight;

                                                            if ( ! artoMenu.$_menu.hasClass( 'arto-menu-layout-1' ) ) {
                                                                topDistance -= artoMenu.$_menu.find( '.arto-navigation-bg').prev( 'div').outerHeight( true );
                                                            }

                                                            artoMenu.$_menu.css({
                                                                'position': 'fixed',
                                                                'top': topDistance,
                                                                'transition': 'top 0.3s'
                                                            });

                                                            artoMenu.$_pageContent.css({
                                                                'padding-top': artoMenu.typeMenu.type0.height
                                                            });

                                                            // Prepare the next step

                                                            // Mark the menu as it's shown
                                                            artoMenu._previousPosition = 2;

                                                            // The general sticky menu css class is added
                                                            artoMenu.$_menu.addClass(artoMenu.cssClsSticky);

                                                            break;

                                                    }
                                                    break;

                                                // in transition - this should not be present for trasition moving of the menu
                                                case 1:
                                                    switch (artoMenu._getScrollDirection()) {

                                                    }
                                                    break;

                                                // shown
                                                case 2:
                                                    switch (artoMenu._getScrollDirection()) {

                                                        // not scroll
                                                        case 0:
                                                            // Do nothing!
                                                            break;

                                                        // down
                                                        case 1:

                                                            var newMenuHeight = artoMenu.$_menu.outerHeight(true);

                                                            topDistance = artoMenu._extraTopDistance - newMenuHeight;

                                                            artoMenu.$_menu.css({
                                                                'position': 'fixed',
                                                                'top': topDistance,
                                                                'transition': 'top 0.3s'
                                                            });

                                                            artoMenu.$_pageContent.css({
                                                                'padding-top': artoMenu.typeMenu.type0.height
                                                            });

                                                            // Prepare the next step

                                                            // Mark the menu as it's hidden
                                                            artoMenu._previousPosition = 0;

                                                            break;

                                                        // up
                                                        case 2:
                                                            // Do nothing!
                                                            break;
                                                    }
                                                    break;
                                            }

                                            artoMenu._previousScrolledPosition = artoEvents.windowScrollTop;
                                        }





                                    } else if ( artoEvents.windowScrollTop < artoMenuMobile._inactiveTopDistance + artoMenu._extraTopDistance + artoMenu.typeMenu.type0.height + artoMenu._extraTopDistanceCatchMenu &&
                                        artoEvents.windowScrollTop >= artoMenuMobile._inactiveTopDistance + artoMenu._extraTopDistance + artoMenu.typeMenu.type0.height ) {

                                        if (undefined === artoMenu._previousPosition) {

                                            // This is the case when no previous position was computed

                                            // The shown position is set
                                            artoMenu._previousPosition = 0;
                                            // The scrolled position is preserved for the next scroll computation
                                            artoMenu._previousScrolledPosition = artoEvents.windowScrollTop;

                                            var newMenuHeight = artoMenu.$_menu.outerHeight(true);

                                            topDistance = artoMenu._extraTopDistance - newMenuHeight;

                                            artoMenu.$_menu.css({
                                                'position': 'fixed',
                                                'top': topDistance
                                            });

                                            artoMenu.$_pageContent.css({
                                                'padding-top': artoMenu.typeMenu.type0.height
                                            });

                                            // The general sticky menu css class is added
                                            artoMenu.$_menu.addClass(artoMenu.cssClsSticky);

                                        } else {

                                            var newMenuHeight = artoMenu.$_menu.outerHeight(true);

                                            topDistance = artoMenu._extraTopDistance - newMenuHeight;

                                            artoMenu.$_menu.css({
                                                'position': 'fixed',
                                                'top': topDistance,
                                                'transition': 'top 0.3s'
                                            });

                                            artoMenu.$_pageContent.css({
                                                'padding-top': artoMenu.typeMenu.type0.height
                                            });

                                            // Mark the menu as it's hidden
                                            artoMenu._previousPosition = 0;

                                            artoMenu._previousScrolledPosition = artoEvents.windowScrollTop;
                                        }




                                    } else {

                                        // Mark the menu as it's hidden
                                        artoMenu._previousPosition = undefined;

                                        // The general sticky menu css class is removed
                                        artoMenu.$_menu.removeClass( artoMenu.cssClsSticky );

                                        //artoMenu.$_menu.removeClass( artoMenu.typeMenu.type0.cssClsShow );
                                        artoMenu.$_menu.css({
                                            'position': '',
                                            'top': '',
                                            'transition': 'none'
                                        });

                                        artoMenu.$_pageContent.css({
                                            'padding-top': ''
                                        });
                                    }

                                    break;
                                case artoMenu.typeTopBar.type1:
                                    // For further development
                                    break;
                            }
                            break;
                    }
                    break;

                //case artoMenu.typeMenu.type1:
                //
                //    // For further development
                //
                //    switch ( artoMenu._currentTypeMove ) {
                //        case artoMenu.typeMove.type0:
                //            switch ( artoMenu._currentTypeTopBar ) {
                //                case artoMenu.typeTopBar.type0:
                //                    break;
                //                case artoMenu.typeTopBar.type1:
                //                    // For further development
                //                    break;
                //            }
                //            break;
                //        case artoMenu.typeMove.type1:
                //            switch ( artoMenu._currentTypeTopBar ) {
                //                case artoMenu.typeTopBar.type0:
                //                    break;
                //                case artoMenu.typeTopBar.type1:
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
             * If the menu was shown (it was hidden before: 0 === artoMenu._beforePreviousPosition and now is shown: 2 === artoMenu._previousPosition), we are ready
             * to reposition sidebars according to the menu.
             *
             * It's necessary only for those sidebars higher than viewport! @see artoSidebar.repositionToMenu
             *
             */

            if ( 2 === artoMenu._previousPosition && 0 === artoMenu._beforePreviousPosition ) {

                if ( undefined !== artoMenu._timerMenuShow ) {
                    clearTimeout( artoMenu._timerMenuShow );
                }

                artoMenu._timerMenuShow = setTimeout(function () {
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
            if ( undefined === artoMenu._previousScrolledPosition ) {
                return 0;
            }

            // Important! We need here -1 because it happens at scroll down to exist a little scroll up of 1 (or 0.5) pixels
            if ( artoMenu._previousScrolledPosition < artoEvents.windowScrollTop - 0.5 ) {
                return 1; // down
            } else if ( artoMenu._previousScrolledPosition > artoEvents.windowScrollTop ) {
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

            var contentPaddingTop = parseInt( artoMenu.$_pageContent.css( 'padding-top').replace( 'px', '' ), 10 );
            var topMenu = parseInt( artoMenu.$_menu.css( 'top').replace( 'px', '' ), 10 );

            // Comments! - next lines before 16.08.2019
            // For 'type0' typeMenu, there's an extra gap added, to position the sidebar lower
            //if ( artoMenu._currentTypeMenu === artoMenu.typeMenu.type0 ) {
            //    contentPaddingTop += 30;
            //}

            if ( true === isThemeSidebar ) {

                // Comments! - next lines before 16.08.2019
                //// These are for the theme sidebar, which needs to remove some padding-top pixels (try to remove it, to see the difference)
                //
                //if ( artoMenu._currentTypeMenu === artoMenu.typeMenu.type0 ) {
                //    contentPaddingTop -= 40;
                //} else {
                //    contentPaddingTop -= 70;
                //}

                contentPaddingTop += 20;

            } else {

                // Comments! - next lines before 16.08.2019
                // This is for Visual Composer 'wpb_widgetised_column' component, which doesn't need padding-top pixels removing
                // Update: 'wpb_widgetised_column' has been replaced

                // 16.08.2019 - next line has been commented because ads add more gap at the top!
                //contentPaddingTop += 20;
            }

            switch ( artoMenu._currentTypeMove ) {
                case artoMenu.typeMove.type0:
                    if ( sidebarHeightLowerThanContainer ) {
                        return contentPaddingTop + topMenu;
                    } else {
                        return contentPaddingTop + topMenu;
                    }
                    break;

                case artoMenu.typeMove.type1:
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
        artoMenu.init( '#arto-header', '.arto-content-wrapper', '#arto-topbar' );
    });

})(jQuery);