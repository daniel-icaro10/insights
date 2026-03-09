import { NextResponse } from 'next/server'

export async function GET() {
  const META_APP_ID = process.env.META_APP_ID
  const META_APP_SECRET = process.env.META_APP_SECRET
  if (!META_APP_ID || !META_APP_SECRET) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ad-accounts?error=meta_not_configured`
    )
  }

  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`
    : 'http://localhost:3000/api/facebook/callback'
  const scopes = [
    'ads_read',
    'ads_management',
    'business_management',
    'public_profile',
  ].join(',')

  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
    `client_id=${META_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `response_type=code&` +
    `state=facebook_connect`

  return NextResponse.redirect(authUrl)
}
