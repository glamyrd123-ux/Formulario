import React, {useEffect, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {
  AlertCircle,
  Building2,
  Check,
  Database,
  Globe,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Send,
  User,
} from 'lucide-react';
import {DatabaseView} from './components/DatabaseView';
import {
  CheckboxGroupField,
  DateField,
  FieldError,
  QuestionHeader,
  RadioGroupField,
  TextAreaField,
  TextField,
} from './components/FormFields';
import {SubmissionSuccess} from './components/SubmissionSuccess';
import {saveSolicitudToDatabase} from './services/solicitudesService';
import {
  AVAILABLE_MATERIALS,
  BRAND_IDENTITY_OPTIONS,
  DOMAIN_REQUIRING_OPTIONS,
  DOMAIN_STATUS_OPTIONS,
  FORM_SECTIONS,
  FormErrors,
  FormValues,
  INITIAL_FORM_VALUES,
  MAIN_GOALS,
  WEBSITE_FEATURES,
  WEBSITE_SECTIONS,
  WEBSITE_STYLES,
  WEBSITE_TYPES,
} from './types/form';

const DRAFT_STORAGE_KEY = 'solicitud_diseno_web_draft_v1';

function loadDraft(): FormValues {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return INITIAL_FORM_VALUES;
    const parsed = JSON.parse(raw) as Partial<FormValues>;
    return {...INITIAL_FORM_VALUES, ...parsed};
  } catch {
    return INITIAL_FORM_VALUES;
  }
}

export default function App() {
  const [viewMode, setViewMode] = useState<'form' | 'database'>('form');
  const [values, setValues] = useState<FormValues>(loadDraft);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedRecordId, setSubmittedRecordId] = useState<string | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(
    FORM_SECTIONS[0].id,
  );

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Ignore storage quota errors
    }
  }, [values]);

  useEffect(() => {
    if (viewMode !== 'form' || submitted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {rootMargin: '-15% 0px -65% 0px', threshold: 0},
    );

    FORM_SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [submitted, viewMode]);

  const setField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
  };

  const toggleArrayField = (
    field:
      | 'styles'
      | 'sectionsToInclude'
      | 'featuresNeeded'
      | 'availableMaterials',
    option: string,
  ) => {
    setValues((prev) => {
      const current = prev[field];
      let updated: string[];

      if (field === 'availableMaterials') {
        const noneLabel = 'Ninguno por el momento.';
        if (option === noneLabel) {
          updated = current.includes(noneLabel) ? [] : [noneLabel];
        } else {
          const withoutNone = current.filter((item) => item !== noneLabel);
          updated = withoutNone.includes(option)
            ? withoutNone.filter((item) => item !== option)
            : [...withoutNone, option];
        }
      } else {
        updated = current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option];
      }

      return {...prev, [field]: updated};
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
  };

  const needsDomainInput = DOMAIN_REQUIRING_OPTIONS.has(values.domainStatus);

  const sectionCompletion = useMemo(() => {
    const s1 =
      Boolean(values.fullName.trim()) &&
      Boolean(values.businessName.trim()) &&
      Boolean(values.businessActivity.trim()) &&
      Boolean(values.phone.trim()) &&
      Boolean(values.email.trim());

    const s2 =
      Boolean(values.businessDescription.trim()) &&
      Boolean(values.mainGoal) &&
      Boolean(values.brandIdentityStatus) &&
      values.styles.length > 0;

    const s3 =
      Boolean(values.websiteType) &&
      Boolean(values.productsOrServices.trim()) &&
      values.sectionsToInclude.length > 0 &&
      values.featuresNeeded.length > 0 &&
      Boolean(values.domainStatus) &&
      (!needsDomainInput || Boolean(values.domainUrl.trim()));

    const s4 = values.availableMaterials.length > 0;
    const s5 =
      Boolean(values.targetDate) || Boolean(values.additionalNotes.trim());

    return {
      'seccion-1': s1,
      'seccion-2': s2,
      'seccion-3': s3,
      'seccion-4': s4,
      'seccion-5': s5,
    } as Record<string, boolean>;
  }, [values, needsDomainInput]);

  const progressPercentage = useMemo(() => {
    const requiredChecks = [
      Boolean(values.fullName.trim()),
      Boolean(values.businessName.trim()),
      Boolean(values.businessActivity.trim()),
      Boolean(values.phone.trim()),
      Boolean(values.email.trim()),
      Boolean(values.businessDescription.trim()),
      Boolean(values.mainGoal),
      Boolean(values.brandIdentityStatus),
      values.styles.length > 0,
      Boolean(values.websiteType),
      Boolean(values.productsOrServices.trim()),
      values.sectionsToInclude.length > 0,
      values.featuresNeeded.length > 0,
      Boolean(values.domainStatus),
      ...(needsDomainInput ? [Boolean(values.domainUrl.trim())] : []),
      values.availableMaterials.length > 0,
    ];
    const completedCount = requiredChecks.filter(Boolean).length;
    return Math.round((completedCount / requiredChecks.length) * 100);
  }, [values, needsDomainInput]);

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Ingresa tu nombre completo.';
    }
    if (!values.phone.trim()) {
      nextErrors.phone = 'Ingresa un número de teléfono o WhatsApp de contacto.';
    } else if (values.phone.replace(/[^\d]/g, '').length < 7) {
      nextErrors.phone =
        'Ingresa un número telefónico válido (al menos 7 dígitos).';
    }
    if (!values.email.trim()) {
      nextErrors.email = 'Ingresa tu correo electrónico principal.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'El formato del correo electrónico no parece válido.';
    }

    return nextErrors;
  };

  const scrollToFirstError = (validationErrors: FormErrors) => {
    const fieldOrder: Array<{key: keyof FormValues; domId: string}> = [
      {key: 'fullName', domId: 'field-fullName'},
      {key: 'phone', domId: 'field-phone'},
      {key: 'email', domId: 'field-email'},
    ];

    const first = fieldOrder.find((item) => Boolean(validationErrors[item.key]));
    if (first) {
      const target = document.getElementById(first.domId);
      if (target) {
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstError(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const id = await saveSolicitudToDatabase(values);
      setSubmittedRecordId(id);
      setSubmitted(true);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }
      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch {
      setSubmitError(
        'No se pudo guardar tu solicitud en la base de datos. Verifica tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setValues(INITIAL_FORM_VALUES);
    setErrors({});
    setSubmitError('');
    setConfirmClear(false);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleStartNew = () => {
    handleClearForm();
    setSubmittedRecordId(null);
    setSubmitted(false);
  };

  if (viewMode === 'database') {
    return <DatabaseView onBackToForm={() => setViewMode('form')} />;
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#E6F3FF] via-[#F2F8FF] to-[#EBF5FF]">
        <SubmissionSuccess
          values={values}
          recordId={submittedRecordId}
          onReset={handleStartNew}
        />
      </main>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F1FE] via-[#F0F7FF] to-[#E6F3FF] text-slate-900">
      {/* Compact mobile progress strip */}
      <div className="lg:hidden sticky top-0 z-20 border-b border-sky-200/80 bg-[#F4F9FF]/95 backdrop-blur-sm px-4 py-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
          <span>Solicitud de Diseño Web y Marca</span>
          <span className="tabular-nums text-sky-700 font-semibold">
            {progressPercentage}% completado
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
            style={{width: `${progressPercentage}%`}}
          />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Form Header Card */}
        <header className="mb-8 rounded-2xl border border-sky-200/90 bg-white overflow-hidden shadow-[0_6px_30px_-12px_rgba(14,116,184,0.14)]">
          <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500" />
          <div className="px-6 sm:px-10 py-7 sm:py-9 bg-gradient-to-br from-white via-white to-sky-50/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold text-sky-700">
                Diseño Web y Marca · 5 Secciones · 20 Preguntas
              </p>
              <button
                type="button"
                onClick={() => setViewMode('database')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-100 cursor-pointer whitespace-nowrap"
              >
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Base de datos</span>
              </button>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance max-w-3xl">
              Formulario de Solicitud de Información para Diseño Web y Marca
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Completa este formulario para proporcionarnos la información necesaria
              sobre tu negocio, empresa, marca o proyecto. Estos datos se guardarán
              directamente en nuestra base de datos para planificar el diseño y
              desarrollo de una página web adaptada a tus objetivos.
            </p>
            <div className="mt-5 pt-4 border-t border-sky-100 flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500">
              <span>Tus respuestas se guardan automáticamente en este navegador</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Section Navigation & Progress Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-8 space-y-5">
            <div className="rounded-2xl border border-sky-200/90 bg-white p-6 shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-sm font-semibold text-slate-900">
                  Progreso del formulario
                </h2>
                <span className="text-sm font-bold tabular-nums text-sky-700">
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
                  style={{width: `${progressPercentage}%`}}
                />
              </div>

              <nav aria-label="Secciones del formulario" className="mt-6 space-y-1.5">
                {FORM_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  const isDone = sectionCompletion[sec.id];
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`group flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-sky-50 text-sky-950 font-semibold'
                          : 'text-slate-600 hover:bg-sky-50/50 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                          isDone
                            ? 'bg-sky-600 text-white'
                            : isActive
                              ? 'bg-sky-200/80 text-sky-900'
                              : 'bg-sky-100/80 text-sky-700'
                        }`}
                      >
                        {isDone ? (
                          <Check
                            className="h-3.5 w-3.5 stroke-[2.75]"
                            aria-hidden="true"
                          />
                        ) : (
                          sec.number
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{sec.title}</span>
                        <span className="block text-xs font-normal text-slate-500">
                          {sec.questionRange}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Form Column */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-8 space-y-7"
          >
            {errorCount > 0 && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-900"
              >
                <AlertCircle
                  className="h-5 w-5 shrink-0 text-rose-600 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">
                    Revisa los campos pendientes ({errorCount})
                  </p>
                  <p className="mt-0.5 text-rose-800/90">
                    Por favor completa los datos de contacto indicados antes de
                    enviar tu solicitud.
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-900"
              >
                <AlertCircle
                  className="h-5 w-5 shrink-0 text-rose-600 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">Error al guardar</p>
                  <p className="mt-0.5 text-rose-800/90">{submitError}</p>
                </div>
              </div>
            )}

            {/* SECCIÓN 1. DATOS GENERALES */}
            <section
              id="seccion-1"
              className="scroll-mt-20 rounded-2xl border border-sky-200/90 bg-white overflow-hidden shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)]"
            >
              <div className="border-b border-sky-100 bg-sky-50/65 px-6 sm:px-8 py-5">
                <p className="text-xs font-semibold text-sky-700 tabular-nums">
                  Sección 01 · Preguntas 1–6
                </p>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Datos Generales
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Información básica de contacto y de tu proyecto.
                </p>
              </div>

              <div className="px-6 sm:px-8 py-7 space-y-6">
                <TextField
                  id="fullName"
                  number="01"
                  label="Nombre completo del solicitante."
                  value={values.fullName}
                  onChange={(val) => setField('fullName', val)}
                  placeholder="Ej. María Fernanda López"
                  autoComplete="name"
                  required
                  icon={<User className="h-4 w-4" />}
                  error={errors.fullName}
                />

                <TextField
                  id="businessName"
                  number="02"
                  label="Nombre de la empresa, negocio, marca o proyecto."
                  value={values.businessName}
                  onChange={(val) => setField('businessName', val)}
                  placeholder="Ej. Estudio Horizonte / Café Brisa"
                  autoComplete="organization"
                  required
                  icon={<Building2 className="h-4 w-4" />}
                  error={errors.businessName}
                />

                <TextField
                  id="businessActivity"
                  number="03"
                  label="¿A qué se dedica tu negocio o proyecto?"
                  value={values.businessActivity}
                  onChange={(val) => setField('businessActivity', val)}
                  placeholder="Ej. Venta de repostería artesanal / Servicios de arquitectura"
                  required
                  error={errors.businessActivity}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <TextField
                    id="phone"
                    number="04"
                    label="Número de teléfono o WhatsApp de contacto."
                    type="tel"
                    value={values.phone}
                    onChange={(val) => setField('phone', val)}
                    placeholder="Ej. +52 55 1234 5678"
                    autoComplete="tel"
                    required
                    icon={<Phone className="h-4 w-4" />}
                    error={errors.phone}
                  />

                  <TextField
                    id="email"
                    number="05"
                    label="Correo electrónico principal."
                    type="email"
                    value={values.email}
                    onChange={(val) => setField('email', val)}
                    placeholder="Ej. contacto@tunegocio.com"
                    autoComplete="email"
                    required
                    icon={<Mail className="h-4 w-4" />}
                    error={errors.email}
                  />
                </div>

                <TextAreaField
                  id="address"
                  number="06"
                  label="Dirección física o ubicación del negocio (si aplica)."
                  value={values.address}
                  onChange={(val) => setField('address', val)}
                  placeholder="Calle, número, ciudad, país o indica si es un negocio 100% en línea"
                  rows={2}
                  optional
                />
              </div>
            </section>

            {/* SECCIÓN 2. INFORMACIÓN DE LA MARCA */}
            <section
              id="seccion-2"
              className="scroll-mt-20 rounded-2xl border border-sky-200/90 bg-white overflow-hidden shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)]"
            >
              <div className="border-b border-sky-100 bg-sky-50/65 px-6 sm:px-8 py-5">
                <p className="text-xs font-semibold text-sky-700 tabular-nums">
                  Sección 02 · Preguntas 7–10
                </p>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Información de la Marca
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Propósito, identidad visual y estilo deseado para tu sitio.
                </p>
              </div>

              <div className="px-6 sm:px-8 py-7 space-y-7">
                <TextAreaField
                  id="businessDescription"
                  number="07"
                  label="Describe brevemente tu negocio, empresa, marca o proyecto."
                  value={values.businessDescription}
                  onChange={(val) => setField('businessDescription', val)}
                  placeholder="Cuéntanos qué te diferencia, quién es tu público ideal y qué te gustaría transmitir..."
                  rows={3}
                  required
                  error={errors.businessDescription}
                />

                <RadioGroupField
                  id="mainGoal"
                  number="08"
                  label="¿Cuál es el objetivo principal de tu página web?"
                  options={MAIN_GOALS}
                  value={values.mainGoal}
                  onChange={(val) => setField('mainGoal', val)}
                  otherOptionLabel="Otro."
                  otherValue={values.mainGoalOther}
                  onOtherChange={(val) => setField('mainGoalOther', val)}
                  otherPlaceholder="Describe el objetivo principal de tu página..."
                  required
                  error={errors.mainGoal}
                  otherError={errors.mainGoalOther}
                />

                <RadioGroupField
                  id="brandIdentityStatus"
                  number="09"
                  label="¿Tu marca cuenta con logotipo, colores corporativos y eslogan?"
                  options={BRAND_IDENTITY_OPTIONS}
                  value={values.brandIdentityStatus}
                  onChange={(val) => setField('brandIdentityStatus', val)}
                  required
                  error={errors.brandIdentityStatus}
                />

                <CheckboxGroupField
                  id="styles"
                  number="10"
                  label="¿Qué estilo o apariencia te gustaría para tu página web?"
                  options={WEBSITE_STYLES}
                  values={values.styles}
                  onToggle={(option) => toggleArrayField('styles', option)}
                  otherOptionLabel="Otro."
                  otherValue={values.stylesOther}
                  onOtherChange={(val) => setField('stylesOther', val)}
                  otherPlaceholder="Describe el estilo visual que tienes en mente..."
                  required
                  error={errors.styles}
                  otherError={errors.stylesOther}
                />
              </div>
            </section>

            {/* SECCIÓN 3. REQUISITOS DE LA PÁGINA WEB */}
            <section
              id="seccion-3"
              className="scroll-mt-20 rounded-2xl border border-sky-200/90 bg-white overflow-hidden shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)]"
            >
              <div className="border-b border-sky-100 bg-sky-50/65 px-6 sm:px-8 py-5">
                <p className="text-xs font-semibold text-sky-700 tabular-nums">
                  Sección 03 · Preguntas 11–15
                </p>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Requisitos de la Página Web
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Tipo de sitio, secciones, funcionalidades y dominio actual.
                </p>
              </div>

              <div className="px-6 sm:px-8 py-7 space-y-7">
                <RadioGroupField
                  id="websiteType"
                  number="11"
                  label="¿Qué tipo de página web necesitas?"
                  options={WEBSITE_TYPES}
                  value={values.websiteType}
                  onChange={(val) => setField('websiteType', val)}
                  otherOptionLabel="Otro."
                  otherValue={values.websiteTypeOther}
                  onOtherChange={(val) => setField('websiteTypeOther', val)}
                  otherPlaceholder="Indica qué tipo de página web necesitas..."
                  required
                  error={errors.websiteType}
                  otherError={errors.websiteTypeOther}
                />

                <TextAreaField
                  id="productsOrServices"
                  number="12"
                  label="¿Qué productos, servicios o información deseas presentar en tu página?"
                  value={values.productsOrServices}
                  onChange={(val) => setField('productsOrServices', val)}
                  placeholder="Detalla tus principales productos, categorías, planes o servicios..."
                  rows={3}
                  required
                  error={errors.productsOrServices}
                />

                <CheckboxGroupField
                  id="sectionsToInclude"
                  number="13"
                  label="¿Qué secciones te gustaría incluir en tu página web?"
                  options={WEBSITE_SECTIONS}
                  values={values.sectionsToInclude}
                  onToggle={(option) =>
                    toggleArrayField('sectionsToInclude', option)
                  }
                  otherOptionLabel="Otra."
                  otherValue={values.sectionsOther}
                  onOtherChange={(val) => setField('sectionsOther', val)}
                  otherPlaceholder="Especifica qué otra sección te gustaría incluir..."
                  required
                  error={errors.sectionsToInclude}
                  otherError={errors.sectionsOther}
                />

                <CheckboxGroupField
                  id="featuresNeeded"
                  number="14"
                  label="¿Qué funcionalidades necesitas en tu página web?"
                  options={WEBSITE_FEATURES}
                  values={values.featuresNeeded}
                  onToggle={(option) =>
                    toggleArrayField('featuresNeeded', option)
                  }
                  otherOptionLabel="Otra."
                  otherValue={values.featuresOther}
                  onOtherChange={(val) => setField('featuresOther', val)}
                  otherPlaceholder="Especifica qué otra funcionalidad necesitas..."
                  required
                  error={errors.featuresNeeded}
                  otherError={errors.featuresOther}
                />

                {/* Question 15 with conditional domain input */}
                <div id="field-domainStatus" className="scroll-mt-24">
                  <fieldset>
                    <legend className="w-full">
                      <QuestionHeader
                        number="15"
                        label="¿Tienes un dominio o página web actualmente?"
                        hint="Selecciona una opción"
                        required
                      />
                    </legend>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DOMAIN_STATUS_OPTIONS.map((option) => {
                        const checked = values.domainStatus === option;
                        return (
                          <label
                            key={option}
                            className={`group flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl border text-sm sm:text-[15px] cursor-pointer transition-all duration-150 select-none ${
                              checked
                                ? 'border-sky-500 bg-sky-50/90 text-slate-900 font-medium shadow-[0_1px_8px_rgba(14,165,233,0.12)]'
                                : 'border-sky-200/80 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/40'
                            }`}
                          >
                            <input
                              type="radio"
                              name="domainStatus"
                              value={option}
                              checked={checked}
                              onChange={() => {
                                setField('domainStatus', option);
                                if (!DOMAIN_REQUIRING_OPTIONS.has(option)) {
                                  setErrors((prev) => {
                                    const next = {...prev};
                                    delete next.domainUrl;
                                    return next;
                                  });
                                }
                              }}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                checked
                                  ? 'border-sky-600 bg-sky-600'
                                  : 'border-sky-300 bg-white group-hover:border-sky-400'
                              }`}
                              aria-hidden="true"
                            >
                              {checked && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span className="leading-snug">{option}</span>
                          </label>
                        );
                      })}
                    </div>

                    <FieldError message={errors.domainStatus} />
                  </fieldset>

                  <AnimatePresence initial={false}>
                    {needsDomainInput && (
                      <motion.div
                        id="field-domainUrl"
                        key="domain-url-input"
                        initial={{opacity: 0, y: -6}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -6}}
                        transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                        className="mt-4 rounded-xl border border-sky-200 bg-sky-50/75 p-4 sm:p-5 scroll-mt-24"
                      >
                        <label
                          htmlFor="domainUrl"
                          className="block text-sm font-semibold text-slate-900"
                        >
                          ¿Cuál es tu dominio o página web?
                        </label>
                        <p className="mt-1 text-xs text-slate-600">
                          Escribe el nombre de tu dominio actual (por ejemplo:{' '}
                          <span className="font-medium text-sky-900">
                            minegocio.com
                          </span>{' '}
                          o{' '}
                          <span className="font-medium text-sky-900">
                            https://minegocio.com
                          </span>
                          ).
                        </p>
                        <div className="relative mt-3">
                          <div
                            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-600"
                            aria-hidden="true"
                          >
                            <Globe className="h-4 w-4" />
                          </div>
                          <input
                            id="domainUrl"
                            type="text"
                            value={values.domainUrl}
                            onChange={(e) => setField('domainUrl', e.target.value)}
                            placeholder="Ej. tudominio.com"
                            aria-invalid={Boolean(errors.domainUrl)}
                            className={`w-full min-h-[44px] rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm sm:text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 ${
                              errors.domainUrl
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                                : 'border-sky-300 focus:border-sky-500 focus:ring-sky-500/15'
                            }`}
                          />
                        </div>
                        <FieldError message={errors.domainUrl} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* SECCIÓN 4. RECURSOS Y PRESENCIA DIGITAL */}
            <section
              id="seccion-4"
              className="scroll-mt-20 rounded-2xl border border-sky-200/90 bg-white overflow-hidden shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)]"
            >
              <div className="border-b border-sky-100 bg-sky-50/65 px-6 sm:px-8 py-5">
                <p className="text-xs font-semibold text-sky-700 tabular-nums">
                  Sección 04 · Preguntas 16–18
                </p>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Recursos y Presencia Digital
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Materiales disponibles, sitios de inspiración y redes sociales.
                </p>
              </div>

              <div className="px-6 sm:px-8 py-7 space-y-7">
                <CheckboxGroupField
                  id="availableMaterials"
                  number="16"
                  label="¿Qué materiales tienes disponibles para utilizar en tu página web?"
                  options={AVAILABLE_MATERIALS}
                  values={values.availableMaterials}
                  onToggle={(option) =>
                    toggleArrayField('availableMaterials', option)
                  }
                  required
                  error={errors.availableMaterials}
                />

                <TextAreaField
                  id="attachmentLinks"
                  number="16b"
                  label="Enlaces de Imágenes / Adjuntos (Google Drive, Dropbox, WeTransfer, logotipo, etc.)."
                  value={values.attachmentLinks}
                  onChange={(val) => setField('attachmentLinks', val)}
                  placeholder="Si ya tienes una carpeta con fotos, logotipo o archivos, pega aquí los enlaces..."
                  rows={2}
                  optional
                />

                <TextAreaField
                  id="referenceLinks"
                  number="17"
                  label="Comparte enlaces de páginas web que te gusten o que sirvan como referencia para tu proyecto."
                  value={values.referenceLinks}
                  onChange={(val) => setField('referenceLinks', val)}
                  placeholder="Pega uno o varios enlaces y cuéntanos qué te gusta de ellos (diseño, colores, estructura)..."
                  rows={3}
                  optional
                />

                <TextAreaField
                  id="socialLinks"
                  number="18"
                  label="Comparte los enlaces de tus redes sociales."
                  value={values.socialLinks}
                  onChange={(val) => setField('socialLinks', val)}
                  placeholder="Ej. Instagram: @tumarca, Facebook: fb.com/tumarca, TikTok, LinkedIn..."
                  rows={3}
                  optional
                />
              </div>
            </section>

            {/* SECCIÓN 5. DETALLES FINALES */}
            <section
              id="seccion-5"
              className="scroll-mt-20 rounded-2xl border border-sky-200/90 bg-white overflow-hidden shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)]"
            >
              <div className="border-b border-sky-100 bg-sky-50/65 px-6 sm:px-8 py-5">
                <p className="text-xs font-semibold text-sky-700 tabular-nums">
                  Sección 05 · Preguntas 19–20
                </p>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Detalles Finales
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Plazos estimados e información adicional relevante.
                </p>
              </div>

              <div className="px-6 sm:px-8 py-7 space-y-7">
                <DateField
                  id="targetDate"
                  number="19"
                  label="¿En qué fecha te gustaría tener tu página web terminada?"
                  value={values.targetDate}
                  onChange={(val) => setField('targetDate', val)}
                  hint="Fecha estimada deseada"
                  optional
                />

                <TextAreaField
                  id="additionalNotes"
                  number="20"
                  label="¿Hay algún detalle, requisito o idea adicional que debamos conocer sobre tu proyecto?"
                  value={values.additionalNotes}
                  onChange={(val) => setField('additionalNotes', val)}
                  placeholder="Cualquier comentario, prioridad o duda adicional..."
                  rows={4}
                  optional
                />
              </div>
            </section>

            {/* Submit & Clear Action Bar */}
            <div className="rounded-2xl border border-sky-200/90 bg-white px-6 sm:px-8 py-6 shadow-[0_6px_28px_-12px_rgba(14,116,184,0.1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {!confirmClear ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-2 min-h-[42px] rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Limpiar formulario</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">
                      ¿Borrar todas las respuestas?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="min-h-[36px] rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                    >
                      Sí, limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="min-h-[36px] rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-sky-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2.5 min-h-[48px] rounded-xl bg-sky-600 px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_6px_20px_-6px_rgba(2,132,199,0.55)] transition-all duration-150 hover:bg-sky-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 disabled:opacity-65 cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Guardando en base de datos...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar solicitud</span>
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
