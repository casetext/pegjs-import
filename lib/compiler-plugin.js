
'use strict';

var ids = {};
var asts = {};
var importCounter = 0;

function use(plugin, options) {

  var myId = (importCounter++).toString();
  ids[options.filename] = myId;

  // this plugin has to happen before the check for missing rules
  plugin.passes.check.unshift(function(ast, options) {

    // save this AST, we're going to need it
    asts[myId] = ast;

    var importedNames = {},
      allRules = [],
      isRuleImported = {};

    // first, get the imported rules this AST will need

    options.dependencies.forEach(function(dependency) {

      var id = ids[dependency.path],
        importedName = dependency.as;

      importedNames[importedName] = '_' + myId + importedName;

      asts[id].rules.forEach(function(rule) {

        if (!isRuleImported[rule.name]) {
          allRules.push(rule);
          isRuleImported[rule.name] = true;
        }

      });

      allRules.push({
        imported: true,
        name: '_' + myId + importedName,
        type: 'rule',
        expression: {
          type: 'rule_ref',
          name: asts[id].rules[0].name
        }
      });

    });

    var myRules = ast.rules;
    ast.rules = allRules.concat(myRules);

    // mangle the names of all rules in this file
    myRules.forEach(function mangleNames(rule) {

      if (!rule.imported) {

        if (rule.type === 'rule_ref') {
          rule.name = importedNames[rule.name];
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

    // allowedStartRules is no longer meaningful. The only allowed
    // start rule is the top rule in the file.
    options.allowedStartRules = [myRules[0].name];

  });

}

module.exports = { use: use };
