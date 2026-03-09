import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAdAccounts } from '@/lib/meta-api'
import { checkAdAccountLimit } from '@/lib/limits'

const META_APP_ID = process.env.META_APP_ID!
const META_APP_SECRET = process.env.META_APP_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`
  : 'http://localhost:3000/api/facebook/callback'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ad-accounts?error=facebook_auth_failed`
    )
  }

  const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `client_id=${META_APP_ID}&` +
    `client_secret=${META_APP_SECRET}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `code=${code}`

  const tokenRes = await fetch(tokenUrl)
  const tokenData = await tokenRes.json()

  if (tokenData.error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ad-accounts?error=token_exchange_failed`
    )
  }

  const accessToken = tokenData.access_token
  const longLivedRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${META_APP_ID}&` +
    `client_secret=${META_APP_SECRET}&` +
    `fb_exchange_token=${accessToken}`
  )
  const longLivedData = await longLivedRes.json()
  const longLivedToken = longLivedData.access_token || accessToken

  const meRes = await fetch(
    `https://graph.facebook.com/v21.0/me?access_token=${longLivedToken}`
  )
  const meData = await meRes.json()
  const facebookUserId = meData.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
    )
  }

  const { data: existingFb } = await supabase
    .from('facebook_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('facebook_user_id', facebookUserId)
    .single()

  if (existingFb) {
    await supabase
      .from('facebook_accounts')
      .update({
        access_token: longLivedToken,
        token_expires_at: longLivedData.expires_in
          ? new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingFb.id)
  } else {
    await supabase.from('facebook_accounts').insert({
      user_id: user.id,
      facebook_user_id: facebookUserId,
      access_token: longLivedToken,
      token_expires_at: longLivedData.expires_in
        ? new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
        : null,
    })
  }

  const { data: fbAccount } = await supabase
    .from('facebook_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('facebook_user_id', facebookUserId)
    .single()

  if (fbAccount) {
    const limitCheck = await checkAdAccountLimit(user.id)
    const adAccounts = await getAdAccounts(longLivedToken)
    const canAdd = Math.max(0, limitCheck.limit - limitCheck.used)
    const toUpsert = adAccounts.slice(0, canAdd)
    for (const acc of toUpsert) {
      await supabase.from('ad_accounts').upsert(
        {
          facebook_account_id: fbAccount.id,
          ad_account_id: acc.id,
          account_name: acc.name,
          currency: acc.currency || 'USD',
          timezone: acc.timezone_name || 'UTC',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'facebook_account_id,ad_account_id',
        }
      )
    }
    if (adAccounts.length > canAdd && canAdd === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ad-accounts?error=limit_reached`
      )
    }
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ad-accounts?success=connected`
  )
}
