import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { Campaign } from '@/types'
import { checkAiInsightLimit } from '@/lib/limits'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limitCheck = await checkAiInsightLimit(user.id)
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: `Limite de insights atingido (${limitCheck.used}/${limitCheck.limit} por dia). Faça upgrade para mais.` },
      { status: 429 }
    )
  }

  const { adAccountId, summary, campaigns } = await request.json() as {
    adAccountId?: string
    summary: { spend: number; revenue: number; roas: number; clicks: number; ctr: number; cpc: number; conversions: number }
    campaigns: Campaign[]
  }

  if (!summary || !campaigns) {
    return NextResponse.json({ error: 'summary and campaigns required' }, { status: 400 })
  }

  if (adAccountId) {
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('id, facebook_accounts!inner(user_id)')
      .eq('id', adAccountId)
      .single()
    const fb = adAccount?.facebook_accounts as { user_id: string } | undefined
    if (!adAccount || fb?.user_id !== user.id) {
      return NextResponse.json({ error: 'Ad account not found or access denied' }, { status: 403 })
    }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Groq API key not configured. Add GROQ_API_KEY to .env.local' },
      { status: 503 }
    )
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })

  const campaignSummary = campaigns.slice(0, 20).map((c) => ({
    name: c.campaign_name,
    status: c.status,
    spend: c.metrics?.spend ?? 0,
    clicks: c.metrics?.clicks ?? 0,
    ctr: c.metrics?.ctr ?? 0,
    cpc: c.metrics?.cpc ?? 0,
    conversions: c.metrics?.conversions ?? 0,
    roas: c.metrics?.roas ?? 0,
  }))

  const prompt = `Você é um analista especialista em Facebook Ads. Analise os dados de desempenho desta conta e forneça 4-6 insights acionáveis.

Responda SEMPRE em português brasileiro.

Resumo da conta:
- Gasto total: $${summary.spend.toFixed(2)}
- Receita total: $${summary.revenue.toFixed(2)}
- ROAS: ${summary.roas.toFixed(2)}x
- Cliques: ${summary.clicks}
- CTR: ${summary.ctr.toFixed(2)}%
- CPC: $${summary.cpc.toFixed(2)}
- Conversões: ${summary.conversions}

Principais campanhas:
${JSON.stringify(campaignSummary, null, 2)}

Formato das respostas (uma por linha, cada uma começando com hífen):
- [TIPO]: Insight acionável em português (ex: "Campanha X tem CPC alto comparado à média da conta")
- Foque em: CTR baixo, CPC alto, ROAS ruim, campanhas vencedoras, recomendações de orçamento
- Seja específico com nomes de campanhas e números
- Cada insight com no máximo 100 caracteres`

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
    })

    const content = completion.choices[0]?.message?.content || 'Nenhum insight gerado.'
    const insightLines = content
      .split('\n')
      .filter((l) => l.trim().startsWith('-'))
      .map((l) => l.replace(/^-\s*/, '').trim())

    const { data: inserted } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        ad_account_id: adAccountId || null,
        insight_type: 'campaign_analysis',
        content: JSON.stringify(insightLines),
        campaign_ids: campaigns.slice(0, 10).map((c) => c.campaign_id),
      })
      .select()
      .single()

    return NextResponse.json({
      insights: insightLines,
      id: inserted?.id,
    })
  } catch (err) {
    console.error('AI insights error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI analysis failed' },
      { status: 500 }
    )
  }
}
