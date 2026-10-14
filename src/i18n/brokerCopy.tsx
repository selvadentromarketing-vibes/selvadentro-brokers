import type { ReactNode } from 'react';
import type { Lang } from './lang';

/** Copy for the broker signup page (/ and /en) and its form. */

interface BrokerCopy {
  title: string;
  headerCta: string;
  cta: string;
  heroBadge: string;
  heroLine1: string;
  heroLine2: string;
  heroSubtitle: string;
  heroNote: string;
  intro: ReactNode;
  benefits: { title: string; body: string }[];
  howBadge: string;
  howTitle: ReactNode;
  steps: { label: string; body: ReactNode; note?: string }[];
  promiseBadge: string;
  promiseTitle: ReactNode;
  promiseSubtitle: string;
  promises: ReactNode[];
  finalBadge: string;
  finalTitle: ReactNode;
  finalSubtitle: string;
  questions: string;
  form: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    agencyLabel: string;
    agencyPlaceholder: string;
    phoneLabel: string;
    phoneAria: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHelp: string;
    errMissing: string;
    errPhone: string;
    errDuplicate: string;
    errGeneric: string;
    submitting: string;
    consent: string;
    successTitleNew: string;
    successTitleExisting: string;
    successBodyNew: string;
    successBodyExisting: string;
    copy: string;
    copied: string;
    saveNew: string;
    saveExisting: string;
    saveRest: string;
    whatsappMessage: (link: string) => string;
  };
}

const Em = ({ children }: { children: ReactNode }) => <em className="text-brand-copper font-cardo italic">{children}</em>;
const Strong = ({ children }: { children: ReactNode }) => <strong className="text-brand-dark-green">{children}</strong>;

const es: BrokerCopy = {
  title: 'Programa de Brokers | Selvadentro Tulum',
  headerCta: 'Generar mi link',
  cta: 'Generar mi link de broker',

  heroBadge: 'Programa de Brokers',
  heroLine1: 'Tu cliente. Tu comisión.',
  heroLine2: 'Registrado y protegido.',
  heroSubtitle: 'Genera tu link personal de broker y registra a tus clientes en segundos — sin exponer sus datos de contacto.',
  heroNote: 'Toma menos de un minuto. Tu link aparece al instante.',

  intro: (
    <>
      Sabemos que tu cartera de clientes es tu activo más valioso. Por eso el registro de clientes de Selvadentro pide{' '}
      <Strong>solo nombre, últimos 4 dígitos del teléfono y ciudad</Strong>
      . El contacto completo lo conservas tú — y cada cliente queda amarrado a tu nombre desde el primer día.
    </>
  ),
  // Same order as the icons in BrokerSignup: link, shield, people.
  benefits: [
    {
      title: 'Link personal único',
      body: 'Un solo link tuyo para todos tus clientes. Compártelo por WhatsApp o regístralos tú mismo.',
    },
    {
      title: 'Cliente protegido',
      body: 'Sin correo ni teléfono completo: ninguna automatización ni asesor interno contactará a tu cliente.',
    },
    {
      title: 'Canal de brokers',
      body: 'Tu registro va directo a Coordinación de Brokers — no al pipeline de ventas directas.',
    },
  ],

  howBadge: 'Cómo funciona',
  howTitle: (<>Tres pasos, <Em>cero fricción</Em></>),
  // A step without `note` gets the "Generar mi link" button instead.
  steps: [
    {
      label: 'Regístrate',
      body: (<>Llena el formulario y recibe <Strong>tu link personal al instante</Strong>, en pantalla y por correo.</>),
    },
    {
      label: 'Registra clientes',
      body: (<>Con tu link, cada cliente se registra con <Strong>nombre, últimos 4 dígitos y ciudad</Strong> — tú o él mismo, desde cualquier celular.</>),
      note: 'Sin apps, sin cuentas, sin exponer su contacto.',
    },
    {
      label: 'Cierra con respaldo',
      body: (<>El registro queda <Strong>a tu nombre en nuestro CRM</Strong>. Coordinación de Brokers te acompaña hasta el cierre.</>),
      note: 'Zoom, tour y cotización siempre contigo presente.',
    },
  ],

  promiseBadge: 'Nuestro compromiso',
  promiseTitle: (<>Lo que <Em>no</Em> va a pasar con tus clientes</>),
  promiseSubtitle: 'Diseñado para proteger la relación broker–cliente.',
  promises: [
    <>Nadie de nuestro equipo interno <strong>llamará ni escribirá a tu cliente</strong> — no tenemos su contacto.</>,
    <>Tu cliente <strong>no entra a campañas de correo ni SMS</strong>: el registro no dispara ninguna automatización de ventas.</>,
    <>Tu registro de broker va al <strong>canal de Coordinación de Brokers</strong>, nunca al pipeline de leads directos.</>,
    <>Cada visita y cada registro con tu link <strong>queda medido y auditable</strong> — la atribución no se pierde.</>,
  ],

  finalBadge: 'Empieza hoy',
  finalTitle: (<>Tu próximo cierre empieza con <Em>tu link</Em></>),
  finalSubtitle: 'Regístrate una vez, úsalo con todos tus clientes.',
  questions: '¿Dudas sobre el programa? Escríbenos a',

  form: {
    title: 'Regístrate como broker',
    subtitle: 'Recibe tu link personal al instante — sin llamadas, sin spam.',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Tu nombre y apellido',
    agencyLabel: 'Agencia inmobiliaria',
    agencyPlaceholder: "Nombre de tu agencia (o 'independiente')",
    phoneLabel: 'Teléfono / WhatsApp',
    phoneAria: 'Teléfono',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    emailHelp: 'Aquí te enviamos tu link personal y material del proyecto.',
    errMissing: 'Por favor completa nombre, teléfono y correo.',
    errPhone: 'Revisa el número de teléfono — parece incompleto.',
    errDuplicate: 'Ya existe un broker registrado con este correo. Revisa tu bandeja de entrada o escríbenos.',
    errGeneric: 'No pudimos completar tu registro. Inténtalo de nuevo en unos minutos.',
    submitting: 'Generando tu link…',
    consent: 'Al registrarte aceptas que el equipo de Coordinación de Brokers de Selvadentro te contacte sobre el programa.',

    successTitleNew: '¡Listo! Este es tu link de broker',
    successTitleExisting: 'Ya tenías tu link de broker',
    successBodyNew: 'Compártelo con tus clientes o úsalo tú mismo para registrarlos. Todo registro con este link queda amarrado a tu nombre.',
    successBodyExisting: 'Tu correo ya estaba registrado, así que aquí está el link que te corresponde. Es el mismo de siempre: úsalo con todos tus clientes.',
    copy: 'Copiar',
    copied: 'Copiado',
    saveNew: 'También te lo enviamos por correo. Guárdalo',
    saveExisting: 'Guárdalo',
    saveRest: '— es tu identificador ante Selvadentro. ¿Dudas? Escríbenos a',
    whatsappMessage: (link: string) => `Regístrate como mi cliente en Selvadentro Tulum con este link: ${link}`,
  },
};

const en: BrokerCopy = {
  title: 'Broker Program | Selvadentro Tulum',
  headerCta: 'Get my link',
  cta: 'Get my broker link',

  heroBadge: 'Broker Program',
  heroLine1: 'Your client. Your commission.',
  heroLine2: 'Registered and protected.',
  heroSubtitle: 'Get your personal broker link and register your clients in seconds — without exposing their full contact details.',
  heroNote: 'Takes less than a minute. Your link appears instantly.',

  intro: (
    <>
      We know your client portfolio is your most valuable asset. That's why Selvadentro's client registration asks for{' '}
      <Strong>only name, email, the last 4 digits of their phone and city</Strong>
      . You keep their full contact details — and every client is tied to your name from day one.
    </>
  ),
  benefits: [
    {
      title: 'One personal link',
      body: 'A single link for all your clients. Share it on WhatsApp or register them yourself.',
    },
    {
      title: 'Protected client',
      body: 'No full phone number, no automations: no in-house sales rep will contact your client.',
    },
    {
      title: 'Broker channel',
      body: 'Your registration goes straight to our Broker Coordination team — not to the direct sales pipeline.',
    },
  ],

  howBadge: 'How it works',
  howTitle: <>Three steps, <Em>zero friction</Em></>,
  steps: [
    {
      label: 'Sign up',
      body: <>Fill out the form and get <Strong>your personal link instantly</Strong>, on screen and by email.</>,
    },
    {
      label: 'Register clients',
      body: <>With your link, each client registers with <Strong>name, email, last 4 digits and city</Strong> — you or them, from any phone.</>,
      note: 'No apps, no accounts, no full phone number.',
    },
    {
      label: 'Close with backing',
      body: <>The registration is <Strong>under your name in our CRM</Strong>. Our Broker Coordination team supports you all the way to closing.</>,
      note: 'Zoom calls, tours and quotes — always with you present.',
    },
  ],

  promiseBadge: 'Our commitment',
  promiseTitle: <>What will <Em>not</Em> happen to your clients</>,
  promiseSubtitle: 'Designed to protect the broker–client relationship.',
  promises: [
    <>No one on our in-house team <strong>will call or message your client</strong> — we never ask for their phone number.</>,
    <>Your client <strong>won't be added to email or SMS campaigns</strong>: registering doesn't trigger any sales automation.</>,
    <>Your broker registration goes to the <strong>Broker Coordination channel</strong>, never to the direct-leads pipeline.</>,
    <>Every visit and every registration through your link <strong>is tracked and auditable</strong> — attribution is never lost.</>,
  ],

  finalBadge: 'Get started today',
  finalTitle: <>Your next closing starts with <Em>your link</Em></>,
  finalSubtitle: 'Sign up once, use it with all your clients.',
  questions: 'Questions about the program? Email us at',

  form: {
    title: 'Sign up as a broker',
    subtitle: 'Get your personal link instantly — no calls, no spam.',
    nameLabel: 'Full name',
    namePlaceholder: 'Your first and last name',
    agencyLabel: 'Real estate agency',
    agencyPlaceholder: "Your agency's name (or 'independent')",
    phoneLabel: 'Phone / WhatsApp',
    phoneAria: 'Phone',
    emailLabel: 'Email',
    emailPlaceholder: 'you@email.com',
    emailHelp: "We'll send your personal link and project materials here.",
    errMissing: 'Please fill in your name, phone and email.',
    errPhone: 'Please check the phone number — it looks incomplete.',
    errDuplicate: 'A broker is already registered with this email. Check your inbox or contact us.',
    errGeneric: "We couldn't complete your registration. Please try again in a few minutes.",
    submitting: 'Generating your link…',
    consent: "By signing up, you agree to be contacted by Selvadentro's Broker Coordination team about the program.",

    successTitleNew: "All set! Here's your broker link",
    successTitleExisting: 'You already have a broker link',
    successBodyNew: 'Share it with your clients or use it yourself to register them. Every registration through this link is tied to your name.',
    successBodyExisting: "Your email was already registered, so here's the link that belongs to you. It's the same one as always: use it with all your clients.",
    copy: 'Copy',
    copied: 'Copied',
    saveNew: "We've also emailed it to you. Save it",
    saveExisting: 'Save it',
    saveRest: "— it's your ID with Selvadentro. Questions? Email us at",
    whatsappMessage: (link: string) => `Register as my client at Selvadentro Tulum with this link: ${link}`,
  },
};

export const BROKER_COPY: Record<Lang, BrokerCopy> = { es, en };
