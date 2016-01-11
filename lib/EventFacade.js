/**
 * A facade used for events.
 *
 * @namespace hap
 * @class EventFacade
 * @constructor
 * @param params {Object}
 */
function EventFacade(params){
  if(params === undefined){
    params = {};
  }
  if('val' in params) {
    this.val(params.val);
    delete params.val;
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
