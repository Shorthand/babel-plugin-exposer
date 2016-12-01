'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;


  var exposerGetModule = t.identifier('__exposer__getModule');
  var exposerModuleIdentifier = t.identifier('__exposer__module');

  function generateImportExposerModule(namespace) {
    return (0, _babelTemplate2.default)(moduleSourceCode)({ NAMESPACE: t.stringLiteral(namespace) });
  }

  function generateInitExposerModule(moduleName) {
    return (0, _babelTemplate2.default)('\n      const NAME = FUNCTION(MODULE);\n    ')({
      NAME: exposerModuleIdentifier,
      FUNCTION: exposerGetModule,
      MODULE: t.stringLiteral(moduleName)
    });
  }

  function getExposedMemberExpression(exposedName) {
    var identifier = exposedName;
    if (!t.isIdentifier(exposedName)) {
      identifier = t.identifier(exposedName);
    }

    return t.memberExpression(exposerModuleIdentifier, identifier);
  }

  function generateExposedExpressesion(exposedName, expression) {
    var memberExpression = getExposedMemberExpression(exposedName);
    return t.assignmentExpression('=', memberExpression, expression);
  }

  function generateExposedFunction(functionDeclaration) {
    var functionName = functionDeclaration.id;
    var funcExpression = t.functionExpression(functionName, functionDeclaration.params, functionDeclaration.body, functionDeclaration.generator, functionDeclaration.async);
    return generateExposedExpressesion(functionName, funcExpression);
  }

  function generateExportedFunction(functionDeclaration) {
    var functionName = functionDeclaration.id;
    return (0, _babelTemplate2.default)('\n      export function NAME(...args) {\n        return EXPOSER.NAME(...args);\n      }\n    ', { sourceType: 'module' })({
      NAME: functionName,
      EXPOSER: exposerModuleIdentifier
    });
  }

  function generatedDefaultExport(functionDeclaration) {
    var functionName = functionDeclaration.id;
    return (0, _babelTemplate2.default)('\n      export default function NAME(...args) {\n        return EXPOSER.NAME(...args);\n      }\n    ', { sourceType: 'module' })({
      NAME: functionName,
      EXPOSER: exposerModuleIdentifier
    });
  }

  function getModuleName(filename, basePath) {
    // determine relative path
    var relativePath = _path2.default.relative(basePath, filename);
    // strip file extension
    return relativePath.replace(/\.[^/.]+$/, "");
  }

  return {

    visitor: {

      /**
       * Import and initialize the module exposer
       */
      Program: function Program(path, state) {
        var basePath = state.opts.basePath;
        var filename = state.file.opts.filename;
        var moduleName = getModuleName(filename, basePath);
        var namespace = state.opts.namespace;

        path.unshiftContainer('body', generateInitExposerModule(moduleName));
        path.unshiftContainer('body', generateImportExposerModule(namespace));
      },


      /**
       * Expose exported functions
       */
      ExportNamedDeclaration: function ExportNamedDeclaration(path) {
        var declaration = path.node.declaration;

        if (!path.node._isExposed && t.isFunctionDeclaration(declaration)) {
          var exposedFunction = generateExposedFunction(declaration);
          var exportedFunction = generateExportedFunction(declaration);
          // prevent recursive visiting on same path
          exportedFunction._isExposed = true;

          path.replaceWith(exposedFunction);
          path.insertAfter(exportedFunction);
        }
      },


      /**
       * Expose the default export
       */
      ExportDefaultDeclaration: function ExportDefaultDeclaration(path) {
        var declaration = path.node.declaration;

        if (!path.node._isExposed && t.isFunctionDeclaration(declaration)) {
          var exposedFunction = generateExposedFunction(declaration);
          var defaultExport = generatedDefaultExport(declaration);
          // prevent recursive visiting on same path
          defaultExport._isExposed = true;

          path.replaceWith(exposedFunction);
          path.insertAfter(defaultExport);
        }
      }
    }
  };
};

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moduleSourceCode = 'var __exposer__getModule = (function(s, h) {\n  var module = function(n) {\n    if (!(n in s[h].m)) s[h].m[n] = {};\n    return s[h].m[n];\n  };\n  if (!(h in s)) s[h] = {m:{}, module:module};\n  return module;\n})(window, NAMESPACE);\n';