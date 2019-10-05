/**
 * Created by ArtoCreative on 26.10.2016.
 */

/* global artoEffect:{} */
/* global artoEvents:{} */

/* global jQuery:{} */

var artoParallaxImage = {};

(function( $, undefined ) {

    'use strict';

    artoParallaxImage = {

        items: [],

        itemsContent: [],

        init: function() {
            artoParallaxImage._findItems();
            artoEffect.compute_all_items();
        },

        _findItems: function() {
            var $items = $( '.arto-parallax-image' );

            if ( $items.length ) {
                $items.each( function( index, element ) {
                    var $element = $(element);

                    // Do not continue if the parallax is off
                    // Just make the element visible
                    if ( ! $element.hasClass( 'arto-parallax' ) ) {
                        return;
                    }

                    // It helps to not jump the image at loading
                    $element.css('opacity', 1);

                    if ( $element.hasClass( 'arto-parallax-fixed' ) ) {

                        $element.css( 'width', artoEvents.windowInnerWidth );
                        $element.css( 'height', artoEvents.windowInnerHeight );


                        var $artoParallaxContainer = $element.parent( '.arto-parallax-container'),
                            $artoParallaxContent = $element.siblings( '.arto-parallax-content');

                        if ( $artoParallaxContent.length ) {
                            $artoParallaxContent.css('opacity', 1);
                            $artoParallaxContent.css('transform', 'translate3d(0, ' + ( -1 * $element.outerHeight() + $artoParallaxContainer.outerHeight() / 2 - $artoParallaxContent.outerHeight() / 2) + 'px, 0)');
                        }

                    } else {

                        var item = new artoEffect.item();

                        // Keep a reference here, because in artoEffects are kept all items that are computed
                        // Later, only these reference are used to reattach the properties when the dimensions of the parallax headers change
                        artoParallaxImage.items.push(item);

                        item.jqueryObj = $element;

                        artoEffect.add_item(item);


                        // Attention! We try to move an image on distMove distance.
                        //
                        // For distMove = item.offset_bottom_top the image stay frozen on the page.
                        //
                        // For that, the object is scaled with a scaleFactor that consider the object height and this distMove.
                        // This scale factor must be precise and do not scale object larger or lower than it is needed.
                        //
                        // And now, the ideal conditions are when at scroll:
                        //
                        // Rule1 : the bottom of the scaled object reaches its bottom viewport container (its viewport container with overflow hidden)
                        // when the bottom of this viewport reaches the bottom of the browser.
                        //
                        // Rule2: the top of the scaled object reaches its top viewport container (its viewport container with overflow hidden)
                        // when the top of this viewport reaches the top of the browser.
                        //
                        // These are the only conditions that must be accomplished. These rules apply, it doesn't matter where the object is. The initialPoint value must be adjusted using this condition.
                        //
                        // Initially, in the browser viewport the object can be full, partial or entirely outside (somewhere down in page) of the viewport.
                        //
                        // For full and partial. In these cases, the object never can be outside of browser viewport (down in page),
                        // but it can be outside (up in page) when the page is refreshed and it's also scrolled.
                        //
                        // For entirely outside. In these cases, the object can be outside of browser viewport (down in page or up in page)
                        //

                        var scaleFactor = 1.5, //(((item.full_height + distMove) * 100)/ item.full_height) / 100;

                            x = item.full_height * scaleFactor - item.full_height,

                            distMove = x + (x * item.full_height / item.offset_top), // px

                        // We ensure that the bottom of the image is at the bottom of its viewport
                            initialPoint = -1 * (item.full_height * scaleFactor - item.full_height ) / 2;  //px

                        item.add_item_property('move_y', artoEffect.get_initial_percent(item), 100, initialPoint, initialPoint + distMove, '');


                        item.animation_callback = function () {

                            var move_y_property = parseFloat(item.computed_item_properties['move_y']).toFixed();

                            item.jqueryObj.css('transform', 'translate3d(0px,' + move_y_property + 'px, 0px) scale(' + scaleFactor + ',' + scaleFactor + ')');

                            //item.jqueryObj.css( 'opacity', 1 );

                            item.redraw = false;
                        };


                        var $artoImageContent = $element.siblings( '.arto-parallax-content' );
                        if ( $artoImageContent.length ) {

                            //$artoImageContent.css('opacity', 0);

                            var itemContent = new artoEffect.item();

                            artoParallaxImage.itemsContent.push( itemContent );

                            itemContent.jqueryObj = $artoImageContent;

                            var moveYStartPosition = -1 * item.full_height / 2 - $artoImageContent.outerHeight( true ) / 2,
                                moveYEndPosition = -1 * $artoImageContent.outerHeight( true );


                            itemContent.add_item_property( 'opacity', 0, 5, 0, 0, '' );
                            itemContent.add_item_property( 'opacity', 5, 10, 1, 1, '' );
                            itemContent.add_item_property( 'opacity', 10, 100, 1, 0, '' );

                            itemContent.add_item_property( 'move_y', 0, 10, moveYStartPosition, moveYStartPosition, '' );
                            itemContent.add_item_property( 'move_y', 10, 100, moveYStartPosition, moveYEndPosition, '' );

                            itemContent.animation_callback = function () {

                                //var opacity_property = itemContent.computed_item_properties['opacity'];
                                //itemContent.jqueryObj.css( 'opacity', opacity_property );
                                //
                                //console.log(opacity_property);

                                //console.log(artoEffect.get_current_percent(itemContent));

                                var move_y_property = parseFloat( itemContent.computed_item_properties['move_y'] ).toFixed();
                                itemContent.jqueryObj.css( 'transform', 'translate3d(0px,' + move_y_property + 'px, 0px)');

                                var opacity_property = itemContent.computed_item_properties['opacity'];
                                itemContent.jqueryObj.css( 'opacity', opacity_property );

                                if ( 0 === opacity_property || 1 === opacity_property ) {
                                    itemContent.jqueryObj.css( 'transition', 'opacity 1s' );
                                } else {
                                    itemContent.jqueryObj.css( 'transition', 'none' );
                                }

                                itemContent.redraw = false;
                            };

                            artoEffect.add_item( itemContent);
                        }
                    }
                });
            }
        },

        /**
         * Attach the item properties using the new initial percent for each item
         */
        reattachItemsProperties: function() {
            for ( var i = 0; i < artoParallaxImage.items.length; i++ ) {
                var item = artoParallaxImage.items[ i ];
                item.remove_item_property( 'move_y' );
                item.add_item_property( 'move_y', artoEffect.get_initial_percent( item ), 100, 0, 200, '');
            }
        }
    };

})( jQuery );


