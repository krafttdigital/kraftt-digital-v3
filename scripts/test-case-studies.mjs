import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const bundlePath = join(tmpdir(), `kraftt-case-study-test-${crypto.randomUUID()}.mjs`);
await build({
  stdin: {
    contents: "export { blankClient, createCaseStudy, emptyWorkspace } from './lib/quotation/model.ts'; export { importBackup, validateWorkspace } from './lib/quotation/storage.ts'; export { caseStudyFilename, caseStudySections, generateCaseStudyHtml, generateCaseStudyPdf } from './lib/quotation/case-study-export.ts';",
    resolveDir: process.cwd(),
    sourcefile: 'case-study-test-entry.ts',
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outfile: bundlePath,
});
const { blankClient, createCaseStudy, emptyWorkspace, importBackup, validateWorkspace, caseStudyFilename, caseStudySections, generateCaseStudyHtml, generateCaseStudyPdf } = await import(pathToFileURL(bundlePath).href);

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

study.basics.clientName = 'A&B <Ltd>';
study.before.visibleProblems = '<script>alert("x")</script> & unclear enquiry path';
study.results.metrics[0].metric = 'Enquiries';
study.results.metrics[0].value = 'Not measured';
const html = generateCaseStudyHtml(study);
assert.equal(caseStudySections(study).length, 7);
assert.equal(caseStudyFilename(study, 'pdf'), 'Kraftt_Case_Study_A_B_Ltd.pdf');
assert.match(html, /A&amp;B &lt;Ltd&gt;/);
assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
assert.doesNotMatch(html, /<script>/);
assert.match(html, /Not measured/);
assert.match(html, /What we did: key decisions/);
const fontNames = ['NotoSans-Regular.ttf', 'NotoSans-Bold.ttf', 'Cormorant-Semibold.ttf'];
const fontData = Object.fromEntries(await Promise.all(fontNames.map(async name => [name, (await readFile(new URL(`../public/admin-assets/fonts/${name}`, import.meta.url))).toString('base64')])));
const pdf = await generateCaseStudyPdf(study, fontData);
assert.equal(pdf.type, 'application/pdf');
assert.equal(await pdf.slice(0, 4).text(), '%PDF');
assert.ok(pdf.size > 10_000);
await unlink(bundlePath);

console.log('Case-study workspace, HTML and PDF export checks passed.');
