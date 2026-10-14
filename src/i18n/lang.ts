import { useLocation } from 'react-router-dom';

/**
 * The site is bilingual by path: Spanish at the root (the original URLs,
 * already printed in brokers' links) and English under /en. The language is
 * read from the URL, so a link always opens in the language it was shared in.
 */
export type Lang = 'es' | 'en';

type Page = 'home' | 'registro';

export const ROUTES: Record<Lang, Record<Page, string>> = {
  es: { home: '/', registro: '/registro' },
  en: { home: '/en', registro: '/en/register' },
};

/** Also routed to the client landing, for anyone who adds /en to a Spanish link by hand. */
export const EN_REGISTRO_ALIAS = '/en/registro';

export const langFromPath = (pathname: string): Lang =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es';

const pageFromPath = (pathname: string): Page => {
  const path = pathname.replace(/\/+$/, '');
  return path === ROUTES.es.registro || path === ROUTES.en.registro || path === EN_REGISTRO_ALIAS
    ? 'registro'
    : 'home';
};

/** The same page in the other language: /registro ↔ /en/register, anything else ↔ home. */
export const pathInLang = (pathname: string, lang: Lang): string => ROUTES[lang][pageFromPath(pathname)];

export const useLang = (): Lang => langFromPath(useLocation().pathname);

/** Strings both pages share. */
export const COMMON: Record<Lang, { logoAlt: string; footerTagline: string; close: string; errorCode: string }> = {
  es: {
    logoAlt: 'Selvadentro · tierra de cenotes',
    footerTagline: 'Tierra de cenotes · Tulum, Quintana Roo',
    close: 'Cerrar',
    errorCode: 'código',
  },
  en: {
    logoAlt: 'Selvadentro · land of cenotes',
    footerTagline: 'Land of cenotes · Tulum, Quintana Roo',
    close: 'Close',
    errorCode: 'code',
  },
};

/** "Try again… (code: sin-conexion)" — the code stays untranslated so the team recognizes it in screenshots. */
export const withErrorCode = (message: string, lang: Lang, errorRef?: string): string =>
  errorRef ? `${message} (${COMMON[lang].errorCode}: ${errorRef})` : message;
