var EventEmitterSuper = require('events').EventEmitter,
    util              = require('util'),
    key;

/**
 * A facade used for events.
 *
 * @namespace mouse.lib.events
 * @class EventFacade
 * @constructor
 * @param params {Object}
 */
function EventFacade(params){
  if(params === undefined){
    params = {};
  }
  this.params = params;
}

/**
 * Sets or returns a value that should be used as
 * then end result of this event.
 *
 * @param val {String|Object}
 * @return {String|Object}
 */
EventFacade.prototype.val = function(val){
  if(val !== undefined){
    this._val = val;
  }
  return this._val;
};
 
function afterEvent(eventName){
  return 'after ' + eventName;
}

function beforeEvent(eventName){
  return 'before ' + eventName;
}

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
 * Attaches a listener to the end of the
 * event listeners list.
 *
 * @param eventName {String}
 * @param fn {Function}
 */
EventEmitter.prototype.after = function(eventName, fn){
  this.on(afterEvent(eventName), fn);
  return this;
};

EventEmitter.prototype.onceAfter = function(eventName, fn){
  this.once(afterEvent(eventName), fn);
  return this;
};

/**
 * Attaches a listener to the beginning of
 * the event listeners list.
 *
 * @param eventName {String}
 * @param fn {Function}
 */
EventEmitter.prototype.before = function(eventName, fn){
  this.on(beforeEvent(eventName), fn);
  return this;
};

EventEmitter.prototype.onceBefore = function(eventName, fn){
  this.once(beforeEvent(eventName), fn);
  return this;
};

function isChild(emitter){
  return !!(emitter.parent && emitter.parent.emit);
}

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
 * Bubble an event.
 *
 * @param eventName {String}
 * @param e {Function}
 */
EventEmitter.prototype.bubble = function(eventName, e){
  e.currentTarget = this;
  this.emit(eventName, e);

  if(isChild(this)){
    this.parent.bubble(eventName, e);
  }
};

/**
 * Starts a downward bubble process, before bubbling
 * back up again.
 *
 * @param eventName {String}
 * @param e {Function}
 */
EventEmitter.prototype.capture = function(eventName, e){
  e.currentTarget = this;

  this.emit(beforeEvent(eventName), e);

  if(isParent(this)){
    this.children.forEach(function(child){
      child.capture(eventName, e);
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

exports.EventFacade  = EventFacade;
exports.EventEmitter = EventEmitter;

