import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(70% 50% at 50% 30%, #6a0c12 0%, #4a0a0e 100%)',
          color: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#a4252b',
            color: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 110,
            fontFamily: 'serif',
            fontWeight: 700,
            border: '6px solid #fef3c7',
            boxSizing: 'border-box',
            borderRadius: 6,
            transform: 'rotate(-4deg)'
          }}
        >
          林
        </div>
      </div>
    ),
    size
  );
}
