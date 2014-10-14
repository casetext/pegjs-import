
'use strict';

var buildParser = require('../../index');

describe('peg-import', function() {

  it('provides the basic import syntax', function() {

    var parser;

    parser = buildParser('test/fixtures/import.peg');

    expect(function() {
      parser.parse('0123456789');
    }).not.to.throw();

    expect(function() {
      parser.parse('0123456789.');
    }).not.to.throw();

    expect(function() {
      parser.parse('abcdefghijk');
    }).to.throw();

  });

  /*
  it('only imports initializers once', function() {

    expect(function() {
      buildParser('test/fixtures/initializer.peg');
    }).not.to.throw();

  });
  */
});
