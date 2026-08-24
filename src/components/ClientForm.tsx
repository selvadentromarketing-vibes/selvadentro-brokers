import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { submitBrokerLead } from '../utils/webhook';
import { getStoredTrackingParams } from '../utils/tracking';

const splitName = (full: string): { first: string; last: string } => {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { first: '', last: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
};

export default function ClientForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !phoneLast4.trim() || !city.trim()) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Revisa el correo electrónico — parece incompleto.');
      return;
    }
    if (!/^\d{4}$/.test(phoneLast4.trim())) {
      setErrorMessage('Los últimos 4 dígitos del teléfono deben ser exactamente 4 números.');
      return;
    }

    setStatus('submitting');
    const { first, last } = splitName(fullName);
    // Stored params keep the broker code even if the ?ref= param was lost
    // while navigating (captureTrackingParams persisted it on page load).
    const tracking = getStoredTrackingParams();
    const result = await submitBrokerLead(
      {
        first_name: first,
        last_name: last,
        email: email.trim(),
        phone_last4: phoneLast4.trim(),
        city: city.trim(),
      },
      tracking,
    );

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage('No pudimos completar el registro. Inténtalo de nuevo en unos minutos.');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-8 shadow-2xl text-center border border-stone-100">
        <CheckCircle2 className="w-14 h-14 text-brand-olive mx-auto mb-4" />
        <h3 className="font-cardo text-2xl font-bold text-brand-dark-green mb-2">¡Registro completado!</h3>
        <p className="text-stone-700 leading-relaxed">
          El registro quedó vinculado al broker que compartió este link. Tu broker te acompañará en cada paso del proceso con Selvadentro.
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
      <h3 className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green mb-1 leading-tight">Registro de cliente</h3>
      <p className="text-sm text-stone-600 mb-5">
        Solo unos datos para dejar tu registro a nombre de tu broker, que te acompaña en todo el proceso.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Nombre y apellido</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="Nombre del cliente"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="cliente@correo.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Últimos 4 dígitos del teléfono <span className="text-brand-copper">*</span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition tracking-[0.4em] font-mono"
            placeholder="1234"
            required
          />
          <span className="block text-[11px] text-stone-500 mt-1">
            Solo los últimos 4 — sirven para identificar el registro sin exponer el número completo.
          </span>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Ciudad</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="Ciudad de residencia"
            autoComplete="address-level2"
            required
          />
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
            Registrando…
          </>
        ) : (
          'Completar registro'
        )}
      </button>

      <p className="mt-3 text-[11px] text-stone-500 text-center leading-relaxed">
        Este registro vincula al cliente con su broker ante Selvadentro, que sigue siendo su punto de contacto.
      </p>
    </form>
  );
}
