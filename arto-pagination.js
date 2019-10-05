/**
 * Created by ArtoCreative on 19.06.2016.
 */

/* global jQuery: {} */

/* global artoGlobal: {} */

var artoPagination;

(function( $, undefined ) {

    'use strict';

    artoPagination = {

        _lazyLoadItems: [],

        loadMoreItem: function( element, event ) {
            this.$element = $( element );

            var $thisElement = this.$element,
                $artoContainer = $thisElement.closest( '.arto-main-container, .arto-grid' ),
                $artoGridContainer = $artoContainer.find( '.arto-grid-container' ),
                $artoLoading = $artoContainer.find( '.arto-loader' ),
                artoUID = $artoContainer.data( 'arto_uid' ),


                artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

            artoUIDElement.paged = parseInt( artoUIDElement.paged, 10 ) + 1;

            $.ajax({
                //url: window.ajaxurl,
                url: window.artoSettings.ajaxUrl,
                type: 'post',
                data: {
                    action: 'arto_get_post',
                    typeContainer: artoUIDElement.type,
                    args: artoUIDElement,
                    gridNonce: window.artoSettings.gridNonce
                },
                beforeSend: function() {
                    $artoLoading.addClass( 'arto-loading-show' );
                    $artoGridContainer.addClass( 'arto-grid-loading' );
                },
                success: function( result ) {

                    if ( '' !== result ) {
                        result = JSON.parse( result );



                        if ( $artoContainer.hasClass( 'arto-main-container' ) ) {



                            // We are on page container

                            $artoContainer.find( '.arto-load-container' ).remove();

                            var $artoGridContainer = $artoContainer.find( '.arto-grid-container' );
                            $artoGridContainer.html( $artoGridContainer.html() + result.output );

                            artoUIDElement.paged = parseInt( artoUIDElement.paged, 10 ) + 1;

                            //console.log(artoUIDElement.current_page + ' : ' + result.args.max_num_pages);

                            if ( artoUIDElement.paged === result.args.max_num_pages ) {
                                $artoGridContainer.find( '.arto-load-more' ).hide();
                            }




                        } else if ( $artoContainer.hasClass( 'arto-grid' ) ) {

                            // We are on arto grid container

                            var $artoGridContainer = $artoContainer.find( '.arto-grid-container' ),
                                $artoGridContainerBody = $artoContainer.find( '.arto-grid-container-body' ),
                                $artoNavigationWrapper = $artoContainer.find( '.arto-navigation-wrapper' );

                            $artoLoading.removeClass( 'arto-loading-show' );
                            $artoGridContainer.removeClass( 'arto-grid-loading' );

                            // Set pagination
                            $artoNavigationWrapper.html( result.pagination );

                            // Remove the existing 'script'
                            $artoGridContainer.find( 'script' ).remove();

                            //delete window.artoSettings.artoContainers[ artoUID ];
                            //artoDebug._logConsole('REMOVE ' + artoUID);

                            if ( $artoGridContainerBody.length ) {

                                // '.arto-grid-container-body' already exists, so append to it
                                $artoGridContainerBody.append( result.output );
                                $artoGridContainerBody.find( '.arto-grid-container-body').children().unwrap();

                            } else {

                                // Add the new '.arto-grid-container-body' to the '.arto-grid-container'
                                $artoGridContainer.append( result.output );
                            }

                            //console.log(artoUIDElement.current_page + ' : ' + result.args.max_num_pages);

                            // Reinitialize the artoUIDElement
                            artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

                            if ( parseInt( artoUIDElement.paged, 10 ) === parseInt(artoUIDElement.max_num_pages, 10 ) ) {
                                $artoNavigationWrapper.find( '.arto-load-more' ).hide();
                            }
                        }



                        // Recompute sidebars
                        artoGlobal.recomputeSidebars();
                    }
                }
            });
        },

        lazyLoadItem: function( element ) {
            this.$element = $( element );
            this.complete = false;

            var $thisElement = this.$element,
                $artoContainer = $thisElement.closest( '.arto-main-container, .arto-grid' ),
                $artoGridContainer = $artoContainer.find( '.arto-grid-container' ),
                $artoLoading = $artoContainer.find( '.arto-loader' ),
                artoUID = $artoContainer.data( 'arto_uid' );

            this.artoUID = artoUID;

            var _this = this;

            $thisElement.on( 'click', function(event) {

                // ByPass the 'complete' check
                _this.loadNextItems( true );
            });


            /**
             * Load the next items.
             * If the artoUIDElement.complete is set to true, DO NOTHING
             *
             * @param bypassComplete - boolean - optional - true if we want to bypass the artoUIDElement.complete check
             * Important! This is used when the 'lazy_load_max_pages' param is set, and the LoadMore button becomes visible (Its 'click' callback function is this)
             */
            this.loadNextItems = function( bypassComplete ) {

                var artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

                // Stop any interval to check this item
                if ( 'undefined' !== typeof artoUIDElement.inRequest && true === artoUIDElement.inRequest ) {
                    return;
                }

                // Stop if bypassComplete is undefined and the artoUIDElement.complete is set to true OR the bypassComplete is set to false
                if ( ( 'undefined' === typeof bypassComplete && ( 'undefined' !== typeof artoUIDElement.complete && true === artoUIDElement.complete ) ) ||
                    ( 'undefined' !== typeof bypassComplete && false === bypassComplete ) ) {
                    return;
                }

                artoUIDElement.paged = parseInt( artoUIDElement.paged, 10 ) + 1;

                $.ajax({
                    //url: window.ajaxurl,
                    url: window.artoSettings.ajaxUrl,
                    type: 'post',
                    data: {
                        action: 'arto_get_post',
                        typeContainer: artoUIDElement.type,
                        args: artoUIDElement,
                        gridNonce: window.artoSettings.gridNonce
                    },
                    beforeSend: function(jqXHR) {
                        $artoLoading.addClass( 'arto-loading-show' );
                        $artoGridContainer.addClass( 'arto-grid-loading' );

                        // Stop any interval to check this item
                        // This is reset at success
                        artoUIDElement.inRequest = true;
                    },
                    success: function( result ) {

                        artoUIDElement.inRequest = false;

                        if ( '' !== result ) {
                            result = JSON.parse( result );

                            $artoContainer.find( '.arto-load-container' ).remove();

                            var $artoGridContainer = $artoContainer.find( '.arto-grid-container' ),
                                $artoGridContainerBody = $artoContainer.find( '.arto-grid-container-body' ),
                                $artoNavigationWrapper = $artoContainer.find( '.arto-navigation-wrapper' );

                            $artoLoading.removeClass( 'arto-loading-show' );
                            $artoGridContainer.removeClass( 'arto-grid-loading' );

                            // Set pagination
                            $artoNavigationWrapper.html( result.pagination );

                            // Remove the existing 'script'
                            $artoGridContainer.find( 'script' ).remove();

                            //delete window.artoSettings.artoContainers[ artoUID ];
                            //artoDebug._logConsole('REMOVE ' + artoUID);

                            if ( $artoGridContainerBody.length ) {

                                // '.arto-grid-container-body' already exists, so append to it
                                $artoGridContainerBody.append( result.output );
                                $artoGridContainerBody.find( '.arto-grid-container-body').children().unwrap();

                            } else {

                                // Add the new '.arto-grid-container-body' to the '.arto-grid-container'
                                $artoGridContainer.append( result.output );
                            }

                            // If the 'lazy_load_max_pages' is set, it will be considered
                            // Otherwise, it goes until the current_page is equal to the max_num_pages (max_num_pages is set just in result.args)

                            //console.log( artoUIDElement.current_page + ' : ' + result.args.max_num_pages + ' : ' + artoUIDElement.lazy_load_max_pages );

                            // Reinitialize the artoUIDElement
                            artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

                            if ( parseInt( artoUIDElement.paged, 10) < parseInt(artoUIDElement.max_num_pages, 10) ) {

                                var $newArtoLazyLoad = $artoNavigationWrapper.find( '.arto-lazy-load' );

                                if ( '' !== artoUIDElement.lazy_load_max_pages && ! isNaN( artoUIDElement.lazy_load_max_pages ) && parseInt( artoUIDElement.paged, 10 ) > parseInt( artoUIDElement.lazy_load_max_pages, 10 ) ) {
                                    artoUIDElement.complete = true;
                                    $newArtoLazyLoad.css( 'visibility', 'visible');

                                    var lazyLoadItem = new artoPagination.lazyLoadItem( $newArtoLazyLoad[0] );
                                    artoPagination._lazyLoadItems.push( lazyLoadItem );
                                }

                                artoPagination.checkLazyLoadItems();

                            } else {
                                artoUIDElement.complete = true;
                            }
                        }
                    }
                });
            };

        },

        checkLazyLoadItems: function( currentItem ) {

            var currentItemOffset,
                currentItemHeight = 0;

            if ( 'undefined' === typeof currentItem ) {
                for ( var i = 0; i < artoPagination._lazyLoadItems.length; i++ ) {
                    currentItem = artoPagination._lazyLoadItems[ i ];

                    var $currentElement = $('[data-arto_uid="' + currentItem.artoUID + '"');

                    if ( $currentElement.length ) {

                        currentItemOffset = $currentElement.offset();
                        currentItemHeight = $currentElement.outerHeight( true );

                        if (window.scrollY + window.innerHeight > currentItemOffset.top + currentItemHeight) {
                            currentItem.loadNextItems();
                        }
                    }
                }
            } else {
                currentItemOffset = currentItem.$element.offset();
                if ( window.scrollY + window.innerHeight > currentItemOffset.top ) {
                    currentItem.loadNextItems();
                }
            }
        },

        init: function() {

            // Find load more buttons
            $( 'body' ).on( 'click', '.arto-load-more', function( event ) {
                artoPagination.loadMoreItem( this, event );
            });

            // Find lazy load buttons
            $(document).find( '.arto-lazy-load').each( function( index, element ) {
                artoPagination._lazyLoadItems.push( new artoPagination.lazyLoadItem( element ) );
            });
        }
    };

})(jQuery);

jQuery(document).ready(function() {

    artoPagination.init();

});
