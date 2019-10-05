/**
 * Created by ArtoCreative on 07.02.2016.
 */

/* global artoEvents:{} */
/* global artoDebug:{} */

/* global jQuery:{} */

var artoUtility;

(function($, undefined){

    'use strict';

    /**
     * Helper utility library
     * @type {{scrollUtility: {_previousScrolledPosition: undefined, direction: {nothing: number, down: number, up: number}, scroll: Function, getScrollDirection: Function, scrolledUp: Function, scrolledDown: Function}}}
     */
    artoUtility = {

        scroll: function() {
            artoUtility.scrollUtility.scroll();
        },



        /**
         * Scroll utility
         */
        scrollUtility: {

            _scrolledPosition: undefined,

            _previousScrolledPosition: undefined,

            direction: {
                'nothing': 0,
                'down': 1,
                'up': 2
            },

            scroll: function() {
                artoUtility.scrollUtility._previousScrolledPosition = artoUtility.scrollUtility._scrolledPosition;
                artoUtility.scrollUtility._scrolledPosition = artoEvents.windowScrollTop;
            },

            getScrollDirection: function() {

                var $this = artoUtility.scrollUtility;

                // This case should not happened
                if ( undefined === $this._previousScrolledPosition ) {
                    // no scroll (at initial computation!)
                    return $this.direction.nothing;
                }
                if ( $this._previousScrolledPosition < $this._scrolledPosition ) {
                    return $this.direction.down; // down
                } else if ( $this._previousScrolledPosition > $this._scrolledPosition ) {
                    return $this.direction.up; // up
                } else {
                    //artoDebug._logWindow('nothing ' + $this._previousScrolledPosition  + ' : ' + $this._scrolledPosition);
                    return $this.direction.nothing; // no scroll!
                }
            },

            scrolledUp: function() {
                var $this = artoUtility.scrollUtility;
                if ( $this.direction.up === $this.getScrollDirection() ) {
                    return true;
                }
                return false;
            },

            scrolledDown: function() {
                var $this = artoUtility.scrollUtility;
                if ( $this.direction.down === $this.getScrollDirection() ) {
                    return true;
                }
                return false;
            },


            scrollToY: function( position ) {
                scrollToY( position, 1, 'easeInOutCubic' );
            },

            scrollToYPrecise: function( position, speed, easing ) {
                scrollToY( position, speed, easing );
            }
        },
    };




    // The following code - is external - used for smooth scroll (temporarily here, maybe better to be moved to external code)


    // first add raf shim
    // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    // main function
    function scrollToY(scrollTargetY, speed, easing) {
        // scrollTargetY: the target scrollY property of the window
        // speed: time in pixels per second
        // easing: easing equation to use

        var scrollY = window.scrollY || document.documentElement.scrollTop,
            scrollTargetY = scrollTargetY || 0,
            speed = speed || 2000,
            easing = easing || 'easeOutBounce',
            currentTime = 0;

        // min time .1, max time .8 seconds
        var time = Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, 0.9));

        // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
        var easingEquations = {
            easeOutSine: function (pos) {
                return Math.sin(pos * (Math.PI / 2));
            },
            easeInOutSine: function (pos) {
                return (-0.5 * (Math.cos(Math.PI * pos) - 1));
            },
            easeInOutQuint: function (pos) {
                if ((pos /= 0.5) < 1) {
                    return 0.5 * Math.pow(pos, 5);
                }
                return 0.5 * (Math.pow((pos - 2), 5) + 2);
            },
            easeInQuad: function(pos) {
                return Math.pow(pos, 2);
            },

            easeOutQuad: function(pos) {
                return -(Math.pow((pos-1), 2) -1);
            },

            easeInOutQuad: function(pos) {
                if ((pos/=0.5) < 1) {
                    return 0.5 * Math.pow(pos, 2);
                }
                return -0.5 * ((pos-=2)*pos - 2);
            },

            easeInCubic: function(pos) {
                return Math.pow(pos, 3);
            },

            easeOutCubic: function(pos) {
                return (Math.pow((pos-1), 3) +1);
            },

            easeInOutCubic: function(pos) {
                if ((pos/=0.5) < 1) {
                    return 0.5 * Math.pow(pos, 3);
                }
                return 0.5 * (Math.pow((pos-2),3) + 2);
            },

            easeInQuart: function(pos) {
                return Math.pow(pos, 4);
            },

            easeOutQuart: function(pos) {
                return -(Math.pow((pos-1), 4) -1);
            },

            easeInOutQuart: function(pos) {
                if ((pos/=0.5) < 1) {
                    return 0.5 * Math.pow(pos, 4);
                }
                return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
            },

            easeInQuint: function(pos) {
                return Math.pow(pos, 5);
            },

            easeOutQuint: function(pos) {
                return (Math.pow((pos-1), 5) +1);
            },

            easeInSine: function(pos) {
                return -Math.cos(pos * (Math.PI/2)) + 1;
            },

            easeInExpo: function(pos) {
                return (pos===0) ? 0 : Math.pow(2, 10 * (pos - 1));
            },

            easeOutExpo: function(pos) {
                return (pos===1) ? 1 : -Math.pow(2, -10 * pos) + 1;
            },

            easeInOutExpo: function(pos) {
                if(pos===0) {
                    return 0;
                }
                if(pos===1) {
                    return 1;
                }
                if((pos/=0.5) < 1) {
                    return 0.5 * Math.pow(2, 10 * (pos - 1));
                }
                return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
            },

            easeInCirc: function(pos) {
                return -(Math.sqrt(1 - (pos*pos)) - 1);
            },

            easeOutCirc: function(pos) {
                return Math.sqrt(1 - Math.pow((pos-1), 2));
            },

            easeInOutCirc: function(pos) {
                if((pos/=0.5) < 1) {
                    return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
                }
                return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
            },

            easeOutBounce: function(pos) {
                if ((pos) < (1/2.75)) {
                    return (7.5625*pos*pos);
                } else if (pos < (2/2.75)) {
                    return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
                } else if (pos < (2.5/2.75)) {
                    return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
                } else {
                    return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
                }
            },

            easeInBack: function(pos) {
                var s = 1.70158;
                return (pos)*pos*((s+1)*pos - s);
            },

            easeOutBack: function(pos) {
                var s = 1.70158;
                return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
            },

            easeInOutBack: function(pos) {
                var s = 1.70158;
                if((pos/=0.5) < 1) {
                    return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
                }
                return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
            },

            elastic: function(pos) {
                return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
            },

            swingFromTo: function(pos) {
                var s = 1.70158;
                return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
                0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
            },

            swingFrom: function(pos) {
                var s = 1.70158;
                return pos*pos*((s+1)*pos - s);
            },

            swingTo: function(pos) {
                var s = 1.70158;
                return (pos-=1)*pos*((s+1)*pos + s) + 1;
            },

            bounce: function(pos) {
                if (pos < (1/2.75)) {
                    return (7.5625*pos*pos);
                } else if (pos < (2/2.75)) {
                    return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
                } else if (pos < (2.5/2.75)) {
                    return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
                } else {
                    return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
                }
            },

            bouncePast: function(pos) {
                if (pos < (1/2.75)) {
                    return (7.5625*pos*pos);
                } else if (pos < (2/2.75)) {
                    return 2 - (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
                } else if (pos < (2.5/2.75)) {
                    return 2 - (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
                } else {
                    return 2 - (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
                }
            },

            easeFromTo: function(pos) {
                if ((pos/=0.5) < 1) {
                    return 0.5 * Math.pow(pos, 4);
                }
                return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
            },

            easeFrom: function(pos) {
                return Math.pow(pos,4);
            },

            easeTo: function(pos) {
                return Math.pow(pos,0.25);
            }
        };

        // add animation loop
        function tick() {
            currentTime += 1 / 60;

            var p = currentTime / time;
            var t = easingEquations[easing](p);

            if (p < 1) {
                artoUtility.currentRequestAnimFrame = window.requestAnimFrame(tick);

                window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));
            } else {
                window.scrollTo(0, scrollTargetY);
            }
        }

        // call it once to get started
        tick();
    }


})(jQuery);
