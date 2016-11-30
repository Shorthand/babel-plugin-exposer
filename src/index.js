import template from 'babel-template';
import * as t from 'babel-types';
import path from 'path';
import { readFileSync } from 'fs';

const moduleSourceCode = `const __exposer__getModule = (() => {
  if (!(NAMESPACE in window)) window[NAMESPACE] = { m: {}, __exposer__getModule };
  return name => {
    if (!(name in window[NAMESPACE].m)) window[NAMESPACE].m[name] = {};
    return window[NAMESPACE].m[name];
  }
})();
`;

export default function({ types: t }) {

  const exposerGetModule = t.identifier('__exposer__getModule');
  const exposerModuleIdentifier = t.identifier('__exposer__module')

  function generateImportExposerModule(namespace) {
    return template(moduleSourceCode)({ NAMESPACE: t.stringLiteral(namespace) });
  }

  function generateInitExposerModule(moduleName) {
    return template(`
      const NAME = FUNCTION(MODULE);
    `)({
      NAME: exposerModuleIdentifier,
      FUNCTION: exposerGetModule,
      MODULE: t.stringLiteral(moduleName),
    });
  }

  function getExposedMemberExpression(exposedName) {
    let identifier = exposedName;
    if (!t.isIdentifier(exposedName)) {
      identifier = t.identifier(exposedName);
    }

    return t.memberExpression(
      exposerModuleIdentifier,
      identifier
    );
  }

  function generateExposedExpressesion(exposedName, expression) {
    const memberExpression = getExposedMemberExpression(exposedName);
    return t.assignmentExpression('=',
      memberExpression,
      expression
    );
  }

  function generateExposedFunction(functionDeclaration) {
    const functionName = functionDeclaration.id;
    const funcExpression = t.functionExpression(
      functionName,
      functionDeclaration.params,
      functionDeclaration.body,
      functionDeclaration.generator,
      functionDeclaration.async
    );
    return generateExposedExpressesion(functionName, funcExpression);
  }

  function generateExportedFunction(functionDeclaration) {
    const functionName = functionDeclaration.id;
    return template(`
      export function NAME() {
        return EXPOSER.NAME();
      }
    `, { sourceType: 'module' })({
      NAME: functionName,
      EXPOSER: exposerModuleIdentifier,
    });
  }

  function generatedDefaultExport(identifier) {
    const memberExpression = getExposedMemberExpression(identifier);
    return t.exportDefaultDeclaration(memberExpression);
  }

  function getModuleName(filename, basePath) {
    // determine relative path
    const relativePath = path.relative(basePath, filename);
    // strip file extension
    return relativePath.replace(/\.[^/.]+$/, "")
  }

  return {

    visitor: {

      /**
       * Import and initialize the module exposer
       */
      Program(path, state) {
        const basePath = state.opts.basePath;
        const filename = state.file.opts.filename;
        const moduleName = getModuleName(filename, basePath);
        const namespace = state.opts.namespace;

        path.unshiftContainer('body', generateInitExposerModule(moduleName));
        path.unshiftContainer('body', generateImportExposerModule(namespace));
      },

      /**
       * Expose exported functions
       */
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;

        if (!path.node._isExposed && t.isFunctionDeclaration(declaration)) {
          const exposedFunction = generateExposedFunction(declaration);
          const exportedFunction = generateExportedFunction(declaration);
          // prevent recursive visiting on same path
          exportedFunction._isExposed = true;

          path.replaceWith(exposedFunction);
          path.insertAfter(exportedFunction);
        }
      },

      /**
       * Expose the default export
       */
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;

        if (!path.node._isExposed && t.isFunctionDeclaration(declaration)) {
          const exposedFunction = generateExposedFunction(declaration);
          const defaultExport = generatedDefaultExport(declaration.id);
          // prevent recursive visiting on same path
          defaultExport._isExposed = true;

          path.replaceWith(exposedFunction);
          path.insertAfter(defaultExport);
        }
      },

    }
  };
}
