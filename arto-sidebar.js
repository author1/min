/**
 * Created by ArtoCreative on 18.12.2015.
 */

/* global artoDebug:{} */
/* global artoEvents:{} */
/* global artoUtility:{} */
/* global artoMenu:{} */

/* global jQuery:{} */

/**
 * Allowed positions:
 * 0 - initial (set at init)
 * 1 - fixed window top
 * 2 - absolute content transition
 * 3 - absolute content bottom
 * 4 - fixed window bottom
 */

// Keep all instantiated sidebars - every sidebar will be registered here
var artoSidebars = [];

// The constructor function
var artoSidebar;

(function( $, undefined ) {

    'use strict';

    artoSidebar = function() {

        // It allows logging messages to console (@see artoDebug)
        this._debugMode = false;

        this.toString = function() {
            return 'Sidebar';
        };


        this._jqSidebar = undefined;

        this._jqSidebarContainer = undefined;

        /**
         * 0 - initial (set at init)
         * 1 - fixed window top
         * 2 - absolute content transition
         * 3 - absolute content bottom
         * 4 - fixed window bottom
         */
        this._currentPosition = undefined;

        this._previousScrolledPosition = undefined;

        this._initialized = false;

        this.init = function( jqSidebar, _jqSidebarContainer ) {

            // This should be initialized only once
            if ( true === this._initialized ) {
                return;
            }


            $.extend( true, this, artoDebug );

            if ( undefined === typeof jqSidebar || undefined === typeof _jqSidebarContainer ) {
                return;
            }
            this._jqSidebar = jqSidebar;
            this._jqSidebarContainer = _jqSidebarContainer;

            this._currentPosition = 0;
            this._previousScrolledPosition = artoEvents.windowPageYOffset;


            this._jqSidebar.css({
                width: this._jqSidebar.outerWidth(true)
            });


            this._initialized = true;
        };



        this.resetPosition = function() {
            this.clearToOriginalPosition();
            this._currentPosition = 0;
        };


        this.recomputeWidth = function() {
            this._jqSidebar.css({
                width: this._jqSidebar.parent().width()
            });
        };


        this.resetWidth = function() {
            this._jqSidebar.css({
                width: ''
            });
        };


        this.scroll = function() {

            if ( !this._initialized ) {
                return;
            }

            // Not under ipad landscape
            if ( artoEvents.windowInnerWidth <= 767 ) {
                return;
            }

            this._logWindow( 'IN position :' + this._currentPosition );

            this._logWindow( this._jqSidebar.outerHeight(true) + ' : ' + this._jqSidebarContainer.outerHeight(true));


            // We have this case when the sidebar is the highest element in page
            if ( this._jqSidebar.outerHeight(true) >= this._jqSidebarContainer.outerHeight(true) ) {

                this.clearToOriginalPosition();
                this._currentPosition = 0;

                return;
            }



            /**
             * The extraTopDistance allows the sidebar to position as the menu is.
             *
             *
             * ABSTRACT:
             * 1. When the sidebar height is lower than its container height, the artoMenu.getMenuTopDistance gets
             * the 'padding-top' css value of the content.
             * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type) BUT ONLY FOR typeMenu.type0
             * For typeMenu.type1, the artoMenu.getMenuTopDistance gets the 'padding-top' css value of the content MINUS the 'top' css value of the menu (it has a negative value)
             *
             * IMPORTANT! We have this case because when the sidebar height is lower than its container height, we don't have the
             * case (2) absolute content transition
             * @see artoMenu.getMenuTopDistance
             *
             *
             * 2. When the sidebar height is higher than its container height, the artoMenu.getMenuTopDistance gets
             * the 'padding-top' css value of the content.
             * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type)
             * @see artoMenu.getMenuTopDistance
             */
            var extraTopDistance = artoMenu.getMenuTopDistance( this._jqSidebar.outerHeight(true) <= artoEvents.windowInnerHeight, this.hasOwnProperty( 'is_theme_sidebar' ) );

            //console.log(extraTopDistance);



            /**
             * 1. Sidebar height is lower than its container height
             * 2. Sidebar height is higher than its container height
             */

            if ( this._jqSidebar.outerHeight(true) <= artoEvents.windowInnerHeight ) {

                // Lower or equal

                if ( artoUtility.scrollUtility.scrolledDown() ) {

                    this._logWindow( 'down - smaller than window' );

                    switch ( this._currentPosition ) {

                        // original position

                        case 0 :

                            if ( artoEvents.windowPageYOffset + extraTopDistance >= this._jqSidebarContainer.offset().top ) {

                                if ( artoEvents.windowPageYOffset + extraTopDistance + this._jqSidebar.outerHeight(true) > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                    // Absolute content bottom

                                    this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                    this._currentPosition = 3;

                                } else {

                                    // Fixed window top

                                    this.fixedTop();
                                    this._currentPosition = 1;
                                }
                            }

                            break;

                        // fixed window top
                        case 1 :

                            // The content bottom position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance + this._jqSidebar.outerHeight(true) > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                // Absolute content bottom

                                this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                this._currentPosition = 3;

                            } else {

                                // Recompute fixed top position because of the menu movement
                                // @see fixedTop()
                                this.fixedTop();
                            }

                            break;

                        // absolute content bottom
                        case 3:

                            // do nothing - moving down and the sidebar is the at the content bottom

                            break;
                    }

                } else if ( artoUtility.scrollUtility.scrolledUp() ) {

                    this._logWindow( 'up  - smaller than window' );

                    switch ( this._currentPosition ) {

                        // original position

                        case 0 :


                            if ( artoEvents.windowPageYOffset + extraTopDistance + this._jqSidebar.outerHeight(true) > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                // Absolute content bottom

                                this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                this._currentPosition = 3;

                            } else if ( artoEvents.windowPageYOffset + extraTopDistance > this._jqSidebarContainer.offset().top ) {

                                this.fixedTop();
                                this._currentPosition = 1;
                            }

                            break;

                        // fixed window top
                        case 1 :

                            if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebarContainer.offset().top ) {

                                // original position

                                this.clearToOriginalPosition();
                                this._currentPosition = 0;

                            } else {

                                // Recompute fixed top position because of the menu movement
                                // @see fixedTop()
                                this.fixedTop();
                            }

                            break;

                        // absolute content bottom
                        case 3:

                            // The original position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebarContainer.offset().top ) {

                                // original position

                                this.clearToOriginalPosition();
                                this._currentPosition = 0;

                            } else if ( artoEvents.windowPageYOffset + extraTopDistance <= this._jqSidebar.offset().top ) {

                                // Fixed window top

                                this.fixedTop();
                                this._currentPosition = 1;

                            }

                            break;
                    }
                }



            } else if ( this._jqSidebar.outerHeight(true) > artoEvents.windowInnerHeight ) {


                // Higher


                if ( artoUtility.scrollUtility.scrolledDown() ) {

                    this._logWindow( 'down - bigger than window' );

                    switch ( this._currentPosition ) {

                        // original position

                        case 0 :

                            if ( artoEvents.windowPageYOffset + extraTopDistance >= this._jqSidebarContainer.offset().top ) {

                                if ( artoEvents.windowPageYOffset + extraTopDistance + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                    // Absolute content bottom

                                    this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                    this._currentPosition = 3;

                                } else if ( artoEvents.windowPageYOffset + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebar.outerHeight(true) ) {

                                    // Fixed window bottom

                                    this.fixedBottom();
                                    this._currentPosition = 4;
                                }
                            }
                            break;

                        // fixed window top
                        case 1 :

                            // The content bottom position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                // Absolute content bottom

                                this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                this._currentPosition = 3;

                            } else if ( artoEvents.windowPageYOffset + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebar.offset().top + this._jqSidebar.outerHeight( true ) ) {

                                // Fixed window bottom

                                this.fixedBottom();
                                this._currentPosition = 4;

                            } else {

                                // Absolute content transition

                                this.absolutePosition( artoUtility.scrollUtility._previousScrolledPosition + extraTopDistance - this._jqSidebarContainer.offset().top );
                                this._currentPosition = 2;
                            }

                            break;

                        // absolute content transition
                        case 2 :

                            // The content bottom position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                // Absolute content bottom

                                this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                this._currentPosition = 3;

                            } else if ( artoEvents.windowPageYOffset + artoEvents.windowInnerHeight > this._jqSidebar.offset().top + this._jqSidebar.outerHeight(true) ) {

                                // Fixed window bottom

                                this.fixedBottom();
                                this._currentPosition = 4;

                            }

                            break;

                        // absolute content bottom
                        case 3:

                            // do nothing - moving down and the sidebar is the at the content bottom

                            break;

                        // fixed window bottom
                        case 4:

                            if ( artoEvents.windowPageYOffset + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true) ) {

                                // Absolute content bottom

                                this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true) );
                                this._currentPosition = 3;

                            }
                            break;
                    }

                } else if ( artoUtility.scrollUtility.scrolledUp() ) {

                    this._logWindow( 'up - bigger than window' );

                    switch ( this._currentPosition ) {

                        // original position

                        case 0 :
                            // do nothing
                            break;

                        // fixed window top
                        case 1 :

                            if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebarContainer.offset().top ) {

                                // original position

                                this.clearToOriginalPosition();
                                this._currentPosition = 0;

                            }
                            break;

                        // absolute content transition
                        case 2 :

                            // The original position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebarContainer.offset().top ) {

                                // original position

                                this.clearToOriginalPosition();
                                this._currentPosition = 0;

                            } else if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebar.offset().top ) {

                                // Fixed window top

                                this.fixedTop( artoEvents.windowPageYOffset - this._jqSidebarContainer.offset().top );
                                this._currentPosition = 1;

                            }

                            break;

                        // absolute content bottom
                        case 3:

                            // The original position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebarContainer.offset().top ) {

                                // original position

                                this.clearToOriginalPosition();
                                this._currentPosition = 0;

                            } else if ( artoEvents.windowPageYOffset + extraTopDistance <= this._jqSidebar.offset().top ) {

                                // Fixed window top

                                this.fixedTop();
                                this._currentPosition = 1;

                            }

                            break;

                        // fixed window bottom
                        case 4:

                            // The original position is checked first

                            if ( artoEvents.windowPageYOffset + extraTopDistance < this._jqSidebarContainer.offset().top ) {

                                // original position

                                this.clearToOriginalPosition();
                                this._currentPosition = 0;

                            } else {

                                // Absolute content transition

                                this.absolutePosition( this._jqSidebar.offset().top - this._jqSidebarContainer.offset().top );
                                this._currentPosition = 2;
                            }

                            break;
                    }
                }
            }

            this._previousScrolledPosition = artoEvents.windowPageYOffset;

            this._logWindow( 'OUT position :' + this._currentPosition );
        };



        this.reposition = function() {

            if ( !this._initialized ) {
                return;
            }

            // Not under ipad landscape
            if ( artoEvents.windowInnerWidth <= 767 ) {
                return;
            }

            this._logWindow( 'IN position :' + this._currentPosition );

            this._logWindow( this._jqSidebar.outerHeight(true) + ' : ' + this._jqSidebarContainer.outerHeight(true));


            // We have this case when the sidebar is the highest element in page
            if ( this._jqSidebar.outerHeight(true) >= this._jqSidebarContainer.outerHeight(true) ) {

                this.clearToOriginalPosition();
                this._currentPosition = 0;

                return;
            }



            /**
             * The extraTopDistance allows the sidebar to position as the menu is.
             *
             *
             * ABSTRACT:
             * 1. When the sidebar height is lower than its container height, the artoMenu.getMenuTopDistance gets
             * the 'padding-top' css value of the content.
             * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type) BUT ONLY FOR typeMenu.type0
             * For typeMenu.type1, the artoMenu.getMenuTopDistance gets the 'padding-top' css value of the content MINUS the 'top' css value of the menu (it has a negative value)
             *
             * IMPORTANT! We have this case because when the sidebar height is lower than its container height, we don't have the
             * case (2) absolute content transition
             * @see artoMenu.getMenuTopDistance
             *
             *
             * 2. When the sidebar height is higher than its container height, the artoMenu.getMenuTopDistance gets
             * the 'padding-top' css value of the content.
             * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type)
             * @see artoMenu.getMenuTopDistance
             */
            var extraTopDistance = artoMenu.getMenuTopDistance( this._jqSidebar.outerHeight(true) <= artoEvents.windowInnerHeight, this.hasOwnProperty( 'is_theme_sidebar' ) );

            //console.log(extraTopDistance);



            /**
             * 1. Sidebar height is lower than its container height
             * 2. Sidebar height is higher than its container height
             */

            if ( this._jqSidebar.outerHeight(true) <= artoEvents.windowInnerHeight ) {

                // Lower or equal

                this._logWindow( 'no scrolled - smaller than window' );

                if (artoEvents.windowPageYOffset + extraTopDistance + this._jqSidebar.outerHeight(true) > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true)) {

                    // Absolute content bottom

                    this.absolutePosition( this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight( true ) );
                    this._currentPosition = 3;

                } else if ( artoEvents.windowPageYOffset + extraTopDistance >= this._jqSidebarContainer.offset().top ) {

                    // Fixed window top

                    this.fixedTop();
                    this._currentPosition = 1;

                } else {

                    // original position

                    this.clearToOriginalPosition();
                    this._currentPosition = 0;
                }



            } else if ( this._jqSidebar.outerHeight(true) > artoEvents.windowInnerHeight ) {


                // Higher


                this._logWindow( 'no scrolled - bigger than window' );

                if (artoEvents.windowPageYOffset + extraTopDistance + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebarContainer.outerHeight(true)) {

                    // Absolute content bottom

                    this.absolutePosition(this._jqSidebarContainer.outerHeight(true) - this._jqSidebar.outerHeight(true));
                    this._currentPosition = 3;

                } else if (artoEvents.windowPageYOffset + extraTopDistance + artoEvents.windowInnerHeight > this._jqSidebarContainer.offset().top + this._jqSidebar.outerHeight(true)) {

                    // Fixed window bottom

                    this.fixedBottom();
                    this._currentPosition = 4;

                } else {

                    // original position

                    this.clearToOriginalPosition();
                    this._currentPosition = 0;
                }
            }

            this._previousScrolledPosition = artoEvents.windowPageYOffset;

            this._logWindow( 'OUT position :' + this._currentPosition );
        };






        /**
         *  This function reposition sidebars giving them the chance to be aligned to the menu.
         *  This function is called usually by sticky menu.
         */
        this.repositionToMenu = function() {

            if ( !this._initialized ) {
                return;
            }

            // Not under ipad landscape
            if ( artoEvents.windowInnerWidth <= 767 ) {
                return;
            }

            this._logWindow( 'TOP - IN position :' + this._currentPosition );

            this._logWindow( 'TOP - ' + this._jqSidebar.outerHeight(true) + ' : ' + this._jqSidebarContainer.outerHeight(true));


            // We have this case when the sidebar is the highest element in page
            if ( this._jqSidebar.outerHeight(true) >= this._jqSidebarContainer.outerHeight(true) ) {

                this.clearToOriginalPosition();
                this._currentPosition = 0;

                return;
            }



            /**
             * The extraTopDistance allows the sidebar to position as the menu is.
             *
             *
             * ABSTRACT:
             * 1. When the sidebar height is lower than its container height, the artoMenu.getMenuTopDistance gets
             * the 'padding-top' css value of the content.
             * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type) BUT ONLY FOR typeMenu.type0
             * For typeMenu.type1, the artoMenu.getMenuTopDistance gets the 'padding-top' css value of the content MINUS the 'top' css value of the menu (it has a negative value)
             *
             * IMPORTANT! We have this case because when the sidebar height is lower than its container height, we don't have the
             * case (2) absolute content transition
             * @see artoMenu.getMenuTopDistance
             *
             *
             * 2. When the sidebar height is higher than its container height, the artoMenu.getMenuTopDistance gets
             * the 'padding-top' css value of the content.
             * It should be enough to take the content 'padding-top' css property (it's set in accordance with the menu type)
             * @see artoMenu.getMenuTopDistance
             */
            var extraTopDistance = artoMenu.getMenuTopDistance( this._jqSidebar.outerHeight(true) <= artoEvents.windowInnerHeight, this.hasOwnProperty( 'is_theme_sidebar' ) );

            //console.log(extraTopDistance);



            // Very very important!
            // It seems it's necessary only for sidebars higher than viewport height!
            // Because they are not on fixed top position. Usually they are fixed bottom or absolute position.

            if ( this._jqSidebar.outerHeight(true) > artoEvents.windowInnerHeight ) {

                if (artoEvents.windowPageYOffset + extraTopDistance >= this._jqSidebarContainer.offset().top) {




                    // Only this case is important! Because this absolute position in transition, offers the sidebar the chance to change its position in accordance to the menu.
                    this.absolutePosition(this._jqSidebar.offset().top - this._jqSidebarContainer.offset().top);
                    this._currentPosition = 2;


                } else {

                    // original position

                    this.clearToOriginalPosition();
                    this._currentPosition = 0;
                }
            }

            this._previousScrolledPosition = artoEvents.windowPageYOffset;

            this._logWindow( 'TOP - OUT position :' + this._currentPosition );
        };







        this.fixedTop = function() {

            this._jqSidebar.css({
                position: 'fixed',

                // Usually, it should be 0, but the sidebar must be positioned as the menu is
                //top: '0',

                top: artoMenu.getMenuTopDistance( this._jqSidebar.outerHeight(true) <= artoEvents.windowInnerHeight, this.hasOwnProperty( 'is_theme_sidebar' ) ),

                // clear additional css settings
                bottom: ''
            });
        };

        this.fixedBottom = function() {

            this._jqSidebar.css({
                position: 'fixed',
                bottom: '0',

                // clear additional css settings
                top: ''
            });
        };

        this.absolutePosition = function( position ) {

            this._jqSidebar.css({
                position: 'absolute',

                // clear additional css settings
                bottom: '',
                top: position
            });
        };

        this.clearToOriginalPosition = function() {

            this._jqSidebar.css({

                // clear all css settings
                position: '',
                top: '',
                bottom: ''
            });
        };
    };


})(jQuery);