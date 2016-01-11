var expect      = require('chai').expect,
    sinon       = require('sinon'),
    EventFacade = require('../lib/EventFacade');

describe('EventFacade', function(){

  beforeEach(function(){
    this.facade = new EventFacade();
  });

  describe('construction', function(){

    it('should have created a params property', function(){
      expect(this.facade.params).to.be.an('object');
    });

    it('s first parameter will be set as the property object', function(){
      this.facade = new EventFacade({foo: 'bar'});
      expect(this.facade.params).to.have.property('foo', 'bar');
    });

    it('will set the value is a `val` prop is given', function(){
      this.facade = new EventFacade({val: 'foo'});
      expect(this.facade.val()).to.equal('foo');
    });
  });

  describe('#val()', function(){

    beforeEach(function(){
      this.facade.val('mung');
    });

    it('can set a value', function(){
      expect(this.facade._val).to.equal('mung');
    });

    it('can retrieve a value', function(){
      expect(this.facade.val()).to.equal('mung');
    });

  });

});
