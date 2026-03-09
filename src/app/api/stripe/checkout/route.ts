import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/** Valida se a chave Stripe é real (não placeholder) */
function isValidStripeKey(key: string | undefined): boolean {
  if (!key?.trim()) return false
  // Rejeita placeholders como "sk_test_..." ou "sk_live_..."
  if (key.includes('...')) return false
  // Chaves Stripe têm formato sk_test_xxx ou sk_live_xxx (mín. ~35 chars)
  if (!/^sk_(test|live)_[a-zA-Z0-9]+$/.test(key) || key.length < 30) return false
  return true
}

let stripe: Stripe | null = null
try {
  stripe = isValidStripeKey(process.env.STRIPE_SECRET_KEY)
    ? new Stripe(process.env.STRIPE_SECRET_KEY!)
    : null
} catch {
  stripe = null
}

const PLANS = {
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID!, adAccounts: 1 },
  pro: { priceId: process.env.STRIPE_PRO_PRICE_ID!, adAccounts: 5 },
  agency: { priceId: process.env.STRIPE_AGENCY_PRICE_ID!, adAccounts: 999 },
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY.' },
      { status: 503 }
    )
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, successUrl, cancelUrl } = await request.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig || !planConfig.priceId) {
    return NextResponse.json(
      { error: planConfig ? 'Preços do Stripe não configurados.' : 'Invalid plan' },
      { status: planConfig ? 503 : 400 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: {
      supabase_user_id: user.id,
      plan,
    },
    subscription_data: {
      metadata: { plan },
    },
  })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    const msg = err instanceof Error ? err.message : 'Erro no checkout'
    return NextResponse.json(
      { error: msg.includes('Invalid API Key') || msg.includes('api_key')
        ? 'Stripe não configurado. Verifique STRIPE_SECRET_KEY em .env.local'
        : msg },
      { status: 503 }
    )
  }
}
