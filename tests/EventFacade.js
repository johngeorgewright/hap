var expect      = require('chai').expect,
    sinon       = require('sinon'),
    EventFacade = require('../lib/EventFacade');

describe('EventFacade', function(){

  beforeEach(function(){
    this.facade = new EventFacade();
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

