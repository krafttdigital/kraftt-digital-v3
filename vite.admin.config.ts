import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const repository = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(repository, 'dist/admin');

export default defineConfig(({ mode }) => {
  let assetOutput = output;
  // Expose only the same public digest used by the existing workspace. Never
  // substitute the whole process.env object or copy any .env files into output.
  const key = 'NEXT_PUBLIC_DOCUMENT_WORKSPACE_PASSWORD_SHA256';
  const digest = loadEnv(mode, repository, key)[key]?.trim().toLowerCase() || '';
  if (!/^[a-f0-9]{64}$/.test(digest)) {
    throw new Error(`Set ${key} in the build environment or .env.local before building the admin.`);
  }
  return {
    root: resolve(repository, 'admin-cloudflare'),
    envDir: repository,
    envPrefix: 'KRAFTT_ADMIN_PUBLIC_',
    resolve: { alias: [{ find: /^next\/image$/, replacement: resolve(repository, 'admin-cloudflare/image.tsx') }] },
    define: { [`process.env.${key}`]: JSON.stringify(digest) },
    css: { postcss: { plugins: [] } },
    plugins: [react(), {
      name: 'kraftt-admin-assets',
      configResolved(config) { assetOutput = resolve(config.root, config.build.outDir); },
      async closeBundle() {
        await cp(resolve(repository, 'public/admin-assets'), resolve(assetOutput, 'admin-assets'), { recursive: true });
      },
    }],
    build: { outDir: output, emptyOutDir: true, sourcemap: false },
  };
});
