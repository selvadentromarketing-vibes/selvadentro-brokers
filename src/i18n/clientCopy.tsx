import type { ReactNode } from 'react';
import type { Lang } from './lang';

/** Copy for the client registration landing (/registro and /en/register) and its form. */

interface ClientCopy {
  title: string;
  banner: string;
  headerCta: string;
  cta: string;
  heroBadge: string;
  heroLine1: string;
  heroLine2: string;
  heroSubtitle: string;
  heroNote: string;
  projectBadge: string;
  projectTitle: ReactNode;
  projectBody: ReactNode;
  features: { num: string; title: string; body: string }[];
  address: string;
  privacyBadge: string;
  privacyTitle: ReactNode;
  privacy: { title: string; body: string }[];
  finalBadge: string;
  finalTitle: ReactNode;
  finalSubtitle: string;
  form: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    last4Label: string;
    last4Help: string;
    cityLabel: string;
    cityPlaceholder: string;
    errMissing: string;
    errEmail: string;
    errLast4: string;
    errGeneric: string;
    submitting: string;
    submit: string;
    footnote: string;
    successTitle: string;
    successBody: string;
  };
}

const Em = ({ children }: { children: ReactNode }) => <em className="text-brand-copper font-cardo italic">{children}</em>;
const Strong = ({ children }: { children: ReactNode }) => <strong className="text-brand-dark-green">{children}</strong>;

const es: ClientCopy = {
  title: 'Registro de Cliente | Selvadentro Tulum',
  banner: 'Tu broker de confianza te invita a registrarte — este registro queda vinculado a él.',
  headerCta: 'Registrarme',
  cta: 'Completar mi registro',

  heroBadge: 'Registro de cliente',
  heroLine1: 'Vivir dentro de la selva,',
  heroLine2: 'entre cenotes.',
  heroSubtitle: 'Confirma tu registro con tu broker y conoce Selvadentro Tulum de su mano.',
  heroNote: 'Solo 4 datos. Menos de un minuto.',

  projectBadge: 'El proyecto',
  projectTitle: <>¿Qué es <Em>Selvadentro</Em>?</>,
  projectBody: (
    <>
      Un desarrollo de lotes residenciales en <Strong>54 hectáreas de selva viva en Tulum</Strong>, con{' '}
      <Strong>cenotes naturales</Strong> y un plan maestro que conserva la selva como protagonista.
    </>
  ),
  features: [
    { num: '01', title: 'Naturaleza', body: 'Lotes dentro de la selva, no sobre ella — densidad baja y conservación real.' },
    { num: '02', title: 'Cenotes', body: 'Agua cristalina dentro del desarrollo, patrimonio natural de la Riviera Maya.' },
    { num: '03', title: 'Comunidad', body: 'Un entorno privado y curado para quienes buscan vivir distinto.' },
    { num: '04', title: 'Tulum', body: 'Una de las plusvalías más dinámicas de México, a minutos del pueblo y el mar.' },
  ],
  address: 'Carr. Tulum – Cancún · Tulum, Quintana Roo · selvadentrotulum.com',

  privacyBadge: 'Tu privacidad primero',
  privacyTitle: <>Por qué pedimos <Em>solo 4 datos</Em></>,
  privacy: [
    { title: 'Tu contacto es tuyo', body: 'Nunca pedimos tu teléfono completo. Tu broker es tu único punto de contacto.' },
    { title: 'Cero spam', body: 'Este registro no te suscribe a nada: sin correos masivos, sin llamadas de vendedores.' },
    { title: 'Atención personal', body: 'Todo lo que necesites — información, Zoom, visita — lo coordina tu broker contigo.' },
  ],

  finalBadge: 'Último paso',
  finalTitle: <>Confirma tu registro <Em>con tu broker</Em></>,
  finalSubtitle: 'Nombre, correo, últimos 4 dígitos de tu teléfono y tu ciudad. Eso es todo.',

  form: {
    title: 'Registro de cliente',
    subtitle: 'Solo unos datos para dejar tu registro a nombre de tu broker, que te acompaña en todo el proceso.',
    nameLabel: 'Nombre y apellido',
    namePlaceholder: 'Nombre del cliente',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'cliente@correo.com',
    last4Label: 'Últimos 4 dígitos del teléfono',
    last4Help: 'Solo los últimos 4 — sirven para identificar el registro sin exponer el número completo.',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Ciudad de residencia',
    errMissing: 'Por favor completa todos los campos.',
    errEmail: 'Revisa el correo electrónico — parece incompleto.',
    errLast4: 'Los últimos 4 dígitos del teléfono deben ser exactamente 4 números.',
    errGeneric: 'No pudimos completar el registro. Inténtalo de nuevo en unos minutos.',
    submitting: 'Registrando…',
    submit: 'Completar registro',
    footnote: 'Este registro vincula al cliente con su broker ante Selvadentro, que sigue siendo su punto de contacto.',
    successTitle: '¡Registro completado!',
    successBody:
      'El registro quedó vinculado al broker que compartió este link. Tu broker te acompañará en cada paso del proceso con Selvadentro.',
  },
};

const en: ClientCopy = {
  title: 'Client Registration | Selvadentro Tulum',
  banner: 'Your trusted broker invited you to register — this registration is linked to them.',
  headerCta: 'Register',
  cta: 'Complete my registration',

  heroBadge: 'Client registration',
  heroLine1: 'Live within the jungle,',
  heroLine2: 'among cenotes.',
  heroSubtitle: 'Confirm your registration with your broker and discover Selvadentro Tulum with their guidance.',
  heroNote: 'Just 4 details. Under a minute.',

  projectBadge: 'The project',
  projectTitle: <>What is <Em>Selvadentro</Em>?</>,
  projectBody: (
    <>
      A residential lot development on <Strong>54 hectares (133 acres) of living jungle in Tulum</Strong>, with{' '}
      <Strong>natural cenotes</Strong> and a master plan that keeps the jungle at the heart of it all.
    </>
  ),
  features: [
    { num: '01', title: 'Nature', body: 'Lots within the jungle, not on top of it — low density and real conservation.' },
    { num: '02', title: 'Cenotes', body: 'Crystal-clear water inside the development, a natural treasure of the Riviera Maya.' },
    { num: '03', title: 'Community', body: 'A private, curated setting for those who want to live differently.' },
    { num: '04', title: 'Tulum', body: "One of Mexico's fastest-appreciating markets, minutes from town and the sea." },
  ],
  address: 'Tulum – Cancún Highway · Tulum, Quintana Roo · selvadentrotulum.com',

  privacyBadge: 'Your privacy first',
  privacyTitle: <>Why we ask for <Em>just 4 details</Em></>,
  privacy: [
    { title: 'Your contact stays yours', body: 'We never ask for your full phone number. Your broker is your only point of contact.' },
    { title: 'Zero spam', body: "This registration doesn't subscribe you to anything: no mass emails, no sales calls." },
    { title: 'Personal attention', body: 'Whatever you need — information, a Zoom call, a site visit — your broker arranges it with you.' },
  ],

  finalBadge: 'Last step',
  finalTitle: <>Confirm your registration <Em>with your broker</Em></>,
  finalSubtitle: "Name, email, the last 4 digits of your phone and your city. That's it.",

  form: {
    title: 'Client registration',
    subtitle: 'Just a few details to register you under your broker, who will guide you through the whole process.',
    nameLabel: 'First and last name',
    namePlaceholder: "Client's name",
    emailLabel: 'Email',
    emailPlaceholder: 'client@email.com',
    last4Label: 'Last 4 digits of phone',
    last4Help: 'Only the last 4 — they identify the registration without exposing the full number.',
    cityLabel: 'City',
    cityPlaceholder: 'City of residence',
    errMissing: 'Please fill in all fields.',
    errEmail: 'Please check the email address — it looks incomplete.',
    errLast4: 'The last 4 digits of the phone must be exactly 4 numbers.',
    errGeneric: "We couldn't complete the registration. Please try again in a few minutes.",
    submitting: 'Registering…',
    submit: 'Complete registration',
    footnote: 'This registration links the client to their broker at Selvadentro; the broker remains their point of contact.',
    successTitle: 'Registration complete!',
    successBody:
      'Your registration is now linked to the broker who shared this link. Your broker will guide you through every step with Selvadentro.',
  },
};

export const CLIENT_COPY: Record<Lang, ClientCopy> = { es, en };
