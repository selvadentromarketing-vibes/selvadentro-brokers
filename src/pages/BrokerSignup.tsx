import { useEffect, useState } from 'react';
import { Check, X, Link2, ShieldCheck, Users } from 'lucide-react';
import BrokerForm from '../components/BrokerForm';
import { captureTrackingParams } from '../utils/tracking';

export default function BrokerSignup() {
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    captureTrackingParams();
    document.title = 'Programa de Brokers | Selvadentro Tulum';
  }, []);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <a href="/" aria-label="Selvadentro" className="shrink-0">
            <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro Tulum" className="h-9 sm:h-11 w-auto" />
          </a>
          <button
            onClick={openForm}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-copper text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-lg uppercase tracking-wider"
          >
            Generar mi link
          </button>
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
            <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro · tierra de cenotes" className="h-20 sm:h-24 w-auto" />
          </div>

          <div className="inline-block mb-6 sm:mb-8 px-5 py-1.5 border border-brand-copper/40 rounded-full">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper">Programa de Brokers</span>
          </div>

          <h1 className="font-cardo font-bold leading-[1.08] mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}>
            <span className="block text-white">Tu cliente. Tu comisión.</span>
            <em className="block not-italic text-brand-copper font-cardo italic">Registrado y protegido.</em>
          </h1>

          <p className="font-cardo italic text-white/75 text-base sm:text-lg mb-10">
            Genera tu link personal de broker y registra a tus clientes en segundos — sin exponer sus datos de contacto.
          </p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            Generar mi link de broker
          </button>
          <p className="text-xs text-white/60 italic mt-3">Toma menos de un minuto. Tu link aparece al instante.</p>
        </div>
      </section>

      {/* 2. POR QUÉ EXISTE */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-12">
            Sabemos que tu cartera de clientes es tu activo más valioso. Por eso el registro de clientes de Selvadentro pide{' '}
            <strong className="text-brand-dark-green">solo nombre, últimos 4 dígitos del teléfono y ciudad</strong>
            . El contacto completo lo conservas tú — y cada cliente queda amarrado a tu nombre desde el primer día.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Link2 className="w-6 h-6" />,
                title: 'Link personal único',
                body: 'Un solo link tuyo para todos tus clientes. Compártelo por WhatsApp o regístralos tú mismo.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: 'Cliente protegido',
                body: 'Sin correo ni teléfono completo: ninguna automatización ni asesor interno contactará a tu cliente.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Canal de brokers',
                body: 'Tu registro va directo a Coordinación de Brokers — no al pipeline de ventas directas.',
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-2xl p-6 sm:p-7 text-center border border-stone-100 shadow-sm">
                <span className="inline-flex w-12 h-12 rounded-full bg-brand-copper/15 text-brand-copper items-center justify-center mb-4">
                  {card.icon}
                </span>
                <h3 className="font-cardo font-bold text-brand-dark-green text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">Cómo funciona</p>
            <h2 className="font-cardo font-bold text-brand-dark-green" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              Tres pasos, <em className="text-brand-copper font-cardo italic">cero fricción</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">1</span>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">Regístrate</p>
              <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">
                Llena el formulario y recibe <strong className="text-brand-dark-green">tu link personal al instante</strong>, en pantalla y por correo.
              </p>
              <button
                onClick={openForm}
                className="inline-block px-6 py-3 bg-brand-copper text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-md"
              >
                Generar mi link
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">2</span>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">Registra clientes</p>
              <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">
                Con tu link, cada cliente se registra con <strong className="text-brand-dark-green">nombre, últimos 4 dígitos y ciudad</strong> — tú o él mismo, desde cualquier celular.
              </p>
              <p className="text-xs text-stone-500 italic">Sin apps, sin cuentas, sin exponer su contacto.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">3</span>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">Cierra con respaldo</p>
              <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">
                El registro queda <strong className="text-brand-dark-green">a tu nombre en nuestro CRM</strong>. Coordinación de Brokers te acompaña hasta el cierre.
              </p>
              <p className="text-xs text-stone-500 italic">Zoom, tour y cotización siempre contigo presente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LO QUE NO VA A PASAR */}
      <section className="bg-brand-dark-green text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">Nuestro compromiso</p>
            <h2 className="font-cardo font-bold mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              Lo que <em className="text-brand-copper font-cardo italic">no</em> va a pasar con tus clientes
            </h2>
            <p className="font-cardo italic text-white/70 text-sm sm:text-base">Diseñado para proteger la relación broker–cliente.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              <>Nadie de nuestro equipo interno <strong>llamará ni escribirá a tu cliente</strong> — no tenemos su contacto.</>,
              <>Tu cliente <strong>no entra a campañas de correo ni SMS</strong>: el registro no dispara ninguna automatización de ventas.</>,
              <>Tu registro de broker va al <strong>canal de Coordinación de Brokers</strong>, nunca al pipeline de leads directos.</>,
              <>Cada visita y cada registro con tu link <strong>queda medido y auditable</strong> — la atribución no se pierde.</>,
            ].map((body, i) => (
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
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">Empieza hoy</p>
          <h2 className="font-cardo font-bold text-brand-dark-green mb-3" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
            Tu próximo cierre empieza con <em className="text-brand-copper font-cardo italic">tu link</em>
          </h2>
          <p className="font-cardo italic text-stone-600 text-base sm:text-lg mb-8">Regístrate una vez, úsalo con todos tus clientes.</p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            Generar mi link de broker
          </button>

          <p className="font-cardo italic text-stone-500 text-sm mt-5">
            ¿Dudas sobre el programa? Escríbenos a{' '}
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
          <p className="font-cardo italic text-white/70 text-sm mb-6">Tierra de cenotes · Tulum, Quintana Roo</p>
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
              aria-label="Cerrar"
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
