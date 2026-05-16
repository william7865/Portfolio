import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Times New Roman', 'serif'],
        'display-hanzi': ['var(--font-display-hanzi)', 'STKaiti', 'cursive'],
        'serif-hanzi': ['var(--font-serif-hanzi)', 'Songti SC', 'serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
export default config;
