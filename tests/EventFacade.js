var expect      = require('expect.js'),
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
      expect(this.facade._val).to.be('mung');
    });

    it('can retrieve a value', function(){
      expect(this.facade.val()).to.be('mung');
    });

  });

});

