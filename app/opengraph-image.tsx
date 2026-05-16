import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'William Lin · Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, #6a0c12 0%, transparent 60%), #4a0a0e',
          color: '#fef3c7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 96,
          fontFamily: 'serif',
          position: 'relative'
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#d4af37',
            letterSpacing: 8,
            textTransform: 'uppercase'
          }}
        >
          PORTFOLIO · PROLOGUE
        </div>

        <div
          style={{
            fontSize: 180,
            marginTop: 80,
            lineHeight: 1,
            letterSpacing: -3,
            display: 'flex',
            gap: 36,
            alignItems: 'flex-end'
          }}
        >
          <span style={{ fontWeight: 300 }}>William</span>
          <span style={{ fontStyle: 'italic', color: '#e9c46a', fontWeight: 300 }}>Lin</span>
        </div>

        <div
          style={{
            fontSize: 28,
            marginTop: 40,
            maxWidth: 800,
            fontStyle: 'italic',
            opacity: 0.85
          }}
        >
          Le code comme calligraphie. Précis, intentionnel, lisible.
        </div>

        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 80,
            width: 96,
            height: 96,
            background: '#a4252b',
            color: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            border: '3px solid #fef3c7',
            transform: 'rotate(-6deg)'
          }}
        >
          林
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#d4af37',
            letterSpacing: 4
          }}
        >
          <span>williamlin.dev</span>
          <span>序幕 · ACT I</span>
        </div>
      </div>
    ),
    size
  );
}
