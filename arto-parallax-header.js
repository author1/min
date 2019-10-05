/**
 * Created by ArtoCreative on 26.10.2016.
 */

/* global artoEffect:{} */

/* global jQuery:{} */

var artoParallaxHeader = {};

(function( $, undefined ) {

    'use strict';

    artoParallaxHeader = {

        items: [],

        init: function() {
            artoParallaxHeader._findItems();
            artoEffect.compute_all_items();
        },

        reinit: function() {

            // The header changes, so all items of the artoEffect must be reinitialized, their markers moving up or down
            artoEffect.reinitialize_all_items( true );

            for ( var i = 0; i < artoParallaxHeader.items.length; i++ ) {
                var item = artoParallaxHeader.items[ i ];

                artoParallaxHeader._addProperty( item );
            }

            // All artoEffect elements are recomputed, their markers were up or down
            artoEffect.compute_all_items();
        },

        _findItems: function() {

            // Images and video players
            var $items = $( '.arto-title-image-wrapper, .arto-title-player-wrapper' );

            if ( $items.length ) {
                $items.each( function( index, element ) {
                    var $element = $(element);

                    if ( ! $element.hasClass( 'arto-parallax' ) ) {
                        return;
                    }

                    var item = new artoEffect.item();

                    // Keep a reference here, because in artoEffects are kept all items that are computed
                    // Later, only these reference are used to reattach the properties when the dimensions of the parallax headers change
                    artoParallaxHeader.items.push( item );

                    item.jqueryObj = $element;

                    artoEffect.add_item( item );
                    artoParallaxHeader._addProperty( item );
                });
            }
        },

        _addProperty: function( item ) {

            item.remove_item_property( 'move_y' );

            //console.log(artoEffect.get_initial_percent(item));
            //console.log(artoEffect.get_top_percent(item));

            var itemOffsetTop = item.jqueryObj.offset().top,
                startValue = - itemOffsetTop / 4;

            if ( 0 === startValue ){
                startValue = -100;
            }

            var initialPercent = artoEffect.get_initial_percent(item),
                topPercent = artoEffect.get_top_percent(item),
                endValue = ( 100 - initialPercent ) * (Math.abs( startValue ) / 1.2 ) / ( topPercent - initialPercent );

            //console.log('initialPercent:' + initialPercent);
            //console.log('topPercent:' + topPercent);
            //console.log('startValue:' + startValue);
            //console.log('endValue:' + endValue);

            item.add_item_property( 'move_y', initialPercent , 100, startValue, endValue, '' );


            var $artoTitleArrow = item.jqueryObj.parent().find( '.arto-title-arrow' );
            if ( $artoTitleArrow.length ) {
                item.hasTitleArrow = true;

                // 'bottom' value is considered, because on desktop the value is different from mobile
                var fromValue = $artoTitleArrow.css( 'bottom' );
                if ( 'undefined' === typeof fromValue ) {
                    fromValue = 70;
                } else {
                    fromValue = parseInt( fromValue.toString().replace( 'px', '' ), 10 );
                }

                item.add_item_property( 'arrow_bottom', 60 , 100, fromValue, 1, '' );
                item.add_item_property( 'arrow_opacity', 60 , 100, 1, 0, '' );
            }

            delete item.animation_callback;

            item.animation_callback = function () {

                // console.log( 'current percent: ' + artoEffect.get_current_percent(item) );

                var move_y_property = parseFloat( item.computed_item_properties['move_y'] ).toFixed();

                // For players, look inside for iframe
                if ( item.jqueryObj.hasClass( 'arto-title-player-wrapper' ) ) {
                    var $artoTitleImage = item.jqueryObj.find('iframe');

                } else {

                    // Otherwise, look inside for image
                    var $artoTitleImage = item.jqueryObj.find('.arto-title-image');
                }

                var imageHeight = $artoTitleImage.height();

                // We must check if we need scale. Because the scale is applied to the image, and that image is usually stretched!
                // The image height is equal or higher than its wrapper. We need to know if it's translated, it needs to be scaled or it's enough her height.

                if ( item.full_height + Math.abs( startValue ) > imageHeight ) {
                    // Image needs to be scaled!

                    // scale factor is a value used to be sure that scaled image is not fit (it must to overlay a little bit)
                    var scale_factor = 0.02,
                        scale = parseFloat( ( item.full_height + Math.abs( startValue ) ) / ( imageHeight ) + scale_factor ).toFixed(3);

                    //console.log( item.full_height  + ':' + Math.abs( startValue ) + ':' + imageHeight );
                    //console.log( 'scale:' + scale );
                    //console.log( scale * imageHeight);
                    //console.log( scale * imageHeight - item.full_height );
                    //console.log( scale * imageHeight - imageHeight );
                    //console.log( ( scale * imageHeight - imageHeight ) / 2 );
                    //console.log( move_y_property );

                    // We scale image, so the computed move_y_property must be adjusted with the extra scale width!

                    move_y_property = 1 * move_y_property + 1 * parseFloat( ( scale * imageHeight - imageHeight ) / 2 ).toFixed();

                    $artoTitleImage.css( 'transform', 'translate3d(-50%,' + move_y_property + 'px, 0px) scale(' + scale + ',' + scale + ') ') ;
                } else {
                    // NOT Scale!
                    $artoTitleImage.css( 'transform', 'translate3d(-50%,' + move_y_property + 'px, 0px)') ;
                }


                // With top 0 we practically reset the old 50% top and we ensure the picture is initially at the top of its viewport
                $artoTitleImage.css( 'top', '0' );


                item.redraw = false;



                if ( 'undefined' !== typeof item.hasTitleArrow ) {
                    var $arrowItem = item.jqueryObj.parent().find( '.arto-title-arrow' );

                    var arrow_bottom = parseFloat( item.computed_item_properties['arrow_bottom'] ).toFixed();
                    $arrowItem.css( 'bottom', arrow_bottom + 'px') ;

                    var arrow_opacity = parseFloat( item.computed_item_properties['arrow_opacity'] ).toFixed(2);
                    $arrowItem.css( 'opacity', arrow_opacity) ;
                }
            };
        }
    };

})( jQuery );


