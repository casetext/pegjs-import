
'use strict';

var fs = require('fs'),
  path = require('path');

module.exports = function(filename) {

  // read the file in
  var text = fs.readFileSync(filename).toString(),
    dependencies = [];

  var newText = text.replace(/^\s*@import (.*)/mg, function(_, importStatement) {

    var match, importedFilename;

    if ((match = importStatement.match(/('|")(.*)\1(\s*as|$)/))) {
      importedFilename = match[2];
    } else {
      throw new Error(
        'File ' + filename + ': ' +
        'Bad syntax in import statement ' + importStatement);
    }

    var as = path.basename(importedFilename, '.peg')
    .replace(/[^A-Za-z0-9_$]/g, '_');

    if (( match = importStatement.match(/['"] as (.*)$/))) {

      if (!match[1].match(/^[A-Za-z_$][A-Za-z0-9_$]*$/)) {
        throw new Error(
          'File ' + filename + ': ' +
          'Bad syntax in "as" portion of import statement ' + importStatement);
      }

      as = match[1];

    }

    dependencies.push({path: importedFilename, as: as});

    return '';

  });

  return {
    text: newText,
    dependencies: dependencies
  };

};
