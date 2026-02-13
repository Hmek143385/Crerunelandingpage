-- =============================================
-- Premunia CRM: Database Schema
-- Replaces the old KV Store (kv_store_07afcff5)
-- =============================================

-- 1. LEADS TABLE
-- Stores all prospect/lead submissions from the landing page
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  profession text not null,
  message text default '',
  status text not null default 'new',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anyone can submit a lead (public form)
create policy "leads_insert_anon"
  on public.leads for insert
  to anon
  with check (true);

-- Authenticated users can read all leads
create policy "leads_select_auth"
  on public.leads for select
  to authenticated
  using (true);

-- Authenticated users can update leads
create policy "leads_update_auth"
  on public.leads for update
  to authenticated
  using (true);

-- Authenticated users can delete leads
create policy "leads_delete_auth"
  on public.leads for delete
  to authenticated
  using (true);

-- Also allow authenticated users to insert (for test leads from admin)
create policy "leads_insert_auth"
  on public.leads for insert
  to authenticated
  with check (true);


-- 2. APP_SETTINGS TABLE
-- Key-value store for application settings (hero text, contact info, etc.)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Anyone can read settings (needed by the public landing page)
create policy "settings_select_anon"
  on public.app_settings for select
  to anon
  using (true);

create policy "settings_select_auth"
  on public.app_settings for select
  to authenticated
  using (true);

-- Only authenticated users can update settings
create policy "settings_update_auth"
  on public.app_settings for update
  to authenticated
  using (true);

-- Only authenticated users can insert settings
create policy "settings_insert_auth"
  on public.app_settings for insert
  to authenticated
  with check (true);


-- 3. EMAIL_AUTOMATIONS TABLE
-- Stores email automation templates
create table if not exists public.email_automations (
  id text primary key,
  name text not null,
  trigger text not null,
  subject text not null,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_automations enable row level security;

create policy "automations_select_auth"
  on public.email_automations for select
  to authenticated
  using (true);

create policy "automations_update_auth"
  on public.email_automations for update
  to authenticated
  using (true);

create policy "automations_insert_auth"
  on public.email_automations for insert
  to authenticated
  with check (true);

create policy "automations_delete_auth"
  on public.email_automations for delete
  to authenticated
  using (true);


-- 4. SMTP_CONFIG TABLE
-- Singleton table for SMTP email configuration
create table if not exists public.smtp_config (
  id integer primary key default 1 check (id = 1),
  host text default '',
  port text default '587',
  username text default '',
  password_encrypted text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.smtp_config enable row level security;

create policy "smtp_select_auth"
  on public.smtp_config for select
  to authenticated
  using (true);

create policy "smtp_update_auth"
  on public.smtp_config for update
  to authenticated
  using (true);

create policy "smtp_insert_auth"
  on public.smtp_config for insert
  to authenticated
  with check (true);


-- =============================================
-- SEED DATA
-- =============================================

-- Default app settings
insert into public.app_settings (key, value) values
  ('hero_title', '"Préparez votre retraite sans sacrifier votre présent"'),
  ('hero_subtitle', '"Le Plan Épargne Retraite (PER) sur-mesure pour les professions libérales : optimisez votre fiscalité dès aujourd''hui."'),
  ('contact_email', '"contact@premunia.fr"'),
  ('contact_phone', '"01 00 00 00 00"'),
  ('contact_address', '"828 Av. Roger Salengro, 92370 Chaville"')
on conflict (key) do nothing;

-- Default welcome email automation
insert into public.email_automations (id, name, trigger, subject, body, active) values
  (
    'auto_welcome',
    'Email de Bienvenue',
    'new_lead',
    'Bienvenue chez Premunia - Votre demande a bien été reçue',
    'Bonjour {{first_name}},

Merci de nous avoir contactés. Un conseiller va vous rappeler sous 24h.

Cordialement,
L''équipe Premunia',
    true
  )
on conflict (id) do nothing;

-- Default empty SMTP config
insert into public.smtp_config (id, host, port, username, password_encrypted) values
  (1, '', '587', '', '')
on conflict (id) do nothing;
