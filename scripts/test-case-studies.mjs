import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundled = await build({
  stdin: {
    contents: "export { blankClient, createCaseStudy, emptyWorkspace } from './lib/quotation/model.ts'; export { importBackup, validateWorkspace } from './lib/quotation/storage.ts';",
    resolveDir: process.cwd(),
    sourcefile: 'case-study-test-entry.ts',
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  write: false,
});
const { blankClient, createCaseStudy, emptyWorkspace, importBackup, validateWorkspace } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const legacy = emptyWorkspace();
delete legacy.caseStudies;
assert.deepEqual(validateWorkspace(legacy).caseStudies, [], 'existing version 2 workspaces gain an empty case-study list');
delete legacy.documents;
delete legacy.documentTrash;
legacy.schemaVersion = 1;
assert.deepEqual(validateWorkspace(legacy).caseStudies, [], 'version 1 backups still import');

const client = blankClient();
client.business = 'Test client';
const study = createCaseStudy(client);
assert.equal(study.clientId, client.id);
assert.equal(study.basics.clientName, client.business);
assert.equal(study.basics.assetPermission, 'not_confirmed');
assert.equal(study.results.metrics[0].value, '', 'new studies contain no invented result');
assert.equal(study.decisions.length, 3);

const workspace = emptyWorkspace();
workspace.clients.push(client);
workspace.caseStudies.push(study);
const restored = importBackup(JSON.stringify(workspace));
assert.deepEqual(restored.caseStudies, [study], 'JSON backup preserves all case-study fields');

const malformed = structuredClone(workspace);
malformed.caseStudies[0].decisions.push(...Array.from({ length: 3 }, () => ({ id: crypto.randomUUID(), decision: '', reason: '', visibleChange: '' })));
assert.throws(() => validateWorkspace(malformed), /too many decision or result rows/);

console.log('Case-study workspace migration and backup checks passed.');
