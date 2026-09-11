import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'Lanvip – Destaca con tu Micro-Landing VIP'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 50% -20%, #3a3a3a 0%, #0a0a0a 70%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 160,
            height: 160,
            borderRadius: 40,
            backgroundColor: '#111',
            border: '4px solid #D4AF37',
            marginBottom: 40,
            boxShadow: '0 0 60px rgba(212,175,55,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontFamily: 'sans-serif',
              fontWeight: 900,
              color: '#D4AF37',
              letterSpacing: '-0.05em',
            }}
          >
            LV
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontFamily: 'sans-serif',
            color: 'white',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Lanvip
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 36,
            fontFamily: 'sans-serif',
            color: '#A3A3A3',
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Tu Micro-Landing VIP, en Minutos
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
