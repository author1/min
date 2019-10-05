/**
 * Created by ArtoCreative on 25.06.2016.
 */
    
/* global jQuery:{} */

/* global artoEvents:{} */

var artoEffect;

(function( $, _ ) {

    'use strict';

    artoEffect = {


        // the bunch of artoEffect items
        items: [],



        // the current request animation frame id
        rAFIndex: 0,



        // flag used to not call 'requestAnimationFrame' when it's steel running
        animation_running: false,



        item: function() {

            // the computed percent value of the jquery object in the viewport
            // - 0 when the top of object enters into the viewport
            // - 100 when the bottom of the object goes outside of the viewport
            this.percent_value = 0;

            // the animation callback function
            this.animation_callback = null;

            // the jquery object of the artoEffect.item
            this.jqueryObj = '';

            // optional - a jquery object that wraps the current item. Used in callback
            this.wrapper_jquery_obj = undefined;

            // a jquery span obj added dynamically added at the top of jqueryObj
            this.top_pointer_jquery_obj = '';

            // the full outer height of the item
            this.full_height = 0;

            // the offset top of the top_pointer_jquery_obj
            this.offset_top = '';

            // the offset top of the top_pointer_jquery_obj and the full_height
            this.offset_bottom_top = '';

            // the properties registered with the item
            this.properties = {};

            // the computed properties that probably will be applied by animation callback function over the jquery object
            this.computed_item_properties = {};

            // flag made 'true' for items having at least one computed property
            this.redraw = false;

            // top is out of screen
            this.top_is_out = false;

            // flag used to mark the initialization item
            this._is_initialized = false;

            // flag used to stop an item to be computed
            this.computation_stopped = false;




            /**
             * - when a new item property is added, it's added as a real property in the item.properties object.
             * - if it's already added, the settings of the property are appended
             * - the settings for an item property must be added in order of the percents
             * - the percent intervals must not be overloaded (ex. 10-30 and 20-40)
             * - it doesn't matter how many settings are added to an item property
             * - after an adding the space of percentage is full, that means after adding
             * ex: add_item_property('opacity', 10, 30, 0, 1, easing)
             *
             * item.properties.opacity.settings :
             * [
             *  [0, 10, 0, 0, '']
             *  [10, 30, 0, 1, easing] - property added
             *  [30, 100, 1, 1, '']
             * ]
             *
             * ex: add_item_property('opacity', 40, 50, 1, 0)
             *
             * item.properties.opacity.settings :
             * [
             *  [0, 10, 0, 0, '']
             *  [10, 30, 0, 1, easing] - property added
             *  [30, 40, 1, 1, '']
             *  [40, 50, 1, 0, easing] - property added
             *  [50, 100, 0, 0, '']
             * ]
             *
             * - callable jQuery easing functions:
             * swing
             * easeInQuad
             * easeOutQuad
             * easeInOutQuad
             * easeInCubic
             * easeOutCubic
             * easeInOutCubic
             * easeInQuart
             * easeOutQuart
             * easeInOutQuart
             * easeInQuint
             * easeOutQuint
             * easeInOutQuint
             * easeInSine
             * easeOutSine
             * easeInOutSine
             * easeInExpo
             * easeOutExpo
             * easeInOutExpo
             * easeInCirc
             * easeOutCirc
             * easeInOutCirc
             * easeInElastic
             * easeOutElastic
             * easeInOutElastic
             * easeInBack
             * easeOutBack
             * easeInOutBack
             * easeInBounce
             * easeOutBounce
             * easeInOutBounce
             *
             * @param name string
             * @param start_percent numeric
             * @param end_percent numeric
             * @param start_value numeric
             * @param end_value numeric
             * @param easing string [optional]
             */
            this.add_item_property = function(name, start_percent, end_percent, start_value, end_value, easing) {

                if (start_percent >= end_percent) {
                    return;
                }

                if (undefined === this.properties[name]) {

                    this.properties[name] = {
                        computed_value: '',
                        settings: []
                    };

                    if (0 !== start_percent) {
                        this.properties[name].settings[this.properties[name].settings.length] = {
                            start_percent: 0,
                            end_percent: start_percent,
                            start_value: start_value,
                            end_value: start_value,
                            easing: ''
                        };
                    }

                    this.properties[name].settings[this.properties[name].settings.length] = {
                        start_percent: start_percent,
                        end_percent: end_percent,
                        start_value: start_value,
                        end_value: end_value,
                        easing: easing
                    };

                    this.properties[name].settings[this.properties[name].settings.length] = {
                        start_percent: end_percent,
                        end_percent: 100,
                        start_value: end_value,
                        end_value: end_value,
                        easing: ''
                    };

                } else {

                    var last_setting = this.properties[name].settings[this.properties[name].settings.length - 1];

                    if (last_setting.start_percent !== start_percent) {
                        this.properties[name].settings[this.properties[name].settings.length - 1] = {
                            start_percent: last_setting.start_percent,
                            end_percent: start_percent,
                            start_value: last_setting.end_value,
                            end_value: last_setting.end_value,
                            easing: ''
                        };

                        this.properties[name].settings[this.properties[name].settings.length] = {
                            start_percent: start_percent,
                            end_percent: end_percent,
                            start_value: start_value,
                            end_value: end_value,
                            easing: easing
                        };
                    } else {
                        this.properties[name].settings[this.properties[name].settings.length - 1] = {
                            start_percent: start_percent,
                            end_percent: end_percent,
                            start_value: start_value,
                            end_value: end_value,
                            easing: easing
                        };
                    }

                    if (100 !== end_percent) {
                        this.properties[name].settings[this.properties[name].settings.length] = {
                            start_percent: end_percent,
                            end_percent: 100,
                            start_value: end_value,
                            end_value: end_value,
                            easing: ''
                        };
                    }
                }
            };


            /**
             * remove an item property
             *
             * @param name {String} The name of the property
             * @returns {boolean}
             */
            this.remove_item_property = function(name) {
                if (undefined === this.properties[name]) {
                    return false;
                }

                delete this.properties[name];

                return true;
            };
        },




        /**
         * - function used to init the artoEffect object
         * - it must be called before adding any item
         * - the _view_port_interval_index flag is initialized
         * - the items list is empty initialized
         */
        init: function() {

            artoEffect.items = [];
        },




        /**
         * - used to add an item to the item list and initialize it
         *
         * @param item The item to be added and initialized
         */
        add_item: function(item) {

            if (item.constructor !== artoEffect.item) {
                return;
            }

            // the item is added in the item list
            artoEffect.items.push(item);

            // the item is initialized only once when it is added
            artoEffect._initialize_item(item);

            // for efficiently rendering all items are computed at once, so do not compute item individually
        },




        /**
         * - used to initialize an item
         * - an item must be initialized only once
         *
         * @param item
         * @private
         */
        _initialize_item: function(item) {

            // an item must be initialized only once
            if (true === item._is_initialized) {
                return;
            }

            // the item full height is computed
            if ( 'undefined' === typeof item.wrapper_jquery_obj) {
                item.full_height = item.jqueryObj.outerHeight(true);
            } else {
                item.full_height = item.wrapper_jquery_obj.height();
            }

            if (0 === item.full_height) {
                return;
            }

            var new_jquery_obj_reference = jQuery('<div class="arto_effect_pointer" style="height: 0; width: 0">');

            new_jquery_obj_reference.insertBefore(item.jqueryObj);

            item.top_pointer_jquery_obj = new_jquery_obj_reference;

            if ( 'absolute' === item.jqueryObj.css( 'position' ) ) {
                item.top_pointer_jquery_obj.css({
                    position: 'absolute',
                    top: 0,
                    left: 0
                });
            }

            item.offset_top = item.top_pointer_jquery_obj.offset().top;

            //console.log("initializare " + artoEffect.items.length + " : " + item.top_pointer_jquery_obj.offset().top);

            item.offset_bottom_top = item.offset_top + item.full_height;

            item.top_is_out = artoEvents.windowPageYOffset > item.offset_top;

            // the item is marked as initialized, being ready to be computed
            // for efficiently rendering all items are computed at once
            item._is_initialized = true;


            // maybe it's better to try a request animation frame after every initialization, for computing the already added items
            //artoEffect.compute_all_items();
        },




        /**
         * - used to reinitialize all items at the view resolution changing
         *
         * @param recompute_height boolean True if it's necessary to recompute the item's height [when view port changes]
         */
        reinitialize_all_items: function(recompute_height) {

            for (var i = artoEffect.items.length - 1; i >= 0; i--) {
                artoEffect.reinitialize_item(artoEffect.items[i], recompute_height);
            }
        },






        /**
         * - used to reinitialize an item at the view resolution changing
         *
         * @param item artoEffect.item
         * @param recompute_height boolean True if it's necessary to recompute the item height [when view port changes]
         * @private
         */
        reinitialize_item: function(item, recompute_height) {

            // a not initialized item can't be reinitialized
            if (false === item._is_initialized) {
                return;
            }

            // prevent the following item computing, till the reinitialization is finished
            item._is_initialized = false;

            item.offset_top = item.top_pointer_jquery_obj.offset().top;

            //console.log("reinitializare " + artoEffect.items.length + " : " + item.top_pointer_jquery_obj.offset().top);

            if (true === recompute_height) {
                if ( 'undefined' === typeof item.wrapper_jquery_obj) {
                    item.full_height = item.jqueryObj.outerHeight(true);
                } else {
                    item.full_height = item.wrapper_jquery_obj.height();
                }

                if (0 === item.full_height) {
                    return;
                }
            }

            item.offset_bottom_top = item.offset_top + item.full_height;

            // Be sure the percent value is also reinitialized
            item.percent_value = 0;

            item._is_initialized = true;
        },




        /**
         * - used for computing item properties
         *
         * @param item The item whose properties are computed
         * @private
         */
        _compute_item_properties: function(item) {

            var computed_properties = {},
                current_item_property;

            for (var property in item.properties) {

                if (true === item.properties.hasOwnProperty(property)) {

                    current_item_property = item.properties[property];

                    var current_setting,
                        new_computed_value,
                        local_computed_value,
                        easing_step,
                        easing_computed_value,
                        easing_division_interval = 1000;

                    for (var i = 0; i < current_item_property.settings.length; i++) {

                        current_setting = current_item_property.settings[i];

                        // the check is done using this form [...) of the interval or the last position 100%
                        if ((current_setting.start_percent <= item.percent_value && item.percent_value < current_setting.end_percent) ||
                            (item.percent_value === current_setting.end_percent && 100 === item.percent_value)) {

                            if (current_setting.start_value === current_setting.end_value) {

                                new_computed_value = current_setting.start_value;

                            } else {

                                // local computed value can have a positive value or a negative value, it depends of the difference end_value - start_value
                                // for a linear easing function, the new computed value is the start_value + local_computed_value
                                // if start_value < end_value, the variable local_computed_value is positive
                                // if start_value > end_value, the variable local_computed_value is negative
                                local_computed_value = (item.percent_value - current_setting.start_percent) / (current_setting.end_percent - current_setting.start_percent) * (current_setting.end_value - current_setting.start_value);


                                // if there's specified an easing function, it's applied over the computed_value
                                if ((undefined === current_setting.easing) || ('' === current_setting.easing)) {

                                    // linear easing function

                                    new_computed_value = current_setting.start_value + local_computed_value;

                                } else {

                                    // specifying an easing function

                                    easing_step = Math.abs(current_setting.start_value - current_setting.end_value) / easing_division_interval;

                                    if (current_setting.start_value < current_setting.end_value) {

                                        easing_computed_value = current_setting.start_value + jQuery.easing[current_setting.easing](
                                                null,
                                                local_computed_value,
                                                0,
                                                easing_step,
                                                current_setting.end_value - current_setting.start_value) * easing_division_interval;

                                    } else {

                                        easing_computed_value = current_setting.start_value - jQuery.easing[current_setting.easing](
                                                null,
                                                -local_computed_value,
                                                0,
                                                easing_step,
                                                current_setting.start_value - current_setting.end_value) * easing_division_interval;
                                    }

                                    new_computed_value = easing_computed_value;

                                    //console.log(current_setting.easing + ' : ' + easing_step + ' ~ ' + easing_computed_value + ' ~ ' + (current_setting.start_value + computed_value) + ' & ' + current_setting.start_value + ' $ ' + current_setting.end_value);
                                }
                            }

                            // if the existing computed value is different, the new computed value is cached
                            if (current_item_property.computed_value !== new_computed_value) {
                                current_item_property.computed_value = new_computed_value;
                                computed_properties[property] = new_computed_value;

                                // the item is marked that it has at least one property that need to be redraw
                                // the animation callback functions are called just for the marked items
                                item.redraw = true;
                            }
                            break;
                        }
                    }
                }
            }

            // a plain javascript object is added if there is no computed property
            item.computed_item_properties = computed_properties;
        },




        /**
         * - used for computing item
         * - the item properties are computed only when the item is in the view port and it is moving
         *
         * @param item The artoEffect.item to be computed
         */
        compute_item: function(item) {
            //console.clear();

            // the item must be initialized first
            if (false === item._is_initialized) {
                return;
            }

            var percent_display_value = 0;

            if (artoEvents.windowPageYOffset + artoEvents.windowInnerHeight >= item.offset_top) {

                if (artoEvents.windowPageYOffset > item.offset_bottom_top ) {
                    percent_display_value = 100;
                } else {
                    percent_display_value = (artoEvents.windowPageYOffset + artoEvents.windowInnerHeight - item.offset_top) * 100 / (artoEvents.windowInnerHeight + item.full_height);
                }
            }

            //console.log(window.pageYOffset + ' : ' + item.offset_top + ' : ' + item.offset_bottom_top);

            if (item.percent_value !== percent_display_value) {
                item.percent_value = percent_display_value;

                //console.log(item.percent_value);

                artoEffect._compute_item_properties(item);
            }

            item.top_is_out = artoEvents.windowPageYOffset > item.offset_top;
        },




        get_current_percent: function(item) {

            // the item must be initialized first
            if (false === item._is_initialized) {
                return;
            }

            var percent_display_value = 0;

            if (artoEvents.windowPageYOffset + artoEvents.windowInnerHeight >= item.offset_top) {

                if (artoEvents.windowPageYOffset > item.offset_bottom_top ) {
                    percent_display_value = 100;
                } else {
                    percent_display_value = (artoEvents.windowPageYOffset + artoEvents.windowInnerHeight - item.offset_top) * 100 / (artoEvents.windowInnerHeight + item.full_height);
                }
            }

            return percent_display_value;
        },


        get_initial_percent: function( item ) {

            // the item must be initialized first
            if (false === item._is_initialized) {
                return;
            }

            var percent_display_value = 0;

            if (artoEvents.windowInnerHeight >= item.offset_top) {

                if (0 > item.offset_bottom_top ) {
                    percent_display_value = 100;
                } else {
                    percent_display_value = (artoEvents.windowInnerHeight - item.offset_top) * 100 / (artoEvents.windowInnerHeight + item.full_height);
                }
            }

            return percent_display_value;
        },


        get_top_percent: function( item ) {

            return (artoEvents.windowInnerHeight) * 100 / (artoEvents.windowInnerHeight + item.full_height);
        },




        /**
         * - used to request an animation frame for computing all items
         * - the flag animation_running is set to false by the last requestAnimationFrame callback (the last animation call),
         * so a new call to requestAnimationFrame can be done
         */
        compute_all_items: function compute_all_items() {
            //artoEffect.animate();

            if (false === artoEffect.animation_running) {
                artoEffect.rAFIndex = window.requestAnimationFrame( artoEffect._animate_all_items );
            }

            artoEffect.animation_running = true;
        },




        /**
         * - used to call the existing callback animate functions
         *
         * @private
         */
        _animate_all_items: function _animate_all_items() {
            //var start_time = Date.now();

            for (var i = 0; i < artoEffect.items.length; i++) {
                if ( false === artoEffect.items[i].computation_stopped) {
                    artoEffect.compute_item(artoEffect.items[i]);
                }
            }

            for (var j = 0; j < artoEffect.items.length; j++) {
                if (true === artoEffect.items[j].redraw) {
                    artoEffect.items[j].animation_callback();
                }
            }

            artoEffect.animation_running = false;

            //var end_time = Date.now();
            //
            //var debug_table = jQuery("#debug_table");
            //debug_table.html((end_time - start_time) + ' ms');
        },





        /** we'll see if it's necessary to make reinitialization just at the view port changing. Now, it's not
         * - necessary to be called when the window is being resized
         */
        arto_events_resize: function() {

            if (0 === artoEffect.items.length) {
                return;
            }

            // this will be applied if it depends just by view port changing

            //if (artoEffect._changed_view_port_width()) {
            //    artoEffect.reinitialize_all_items();
            //}

            artoEffect.reinitialize_all_items(false);

            artoEffect.compute_all_items();
        },






        log: function log(msg) {
            //console.log(msg);
        }
    };
    
    artoEffect.init();
    
})( jQuery );