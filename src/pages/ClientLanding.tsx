import { useEffect, useState } from 'react';
import { Check, X, Handshake } from 'lucide-react';
import ClientForm from '../components/ClientForm';
import { captureTrackingParams, getBrokerCode } from '../utils/tracking';
import { trackBrokerClick } from '../utils/webhook';

export default function ClientLanding() {
  const [brokerCode, setBrokerCode] = useState<string | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const tracking = captureTrackingParams();
    const code = getBrokerCode(tracking);
    setBrokerCode(code);
    document.title = 'Registro de Cliente | Selvadentro Tulum';
    if (code) void trackBrokerClick(code, tracking);
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
      {/* BROKER BANNER */}
      {brokerCode && (
        <div className="bg-brand-copper text-white text-center text-xs sm:text-sm tracking-wide py-2.5 px-4">
          <Handshake className="w-4 h-4 inline-block mr-2 -mt-0.5" />
          Tu broker de confianza te invita a registrarte — este registro queda vinculado a él.
        </div>
      )}

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-brand-dark-green/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <a href="https://selvadentrotulum.com" aria-label="Selvadentro" className="shrink-0">
            <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro Tulum" className="h-9 sm:h-11 w-auto" />
          </a>
          <button
            onClick={openForm}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-copper text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-lg uppercase tracking-wider"
          >
            Registrarme
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
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper">Registro de cliente</span>
          </div>

          <h1 className="font-cardo font-bold leading-[1.08] mb-5" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)' }}>
            <span className="block text-white">Vivir dentro de la selva,</span>
            <em className="block not-italic text-brand-copper font-cardo italic">entre cenotes.</em>
          </h1>

          <p className="font-cardo italic text-white/75 text-base sm:text-lg mb-10">
            Confirma tu registro con tu broker y conoce Selvadentro Tulum de su mano.
          </p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            Completar mi registro
          </button>
          <p className="text-xs text-white/60 italic mt-3">Solo 3 datos. Menos de un minuto.</p>
        </div>
      </section>

      {/* 2. ¿QUÉ ES SELVADENTRO? */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">El proyecto</p>
            <h2 className="font-cardo font-bold text-brand-dark-green leading-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              ¿Qué es <em className="text-brand-copper font-cardo italic">Selvadentro</em>?
            </h2>
          </div>

          <p className="text-center text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-12">
            Un desarrollo de lotes residenciales en <strong className="text-brand-dark-green">54 hectáreas de selva viva en Tulum</strong>, con{' '}
            <strong className="text-brand-dark-green">cenotes naturales</strong> y un plan maestro que conserva la selva como protagonista.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: '01', title: 'Naturaleza', body: 'Lotes dentro de la selva, no sobre ella — densidad baja y conservación real.' },
              { num: '02', title: 'Cenotes', body: 'Agua cristalina dentro del desarrollo, patrimonio natural de la Riviera Maya.' },
              { num: '03', title: 'Comunidad', body: 'Un entorno privado y curado para quienes buscan vivir distinto.' },
              { num: '04', title: 'Tulum', body: 'Una de las plusvalías más dinámicas de México, a minutos del pueblo y el mar.' },
            ].map((card) => (
              <div key={card.num} className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-stone-100 shadow-sm">
                <p className="font-cardo text-brand-copper font-bold text-2xl sm:text-3xl mb-2">{card.num}</p>
                <div className="w-6 h-0.5 bg-brand-copper/50 mx-auto mb-3" />
                <h3 className="font-cardo font-bold text-brand-dark-green text-base sm:text-lg mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          <p className="font-cardo italic text-stone-500 text-xs sm:text-sm tracking-wide text-center mt-8">
            Carr. Tulum – Cancún · Tulum, Quintana Roo · selvadentrotulum.com
          </p>
        </div>
      </section>

      {/* 3. POR QUÉ SOLO 3 DATOS */}
      <section className="bg-brand-dark-green text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">Tu privacidad primero</p>
            <h2 className="font-cardo font-bold" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              Por qué pedimos <em className="text-brand-copper font-cardo italic">solo 3 datos</em>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Tu contacto es tuyo', body: 'No pedimos tu correo ni tu teléfono completo. Tu broker es tu único punto de contacto.' },
              { title: 'Cero spam', body: 'Este registro no te suscribe a nada: sin correos masivos, sin llamadas de vendedores.' },
              { title: 'Atención personal', body: 'Todo lo que necesites — información, Zoom, visita — lo coordina tu broker contigo.' },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl p-6 sm:p-7 border border-brand-copper/30 bg-brand-dark-green/40 text-center">
                <span className="inline-flex w-10 h-10 rounded-full bg-brand-copper/20 text-brand-copper items-center justify-center mb-4">
                  <Check className="w-5 h-5" />
                </span>
                <h3 className="font-cardo italic text-brand-copper text-base sm:text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-white/85 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA FINAL */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">Último paso</p>
          <h2 className="font-cardo font-bold text-brand-dark-green mb-3" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
            Confirma tu registro <em className="text-brand-copper font-cardo italic">con tu broker</em>
          </h2>
          <p className="font-cardo italic text-stone-600 text-base sm:text-lg mb-8">Nombre, últimos 4 dígitos de tu teléfono y tu ciudad. Eso es todo.</p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            Completar mi registro
          </button>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-brand-dark-green text-white text-center py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro" className="h-12 w-auto mx-auto mb-4" />
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
            <ClientForm />
          </div>
        </div>
      )}
    </div>
  );
}
