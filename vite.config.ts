import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Spanish → English swaps for index.html. Each Spanish string must appear in
// index.html exactly as written here; edit both together.
const EN_HEAD: [string, string][] = [
  ['<html lang="es">', '<html lang="en">'],
  ['Programa de Brokers | Selvadentro Tulum', 'Broker Program | Selvadentro Tulum'],
  [
    'Registra tu alianza con Selvadentro Tulum, recibe tu link personal y registra a tus clientes con solo nombre, últimos 4 dígitos y ciudad. Tu cliente queda protegido a tu nombre.',
    'Partner with Selvadentro Tulum, get your personal link and register your clients with just name, email, last 4 phone digits and city. Each client stays protected under your name.',
  ],
  [
    'Tu link personal de broker: registra clientes y protege tu comisión en Selvadentro Tulum.',
    'Your personal broker link: register clients and protect your commission at Selvadentro Tulum.',
  ],
  ['content="https://brokers.selvadentrotulum.com/"', 'content="https://brokers.selvadentrotulum.com/en"'],
];

/**
 * Emits dist/en/index.html: the same page with an English <head>, so links
 * to /en and /en/register shared on WhatsApp preview in English (crawlers
 * don't run the app). public/_redirects serves it for /en/*.
 */
const englishIndexHtml = (): Plugin => ({
  name: 'english-index-html',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const index = bundle['index.html'];
    if (index?.type !== 'asset') this.error('index.html is missing from the bundle');
    let html = String(index.source);
    for (const [es, en] of EN_HEAD) {
      if (!html.includes(es)) {
        this.error(`"${es}" is no longer in index.html — update EN_HEAD in vite.config.ts to match it.`);
      }
      html = html.split(es).join(en);
    }
    this.emitFile({ type: 'asset', fileName: 'en/index.html', source: html });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), englishIndexHtml()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
