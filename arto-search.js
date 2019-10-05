/**
 * Created by ArtoCreative on 24.06.2018.
 */


/* global jQuery:{} */

/* global artoViewport:{} */

// The constructor function
var artoSearch;

(function( $, undefined ) {

    'use strict';

    artoSearch = {

        _initialized: false,

        _artoHeaderSelector: '#arto-body',
        // _artoHeaderSelector: '#arto-header', // arto-header has been changed to arto-body
        _artoTopbarSelector: '#arto-topbar',

        _searchHeaderSelector: '.arto-search-header',
        _searchContentSelector: '.arto-search-content',

        _searchFieldSelector: '#arto-search-input',
        _searchCloseSelector: '#close-search',
        _searchResultsSelector: '.arto-search-ajax-content',
        _searchMoreResultsSelector: '.arto-search-more-results',
        _searchNoResultsSelector: '.arto-search-no-results',
        _searchLoadingSelector: '.arto-loader.arto-pos-search',

        _menuSearchSelector: '.arto-menu-search',

        $_artoHeader: undefined,

        $_searchHeader: undefined,
        $_searchContent: undefined,

        $_searchField: undefined,
        $_searchResults: undefined,
        $_searchClose: undefined,
        $_searchMoreResults: undefined,
        $_searchNoResults: undefined,
        $_searchLoading: undefined,

        $_menuSearch: undefined,


        _inputTimeout: undefined,

        _cleared: true,

        _wpAdminBarHeight: 0,


        init: function() {
            if ( artoSearch._initialized ) {
                return;
            }

            artoSearch.$_artoHeader = $( artoSearch._artoHeaderSelector );

            artoSearch.$_searchHeader = artoSearch.$_artoHeader.find( artoSearch._searchHeaderSelector );
            artoSearch.$_searchContent = artoSearch.$_artoHeader.find( artoSearch._searchContentSelector );

            artoSearch.$_searchField = artoSearch.$_searchHeader.find( artoSearch._searchFieldSelector );
            artoSearch.$_searchClose = artoSearch.$_searchHeader.find( artoSearch._searchCloseSelector );
            artoSearch.$_searchResults = artoSearch.$_searchContent.find( artoSearch._searchResultsSelector );
            artoSearch.$_searchMoreResults = artoSearch.$_searchContent.find( artoSearch._searchMoreResultsSelector );
            artoSearch.$_searchNoResults = artoSearch.$_searchContent.find( artoSearch._searchNoResultsSelector );
            artoSearch.$_searchLoading = artoSearch.$_searchContent.find( artoSearch._searchLoadingSelector );

            artoSearch.$_menuSearch = $( artoSearch._menuSearchSelector );

            var $wpadminbar = $( '#wpadminbar');
            if ( $wpadminbar.length ) {
                artoSearch._wpAdminBarHeight = $wpadminbar.outerHeight( true );
            }

            artoSearch._bindEvents();

            artoSearch._initialized = true;
        },


        _bindEvents: function() {

            $( 'body' ).on( 'keyup', function( event ) {

                if (27 === event.keyCode) {
                    artoSearch._closeHandler(event);
                    return;
                }

            }).on( 'keyup', artoSearch._searchFieldSelector, function( event ) {

                if ( 'undefined' !== typeof artoSearch._inputTimeout ) {
                    clearTimeout( artoSearch._inputTimeout );
                }

                artoSearch._inputTimeout = setTimeout(function() {
                    artoSearch._doSearch();
                }, 300);

            }).on( 'click', artoSearch._menuSearchSelector, function( event ){

                event.preventDefault();


                artoSearch.$_artoHeader.data('no_search_width', artoSearch.$_artoHeader.outerWidth());

                if ( artoViewport.previousInterval <= 767 ) {
                    $('body').addClass( "arto-search-mobile-active");
                }


                artoSearch.$_artoHeader.addClass('arto-show-search');
                artoSearch.$_searchContent.addClass('arto-show-results');
                artoSearch.$_searchMoreResults.parent().hide();
                artoSearch.$_searchNoResults.parent().hide();

                artoSearch.$_searchResults.html('');

                setTimeout(function () {

                    artoSearch.$_searchField.focus();

                    // hide scroll bars
                    $('body').css({
                        overflow: 'hidden'
                    });

                    artoSearch.$_artoHeader.data('search_width', artoSearch.$_artoHeader.outerWidth());

                    var dataSearchWidth = artoSearch.$_artoHeader.data('search_width'),
                        dataNoSearchWidth = artoSearch.$_artoHeader.data('no_search_width'),
                        paddingRightVal = dataSearchWidth - dataNoSearchWidth;

                    // add padding-right to search header, to supply the scroll bar width (which has been removed)
                    artoSearch.$_searchHeader.css({
                        'padding-right': paddingRightVal
                    });

                }, 300);



            }).on( 'click', artoSearch._searchCloseSelector, artoSearch._closeHandler );

        },


        _closeHandler: function( event ) {

            event.preventDefault();

            artoSearch.$_searchField.val( '' );
            artoSearch.$_searchResults.html( '' );

            artoSearch.$_searchHeader.css({
                'padding-right': 0
            });

            if ( artoViewport.previousInterval <= 767 ) {
                $('body').removeClass( "arto-search-mobile-active");
            }

            artoSearch.$_artoHeader.removeClass('arto-show-search');
            artoSearch.$_searchContent.removeClass('arto-show-results');

            setTimeout(function () {
                // hide scroll bars
                $('body').css({
                    overflow: ''
                });

                artoSearch._cleared = true;

            }, 300);
        },


        _doSearch: function() {
            var searchValue = artoSearch.$_searchField.val().trim();

            if ( searchValue.length ) {

                if ( 'undefined' !== typeof artoSearch._jqXHR ) {
                    artoSearch._jqXHR.abort();
                }

                artoSearch._jqXHR = $.ajax({
                    url: window.artoSettings.ajaxUrl,
                    type: 'post',
                    data: {
                        action: 'arto_get_post',
                        typeContainer: 'arto_header_search',
                        args: {
                            s: searchValue
                        },
                        gridNonce: window.artoSettings.gridNonce
                    },
                    beforeSend: function( xhr ) {
                        artoSearch.$_searchLoading.addClass( 'arto-loading-show' );
                        artoSearch.$_searchResults.addClass( 'arto-search-ajax-content-hidden' );
                    }
                }).done(function (data, textStatus, jqXHR) {

                    artoSearch.$_searchLoading.removeClass( 'arto-loading-show' );
                    artoSearch.$_searchResults.removeClass( 'arto-search-ajax-content-hidden' );

                    if (textStatus === 'success') {

                        data = JSON.parse( data );

                        var noResults = true;

                        if ('' !== data.search_content ) {
                            artoSearch.$_searchResults.html( data.search_content );

                            noResults = false;
                        } else {
                            artoSearch.$_searchResults.html('');
                            artoSearch.$_searchMoreResults.parent().hide();
                        }

                        artoSearch.$_searchMoreResults.find( 'a:first' ).attr( 'href', data.search_query );

                        if ( 2 > artoSearch.$_searchResults.height() ) {
                            artoSearch.$_searchNoResults.parent().show();
                        } else {
                            artoSearch.$_searchNoResults.parent().hide();
                        }

                        if ( noResults || $(window).height() > artoSearch.$_searchResults.height() + artoSearch.$_searchHeader.height() + artoSearch._wpAdminBarHeight ) {
                            artoSearch.$_searchMoreResults.parent().hide();
                        } else {
                            artoSearch.$_searchMoreResults.parent().show();
                        }

                        artoSearch._jqXHR = undefined;
                    }

                });

            } else {
                artoSearch.$_searchResults.html('');
                artoSearch.$_searchMoreResults.parent().hide();
            }
        }

    };


    setTimeout(function() {

        // Wait for #wpadminbar
        artoSearch.init();

    }, 100);


})( jQuery );