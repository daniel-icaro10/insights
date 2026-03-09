-- Tabela para guardar snapshot de métricas (usado para comparar e gerar alertas)
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE CASCADE NOT NULL,
  summary JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS metric_snapshots_updated_at ON metric_snapshots;
CREATE TRIGGER metric_snapshots_updated_at
  BEFORE UPDATE ON metric_snapshots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_metric_snapshots_ad_account
  ON metric_snapshots(ad_account_id);

ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metric_snapshots_via_ad_accounts" ON metric_snapshots;
CREATE POLICY "metric_snapshots_via_ad_accounts" ON metric_snapshots FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ad_accounts aa
    JOIN facebook_accounts fa ON fa.id = aa.facebook_account_id
    WHERE aa.id = metric_snapshots.ad_account_id AND fa.user_id = auth.uid()
  )
);
