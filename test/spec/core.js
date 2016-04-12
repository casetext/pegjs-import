'use strict';

var pegimport = require('../../index'),
  peg = require('pegjs'),
  path = require('path'),
  mockFs = require('mock-fs');

describe('peg-import', function() {

  it('provides the basic import syntax', function() {

    var parser;

    parser = pegimport.buildParser('test/fixtures/import.peg');

    expect(function() {
      parser.parse('0123456789');
    }).not.to.throw();

    expect(function() {
      parser.parse('0123456789.');
    }).not.to.throw();

    expect(function() {
      parser.parse('abcdefghijk');
    }).to.throw(parser.SyntaxError);

  });

  it('only imports initializers once', function() {

    expect(function() {
      pegimport.buildParser('test/fixtures/initializer.peg');
    }).not.to.throw();

  });

  it('imports initializers in the correct order', function() {

    expect(function() {
      pegimport.buildParser('test/fixtures/initializer2.peg');
    }).not.to.throw();

  });

  it('detects circular dependencies', function() {

    expect(function() {
      pegimport.buildParser('test/fixtures/circle/left.peg');
    }).to.throw(peg.GrammarError);

  });

  it('passes options straight through', function() {

    expect(function() {
      pegimport.buildParser('test/fixtures/initializer.peg', { optimize: 'size' });
    }).not.to.throw();

  });

  it('treats internal rule name references correctly', function() {

    expect(function() {
      pegimport.buildParser('test/fixtures/rulerefs.peg');
    }).not.to.throw();

  });

  describe('caching', function() {
    var absoluteFilename = path.resolve('test/fixtures/import.peg')

    afterEach(function() {
      mockFs.restore();
    });

    function enableMock() {
      var stubbedFixture = 'start = a:.* { return "abc" }';

      mockFs({
        'test/fixtures': {
          'import.peg': stubbedFixture
        }
      });
    }

    function result() {
      return pegimport.buildParser(absoluteFilename).parse('123');
    }

    it('works with absolute filenames', function() {
      expect(result()).to.deep.equal(['1', '2', '3']);

      enableMock();

      expect(result()).to.not.equal('abc');
    });

    it('can be cleared', function() {
      expect(result()).to.deep.equal(['1', '2', '3']);

      enableMock();
      pegimport.clearCache();

      expect(result()).to.equal('abc');
    });

  });
});
