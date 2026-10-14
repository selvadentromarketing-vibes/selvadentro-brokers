import { useEffect, useState } from 'react';
import { Check, X, Link2, ShieldCheck, Users } from 'lucide-react';
import BrokerForm from '../components/BrokerForm';
import LanguageSwitch from '../components/LanguageSwitch';
import { captureTrackingParams } from '../utils/tracking';
import { COMMON, ROUTES, useLang } from '../i18n/lang';
import { BROKER_COPY } from '../i18n/brokerCopy';

// Same order as BROKER_COPY.benefits.
const BENEFIT_ICONS = [Link2, ShieldCheck, Users];

export default function BrokerSignup() {
  const [formOpen, setFormOpen] = useState(false);
  const lang = useLang();
  const t = BROKER_COPY[lang];
  const common = COMMON[lang];

  useEffect(() => {
    captureTrackingParams();
  }, []);

  useEffect(() => {
    document.title = BROKER_COPY[lang].title;
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = formOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen]);

  const openForm = () => setFormOpen(true);

  return (
    <div className="font-lexend text-[#2D332B] bg-[#ECE5D8]">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-brand-dark-green/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-3 sm:gap-4">
          <a href={ROUTES[lang].home} aria-label="Selvadentro" className="shrink-0">
            <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro Tulum" className="h-8 sm:h-11 w-auto" />
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitch />
            <button
              onClick={openForm}
              className="px-3.5 sm:px-6 py-2 sm:py-2.5 bg-brand-copper text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-lg uppercase tracking-wide sm:tracking-wider"
            >
              {t.headerCta}
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="bg-brand-dark-green text-white pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-10 text-center relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 70% 30%, rgba(207,133,67,0.18) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col items-center">
            <img src="/logo-selvandentro_tulum-cream.webp" alt={common.logoAlt} className="h-20 sm:h-24 w-auto" />
          </div>

          <div className="inline-block mb-6 sm:mb-8 px-5 py-1.5 border border-brand-copper/40 rounded-full">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper">{t.heroBadge}</span>
          </div>

          <h1 className="font-cardo font-bold leading-[1.08] mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}>
            <span className="block text-white">{t.heroLine1}</span>
            <em className="block not-italic text-brand-copper font-cardo italic">{t.heroLine2}</em>
          </h1>

          <p className="font-cardo italic text-white/75 text-base sm:text-lg mb-10">{t.heroSubtitle}</p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            {t.cta}
          </button>
          <p className="text-xs text-white/60 italic mt-3">{t.heroNote}</p>
        </div>
      </section>

      {/* 2. POR QUÉ EXISTE */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-12">{t.intro}</p>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {t.benefits.map((card, i) => {
              const Icon = BENEFIT_ICONS[i];
              return (
                <div key={card.title} className="bg-white rounded-2xl p-6 sm:p-7 text-center border border-stone-100 shadow-sm">
                  <span className="inline-flex w-12 h-12 rounded-full bg-brand-copper/15 text-brand-copper items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-cardo font-bold text-brand-dark-green text-lg mb-2">{card.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.howBadge}</p>
            <h2 className="font-cardo font-bold text-brand-dark-green" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {t.howTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {t.steps.map((step, i) => (
              <div key={step.label} className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
                <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">{i + 1}</span>
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">{step.label}</p>
                <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">{step.body}</p>
                {step.note ? (
                  <p className="text-xs text-stone-500 italic">{step.note}</p>
                ) : (
                  <button
                    onClick={openForm}
                    className="inline-block px-6 py-3 bg-brand-copper text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-md"
                  >
                    {t.headerCta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LO QUE NO VA A PASAR */}
      <section className="bg-brand-dark-green text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.promiseBadge}</p>
            <h2 className="font-cardo font-bold mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {t.promiseTitle}
            </h2>
            <p className="font-cardo italic text-white/70 text-sm sm:text-base">{t.promiseSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {t.promises.map((body, i) => (
              <div key={i} className="rounded-2xl p-6 sm:p-7 border border-brand-copper/30 bg-brand-dark-green/40 text-center">
                <span className="inline-flex w-10 h-10 rounded-full bg-brand-copper/20 text-brand-copper items-center justify-center mb-4">
                  <Check className="w-5 h-5" />
                </span>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.finalBadge}</p>
          <h2 className="font-cardo font-bold text-brand-dark-green mb-3" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
            {t.finalTitle}
          </h2>
          <p className="font-cardo italic text-stone-600 text-base sm:text-lg mb-8">{t.finalSubtitle}</p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            {t.cta}
          </button>

          <p className="font-cardo italic text-stone-500 text-sm mt-5">
            {t.questions}{' '}
            <a href="mailto:info@selvadentrotulum.com" className="text-brand-olive underline hover:text-brand-dark-green">
              info@selvadentrotulum.com
            </a>
          </p>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-brand-dark-green text-white text-center py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro" className="h-12 w-auto mx-auto mb-5" />
          <p className="font-cardo italic text-white/70 text-sm mb-6">{common.footerTagline}</p>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
            <a href="https://selvadentrotulum.com" className="hover:text-white/70">Selvadentrotulum.com</a>
          </p>
        </div>
      </footer>

      {/* MODAL */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/65 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}
        >
          <div className="relative w-full max-w-md my-auto">
            <button
              onClick={() => setFormOpen(false)}
              aria-label={common.close}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-brand-dark-green shadow-xl flex items-center justify-center hover:bg-stone-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <BrokerForm />
          </div>
        </div>
      )}
    </div>
  );
}
