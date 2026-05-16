import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'William Lin · Match Point';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F2EEE2',
          color: '#0F1419',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          fontFamily: 'serif'
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#B7472A',
            letterSpacing: 4
          }}
        >
          WILLIAM LIN · PORTFOLIO
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 140, marginTop: 60, lineHeight: 1 }}>
          Match Point.
        </div>
        <div style={{ fontSize: 28, marginTop: 40, maxWidth: 800 }}>
          Développeur Full Stack. Disponible en alternance — septembre 2026.
        </div>
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#8A8576'
          }}
        >
          <span>williamlin.dev</span>
          <span>SET 1 · 21 — 19</span>
        </div>
      </div>
    ),
    size
  );
}
