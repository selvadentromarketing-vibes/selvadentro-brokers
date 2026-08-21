import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for the brokers site.
 *
 * Same Supabase project as referidos.selvadentrotulum.com — the broker
 * tables (brokers / broker_clicks / broker_leads) live alongside the
 * referral tables and are reached exclusively through SECURITY DEFINER
 * RPC functions (see db/brokers-schema.sql).
 *
 * Uses the publishable key (sb_publishable_...), safe to ship to the
 * browser. Never put the service_role key here.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud at startup if env vars are missing — easier to debug than
  // a cryptic "fetch failed" later when a form is submitted.
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Domain types ────────────────────────────────────────────────────────

export interface BrokerRow {
  id: string;
  code: string;
  first_name: string;
  last_name: string | null;
  agency: string | null;
  email: string;
  phone: string;
  status: 'active' | 'paused';
  ghl_contact_id: string | null;
  created_at: string;
}

export interface BrokerLeadRow {
  id: string;
  broker_id: string | null;
  first_name: string;
  last_name: string | null;
  phone_last4: string;
  city: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  ghl_contact_id: string | null;
  landing_page: string | null;
  created_at: string;
}
