export declare class EventEmitter{
	addChild(emitter:EventEmitter): EventEmitter;
	after(eventName:string, fn:Function): EventEmitter;
	before(eventName:string, fn:Function): EventEmitter;
	protected bubble(eventName:String, e:EventFacade): EventEmitter;
	protected capture(eventName:String, e:EventFacade): EventEmitter;
	emit(eventName:string, ...attrs:Object[]): boolean;
	fire(eventName:string, ...attrs:(Object|EventFacade)[]): Object;
	on(eventName:string, fn:Function): EventEmitter;
	once(eventName:string, fn:Function): EventEmitter;
	onceAfter(eventName:string, fn:Function): EventEmitter;
	onceBefore(eventName:string, fn:Function): EventEmitter;
	removeListener(eventName:string, fn:Function): EventEmitter;
	setParent(emitter:EventEmitter): EventEmitter;
}
export declare class EventFacade {
	constructor(params?:Object);
	val(value?:Object): Object;
}