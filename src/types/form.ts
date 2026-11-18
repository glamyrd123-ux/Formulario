export interface FormValues {
  // Sección 1. Datos generales
  fullName: string;
  businessName: string;
  businessActivity: string;
  phone: string;
  email: string;
  address: string;

  // Sección 2. Información de la marca
  businessDescription: string;
  mainGoal: string;
  mainGoalOther: string;
  brandIdentityStatus: string;
  styles: string[];
  stylesOther: string;

  // Sección 3. Requisitos de la página web
  websiteType: string;
  websiteTypeOther: string;
  productsOrServices: string;
  sectionsToInclude: string[];
  sectionsOther: string;
  featuresNeeded: string[];
  featuresOther: string;
  domainStatus: string;
  domainUrl: string;

  // Sección 4. Recursos y presencia digital
  availableMaterials: string[];
  attachmentLinks: string;
  referenceLinks: string;
  socialLinks: string;

  // Sección 5. Detalles finales
  targetDate: string;
  additionalNotes: string;
}

export const INITIAL_FORM_VALUES: FormValues = {
  fullName: '',
  businessName: '',
  businessActivity: '',
  phone: '',
  email: '',
  address: '',
  businessDescription: '',
  mainGoal: '',
  mainGoalOther: '',
  brandIdentityStatus: '',
  styles: [],
  stylesOther: '',
  websiteType: '',
  websiteTypeOther: '',
  productsOrServices: '',
  sectionsToInclude: [],
  sectionsOther: '',
  featuresNeeded: [],
  featuresOther: '',
  domainStatus: '',
  domainUrl: '',
  availableMaterials: [],
  attachmentLinks: '',
  referenceLinks: '',
  socialLinks: '',
  targetDate: '',
  additionalNotes: '',
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export interface SectionMeta {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  questionRange: string;
}

export const FORM_SECTIONS: SectionMeta[] = [
  {
    id: 'seccion-1',
    number: '01',
    title: 'Datos Generales',
    subtitle: 'Información básica de contacto y de tu proyecto.',
    questionRange: 'Preguntas 1–6',
  },
  {
    id: 'seccion-2',
    number: '02',
    title: 'Información de la Marca',
    subtitle: 'Propósito, identidad visual y estilo deseado.',
    questionRange: 'Preguntas 7–10',
  },
  {
    id: 'seccion-3',
    number: '03',
    title: 'Requisitos de la Página Web',
    subtitle: 'Estructura, funciones y situación actual de tu dominio.',
    questionRange: 'Preguntas 11–15',
  },
  {
    id: 'seccion-4',
    number: '04',
    title: 'Recursos y Presencia Digital',
    subtitle: 'Materiales listos, sitios de referencia y redes sociales.',
    questionRange: 'Preguntas 16–18',
  },
  {
    id: 'seccion-5',
    number: '05',
    title: 'Detalles Finales',
    subtitle: 'Fecha estimada de entrega e ideas adicionales.',
    questionRange: 'Preguntas 19–20',
  },
];

export const MAIN_GOALS = [
  'Dar a conocer mi negocio.',
  'Promocionar productos o servicios.',
  'Vender por Internet.',
  'Conseguir nuevos clientes.',
  'Presentar información empresarial o profesional.',
  'Mostrar un portafolio de trabajos.',
  'Otro.',
] as const;

export const BRAND_IDENTITY_OPTIONS = [
  'Sí, cuento con todos.',
  'Solo tengo algunos elementos.',
  'No tengo identidad visual.',
  'Deseo renovar mi imagen actual.',
] as const;

export const WEBSITE_STYLES = [
  'Moderno.',
  'Elegante.',
  'Minimalista.',
  'Profesional.',
  'Creativo.',
  'Corporativo.',
  'Otro.',
] as const;

export const WEBSITE_TYPES = [
  'Página empresarial o corporativa.',
  'Tienda virtual.',
  'Página personal o profesional.',
  'Catálogo de productos o servicios.',
  'Portafolio digital.',
  'Blog o página informativa.',
  'Otro.',
] as const;

export const WEBSITE_SECTIONS = [
  'Inicio.',
  'Nosotros.',
  'Servicios.',
  'Productos.',
  'Catálogo.',
  'Galería.',
  'Portafolio.',
  'Contacto.',
  'Blog o noticias.',
  'Otra.',
] as const;

export const WEBSITE_FEATURES = [
  'Contacto directo por WhatsApp.',
  'Formulario de contacto.',
  'Catálogo de productos o servicios.',
  'Tienda y pagos en línea.',
  'Reservas o citas.',
  'Galería de imágenes y videos.',
  'Integración con redes sociales.',
  'Otra.',
] as const;

export const DOMAIN_STATUS_OPTIONS = [
  'Sí, tengo una página web.',
  'Tengo un dominio, pero no una página web.',
  'No tengo ninguno.',
  'Deseo renovar mi página actual.',
] as const;

export const DOMAIN_REQUIRING_OPTIONS = new Set<string>([
  'Sí, tengo una página web.',
  'Tengo un dominio, pero no una página web.',
  'Deseo renovar mi página actual.',
]);

export const AVAILABLE_MATERIALS = [
  'Logotipo.',
  'Fotografías.',
  'Videos.',
  'Textos e información del negocio.',
  'Colores y tipografías corporativas.',
  'Ninguno por el momento.',
] as const;
