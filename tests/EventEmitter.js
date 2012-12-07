var expect       = require('expect.js'),
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

  describe('#on()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.on('test event', this.testFn);
    });

    it('should attach an event listener', function(){
      expect(this.testObj._events).not.to.be(undefined);
      expect(this.testObj._events['test event']).to.be(this.testFn);
    });

  });

  describe('#removeListener()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.on('test event', this.testFn);
      this.testObj.removeListener('test event', this.testFn);
    });

    it('should remove an event listener', function(){
      expect(this.testObj._events['test event']).to.be(undefined);
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
      expect(this.testObj._events).not.to.be(undefined);
      expect(this.testObj._events['after test after']).to.be(this.testFn);
    });

  });

  describe('#before()', function(){

    beforeEach(function(){
      this.testFn = function(){};
      this.testObj.before('test before', this.testFn);
    });

    it('should attach listeners to a "before" event', function(){
      expect(this.testObj._events).not.to.be(undefined);
      expect(this.testObj._events['before test before']).to.be(this.testFn);
    });

  });

  describe('#fire()', function(){

    it('should notify event listeners', function(done){
      this.testObj.on('test event', function(){ done(); });
      this.testObj.fire('test event');
    });

    it('should pass an EventFacade', function(done){
      this.testObj.on('test event', function(e){
        expect(e).to.be.an(EventFacade);
        done();
      });
      this.testObj.fire('test event');
    });

    it('will return the modifed value', function(){
      var val;

      this.facade.val.returns('mung');
      val = this.testObj.fire('test event', this.facade);

      assert(this.facade.val.calledWith());
      expect(val).to.be('mung');
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

  describe('#bubble()', function(){

    beforeEach(function(){
      this.testObj.parent = sinon.stub(new EventEmitter());
    });

    it('should call the #bubble() method in the #parent property', function(){
      this.testObj.bubble('test event', this.facade);
      assert(this.testObj.parent.bubble.calledWith());
    });

  });

  describe('#capture()', function(){

    beforeEach(function(){
      var child             = new EventEmitter();
      child.parent          = this.testObj;
      this.testObj.children = [child];
    });

    it('should call the #capture() method in the children', function(){
      this.testObj.children[0].capture = sinon.spy();
      this.testObj.capture('test event', this.facade);
      expect(this.testObj.children[0].capture.called).to.be.ok();
    });

    it('should call the child\'s bubble method', function(){
      this.testObj.children[0].bubble = sinon.spy();
      this.testObj.capture('test event', this.facade);
      expect(this.testObj.children[0].bubble.called).to.be.ok();
    });

    it('should bubble back up', function(){
      this.testObj.bubble = sinon.spy();
      this.testObj.capture('test event', this.facade);
      expect(this.testObj.bubble.called).to.be.ok();
    });

  });

});

