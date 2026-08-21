import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2, Copy, Check, Share2 } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import type { Value as PhoneValue } from 'react-phone-number-input';
import { submitBrokerSignup } from '../utils/webhook';
import { captureTrackingParams } from '../utils/tracking';

const splitName = (full: string): { first: string; last: string } => {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { first: '', last: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
};

export default function BrokerForm() {
  const [fullName, setFullName] = useState('');
  const [agency, setAgency] = useState('');
  const [phone, setPhone] = useState<PhoneValue | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registroLink, setRegistroLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone || !email.trim()) {
      setErrorMessage('Por favor completa nombre, teléfono y correo.');
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setErrorMessage('Revisa el número de teléfono — parece incompleto.');
      return;
    }

    setStatus('submitting');
    const { first, last } = splitName(fullName);
    const tracking = captureTrackingParams();
    const result = await submitBrokerSignup(
      { first_name: first, last_name: last, agency: agency.trim(), email: email.trim(), phone },
      tracking,
    );

    if (result.success && result.registro_link) {
      setRegistroLink(result.registro_link);
      setStatus('success');
    } else {
      setStatus('error');
      const errMsg = result.error instanceof Error ? result.error.message : null;
      setErrorMessage(errMsg ?? 'No pudimos completar tu registro. Inténtalo de nuevo en unos minutos.');
    }
  };

  const copyLink = async () => {
    if (!registroLink) return;
    try {
      await navigator.clipboard.writeText(registroLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* older browsers */
    }
  };

  const whatsappShare = () => {
    if (!registroLink) return;
    const msg = encodeURIComponent(
      `Regístrate como mi cliente en Selvadentro Tulum con este link: ${registroLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  if (status === 'success' && registroLink) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100">
        <div className="text-center mb-5">
          <CheckCircle2 className="w-14 h-14 text-brand-olive mx-auto mb-3" />
          <h3 className="font-cardo text-2xl font-bold text-brand-dark-green mb-1">¡Listo! Este es tu link de broker</h3>
          <p className="text-sm text-stone-600">
            Compártelo con tus clientes o úsalo tú mismo para registrarlos. Todo registro con este link queda amarrado a tu nombre.
          </p>
        </div>

        <div className="bg-[#F8F5EF] rounded-xl p-3 mb-4 border border-stone-200">
          <code className="block text-xs sm:text-sm text-brand-dark-green break-all leading-relaxed font-mono">{registroLink}</code>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-olive text-white rounded-lg font-semibold text-sm hover:bg-brand-dark-green transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar
              </>
            )}
          </button>
          <button
            type="button"
            onClick={whatsappShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1ebe5d] transition-all"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
        </div>

        <p className="text-[11px] text-stone-500 text-center leading-relaxed">
          También te lo enviamos por correo. Guárdalo — es tu identificador ante Selvadentro. ¿Dudas? Escríbenos a{' '}
          <a href="mailto:info@selvadentrotulum.com" className="text-brand-olive underline">
            info@selvadentrotulum.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100"
      noValidate
    >
      <h3 className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green mb-1 leading-tight">Regístrate como broker</h3>
      <p className="text-sm text-stone-600 mb-5">Recibe tu link personal al instante — sin llamadas, sin spam.</p>

      <div className="space-y-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Nombre completo</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="Tu nombre y apellido"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Agencia inmobiliaria</span>
          <input
            type="text"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="Nombre de tu agencia (o 'independiente')"
            autoComplete="organization"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Teléfono / WhatsApp <span className="text-brand-copper">*</span>
          </span>
          <div className="phone-input-shell px-4 py-3 border border-stone-300 rounded-lg bg-white transition focus-within:border-brand-olive focus-within:ring-2 focus-within:ring-brand-olive/30">
            <PhoneInput
              defaultCountry="MX"
              value={phone}
              onChange={setPhone}
              placeholder="999 123 4567"
              autoComplete="tel"
              numberInputProps={{ 'aria-label': 'Teléfono', required: true }}
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
          <span className="block text-[11px] text-stone-500 mt-1">Aquí te enviamos tu link personal y material del proyecto.</span>
        </label>
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-600" role="alert">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 w-full px-6 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg hover:shadow-brand-dark-green/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando tu link…
          </>
        ) : (
          'Generar mi link de broker'
        )}
      </button>

      <p className="mt-3 text-[11px] text-stone-500 text-center leading-relaxed">
        Al registrarte aceptas que el equipo de Coordinación de Brokers de Selvadentro te contacte sobre el programa.
      </p>
    </form>
  );
}
