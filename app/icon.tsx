import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#a4252b',
          color: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontFamily: 'serif',
          fontWeight: 700,
          border: '2px solid #fef3c7',
          boxSizing: 'border-box',
          borderRadius: 2
        }}
      >
        林
      </div>
    ),
    size
  );
}
