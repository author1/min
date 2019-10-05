/**
 * Created by ArtoCreative on 15.07.2017.
 */

/* global jQuery:{} */
/* global artoDebug:{} */
/* global artoViewport:{} */

var artoListMore;

(function( $, undefined ) {

    'use strict';

    artoListMore = {

        _debugMode: false,

        _viewportInterval: undefined,


        _items: [],


        /**
         *
         */
        init: function() {

            $.extend( true, artoListMore, artoDebug );

            artoListMore._viewportInterval = artoViewport.previousInterval;
            artoListMore._items = [];
        },


        /**
         *
         */
        item: function() {

            this.gridUid = ''; // Optional

            this.$headerWrapper = undefined;
            this.$wrapper = undefined;

            this.$HList = undefined;
            this.$VList = undefined;

            this.$VHeader = undefined;
            this.HCssSelector = '';
            this.excludedFromWrapper = [];
            this.extraHSpace = 1;
            this.HList = [];
            this.VList = [];
            this.VHeaderWidth = 0;

            this.spaceHElements = 0;
            this.computeBeforeCallback = undefined;
            this.computeAfterCallback = undefined;

            this.taxonomy = undefined;

            this._isInitialized = false;
        },


        /**
         *
         * @param item
         */
        addItem: function( item ) {

            if ( 1 !== item.$HList.length ) {
                throw 'item.$HList.length: ' + item.$HList.length;
            }
            if ( 1 !== item.$VList.length ) {
                throw 'item.$VList.length: ' + item.$VList.length;
            }
            if ( 1 !== item.$wrapper.length ) {
                throw 'item.$wrapper.length: ' + item.$wrapper.length;
            }
            if ( 1 !== item.$headerWrapper.length ) {
                throw 'item.$headerWrapper.length: ' + item.$headerWrapper.length;
            }
            if ( '' === item.HCssSelector ) {
                throw 'item.HCssSelector is empty';
            }

            artoListMore._items.push( item );
            artoListMore._initItem( item );
            artoListMore._computeItem( item );
        },


        /**
         *
         * @param gridUid
         * @returns {boolean}
         */
        deleteItem: function( gridUid ) {
            for ( var i = 0; i < artoListMore._items.length; i++ ) {
                if ( artoListMore._items[i].gridUid === gridUid ) {
                    artoListMore._items.splice( i, 1 );
                    return true;
                }
            }
            return false;
        },


        /**
         *
         * @param item
         * @private
         */
        _initItem: function( item ) {

            if ( true === item._isInitialized ) {
                return;
            }

            //console.log('++++++++++++++++++++++++++++++++++');
            //item.$HList.addClass( 'arto-grid-cat-hidden' );


            var $HElements = item.$HList.find( '.' + item.HCssSelector );
            if ( $HElements.length ) {

                $HElements.each( function ( index, el ) {
                    var $el = jQuery( el );

                    $el.addClass( 'arto-grid-cat-shown' );

                    item.HList.push({
                        $ref: $el,
                        width: $el.outerWidth( true )
                    });

                    artoListMore._logConsole( $el.outerWidth( true) );

                    $el.find( '.arto-grid-cat_el' ).on( 'click', function(event) {
                        var $this = jQuery( this ),
                            $artoGrid = $this.closest( '.arto-grid' ),
                            $artoGridContainer = $artoGrid.find( '.arto-grid-container' ),
                            $artoNavigationWrapper = $artoGrid.find( '.arto-navigation-wrapper' ),
                            $artoLoader = $artoGrid.children( '.arto-loading-grid ').children( '.arto-loader'),

                            artoUID = $artoGrid.data( 'arto_uid' ),
                            artoUIDElement = window.artoSettings.artoContainers[ artoUID ],
                            catId = $this.data( 'cat_id');

                        //console.log(artoUID);


                        // Set artoUIDElement - it will be sent to server as args
                        artoUIDElement.ajax_filter_taxonomy = catId;
                        artoUIDElement.paged = 1;
                        artoUIDElement.artoUID = artoUID;
                        artoUIDElement.offset = artoUIDElement.original_offset;


                        item.$wrapper.find( '.arto-grid-cat_el' ).each(function(index, el) {
                            jQuery(this).removeClass( 'arto-grid-cat_el-selected' );
                        });

                        $this.addClass( 'arto-grid-cat_el-selected' );

                        artoListMore._logConsole(catId);

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
                            beforeSend: function () {
                                $artoLoader.addClass( 'arto-loading-show' );
                                $artoGridContainer.addClass( 'arto-grid-loading' );
                            },
                            success: function (result) {

                                $artoLoader.removeClass( 'arto-loading-show' );
                                $artoGridContainer.removeClass( 'arto-grid-loading' );

                                if ('' !== result) {
                                    result = JSON.parse(result);
                                }


                                // Remove the existing 'script'
                                //$artoGridContainer.find( 'script' ).remove();
                                //delete window.artoSettings.artoContainers[ artoUID ];
                                //artoDebug._logConsole('REMOVE ' + artoUID);


                                $artoGridContainer.html( result.output );
                                $artoNavigationWrapper.html( result.pagination );

                                // Reinitialize the artoUIDElement
                                artoUIDElement = window.artoSettings.artoContainers[ artoUID ];

                                if ( 'undefined' === typeof artoUIDElement ) {
                                    return;
                                }

                                if ( parseInt( artoUIDElement.paged, 10 ) === parseInt(artoUIDElement.max_num_pages, 10 ) ) {
                                    $artoNavigationWrapper.find( '.arto-load-more' ).hide();
                                }
                            }
                        });
                    });
                });
            }


            var horizontal_jquery_obj_padding_left = item.$HList.css( 'padding-left' );
            if ( ( undefined !== horizontal_jquery_obj_padding_left ) && ( '' !== horizontal_jquery_obj_padding_left ) ) {
                item.extraHSpace += parseInt( horizontal_jquery_obj_padding_left.replace( 'px', '' ), 10 );
            }

            var horizontal_jquery_obj_padding_right = item.$HList.css( 'padding-right' );
            if ( ( undefined !== horizontal_jquery_obj_padding_right ) && ( '' !== horizontal_jquery_obj_padding_right ) ) {
                item.extraHSpace += parseInt( horizontal_jquery_obj_padding_right.replace( 'px', '' ), 10 );
            }

            var horizontal_jquery_obj_margin_left = item.$HList.css( 'margin-left' );
            if ( ( undefined !== horizontal_jquery_obj_margin_left ) && ( '' !== horizontal_jquery_obj_margin_left ) ) {
                item.extraHSpace += parseInt( horizontal_jquery_obj_margin_left.replace( 'px', '' ), 10 );
            }

            var horizontal_jquery_obj_margin_right = item.$HList.css( 'margin-right' );
            if ( ( undefined !== horizontal_jquery_obj_margin_right ) && ( '' !== horizontal_jquery_obj_margin_right ) ) {
                item.extraHSpace += parseInt( horizontal_jquery_obj_margin_right.replace( 'px', '' ), 10 );
            }

            var horizontal_jquery_obj_border_left = item.$HList.css( 'border-left' );
            if ( ( undefined !== horizontal_jquery_obj_border_left ) && ( '' !== horizontal_jquery_obj_border_left ) ) {
                item.extraHSpace += parseInt( horizontal_jquery_obj_border_left.replace( 'px', '' ), 10 );
            }

            var horizontal_jquery_obj_border_right = item.$HList.css( 'border-right' );
            if ( ( undefined !== horizontal_jquery_obj_border_right ) && ( '' !== horizontal_jquery_obj_border_right ) ) {
                item.extraHSpace += parseInt( horizontal_jquery_obj_border_right.replace( 'px', '' ), 10 );
            }

            item.VHeaderWidth = item.$VHeader.find( '.arto-grid-more-head').outerWidth( true );

            item._isInitialized = true;
        },


        /**
         *
         * @private
         */
        _reinitializeItems: function() {

            artoListMore._logConsole('reinit----------: ' + artoListMore._viewportInterval + ' : ' + artoViewport.previousInterval);

            artoListMore._viewportInterval = artoViewport.previousInterval;

            for ( var i = 0; i < artoListMore._items.length; i++ ) {

                var item = artoListMore._items[i];

                if ( false === item._isInitialized ) {
                    continue;
                }

                item._isInitialized = false;

                item.$HList.html( item.$HList.html() + item.$VList.html() );
                item.$VList.html( '' );
                item.HList = [];
                item.VList = [];

                artoListMore._initItem( item );
            }
        },


        /**
         *
         * @param item
         * @private
         */
        _computeItem: function( item ) {

            if ( false === item._isInitialized ) {
                return;
            }

            if ( 'undefined' !== typeof item.computeBeforeCallback ) {
                item.computeBeforeCallback.call( item );
            }

            var spaceHElements = item.$headerWrapper.css( 'width' ).replace( 'px', '' );

            artoListMore._logConsole('1: ' + spaceHElements);

            // then this space is reduced by the widths of the excluded elements
            for ( var i = 0; i < item.excludedFromWrapper.length; i++ ) {
                spaceHElements -= item.excludedFromWrapper[ i ].outerWidth( true );
            }

            // if the vertical list is empty, the space for horizontal elements does not contain the width of the vertical head list
            if ( item.VList.length > 0 ) {
                spaceHElements -= item.VHeaderWidth;
            }

            artoListMore._logConsole('2: ' + spaceHElements);

            for ( var j = 0; j < item.HList.length; j++ ) {
                spaceHElements -= item.HList[ j ].width;
            }

            artoListMore._logConsole('3: ' + spaceHElements);

            spaceHElements -= item.extraHSpace;

            artoListMore._logConsole('4: ' + spaceHElements);

            while ( spaceHElements < 0 ) {

                if ( 0 === item.VList.length ) {
                    spaceHElements -= item.VHeaderWidth;
                    artoListMore._logConsole('5: ' + spaceHElements);
                }

                var movedEl1 = artoListMore._moveToVList( item );
                if ( null === movedEl1 ) {
                    break;
                }
                spaceHElements += movedEl1.width;
                artoListMore._logConsole(spaceHElements);
            }


            while ( item.VList.length > 0 && spaceHElements >= item.VList[ 0 ].width ) {

                var movedEl2 = artoListMore._moveToHList( item );

                if ( null === movedEl2 ) {
                    break;
                }
                spaceHElements -= movedEl2.width;
            }

            if ( ( 1 === item.VList.length ) && ( spaceHElements + item.VHeaderWidth >= item.VList[ 0 ].width ) ) {
                artoListMore._moveToHList( item );
            }

            if ( item.HList.length ) {
                item.$VHeader.removeClass( 'arto-grid-cat-list-empty' );
            } else {
                item.$VHeader.addClass( 'arto-grid-cat-list-empty' );
            }

            if ( item.VList.length ) {
                item.$VHeader.css( 'display', 'inline-block' );
            } else {
                item.$VHeader.css( 'display', 'none' );
            }

            item.spaceHElements = spaceHElements;


            if ( 'undefined' !== typeof item.computeAfterCallback ) {
                item.computeAfterCallback.call( item );
            }
        },


        /**
         *
         * @private
         */
        _computeItems: function() {
            for ( var i = 0; i < artoListMore._items.length; i++ ) {
                artoListMore._computeItem( artoListMore._items[i] );
            }
        },


        /**
         *
         * @param item
         * @returns {*}
         * @private
         */
        _moveToHList: function( item ) {

            if ( false === item._isInitialized || 0 === item.VList.length ) {
                return null;
            }

            var el = item.VList.shift();

            if ( 0 === item.VList.length ) {
                item.$VList.css( 'display', 'none' );
            }

            item.HList.push( el );

            //el.$ref.css( 'opacity', '0' );

            el.$ref.detach().appendTo( item.$HList );

            //setTimeout( function() {
            //    el.$ref.css( 'opacity', '1' );
            //}, 50);

            return el;
        },


        /**
         *
         * @param item
         * @returns {*}
         * @private
         */
        _moveToVList: function( item ) {

            if ( false === item._isInitialized || 0 === item.HList.length ) {
                return null;
            }

            var el = item.HList.pop();

            if ( 0 === item.VList.length ) {
                item.$VList.css( 'display', '' );
            }

            item.VList.unshift( el );

            el.$ref.detach().prependTo( item.$VList );

            return el;
        },


        /**
         *
         * @private
         */
        _moveAllToVList: function( item ) {
            while ( item.HList.length > 0 ) {
                artoListMore._moveToVList( item );
            }
        },


        /**
         *
         */
        resize: function() { artoListMore._logConsole( 'resize' );
            if ( 0 === artoListMore._items.length ) {
                return;
            }
            if ( artoListMore._viewportInterval !== artoViewport.previousInterval ) {
                artoListMore._reinitializeItems();
            }
            artoListMore._computeItems();
        }
    };

    artoListMore.init();

})( jQuery );