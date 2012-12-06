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
 * @method val
 * @param val {String|Object}
 * @return {String|Object}
 */
EventFacade.prototype.val = function(val){
  if(val !== undefined){
    this._val = val;
  }
  return this._val;
};

module.exports = EventFacade;

