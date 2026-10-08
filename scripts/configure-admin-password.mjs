import { createHash } from 'node:crypto';
import { stdin, stdout, stderr } from 'node:process';

// Prints only the verification digest. The password is never saved by this script.
async function hiddenPassword() {
  if (!stdin.isTTY) { let value = ''; for await (const chunk of stdin) value += chunk; return value.replace(/\r?\n$/, ''); }
  stderr.write('Choose a Document Workspace password (input hidden): ');
  stdin.setRawMode(true); stdin.setEncoding('utf8'); stdin.resume();
  return await new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => { stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', receive); stderr.write('\n'); if (error) reject(error); else resolve(value); };
    const receive = chunk => { for (const character of chunk) { if (character === '\u0003') return finish(new Error('Cancelled.')); if (character === '\r' || character === '\n') return finish(); if (character === '\u007f' || character === '\b') value = value.slice(0, -1); else if (character >= ' ') value += character; } };
    stdin.on('data', receive);
  });
}
try {
  const password = await hiddenPassword();
  if (!password.length || password.length > 256) throw new Error('Choose a non-empty password of up to 256 characters.');
  stdout.write(`NEXT_PUBLIC_DOCUMENT_WORKSPACE_PASSWORD_SHA256=${createHash('sha256').update(password, 'utf8').digest('hex')}\n`);
} catch (error) { stderr.write(`${error.message}\n`); process.exitCode = 1; }
