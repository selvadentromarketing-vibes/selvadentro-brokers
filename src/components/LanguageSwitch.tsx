import { Link, useLocation } from 'react-router-dom';
import { Lang, langFromPath, pathInLang } from '../i18n/lang';

const OPTIONS: { lang: Lang; label: string; name: string }[] = [
  { lang: 'es', label: 'ES', name: 'Español' },
  { lang: 'en', label: 'EN', name: 'English' },
];

/**
 * ES | EN toggle for the header. Switching keeps the query string, so a
 * client who opened a broker's link (?ref=…) stays attributed to that broker.
 */
export default function LanguageSwitch() {
  const { pathname, search } = useLocation();
  const current = langFromPath(pathname);

  return (
    <nav
      aria-label={current === 'en' ? 'Language' : 'Idioma'}
      className="flex items-center rounded-full border border-white/25 p-0.5 text-[11px] sm:text-xs font-semibold tracking-wider"
    >
      {OPTIONS.map((option) =>
        option.lang === current ? (
          <span key={option.lang} aria-current="true" aria-label={option.name} className="px-2 sm:px-2.5 py-1 rounded-full bg-white/15 text-white">
            {option.label}
          </span>
        ) : (
          <Link
            key={option.lang}
            to={{ pathname: pathInLang(pathname, option.lang), search }}
            lang={option.lang}
            hrefLang={option.lang}
            aria-label={option.name}
            title={option.name}
            className="px-2 sm:px-2.5 py-1 rounded-full text-white/60 hover:text-white transition"
          >
            {option.label}
          </Link>
        ),
      )}
    </nav>
  );
}
