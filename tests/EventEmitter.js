var expect       = require('chai').expect,
    assert       = require('assert'),
    sinon        = require('sinon'),
    hap          = require('../'),
    EventFacade  = hap.EventFacade,
    EventEmitter = hap.EventEmitter;

describe('EventEmitter', function(){

  beforeEach(function(){
    this.facade  = sinon.stub(new EventFacade());
    this.testObj = new EventEmitter();
  });

  describe('#addChild()', function(){

    beforeEach(function(){
      this.child = new EventEmitter();
      this.testObj.addChild(this.child);
    });

    it('should add to the #children property', function(){
      expect(this.testObj.children).to.be.an('Array');
      expect(this.testObj.children).to.contain(this.child);
    });

    it('should set the child\'s #parent property', function(){
      expect(this.child.parent).to.equal(this.testObj);
    });

  });

  describe('#setParent()', function(){

    beforeEach(function(){
      this.parent = new EventEmitter();
      this.testObj.setParent(this.parent);
    });

    it('should change/set the #parent property', function(){
      expect(this.testObj.parent).to.equal(this.parent);
    });

    it('should append the parent\'s #children property', function(){
      expect(this.parent.children).to.contain(this.testObj);
    });

  });

  describe('#on()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.on('test event', this.testFn);
    });

    it('should attach an event listener', function(){
      expect(this.testObj._events).not.to.be.undefined;
      expect(this.testObj._events['test event']).to.equal(this.testFn);
    });

  });

  describe('#removeListener()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.on('test event', this.testFn);
      this.testObj.removeListener('test event', this.testFn);
    });

    it('should remove an event listener', function(){
      expect(this.testObj._events['test event']).to.be.undefined;
    });

  });

  describe('#emit()', function(){

    it('should notify event listeners', function(done){
      this.testObj.on('test event', done);
      this.testObj.emit('test event');
    });

  });

  describe('#after()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.after('test after', this.testFn);
    });

    it('should attach listeners to an "after" event', function(){
      expect(this.testObj._events).not.to.be.undefined;
      expect(this.testObj._events['after test after']).to.equal(this.testFn);
    });

  });

  describe('#before()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.before('test before', this.testFn);
    });

    it('should attach listeners to a "before" event', function(){
      expect(this.testObj._events).not.to.be.undefined;
      expect(this.testObj._events['before test before']).to.equal(this.testFn);
    });

  });

  describe('#fire()', function(){

    it('should notify event listeners', function(done){
      this.testObj.on('test event', function(){ done(); });
      this.testObj.fire('test event');
    });

    it('should pass an EventFacade', function(done){
      this.testObj.on('test event', function(e){
        expect(e).to.be.instanceOf(EventFacade);
        done();
      });
      this.testObj.fire('test event');
    });

    it('will return the modifed value', function(){
      var val;

      this.facade.val.returns('mung');
      val = this.testObj.fire('test event', this.facade);

      assert(this.facade.val.calledWith());
      expect(val).to.equal('mung');
    });

  });

  function once(method){

    describe('#' + method + '()', function(){

      beforeEach(function(){
        this.spy = sinon.spy();
        this.testObj[method]('test event', this.spy);
      });

      it('should only be notified once', function(){
        this.testObj.fire('test event');
        this.testObj.fire('test event');
        assert(this.spy.calledOnce);
      });

    });

  }

  once('once');
  once('onceBefore');
  once('onceAfter');

});

