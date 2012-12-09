var EventEmitterSuper = require('events').EventEmitter,
    EventFacade       = require('./EventFacade'),
    util              = require('util');
 
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
}

// Extend the events.EventEmitter class
util.inherits(EventEmitter, EventEmitterSuper);

/**
 * Returns the name for the "after" event.
 *
 * @private
 * @method afterEvent
 * @param eventName {String} The original event name.
 * @return String
 */
function afterEvent(eventName){
  return 'after ' + eventName;
}

/**
 * Returns the name for the "before" event.
 *
 * @private
 * @method beforeEvent
 * @param eventName {String} The original event name.
 * @return String
 */
function beforeEvent(eventName){
  return 'before ' + eventName;
}

/**
 * Attaches a listener to the end of the
 * event listeners list.
 *
 * @method after
 * @param eventName {String}
 * @param fn {Function}
 */
EventEmitter.prototype.after = function(eventName, fn){
  this.on(afterEvent(eventName), fn);
  return this;
};

/**
 * Attaches a listener to the end of the
 * event listeners list and let's it fire
 * just once.
 *
 * @method onceAfter
 * @param eventName {String}
 * @param fn {Function}
 */
EventEmitter.prototype.onceAfter = function(eventName, fn){
  this.once(afterEvent(eventName), fn);
  return this;
};

/**
 * Attaches a listener to the capturing stage.
 *
 * @method before
 * @param eventName {String}
 * @param fn {Function}
 */
EventEmitter.prototype.before = function(eventName, fn){
  this.on(beforeEvent(eventName), fn);
  return this;
};

/**
 * Attached a listener to the capturing stage
 * and let's it fire just once.
 *
 * @method onceBefore
 * @param eventName {String}
 * @param fn {Function}
 */
EventEmitter.prototype.onceBefore = function(eventName, fn){
  this.once(beforeEvent(eventName), fn);
  return this;
};

/**
 * Determins whether or not an emitter is a child
 * of other emitters.
 *
 * @private
 * @method isChild
 * @param emitter {EventEmitter} The emitter.
 * @return boolean
 */
function isChild(emitter){
  return !!(emitter.parent && emitter.parent.emit);
}

/**
 * Determins whether or not an emitter is a parent
 * to other other emitters.
 *
 * @private
 * @method isParent
 * @param emitter {EventEmitter} The emitter.
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
      if(emitter.children[i].emit){
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
 * Adds an emitter as a child to this object.
 *
 * @method addChild
 * @param emitter {EventEmitter} The child emitter
 */
EventEmitter.prototype.addChild = function(emitter){
  // Add the emitter to the children property
  this.children.push(emitter);
  // And set the child's #parent property as this object.
  emitter.parent = this;
  // Chainable
  return this;
};

/**
 * Adds an emitter as the parent of this object.
 *
 * @method setParent
 * @param emitter {EventEmitter} The parent emitter
 */
EventEmitter.prototype.setParent = function(emitter){
  // Add the emitter to the #parent property
  this.parent = emitter;
  // Make sure that the emitter has a #children property
  emitter.children = emitter.children || [];
  // ... then add this to the emitter's #children property
  emitter.children.push(this);
  // Chainable
  return this;
};

/**
 * Bubble an event.
 *
 * @method bubble
 * @param eventName {String}
 * @param e {Function}
 */
EventEmitter.prototype.bubble = function(eventName, e){
  // Set this a the facade's current target
  e.currentTarget = this;
  
  // If the event hasn't already bubbled through
  // this emitter...
  if(!this.hasBubbled[eventName]){
    // ... then emit the event
    this.emit(eventName, e);
    // and tell this emitter not to emit this event
    // again.
    this.hasBubbled[eventName] = true;
  }

  // If this emitter has a parent
  if(isChild(this)){
    // ... then bubble up the chain
    this.parent.bubble(eventName, e);
  }
  
  // Chainable
  return this;
};

/**
 * Starts a downward bubble process, before bubbling
 * back up again.
 *
 * @method capture
 * @param eventName {String}
 * @param e hap.EventFacade
 */
EventEmitter.prototype.capture = function(eventName, e){
  // The event name for the last bubbling procedure
  var afterEventName = afterEvent(eventName);
  
  // Set this as the facade's current target.
  e.currentTarget = this;
  
  // Reset the bubbling properties so that the event
  // will get emitted when it bubbles back through
  // this emitter.
  this.hasBubbled[eventName]      = false;
  this.hasBubbled[afterEventName] = false;

  // Emit the "before" event.
  this.emit(beforeEvent(eventName), e);

  // If this has children emitter...
  if(isParent(this)){
    // ... loop through the children
    this.children.forEach(function(child){
      // If the child look like an EventEmitter
      if(child.capture){
        // proceed capturing the event downwards.
        child.capture(eventName, e);
      }
    });
  }

  else{
    // Start bubbling the event back up the tree
    // if this emitter doesn't have any
    // children.
    this.bubble(eventName, e);
    // One last bubble for observers that want to
    // listen for the very end of the event.
    this.bubble(afterEventName, e);
  }
  
  // Chainable
  return this;
};

/**
 * Similar to the emit method but adds a facade object
 * and returns the amended value.
 *
 * @method fire
 * @param eventName {String}
 * @param args {Object}
 * @return mixed
 */
EventEmitter.prototype.fire = function(eventName, args){
  var e;

  // Make sure there is an argument hash
  args = args || {};
  // Create a facade
  e    = args instanceof EventFacade ? args : new EventFacade(args);

  // Set the event target
  e.target = this;

  // Begin the capturing process
  this.capture(eventName, e);

  // Return the value left in the facade.
  return e.val();
};

module.exports = EventEmitter;

