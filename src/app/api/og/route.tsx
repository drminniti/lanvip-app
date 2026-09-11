import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const title = searchParams.get('title') || 'Mi Perfil VIP'
    const image = searchParams.get('image')
    
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
          {image ? (
            <img
              src={image}
              alt="Avatar"
              style={{
                width: 240,
                height: 240,
                borderRadius: 120,
                marginBottom: 50,
                border: '6px solid #D4AF37',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: 120,
                marginBottom: 50,
                backgroundColor: '#333',
                border: '6px solid #D4AF37',
              }}
            />
          )}
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
            {title}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 36,
              fontFamily: 'sans-serif',
              color: '#D4AF37',
              fontWeight: 500,
            }}
          >
            lanvip.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('Failed to generate OG image:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
