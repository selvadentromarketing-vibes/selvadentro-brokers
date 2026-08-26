import { supabase } from './supabase';
import { TrackingParams, getBrokerCode } from './tracking';

/**
 * Two-system writes for brokers (same pattern as the Referidos site):
 *
 *   submitBrokerSignup → Supabase (create broker + get code)
 *                      → GHL (tag as broker, welcome email with the link —
 *                        WITHOUT triggering the sales-team automations)
 *
 *   submitBrokerLead   → Supabase (create lead row, link to broker by code)
 *                      → GHL (create client record in the Brokers - Producción
 *                        pipeline, tagged broker-client so the sales
 *                        automations skip it — the broker keeps the
 *                        relationship)
 *
 *   trackBrokerClick   → Supabase only (don't pollute GHL contacts per click)
 *
 * Supabase is the source of truth for the broker code. GHL is the channel
 * for human-facing comms (welcome email, Charlie's pipelines).
 */

const normalizeE164 = (raw: string | undefined, defaultCountryCode = '+52'): string => {
  if (!raw) return '';
  const trimmed = raw.replace(/[\s()\-.]/g, '').trim();
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return `${defaultCountryCode}${digits}`;
};

/**
 * GHL inbound-webhook workflow URLs — the BROKER_SIGNUP and BROKER_LEAD
 * workflows in the Selvadentro Tulum location (see docs/PLAN-GHL-BROKERS.md).
 *
 * Posting here is best-effort: if GHL is down or the workflow is unpublished,
 * the broker/client is still recorded in Supabase and the failure is logged
 * rather than surfaced to the person filling the form.
 */
const BROKER_SIGNUP_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/crN2IhAuOBAl7D8324yI/webhook-trigger/1701c3d9-fbe0-486f-a00a-abbee30c637e';

const BROKER_LEAD_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/crN2IhAuOBAl7D8324yI/webhook-trigger/6c3bdd09-3ee9-46ef-b7bf-3e670d64759f';

const REGISTRO_LINK_BASE = 'https://brokers.selvadentrotulum.com/registro';

const postToGhl = async (url: string, payload: Record<string, unknown>, context: string) => {
  if (!url) {
    console.warn(`GHL webhook for ${context} not configured yet — skipped (data is in Supabase).`);
    return;
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.warn(`GHL webhook (${context}) returned ${response.status} — record saved in DB, but not yet in GHL.`);
    }
  } catch (e) {
    console.warn(`GHL webhook (${context}) errored — record saved in DB, but not yet in GHL:`, e);
  }
};

export interface BrokerSignupData {
  first_name: string;
  last_name: string;
  agency: string;
  email: string;
  phone: string;
}

export interface BrokerLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone_last4: string;
  city: string;
}

export interface SubmissionResult {
  success: boolean;
  error?: unknown;
  /** For broker signups: the code + full link, shown on-screen immediately. */
  broker_code?: string;
  registro_link?: string;
  /** True when the broker was already registered and we returned the link
   *  they already had, instead of failing on the duplicate email. */
  existing?: boolean;
}

/**
 * Look up the link of a broker who is already registered.
 *
 * Returns null if the lookup is unavailable — notably when get_broker_link
 * has not been applied to the database yet — so the caller falls back to the
 * plain "this email is already registered" message rather than breaking.
 */
const lookupExistingBrokerCode = async (email: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('get_broker_link', { p_email: email });
    if (error) {
      console.warn('get_broker_link failed — falling back to the duplicate message:', error);
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return row?.code ?? null;
  } catch (e) {
    console.warn('get_broker_link errored:', e);
    return null;
  }
};

// ──────────────────────────────────────────────────────────────────────────
// BROKER SIGNUP
// ──────────────────────────────────────────────────────────────────────────

export const submitBrokerSignup = async (
  data: BrokerSignupData,
  tracking: TrackingParams,
): Promise<SubmissionResult> => {
  // Step 1 — Insert into Supabase via RPC, receive the generated code back.
  const { data: rpcRows, error: rpcError } = await supabase.rpc('create_broker', {
    p_first_name: data.first_name,
    p_last_name: data.last_name || null,
    p_agency: data.agency || null,
    p_email: data.email,
    p_phone: data.phone,
  });

  if (rpcError) {
    const isDuplicate =
      typeof rpcError.message === 'string' && rpcError.message.includes('brokers_email_key');

    // Already registered → give them the link they already have rather than
    // an error. Brokers hit this constantly (they forget, or the welcome mail
    // landed in spam), and a dead end here loses them.
    if (isDuplicate) {
      const existingCode = await lookupExistingBrokerCode(data.email);
      if (existingCode) {
        return {
          success: true,
          existing: true,
          broker_code: existingCode,
          registro_link: `${REGISTRO_LINK_BASE}?ref=${encodeURIComponent(existingCode)}`,
        };
      }
      return {
        success: false,
        error: new Error('Ya existe un broker registrado con este correo. Revisa tu bandeja de entrada o escríbenos.'),
      };
    }

    console.error('Supabase create_broker failed:', rpcError);
    return { success: false, error: rpcError };
  }

  const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
  if (!row?.code) {
    return { success: false, error: new Error('No se recibió código de broker') };
  }

  const broker_code: string = row.code;
  const registro_link = `${REGISTRO_LINK_BASE}?ref=${encodeURIComponent(broker_code)}`;

  // Step 2 — Forward to GHL so the workflow can tag them as broker, route them
  //          to Coordinación de Brokers and email the link. Best-effort: if GHL
  //          fails, the broker still exists in our DB and we show the link.
  await postToGhl(
    BROKER_SIGNUP_WEBHOOK_URL,
    {
      first_name: data.first_name,
      last_name: data.last_name,
      name: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      phone: normalizeE164(data.phone),
      agency: data.agency,
      form_type: 'broker-signup',
      // Broker attribution from Supabase — GHL email template uses this:
      broker_code,
      // Reuses the existing GHL custom fields contact.affiliate_code /
      // contact.referral_link (created for Referidos, same semantics here).
      affiliate_code: broker_code,
      referral_link: registro_link,
      // Sourcing — the 'broker' tag routes them to Charlie's channel and is
      // the tag the sales automations must exclude (see docs).
      source_label: 'brokers-signup-web',
      tags: ['broker', 'broker-signup-web'],
      'contact.source': 'Brokers - Signup Web',
      landing_page: tracking.landing_page,
      referrer_url: tracking.referrer_url,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_term: tracking.utm_term,
      utm_content: tracking.utm_content,
      gclid: tracking.gclid,
      fbclid: tracking.fbclid,
    },
    'broker-signup',
  );

  return { success: true, broker_code, registro_link };
};

// ──────────────────────────────────────────────────────────────────────────
// BROKER-REFERRED CLIENT
// ──────────────────────────────────────────────────────────────────────────

export const submitBrokerLead = async (
  data: BrokerLeadData,
  tracking: TrackingParams,
): Promise<SubmissionResult> => {
  const broker_code = getBrokerCode(tracking) ?? null;

  // Step 1 — Insert into Supabase via RPC. The RPC also looks up the broker's
  // name / email / agency so the GHL record shows who owns the client.
  const { data: rpcRows, error: rpcError } = await supabase.rpc('create_broker_lead', {
    p_first_name: data.first_name,
    p_last_name: data.last_name || null,
    p_email: data.email,
    p_phone_last4: data.phone_last4,
    p_city: data.city,
    p_broker_code: broker_code,
    p_landing_page: tracking.landing_page,
    p_utm_source: tracking.utm_source ?? null,
    p_utm_campaign: tracking.utm_campaign ?? null,
  });

  if (rpcError) {
    console.error('Supabase create_broker_lead failed:', rpcError);
    return { success: false, error: rpcError };
  }

  const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
  const broker_name: string | null = row?.broker_name ?? null;
  const broker_email: string | null = row?.broker_email ?? null;
  const broker_agency: string | null = row?.broker_agency ?? null;

  // Step 2 — Forward to GHL. The client's full phone is deliberately never
  // collected — only the last 4 digits, which map to the existing GHL custom
  // field contact.ltimos_4_dgitos_de_su_telfono. The `broker-client` tag is
  // what keeps the sales automations off this contact (see the "blindaje"
  // step in docs/PLAN-GHL-BROKERS.md).
  await postToGhl(
    BROKER_LEAD_WEBHOOK_URL,
    {
      first_name: data.first_name,
      last_name: data.last_name,
      name: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      phone_last4: data.phone_last4,
      city: data.city,
      form_type: 'broker-client',
      // Broker attribution — for lookup/joins + at-a-glance sales context.
      referred_by: broker_code,
      referred_by_name: broker_name,
      referred_by_email: broker_email,
      referred_by_agency: broker_agency,
      source_label: 'brokers-client-web',
      tags: ['broker-client', 'broker-client-web'],
      'contact.source': 'Brokers - Cliente Web',
      landing_page: tracking.landing_page,
      referrer_url: tracking.referrer_url,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_term: tracking.utm_term,
      utm_content: tracking.utm_content,
    },
    'broker-client',
  );

  return { success: true };
};

// ──────────────────────────────────────────────────────────────────────────
// CLICK TRACKING — Supabase only
// ──────────────────────────────────────────────────────────────────────────

export const trackBrokerClick = async (
  code: string,
  tracking: TrackingParams,
): Promise<void> => {
  // Fire-and-forget — never block page render or surface errors to the user.
  try {
    await supabase.rpc('track_broker_click', {
      p_code: code,
      p_user_agent: navigator.userAgent ?? null,
      p_referrer_url: tracking.referrer_url ?? null,
      p_utm_source: tracking.utm_source ?? null,
      p_utm_medium: tracking.utm_medium ?? null,
      p_utm_campaign: tracking.utm_campaign ?? null,
      p_utm_term: tracking.utm_term ?? null,
      p_utm_content: tracking.utm_content ?? null,
    });
  } catch (e) {
    // Silent — clicks aren't critical to user experience.
    console.debug('track_broker_click failed:', e);
  }
};
