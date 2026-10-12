/**
 * Daily keep-alive for the Supabase project shared by brokers and Referidos.
 *
 * Supabase pauses free-plan projects after a week without activity. When that
 * happened (Oct 2026), every broker signup failed with the generic error and
 * the broker was saved nowhere — not in Supabase, not in GHL. One small query
 * a day counts as activity and keeps the project awake.
 *
 * It calls track_broker_click with a code no broker can have (generated codes
 * are lowercase letters, digits and dashes — never underscores), so the
 * function looks it up, finds nothing and returns without writing a row.
 * track_broker_click is used because it is in the base schema, so it exists
 * on every install.
 *
 * Runs on Netlify's schedule; failures show up in the site's Functions logs.
 */

const KEEPALIVE_CODE = '__keepalive__';

export default async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('supabase-keepalive: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not available to functions.');
  }

  const response = await fetch(`${url}/rest/v1/rpc/track_broker_click`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_code: KEEPALIVE_CODE,
      p_user_agent: 'netlify-supabase-keepalive',
      p_referrer_url: null,
      p_utm_source: null,
      p_utm_medium: null,
      p_utm_campaign: null,
      p_utm_term: null,
      p_utm_content: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`supabase-keepalive: Supabase answered ${response.status}: ${await response.text()}`);
  }
  console.log('supabase-keepalive: ok');
};

export const config = { schedule: '@daily' };
