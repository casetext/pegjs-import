# pegjs-import

[![Build Status](https://travis-ci.org/casetext/pegjs-import.svg?branch=master)](https://travis-ci.org/casetext/pegjs-import)

Import other PEG files into a PEG.js grammar.

## Installation

```
npm install --save pegjs pegjs-import
```

## Usage

pegjs-import provides a single function that replaces ```peg.buildParser```:

```javascript
  var pegimport = require('pegjs-import');

  var parser = pegimport.buildParser('path/to/grammar.peg', options);
  parser.parse('foo');
```

Instead of taking a string, it takes a filename.

Inside a PEG.js grammar, you can now make use of the ```@import``` directive, like so:

```
/* NOTE: this grammar won't work in stock PEG.js anymore! */

{
  this.notes = "Initializers work as you expect them to and are imported.";
}

@import "path/to/grammar"

start
  = grammar
```

When you ```@import``` another grammar, that grammar's topmost rule becomes accessible in the context of the current grammar under one of two possible rule names: 
   - A name you provide explicitly through the use of the optional "as" parameter
   - The basename of the file, corrected to be a valid Javascript identifier (so if the file were called /foo/bar/my-grammar.peg, the rule name would be my_grammar).

## Changes from stock PEG.js behavior

* You cannot supply ```options.allowedStartRules``` anymore. The only allowed start rule is always the first rule in the grammar.
* You cannot supply a grammar as a string, you must give a filename. There are libraries that provide virtual and in-memory filesystems if you want to work on grammars as strings.

## Limitations

- pegjs-import is only tested on NodeJS, though the parsers work everywhere they usually do.
- Circular dependencies explicitly throw an exception. Don't use them.
- Please don't do funny things with rule names, pegjs-import will probably explode. I will not be held responsible for exploding grammars.

## Changelog

### 0.2.6

 - Fixed a bug in path comparison that broke Windows.

### 0.2.5

- parse-imports now handles /index.peg correctly.

### 0.2.4

- Resolve a glitch in external rule name resolution.

### 0.2.3

- Don't require "as" identifiers to have two characters in them

### 0.2.2

- Make sure we treat internal vs. external rule_refs correctly

### 0.2.1

- Fixed bug in options parsing.

### 0.2.0

- Changed syntax to more closely correspond to that of PEG.js.
