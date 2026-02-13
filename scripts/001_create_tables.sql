-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  profession TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create app_settings table (key-value for site configuration)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Create email_automations table
CREATE TABLE IF NOT EXISTS email_automations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL DEFAULT 'new_lead',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO app_settings (key, value) VALUES
  ('hero_title', '"Préparez votre retraite sans sacrifier votre présent"'),
  ('hero_subtitle', '"Le Plan Épargne Retraite (PER) sur-mesure pour les professions libérales : optimisez votre fiscalité dès aujourd''hui."'),
  ('contact_email', '"contact@premunia.fr"'),
  ('contact_phone', '"01 00 00 00 00"'),
  ('contact_address', '"828 Av. Roger Salengro, 92370 Chaville"')
ON CONFLICT (key) DO NOTHING;

-- Insert default automation
INSERT INTO email_automations (id, name, trigger_event, subject, body, active) VALUES
  ('auto_welcome', 'Email de Bienvenue', 'new_lead', 'Bienvenue chez Premunia - Votre demande a bien été reçue', 'Bonjour {{first_name}},\n\nMerci de nous avoir contactés. Un conseiller va vous rappeler sous 24h.\n\nCordialement,\nL''équipe Premunia', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
-- Anyone can insert (public form)
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can view leads
CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update leads
CREATE POLICY "Authenticated users can update leads" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete leads
CREATE POLICY "Authenticated users can delete leads" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for app_settings
-- Anyone can read settings (used by landing page)
CREATE POLICY "Anyone can read settings" ON app_settings
  FOR SELECT USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update settings" ON app_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert settings" ON app_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for email_automations
-- Only authenticated users can read automations
CREATE POLICY "Authenticated users can read automations" ON email_automations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update automations
CREATE POLICY "Authenticated users can update automations" ON email_automations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can insert automations
CREATE POLICY "Authenticated users can insert automations" ON email_automations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
