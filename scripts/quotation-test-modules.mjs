import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url), cache = new Map();
export function loadQuotationModule(name) {
  return loadProjectModule(`lib/quotation/${name}.ts`);
}
export function loadProjectModule(relative) {
  const filename = path.resolve(relative);
  if (cache.has(filename)) return cache.get(filename);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  const compiled = { exports: {} }; cache.set(filename, compiled.exports);
  const localRequire = specifier => specifier.startsWith('.') ? loadProjectModule(path.resolve(path.dirname(filename), `${specifier}.ts`)) : require(specifier);
  // Only repository-owned TypeScript is evaluated, never imported backup content.
  new Function('require', 'module', 'exports', outputText)(localRequire, compiled, compiled.exports);
  return compiled.exports;
}
