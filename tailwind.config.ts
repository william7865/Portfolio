import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'hall-floor': '#F2EEE2',
        'ink': '#0F1419',
        'shuttle': '#F4D04A',
        'court-line': '#B7472A',
        'net-green': '#5C7A6B',
        'muted': '#8A8576',
        'lol-blue': '#1C8CE8',
        'penta-magenta': '#9B30A8'
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
export default config;
