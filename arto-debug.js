/**
 * Created by ArtoCreative on 07.02.2016.
 */

/**
 * Helper object library for debugging.
 * This object library should not be used alone.
 */

/* global jQuery:{} */

var artoDebug;

(function($, undefined){

    'use strict';

    artoDebug = {

        _debugWindow: undefined,

        _disabled: true,

        _logConsole: function( msg) {

            // This allows us to show debug info without '_debugMode' property of the extended libraries (just call artoDebug._lowWindow)
            if ( this.hasOwnProperty( '_debugMode' ) && ! this._debugMode ) {
                return;
            }

            window.console.log( msg );
        },

        _logWindow: function( msg ) {

            // This allows us to show debug info without '_debugMode' property of the extended libraries (just call artoDebug._lowWindow)
            if ( this.hasOwnProperty( '_debugMode' ) && ! this._debugMode ) {
                return;
            }

            if ( ! window._debugWindow) {
                window._debugWindow = $( '<div style="background-color: white; ' +
                    'border: 1px solid red; ' +
                    'width: 300px; ' +
                    'height: 500px; ' +
                    'position: fixed; ' +
                    'bottom: 0; ' +
                    'font-size: 10px; ' +
                    'z-index: 1000;' +
                    'overflow: scroll"></div>' );

                $( document.body ).append( window._debugWindow );

                window._debugWindow.before( '<input type="button" style="position: fixed; ' +
                    'bottom: 500px;' +
                    'z-index: 1000;' +
                    'width: 120px" value="Clear" onclick="javascript:window._debugWindow.html(\'\')" />' );

                window._debugWindow.before( '<input type="button" style="position: fixed; ' +
                    'bottom: 500px;' +
                    'width: 120px;' +
                    'z-index: 1000;' +
                    'left: 120px" value="Enable/Disable" onclick="javascript:artoDebug._disabled = !artoDebug._disabled;" />' );
            }

            if ( false === artoDebug._disabled && undefined !== msg ) {

                var libraryId = 'Debug';
                if ( this.hasOwnProperty( 'toString' ) ) {
                    libraryId = this.toString();
                }
                window._debugWindow.html( libraryId + ':' + msg + '<br>' + window._debugWindow.html());

            }
            else {
                // Do not clean, because it's used by other libraries
                //this._debugWindow.html( '' );
            }
        }
    };

})(jQuery);
