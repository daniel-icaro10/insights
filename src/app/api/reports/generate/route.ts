import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Campaign, MetricsSummary } from '@/types'
import { checkReportLimit } from '@/lib/limits'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limitCheck = await checkReportLimit(user.id)
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: `Limite de relatórios atingido (${limitCheck.used}/${limitCheck.limit} por mês). Faça upgrade para mais.` },
      { status: 429 }
    )
  }

  const { format, summary, campaigns, timeSeries, dateRange, adAccountId } = await request.json() as {
    format: 'pdf' | 'csv'
    summary: MetricsSummary
    campaigns: Campaign[]
    timeSeries: Array<{ date: string; spend: number; revenue: number; clicks: number }>
    dateRange: { start: string; end: string }
    adAccountId?: string
  }

  if (!summary || format !== 'pdf' && format !== 'csv') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const saveReportRecord = async () => {
    await supabase.from('reports').insert({
      user_id: user.id,
      ad_account_id: adAccountId || null,
      report_type: 'performance',
      date_range_start: dateRange?.start || null,
      date_range_end: dateRange?.end || null,
      format,
    })
  }

  const escapeCsv = (val: unknown): string => {
    const s = String(val ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  if (format === 'csv') {
    await saveReportRecord()
    const headers = ['Campaign Name', 'Status', 'Spend', 'Clicks', 'CTR', 'CPC', 'Conversions', 'ROAS']
    const rows = (campaigns || []).map((c) => [
      escapeCsv(c.campaign_name),
      escapeCsv(c.status),
      (c.metrics?.spend ?? 0).toFixed(2),
      c.metrics?.clicks ?? 0,
      (c.metrics?.ctr ?? 0).toFixed(2) + '%',
      (c.metrics?.cpc ?? 0).toFixed(2),
      c.metrics?.conversions ?? 0,
      (c.metrics?.roas ?? 0).toFixed(2) + 'x',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const base64 = Buffer.from(csv, 'utf-8').toString('base64')
    return NextResponse.json({ format: 'csv', data: base64 })
  }

  await saveReportRecord()
  const doc = new jsPDF()
  doc.setFontSize(22)
  doc.text('AdInsight AI - Performance Report', 14, 22)
  doc.setFontSize(12)
  doc.text(`Period: ${dateRange?.start || 'N/A'} to ${dateRange?.end || 'N/A'}`, 14, 32)

  doc.setFontSize(14)
  doc.text('Summary', 14, 45)
  doc.setFontSize(10)
  const summaryText = [
    `Total Spend: $${summary.spend.toFixed(2)}`,
    `Revenue: $${summary.revenue.toFixed(2)}`,
    `ROAS: ${summary.roas.toFixed(2)}x`,
    `Clicks: ${summary.clicks}`,
    `CTR: ${summary.ctr.toFixed(2)}%`,
    `CPC: $${summary.cpc.toFixed(2)}`,
    `Conversions: ${summary.conversions}`,
  ]
  summaryText.forEach((line, i) => doc.text(line, 14, 55 + i * 6))

  autoTable(doc, {
    startY: 105,
    head: [['Campaign', 'Status', 'Spend', 'Clicks', 'CTR', 'CPC', 'Conv', 'ROAS']],
    body: (campaigns || []).slice(0, 15).map((c) => [
      c.campaign_name?.slice(0, 25) || '-',
      c.status,
      `$${(c.metrics?.spend ?? 0).toFixed(2)}`,
      c.metrics?.clicks ?? 0,
      `${(c.metrics?.ctr ?? 0).toFixed(2)}%`,
      `$${(c.metrics?.cpc ?? 0).toFixed(2)}`,
      c.metrics?.conversions ?? 0,
      `${(c.metrics?.roas ?? 0).toFixed(2)}x`,
    ]),
  })

  const base64 = doc.output('datauristring').split(',')[1]
  return NextResponse.json({ format: 'pdf', data: base64 })
}
