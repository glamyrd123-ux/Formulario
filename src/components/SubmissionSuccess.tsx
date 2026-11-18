import React, {useState} from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Printer,
  RotateCcw,
} from 'lucide-react';
import {DOMAIN_REQUIRING_OPTIONS, FormValues} from '../types/form';

interface SubmissionSuccessProps {
  values: FormValues;
  recordId?: string | null;
  onReset: () => void;
}

function formatSummaryText(values: FormValues): string {
  const joinWithOther = (items: string[], otherLabel: string, otherText: string) => {
    if (items.length === 0) return 'No especificado';
    return items
      .map((item) =>
        item === otherLabel && otherText.trim()
          ? `${item} (${otherText.trim()})`
          : item,
      )
      .join(', ');
  };

  const singleWithOther = (val: string, otherLabel: string, otherText: string) => {
    if (!val) return 'No especificado';
    if (val === otherLabel && otherText.trim()) {
      return `${val} (${otherText.trim()})`;
    }
    return val;
  };

  const hasDomain = DOMAIN_REQUIRING_OPTIONS.has(values.domainStatus);

  return [
    'SOLICITUD DE INFORMACIÓN PARA DISEÑO WEB Y MARCA',
    '================================================',
    '',
    'SECCIÓN 1. DATOS GENERALES',
    `1. Nombre completo del solicitante: ${values.fullName || 'No especificado'}`,
    `2. Empresa, negocio, marca o proyecto: ${values.businessName || 'No especificado'}`,
    `3. Actividad del negocio o proyecto: ${values.businessActivity || 'No especificado'}`,
    `4. Teléfono o WhatsApp: ${values.phone || 'No especificado'}`,
    `5. Correo electrónico principal: ${values.email || 'No especificado'}`,
    `6. Dirección física o ubicación: ${values.address || 'No aplica / No especificado'}`,
    '',
    'SECCIÓN 2. INFORMACIÓN DE LA MARCA',
    `7. Descripción del negocio: ${values.businessDescription || 'No especificado'}`,
    `8. Objetivo principal: ${singleWithOther(values.mainGoal, 'Otro.', values.mainGoalOther)}`,
    `9. Identidad visual actual: ${values.brandIdentityStatus || 'No especificado'}`,
    `10. Estilo deseado: ${joinWithOther(values.styles, 'Otro.', values.stylesOther)}`,
    '',
    'SECCIÓN 3. REQUISITOS DE LA PÁGINA WEB',
    `11. Tipo de página web: ${singleWithOther(values.websiteType, 'Otro.', values.websiteTypeOther)}`,
    `12. Productos, servicios o información a presentar: ${values.productsOrServices || 'No especificado'}`,
    `13. Secciones a incluir: ${joinWithOther(values.sectionsToInclude, 'Otra.', values.sectionsOther)}`,
    `14. Funcionalidades necesarias: ${joinWithOther(values.featuresNeeded, 'Otra.', values.featuresOther)}`,
    `15. Dominio o página web actual: ${values.domainStatus || 'No especificado'}`,
    ...(hasDomain
      ? [`    Dominio indicado: ${values.domainUrl || 'No especificado'}`]
      : []),
    '',
    'SECCIÓN 4. RECURSOS Y PRESENCIA DIGITAL',
    `16. Materiales disponibles: ${values.availableMaterials.length > 0 ? values.availableMaterials.join(', ') : 'No especificado'}`,
    `17. Enlaces de referencia: ${values.referenceLinks || 'No especificado'}`,
    `18. Enlaces de redes sociales: ${values.socialLinks || 'No especificado'}`,
    `    Enlaces de Imágenes / Adjuntos: ${values.attachmentLinks || 'No especificado'}`,
    '',
    'SECCIÓN 5. DETALLES FINALES',
    `19. Fecha deseada de entrega: ${values.targetDate || 'Sin fecha definida'}`,
    `20. Detalles o ideas adicionales: ${values.additionalNotes || 'Ninguno'}`,
  ].join('\n');
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  values,
  recordId,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const summaryText = formatSummaryText(values);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = summaryText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summaryText], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (values.businessName || values.fullName || 'solicitud')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/(^-|-$)/g, '');
    link.href = url;
    link.download = `solicitud-diseno-web-${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasDomain = DOMAIN_REQUIRING_OPTIONS.has(values.domainStatus);

  const summaryRows: Array<{label: string; value: string}> = [
    {label: '01. Solicitante', value: values.fullName || 'No especificado'},
    {label: '02. Empresa o marca', value: values.businessName || 'No especificado'},
    {label: '03. Actividad', value: values.businessActivity || 'No especificado'},
    {label: '04. Teléfono / WhatsApp', value: values.phone || 'No especificado'},
    {label: '05. Correo electrónico', value: values.email || 'No especificado'},
    {label: '06. Ubicación', value: values.address || 'No especificado'},
    {label: '07. Descripción', value: values.businessDescription || 'No especificado'},
    {
      label: '08. Objetivo principal',
      value:
        values.mainGoal === 'Otro.' && values.mainGoalOther
          ? `Otro: ${values.mainGoalOther}`
          : values.mainGoal || 'No especificado',
    },
    {label: '09. Identidad visual', value: values.brandIdentityStatus || 'No especificado'},
    {
      label: '10. Estilo deseado',
      value:
        values.styles.length > 0
          ? values.styles
              .map((s) =>
                s === 'Otro.' && values.stylesOther
                  ? `Otro: ${values.stylesOther}`
                  : s,
              )
              .join(', ')
          : 'No especificado',
    },
    {
      label: '11. Tipo de página',
      value:
        values.websiteType === 'Otro.' && values.websiteTypeOther
          ? `Otro: ${values.websiteTypeOther}`
          : values.websiteType || 'No especificado',
    },
    {label: '12. Contenido a presentar', value: values.productsOrServices || 'No especificado'},
    {
      label: '13. Secciones',
      value:
        values.sectionsToInclude.length > 0
          ? values.sectionsToInclude
              .map((s) =>
                s === 'Otra.' && values.sectionsOther
                  ? `Otra: ${values.sectionsOther}`
                  : s,
              )
              .join(', ')
          : 'No especificado',
    },
    {
      label: '14. Funcionalidades',
      value:
        values.featuresNeeded.length > 0
          ? values.featuresNeeded
              .map((s) =>
                s === 'Otra.' && values.featuresOther
                  ? `Otra: ${values.featuresOther}`
                  : s,
              )
              .join(', ')
          : 'No especificado',
    },
    {
      label: '15. Dominio / sitio actual',
      value:
        hasDomain && values.domainUrl
          ? `${values.domainStatus} — Dominio: ${values.domainUrl}`
          : values.domainStatus || 'No especificado',
    },
    {
      label: '16. Materiales disponibles',
      value:
        values.availableMaterials.length > 0
          ? values.availableMaterials.join(', ')
          : 'No especificado',
    },
    {
      label: '17. Enlaces de referencia',
      value: values.referenceLinks || 'No especificado',
    },
    {
      label: '18. Redes sociales',
      value: values.socialLinks || 'No especificado',
    },
    {
      label: 'Imágenes / Adjuntos',
      value: values.attachmentLinks || 'No especificado',
    },
    {
      label: '19. Fecha deseada',
      value: values.targetDate || 'Sin fecha definida',
    },
    {
      label: '20. Notas adicionales',
      value: values.additionalNotes || 'Ninguno',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="rounded-2xl border border-sky-200 bg-white p-6 sm:p-10 shadow-[0_8px_36px_-12px_rgba(14,116,184,0.14)]">
        <div className="flex flex-col items-start gap-4 border-b border-sky-100 pb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-sky-700">
              Guardado en la base de datos
              {recordId ? ` · Registro ${recordId}` : ''}
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              ¡Gracias por completar nuestro formulario!
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Agradecemos tu interés en nuestros servicios. La información
              proporcionada quedó registrada en nuestra base de datos y nos
              permitirá conocer mejor tu proyecto para planificar una propuesta
              adaptada a tus necesidades.
            </p>
            <p className="mt-2 text-sm sm:text-base font-semibold text-sky-700">
              ¡Estamos encantados de trabajar contigo!
            </p>
          </div>

          <div className="no-print mt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 min-h-[40px] rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/25 cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Resumen copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span>Copiar resumen</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 min-h-[40px] rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-2 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-100/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20 cursor-pointer whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Descargar (.txt)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 min-h-[40px] rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20 cursor-pointer whitespace-nowrap"
            >
              <Printer className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-base font-semibold text-slate-900 mb-4">
            Resumen de tu información
          </h2>
          <dl className="divide-y divide-sky-100 rounded-xl border border-sky-100 bg-sky-50/35">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 py-3 text-sm"
              >
                <dt className="font-medium text-slate-600 tabular-nums">
                  {row.label}
                </dt>
                <dd className="sm:col-span-2 text-slate-900 whitespace-pre-line break-words">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="no-print mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-sky-100 pt-6">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 min-h-[40px] rounded-xl px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Enviar otra solicitud</span>
          </button>
        </div>
      </div>
    </div>
  );
};
