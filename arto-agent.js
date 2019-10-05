/**
 * Created by ArtoCreative on 09.12.2016.
 */

/**
 * Created by ArtoCreative on 21.05.2015.
 */

/* global jQuery:{} */

var artoAgent = {};

(function( $, undefined ){

    'use strict';

    /**
     * - artoAgent keeps the settings of the current agent
     */
    artoAgent = {
        isSafari: false,
        isChrome: false,
        isFirefox: false,
        isIE10: false,
        isIE11: false,
        isMacOS: false,

        isAndroid: false,
        isIos: false,

        bodyClass: '',

        _userAgent: undefined,


        /**
         * - init method should be called by the artoGlobal.init()
         */
        init: function() {
            this._userAgent = navigator.userAgent;

            this._isSafari();
            this._isChrome();
            this._isFirefox();
            this._isIE10();
            this._isIE11();
            this._isMacOS();
            this._isiOS();

            document.getElementsByTagName( 'html' )[0].className += this.bodyClass;
        },

        _isChrome: function() {
            if ( /chrom(e|ium)/.test( this._userAgent.toLowerCase() ) ) {
                this.isChrome = true;
                this.bodyClass += ' arto-chrome';
            }
        },

        _isSafari: function() {
            if ( -1 !== this._userAgent.indexOf( 'Safari' ) && -1 === this._userAgent.indexOf( 'Chrome' ) ) {
                this.isSafari = true;
                this.bodyClass += ' arto-safari';
            }
        },

        _isFirefox: function() {
            if ( -1 !== this._userAgent.indexOf( 'Firefox' ) ) {
                this.isFirefox = true;
                this.bodyClass += ' arto-firefox';
            }
        },

        _isIE10: function() {
            if(  -1 !== this._userAgent.indexOf( 'MSIE 10.0' ) ) {
                this.isIE10 = true;
                this.bodyClass += ' arto-ie10';
            }
        },

        _isIE11: function() {
            if ( !! this._userAgent.match( /Trident.*rv\:11\./ ) ) {
                this.isIE11 = true;
                this.bodyClass += ' arto-ie11';
            }
        },

        _isMacOS: function() {
            if ( -1 !== this._userAgent.indexOf( 'Mac OS X' )  ) {
                this.isMacOS = true;
                this.bodyClass += ' arto-macos';
            }
        },

        _isAndroid: function() {
            if ( -1 !== this._userAgent.toLowerCase().indexOf( 'android' ) ) {
                this.isAndroid = true;
                this.bodyClass += ' arto-android';
            }
        },

        _isiOS: function() {
            if ( /(iPad|iPhone|iPod)/g.test( this._userAgent ) ) {
                this.isiOS = true;
                this.bodyClass += ' arto-ios';
            }
        }
    };

    artoAgent.init();



})( jQuery );
