/// <reference path="../typings/index.d.ts" />
var EventEmitterSuper = require('events').EventEmitter,
    EventFacade       = require('./EventFacade'),
    util              = require('util'),
    inherits          = util.inherits,
    extend            = util._extend;

/**
 * Returns the name for the "after" event.
 *
 * @function afterEvent
 * @param eventName {String} The original event name.
 * @return String
 */
function afterEvent(eventName){
  return 'after ' + eventName;
}

/**
 * Returns the name for the "before" event.
 *
 * @function beforeEvent
 * @param eventName {String} The original event name.
 * @return String
 */
function beforeEvent(eventName){
  return 'before ' + eventName;
}

/**
 * Determins whether or not an object is an emitter
 *
 * @function isEmitter
 * @param emitter {any}
 * @return boolean
 */
function isEmitter(emitter) {
  return typeof emitter === 'object' && emitter.hapEventEmitter;
}

/**
 * Determins whether or not an emitter is a child
 * of other emitters.
 *
 * @function isChild
 * @param emitter {hap.EventEmitter} The emitter.
 * @return boolean
 */
function isChild(emitter){
  return !!(emitter.parent && isEmitter(emitter.parent));
}

/**
 * Determins whether or not an emitter is a parent
 * to other other emitters.
 *
 * @function isParent
 * @param emitter {hap.EventEmitter} The emitter.
 * @return boolean
 */
function isParent(emitter){
  var parental = false,
      i;

  // If the emitter has an array of children...
  if(emitter.children && util.isArray(emitter.children)){
    // ... then loop through each child.
    for(i=0; i<emitter.children.length; i++){
      // If the child looks like an emitter...
      if(isEmitter(emitter.children[i])){
        // ... we now can determin that the emitter
        // is a parent. So stop the loop and return
        // the value.
        parental = true;
        break;
      }
    }
  }

  return parental;
}

/**
 * Bubble an event.
 *
 * @function bubble
 * @param emitter {hap.EventEmitter}
 * @param eventName {String}
 * @param e {Function}
 */
function bubble(emitter, eventName, e){
  // Set this a the facade's current target
  e.currentTarget = emitter;
  
  // If the event hasn't already bubbled through
  // this emitter...
  if(!emitter.hasBubbled[eventName]){
    // If the emitter has children...
    if(isParent(emitter)){
      // Make sure the children all call the bubble
      // method.
      emitter.children.forEach(function(child){
        bubble(child, eventName, e);
      });
    }
    // ... then emit the event
    emitter.emit(eventName, e);
    // and tell this emitter not to emit this event
    // again.
    emitter.hasBubbled[eventName] = true;
  }

  // Chainable
  return emitter;
};

/**
 * Starts a downward bubble process, before bubbling
 * back up again.
 *
 * @function capture
 * @param emitter {hap.EventEmitter}
 * @param eventName {String}
 * @param e {hap.EventFacade}
 */
function capture(emitter, eventName, e){
  // The event name for the last bubbling procedure
  var afterEventName = afterEvent(eventName);
  
  // Set this as the facade's current target.
  e.currentTarget = emitter;
  
  // Reset the bubbling properties so that the event
  // will get emitted when it bubbles back through
  // this emitter.
  emitter.hasBubbled[eventName]      = false;
  emitter.hasBubbled[afterEventName] = false;

  // Emit the "before" event.
  emitter.emit(beforeEvent(eventName), e);

  // If this has children emitter...
  if(isParent(emitter)){
    // ... loop through the children
    emitter.children.forEach(function(child){
      // If the child look like an EventEmitter
      if(isEmitter(child)){
        // proceed capturing the event downwards.
        capture(child, eventName, e);
      }
    });
  }

  // Chainable
  return emitter;
};

/**
 * A extended version of the EventEmitter.
 *
 * @namespace hap
 * @class EventEmitter
 * @extends events.EventEmitter
 */
function EventEmitter(){
  // Call the super's constructor
  EventEmitterSuper.apply(this, arguments);
  
  /**
   * An array of children emitter.
   * 
   * @property children
   * @type [hap.EventEmitter]
   */
  this.children = [];
  
  /**
   * A hash of boolean values that depict which
   * events have already bubbled through this
   * object. This prevents duplicating the event
   * firing process.
   * 
   * @property hasBubbled
   * @type Boolean
   */
  this.hasBubbled = {};

  /**
   * A way of distinguishing an hap.EventEmitter.
   *
   * @property hapEventEmitter
   * @type Boolean
   */
  this.hapEventEmitter = true;
}

// Extend the events.EventEmitter class
inherits(EventEmitter, EventEmitterSuper);
extend(EventEmitter.prototype, {

  /**
   * Attaches a listener to the end of the
   * event listeners list.
   *
   * @method after
   * @param eventName {String}
   * @param fn {Function}
   */
  after: function(eventName, fn){
    this.on(afterEvent(eventName), fn);
    return this;
  },

  /**
   * Attaches a listener to the end of the
   * event listeners list and let's it fire
   * just once.
   *
   * @method onceAfter
   * @param eventName {String}
   * @param fn {Function}
   */
  onceAfter: function(eventName, fn){
    this.once(afterEvent(eventName), fn);
    return this;
  },

  /**
   * Attaches a listener to the capturing stage.
   *
   * @method before
   * @param eventName {String}
   * @param fn {Function}
   */
  before: function(eventName, fn){
    this.on(beforeEvent(eventName), fn);
    return this;
  },

  /**
   * Attached a listener to the capturing stage
   * and let's it fire just once.
   *
   * @method onceBefore
   * @param eventName {String}
   * @param fn {Function}
   */
  onceBefore: function(eventName, fn){
    this.once(beforeEvent(eventName), fn);
    return this;
  },

  /**
   * Adds an emitter as a child to this object.
   *
   * @method addChild
   * @param emitter {EventEmitter} The child emitter
   */
  addChild: function(emitter){
    // Add the emitter to the children property
    this.children.push(emitter);
    // And set the child's #parent property as this object.
    emitter.parent = this;
    // Chainable
    return this;
  },

  /**
   * Adds an emitter as the parent of this object.
   *
   * @method setParent
   * @param emitter {EventEmitter} The parent emitter
   */
  setParent: function(emitter){
    // Add the emitter to the #parent property
    this.parent = emitter;
    // Make sure that the emitter has a #children property
    emitter.children = emitter.children || [];
    // ... then add this to the emitter's #children property
    emitter.children.push(this);
    // Chainable
    return this;
  },

  /**
   * Similar to the emit method but adds a facade object
   * and returns the amended value.
   *
   * @method fire
   * @param eventName {String}
   * @param args {Object}
   * @return mixed
   */
  fire: function(eventName, args){
        // The event name for the last bubbling procedure
    var afterEventName = afterEvent(eventName),
        // The event facade
        e;

    // Make sure there is an argument hash
    args = args || {};

    // Create a facade
    e = args instanceof EventFacade ? args : new EventFacade(args);

    // Set the event target
    e.target = this;

    // Begin the capturing process
    capture(this, eventName, e);

    // Start bubbling the event back up the tree
    // if this emitter doesn't have any
    // children.
    bubble(this, eventName, e);

    // One last bubble for observers that want to
    // listen for the very end of the event.
    bubble(this, afterEventName, e);

    // Return the value left in the facade.
    return e.val();
  }

});

module.exports = EventEmitter;

