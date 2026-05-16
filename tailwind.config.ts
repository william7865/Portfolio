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
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      },
      fontSize: {
        'hero': ['clamp(5rem, 20vw, 18rem)', { lineHeight: '0.82', letterSpacing: '-0.045em' }],
        'mega': ['clamp(3rem, 12vw, 9rem)', { lineHeight: '0.85', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(2rem, 6vw, 5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }]
      }
    }
  },
  plugins: []
};
export default config;
