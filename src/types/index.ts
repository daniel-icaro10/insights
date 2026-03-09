export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  stripe_customer_id: string | null
  subscription_tier: 'starter' | 'pro' | 'agency'
  subscription_status: string
  created_at: string
  updated_at: string
}

export interface FacebookAccount {
  id: string
  user_id: string
  facebook_user_id: string
  business_name: string | null
  created_at: string
  ad_accounts?: AdAccount[]
}

export interface AdAccount {
  id: string
  facebook_account_id: string
  ad_account_id: string
  account_name: string | null
  currency: string
  timezone: string
  is_active: boolean
  created_at: string
}

export interface Campaign {
  id: string
  campaign_id: string
  campaign_name: string
  status: string
  objective: string | null
  daily_budget: number | null
  lifetime_budget: number | null
  start_time: string | null
  stop_time: string | null
  metrics?: CampaignMetrics
}

export interface CampaignMetrics {
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  conversions: number
  purchase_value: number
  roas: number
  frequency: number
}

export interface MetricsSummary {
  spend: number
  revenue: number
  roas: number
  clicks: number
  ctr: number
  cpc: number
  conversions: number
  impressions: number
}

export interface TimeSeriesDataPoint {
  date: string
  spend: number
  revenue: number
  clicks: number
  conversions: number
  roas: number
  impressions: number
}

export interface Alert {
  id: string
  alert_type: 'ctr_drop' | 'cpc_increase' | 'roas_drop' | 'spend_spike'
  message: string
  threshold_value?: number
  current_value?: number
  is_read: boolean
  created_at: string
}

export interface AIInsight {
  id: string
  insight_type: string
  content: string
  campaign_ids: string[]
  created_at: string
}

export type DateRange = 'today' | 'yesterday' | '7d' | '30d' | 'custom'

export interface DateFilter {
  range: DateRange
  startDate?: string
  endDate?: string
}
