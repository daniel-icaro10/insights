-- =============================================================================
-- AdInsight AI - Schema completo para SaaS
-- Execute no SQL Editor do Supabase ou via: supabase db push
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES (estende auth.users)
-- =============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_tier TEXT DEFAULT 'starter'
    CHECK (subscription_tier IN ('starter', 'pro', 'agency')),
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'trialing', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 2. FACEBOOK_ACCOUNTS
-- =============================================================================
CREATE TABLE facebook_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  facebook_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  refresh_token TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, facebook_user_id)
);

CREATE INDEX idx_facebook_accounts_user_id ON facebook_accounts(user_id);
CREATE INDEX idx_facebook_accounts_token_expires ON facebook_accounts(token_expires_at)
  WHERE token_expires_at IS NOT NULL;

CREATE TRIGGER facebook_accounts_updated_at
  BEFORE UPDATE ON facebook_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 3. AD_ACCOUNTS
-- =============================================================================
CREATE TABLE ad_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facebook_account_id UUID REFERENCES facebook_accounts(id) ON DELETE CASCADE NOT NULL,
  ad_account_id TEXT NOT NULL,
  account_name TEXT,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(facebook_account_id, ad_account_id)
);

CREATE INDEX idx_ad_accounts_facebook ON ad_accounts(facebook_account_id);
CREATE INDEX idx_ad_accounts_active ON ad_accounts(is_active) WHERE is_active = true;

CREATE TRIGGER ad_accounts_updated_at
  BEFORE UPDATE ON ad_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 4. CAMPAIGNS (cache Meta)
-- =============================================================================
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE CASCADE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  status TEXT,
  objective TEXT,
  daily_budget NUMERIC(12, 2),
  lifetime_budget NUMERIC(12, 2),
  start_time TIMESTAMPTZ,
  stop_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(ad_account_id, campaign_id)
);

CREATE INDEX idx_campaigns_ad_account ON campaigns(ad_account_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 5. METRICS_CACHE
-- =============================================================================
CREATE TABLE metrics_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE CASCADE NOT NULL,
  campaign_id TEXT,
  date DATE NOT NULL,
  spend NUMERIC(12, 2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr NUMERIC(8, 4) DEFAULT 0,
  cpc NUMERIC(12, 4) DEFAULT 0,
  cpm NUMERIC(12, 4) DEFAULT 0,
  conversions NUMERIC(12, 2) DEFAULT 0,
  purchase_value NUMERIC(12, 2) DEFAULT 0,
  roas NUMERIC(8, 2) DEFAULT 0,
  frequency NUMERIC(6, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(ad_account_id, campaign_id, date)
);

CREATE INDEX idx_metrics_cache_ad_account_date ON metrics_cache(ad_account_id, date DESC);
CREATE INDEX idx_metrics_cache_campaign ON metrics_cache(ad_account_id, campaign_id, date);

-- =============================================================================
-- 6. ALERTS
-- =============================================================================
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL
    CHECK (alert_type IN ('ctr_drop', 'cpc_increase', 'roas_drop', 'spend_spike', 'custom')),
  message TEXT NOT NULL,
  threshold_value NUMERIC(12, 4),
  current_value NUMERIC(12, 4),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_created ON alerts(user_id, created_at DESC);

-- =============================================================================
-- 7. ALERT_SETTINGS (configurações por usuário)
-- =============================================================================
CREATE TABLE alert_settings (
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

CREATE TRIGGER alert_settings_updated_at
  BEFORE UPDATE ON alert_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 8. REPORTS
-- =============================================================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  file_url TEXT,
  format TEXT CHECK (format IN ('pdf', 'csv')),
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created ON reports(user_id, created_at DESC);

-- =============================================================================
-- 9. AI_INSIGHTS
-- =============================================================================
CREATE TABLE ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
  insight_type TEXT,
  content TEXT NOT NULL,
  campaign_ids TEXT[],
  model_used TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_ad_account ON ai_insights(ad_account_id);
CREATE INDEX idx_ai_insights_created ON ai_insights(user_id, created_at DESC);

-- =============================================================================
-- 10. SUBSCRIPTION_LIMITS (referência para limites por plano)
-- =============================================================================
CREATE TABLE subscription_limits (
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

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Facebook accounts
CREATE POLICY "facebook_accounts_all_own" ON facebook_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Ad accounts (via facebook_accounts)
CREATE POLICY "ad_accounts_all_via_facebook" ON ad_accounts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM facebook_accounts fa
    WHERE fa.id = ad_accounts.facebook_account_id AND fa.user_id = auth.uid()
  )
);

-- Campaigns (via ad_accounts)
CREATE POLICY "campaigns_all_via_ad_accounts" ON campaigns FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ad_accounts aa
    JOIN facebook_accounts fa ON fa.id = aa.facebook_account_id
    WHERE aa.id = campaigns.ad_account_id AND fa.user_id = auth.uid()
  )
);

-- Metrics cache
CREATE POLICY "metrics_cache_all_via_ad_accounts" ON metrics_cache FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ad_accounts aa
    JOIN facebook_accounts fa ON fa.id = aa.facebook_account_id
    WHERE aa.id = metrics_cache.ad_account_id AND fa.user_id = auth.uid()
  )
);

-- Alerts
CREATE POLICY "alerts_all_own" ON alerts FOR ALL USING (auth.uid() = user_id);

-- Alert settings
CREATE POLICY "alert_settings_all_own" ON alert_settings FOR ALL USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "reports_all_own" ON reports FOR ALL USING (auth.uid() = user_id);

-- AI Insights
CREATE POLICY "ai_insights_all_own" ON ai_insights FOR ALL USING (auth.uid() = user_id);

-- Subscription limits (leitura pública para usuários autenticados)
CREATE POLICY "subscription_limits_select_authenticated" ON subscription_limits
  FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- TRIGGER: criar profile no signup
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- FUNÇÃO: verificar limite de ad accounts por plano
-- =============================================================================
CREATE OR REPLACE FUNCTION check_ad_account_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_limit INT;
  v_count INT;
BEGIN
  SELECT subscription_tier INTO v_tier FROM profiles WHERE id = p_user_id;
  SELECT max_ad_accounts INTO v_limit FROM subscription_limits WHERE tier = COALESCE(v_tier, 'starter');
  v_limit := COALESCE(v_limit, 1);

  SELECT COUNT(*)::INT INTO v_count
  FROM ad_accounts aa
  JOIN facebook_accounts fa ON fa.id = aa.facebook_account_id
  WHERE fa.user_id = p_user_id;

  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
