var expect       = require('expect.js'),
    sinon        = require('sinon'),
    events       = require('../index'),
    EventEmitter = events.EventEmitter,
    EventFacade  = events.EventFacade;

describe('events', function(){

  describe('EventFacade', function(){

    beforeEach(function(){
      this.facade = new EventFacade();
    });

    describe('#val()', function(){

      beforeEach(function(){
        this.facade.val('mung');
      });

      it('can set a value', function(){
        expect(this.facade._val).to.be('mung');
      });

      it('can retrieve a value', function(){
        expect(this.facade.val()).to.be('mung');
      });

    });

  });

  describe('EventEmitter', function(){

    beforeEach(function(){
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

        this.testObj.before('test event', function(e){
          e.val([]);
        });

        this.testObj.on('test event', function(e){
          expect(e.val()).to.be.an(Array);
          e.val().push('face');
        });

        this.testObj.on('test event', function(e){
          expect(e.val()).to.contain('face');
          e.val().push('brungle');
        });

        this.testObj.after('test event', function(e){
          expect(e.val()).to.contain('face');
          expect(e.val()).to.contain('brungle');
          e.val(e.val().join(' - '));
        });

        val = this.testObj.fire('test event');

        expect(val).to.be('face - brungle');
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
          expect(this.spy.calledOnce).to.be.ok();
        });

      });

    }

    once('once');
    once('onceBefore');
    once('onceAfter');

    describe('#bubble()', function(){

      beforeEach(function(){
        this.testObj.parent = new EventEmitter();
      });

      it('should call the #bubble() method in the #parent property', function(){
        this.testObj.parent.bubble = sinon.spy();
        this.testObj.bubble('test event', new EventFacade());
        expect(this.testObj.parent.bubble.called).to.be.ok();
      });

    });

    describe('#capture()', function(){

      beforeEach(function(){
        var child             = new EventEmitter();
        child.parent          = this.testObj;
        this.testObj.children = [child];
        this.facade           = new EventFacade();
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

});

