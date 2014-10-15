
'use strict';

var ids = {},
  asts = {},
  firstRules = {},
  importCounter = 0;

function use(plugin) {

  // this plugin has to happen before the check for missing rules
  plugin.passes.check.unshift(function(ast, options) {

    // save this AST, we're going to need it
    var myId = (importCounter++).toString();
    ids[options.filename] = myId;
    asts[myId] = ast;
    firstRules[myId] = ast.rules[0];

    var importedNames = {},
      allRules = [],
      isRuleImported = {};

    // first, get the imported rules and initializers this AST will need

    options.dependencies.forEach(function(dependency) {

      var id = ids[dependency.path],
        importedName = dependency.as;

      importedNames[importedName] = firstRules[id].name;
      asts[id].rules.forEach(function(rule) {

        if (!isRuleImported[rule.name]) {
          allRules.push(rule);
          isRuleImported[rule.name] = true;
        }

      });

    });

    var myRules = ast.rules;
    ast.rules = allRules.concat(myRules);

    // mangle the names of all rules in this file
    myRules.forEach(function mangleNames(rule) {

      if (!rule.imported) {

        if (rule.type === 'rule_ref') {
          rule.name = importedNames[rule.name] || '_' + myId + rule.name;
        } else if (rule.name) {
          rule.name = '_' + myId + rule.name;
        }

        if (rule.expression) {
          mangleNames(rule.expression);
        } else if (rule.elements) {
          rule.elements.forEach(mangleNames);
        } else if (rule.alternatives) {
          rule.alternatives.forEach(mangleNames);
        }

        rule.imported = true;

      }

    });

    // tally up the initializers
    var initializers = Object.keys(asts)
    .reduce(function(initializers, id) {

      var ast = asts[id];

      if (ast.initializer && !ast.initializer.imported) {

        ast.initializer.imported = true;
        return initializers.concat(ast.initializer);

      } else {
        return initializers;
      }

    }, []);

    if (initializers.length > 0) {

      ast.initializer = {
        type: 'initializer',
        code: initializers.reduce(function(s, initializer) {
          return s + initializer.code + '\n';
        }, '')
      };

    }

    // allowedStartRules is no longer meaningful. The only allowed
    // start rule is the top rule in the file.
    options.allowedStartRules = [firstRules[myId].name];

  });

}

module.exports = { use: use };
