-- =============================================================================
-- AdInsight AI - Alterações incrementais (para quem já aplicou 001 anterior)
-- Se você está configurando do zero, use apenas 001_initial_schema.sql
-- =============================================================================

-- Novos campos em profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'trialing', 'past_due'));

-- Unique em stripe_customer_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Novos campos em facebook_accounts
ALTER TABLE facebook_accounts ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Tabela alert_settings (se não existir)
CREATE TABLE IF NOT EXISTS alert_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ctr_drop_threshold NUMERIC(5, 2) DEFAULT 0.5,
  cpc_increase_threshold NUMERIC(8, 2) DEFAULT 0.2,
  roas_drop_threshold NUMERIC(5, 2) DEFAULT 0.5,
  spend_spike_threshold_pct NUMERIC(5, 2) DEFAULT 50,
  spend_spike_min_delta NUMERIC(10, 2) DEFAULT 50,
  email_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela subscription_limits
CREATE TABLE IF NOT EXISTS subscription_limits (
  tier TEXT PRIMARY KEY,
  max_ad_accounts INT NOT NULL DEFAULT 1,
  max_ai_insights_per_day INT,
  max_reports_per_month INT,
  features JSONB DEFAULT '{}'
);

INSERT INTO subscription_limits (tier, max_ad_accounts, max_ai_insights_per_day, max_reports_per_month, features)
VALUES
  ('starter', 1, 5, 10, '{"ai_insights": true, "reports": true, "alerts": true}'::jsonb),
  ('pro', 5, 50, 100, '{"ai_insights": true, "reports": true, "alerts": true, "priority_support": true}'::jsonb),
  ('agency', 999, NULL, NULL, '{"ai_insights": true, "reports": true, "alerts": true, "priority_support": true, "api_access": true}'::jsonb)
ON CONFLICT (tier) DO UPDATE SET
  max_ad_accounts = EXCLUDED.max_ad_accounts,
  max_ai_insights_per_day = EXCLUDED.max_ai_insights_per_day,
  max_reports_per_month = EXCLUDED.max_reports_per_month,
  features = EXCLUDED.features;

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON alerts(user_id, is_read) WHERE is_read = false;

-- Alert type: permitir 'custom'
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_alert_type_check
  CHECK (alert_type IN ('ctr_drop', 'cpc_increase', 'roas_drop', 'spend_spike', 'custom'));

-- RLS para novas tabelas
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alert_settings_all_own" ON alert_settings;
CREATE POLICY "alert_settings_all_own" ON alert_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscription_limits_select_authenticated" ON subscription_limits;
CREATE POLICY "subscription_limits_select_authenticated" ON subscription_limits
  FOR SELECT TO authenticated USING (true);
