var EventEmitterSuper = require('events').EventEmitter,
    EventFacade       = require('./EventFacade'),
    util              = require('util');
 
/**
 * A extended version of the EventEmitter.
 *
 * @namespace mouse.lib.events
 * @class EventEmitter
 * @extends events.EventEmitter
 */
function EventEmitter(){
  EventEmitterSuper.apply(this, arguments);
}

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
 * Determins whether or not an amitter is a parent
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

  if(emitter.children && util.isArray(emitter.children)){
    for(i=0; i<emitter.children.length; i++){
      if(emitter.children[i].emit){
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
 * @param emitter {EventEmitter} The child emitter
 */
EventEmitter.prototype.addChild = function(emitter){
  this.children = this.children || [];
  this.children.push(emitter);
  emitter.setParent(this);
};

/**
 * Adds an emitter as the parent of this object.
 *
 * @param emitter {EventEmitter} The parent emitter
 */
EventEmitter.prototype.setParent = function(emitter){
  this.parent = emitter;
  emitter.addChild(this);
};

/**
 * Bubble an event.
 *
 * @param eventName {String}
 * @param e {Function}
 */
EventEmitter.prototype.bubble = function(eventName, e){
  e.currentTarget = this;
  this.emit(eventName, e);

  if(e.target !== this && isChild(this)){
    this.parent.bubble(eventName, e);
  }
};

/**
 * Starts a downward bubble process, before bubbling
 * back up again.
 *
 * @param eventName {String}
 * @param e {Function}
 * @todo As there can be several children to one parent,
 * we need to make sure that not all children will invoke
 * the bubbling procedure, otherwise the parents may get
 * invoked more than once.
 */
EventEmitter.prototype.capture = function(eventName, e){
  e.currentTarget = this;

  this.emit(beforeEvent(eventName), e);

  if(isParent(this)){
    this.children.forEach(function(child){
      if(child.capture){
        child.capture(eventName, e);
      }
    });
  }

  else{
    this.bubble(eventName, e);
    this.bubble(afterEvent(eventName), e);
  }
};

/**
 * Similar to the emit method but adds a facade object
 * and returns the amended value.
 *
 * @param eventName
 * @return mixed
 */
EventEmitter.prototype.fire = function(eventName, args){
  var e;

  args = args || {};
  e    = args instanceof EventFacade ? args : new EventFacade(args);

  e.target = this;

  this.capture(eventName, e);

  return e.val();
};

module.exports = EventEmitter;

