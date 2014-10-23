
'use strict';

var fs = require('fs'),
  path = require('path'),
  peg = require('pegjs'),
  importPlugin = require('./lib/compiler-plugin'),
  parseImports = require('./lib/parse-imports');

var parsers = {},
  importStack = [];

function buildParser(filename, options) {

  // if we've already imported this file, don't touch it again
  if (parsers[filename]) {
    return parsers[filename];
  }

  var absoluteFilename = path.resolve(filename),
    grammar = parseImports(absoluteFilename);

  if (importStack.indexOf(absoluteFilename) !== -1) {
    throw new peg.GrammarError('Circular dependency on ' + absoluteFilename);
  } else {
    importStack.push(absoluteFilename);
  }

  // recursively build the files we discovered
  grammar.dependencies.forEach(function(dependency) {

    // convert path to absolute
    if (dependency.path.charAt(0) === '.') {

      var prospectivePath = path.resolve(
        path.dirname(filename),
        dependency.path);

      if (fs.existsSync(path.join(prospectivePath, 'index.peg'))) {
        dependency.path = path.join(prospectivePath, 'index.peg');
      } else if (fs.existsSync(prospectivePath + '.peg')) {
        dependency.path = prospectivePath + '.peg';
      } else if (fs.existsSync(prospectivePath)) {
        dependency.path = prospectivePath;
      }

    } else {
      dependency.path = require.resolve(dependency.path);
    }

    var parser;
    try {
      parser = buildParser(dependency.path, options);
    } catch(e) {
      if (e instanceof peg.GrammarError) {
        throw new peg.GrammarError(dependency.path + ': ' + e.message + '\n');
      } else {
        throw e;
      }
    }

  });

  // call out to PEG and build the parser

  var combinedOptions = {};
  for (var option in options) {

    if (options.hasOwnProperty(option)) {
      combinedOptions[option] = options[option];
    }

  }

  if (combinedOptions.plugins) {
    combinedOptions.plugins = combinedOptions.plugins.concat(importPlugin);
  } else {
    combinedOptions.plugins = [importPlugin];
  }

  combinedOptions.filename = absoluteFilename;
  combinedOptions.dependencies = grammar.dependencies;

  var newParser;

  try {
    newParser = peg.buildParser(grammar.text, combinedOptions);
  } catch(e) {

    if (e instanceof peg.GrammarError) {
      throw new peg.GrammarError(absoluteFilename + ': ' + e.message + '\n');
    } else {
      throw e;
    }

  }

  // pop ourselves off the import stack
  importStack.pop();

  parsers[absoluteFilename] = newParser;
  return newParser;

};
module.exports = { buildParser: buildParser };
