import {EventEmitter as BaseEventEmitter} from "events";

export class EventEmitter extends BaseEventEmitter{
	addChild(emitter:EventEmitter);
	after(eventName:string, fn:Function);
	before(eventName:string, fn:Function)
	protected bubble(eventName:String, e:EventFacade);
	protected capture(eventName:String, e:EventFacade);
	emit(eventName:string, ...attrs:Object[]):boolean;
	fire(eventName:string, ...attrs:(Object|EventFacade)[]):Object;
	on(eventName:string, fn:Function);
	once(eventName:string, fn:Function);
	onceAfter(eventName:string, fn:Function);
	onceBefore(eventName:string, fn:Function);
	removeListener(eventName:string, fn:Function):EventEmitter;
	setParent(emitter:EventEmitter);
}
export class EventFacade {
	constructor(params?:Object);
	val(value?:Object):Object; 
}