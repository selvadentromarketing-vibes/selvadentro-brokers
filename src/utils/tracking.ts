/**
 * URL parameter capture for the brokers site.
 * Captures standard marketing params (UTM, gclid, fbclid) AND the broker
 * referral param (`ref`) that each broker's personal link carries.
 */

export interface TrackingParams {
  // Standard marketing
  gclid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  // Broker referral (any of these may appear; `ref` is what we generate)
  ref?: string;
  broker?: string;
  broker_code?: string;
  // Always captured
  landing_page: string;
  referrer_url?: string;
}

export const captureTrackingParams = (): TrackingParams => {
  const url = new URLSearchParams(window.location.search);

  const params: TrackingParams = {
    landing_page: window.location.href,
    referrer_url: document.referrer || undefined,
    gclid: url.get('gclid') || undefined,
    fbclid: url.get('fbclid') || undefined,
    utm_source: url.get('utm_source') || undefined,
    utm_medium: url.get('utm_medium') || undefined,
    utm_campaign: url.get('utm_campaign') || undefined,
    utm_term: url.get('utm_term') || undefined,
    utm_content: url.get('utm_content') || undefined,
    ref: url.get('ref') || undefined,
    broker: url.get('broker') || undefined,
    broker_code: url.get('broker_code') || undefined,
  };

  // Persist so the code survives navigation within the SPA (e.g. the client
  // lands with ?ref=..., browses, then submits from a URL without the param).
  try {
    const hasBrokerCode = params.ref || params.broker || params.broker_code;
    const stored = localStorage.getItem('brokers_tracking');
    if (hasBrokerCode || !stored) {
      localStorage.setItem('brokers_tracking', JSON.stringify(params));
    }
  } catch {
    // localStorage can fail in privacy mode — fall back gracefully
  }

  return params;
};

export const getStoredTrackingParams = (): TrackingParams => {
  try {
    const stored = localStorage.getItem('brokers_tracking');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { landing_page: window.location.href };
};

/** First non-empty broker identifier found in the captured params. */
export const getBrokerCode = (params: TrackingParams): string | undefined => {
  return params.ref || params.broker || params.broker_code;
};
