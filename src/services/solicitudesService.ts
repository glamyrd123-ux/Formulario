import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {db, handleFirestoreError, OperationType} from '../firebase';
import {DOMAIN_REQUIRING_OPTIONS, FormValues} from '../types/form';

export type SolicitudEstado =
  | 'Nueva'
  | 'En revisión'
  | 'Propuesta enviada'
  | 'Completada';

export interface SolicitudRecord {
  id: string;
  fechaSolicitud: string;
  nombreCompleto: string;
  empresaProyecto: string;
  actividad: string;
  telefono: string;
  correo: string;
  direccion: string;
  descripcionMarca: string;
  objetivoWeb: string;
  identidadVisual: string;
  estiloApariencia: string;
  tipoPaginaWeb: string;
  productosServicios: string;
  seccionesIncluir: string;
  funcionalidadesNecesarias: string;
  dominioPaginaActual: string;
  materialesDisponibles: string;
  referenciasWeb: string;
  redesSociales: string;
  fechaEntregaDeseada: string;
  detallesAdicionales: string;
  enlacesAdjuntos: string;
  estado: SolicitudEstado;
  createdAt?: Timestamp | null;
}

const COLLECTION_NAME = 'solicitudes';

function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function formatCurrentDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function generateSolicitudId(): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `sol_${Date.now()}_${random}`;
}

export function mapFormValuesToPayload(values: FormValues) {
  const joinWithOther = (
    items: string[],
    otherLabel: string,
    otherText: string,
  ) =>
    items
      .map((item) =>
        item === otherLabel && otherText.trim()
          ? `${item} (${otherText.trim()})`
          : item,
      )
      .join(', ');

  const singleWithOther = (
    val: string,
    otherLabel: string,
    otherText: string,
  ) => {
    if (val === otherLabel && otherText.trim()) {
      return `${val} (${otherText.trim()})`;
    }
    return val;
  };

  const hasDomain = DOMAIN_REQUIRING_OPTIONS.has(values.domainStatus);
  const dominioFormatted =
    hasDomain && values.domainUrl.trim()
      ? `${values.domainStatus} — Dominio: ${values.domainUrl.trim()}`
      : values.domainStatus;

  return {
    fechaSolicitud: truncate(formatCurrentDateTime(), 40),
    nombreCompleto: truncate(values.fullName, 160),
    empresaProyecto: truncate(values.businessName, 160),
    actividad: truncate(values.businessActivity, 300),
    telefono: truncate(values.phone, 60),
    correo: truncate(values.email, 160),
    direccion: truncate(values.address, 500),
    descripcionMarca: truncate(values.businessDescription, 2000),
    objetivoWeb: truncate(
      singleWithOther(values.mainGoal, 'Otro.', values.mainGoalOther),
      300,
    ),
    identidadVisual: truncate(values.brandIdentityStatus, 200),
    estiloApariencia: truncate(
      joinWithOther(values.styles, 'Otro.', values.stylesOther),
      400,
    ),
    tipoPaginaWeb: truncate(
      singleWithOther(values.websiteType, 'Otro.', values.websiteTypeOther),
      300,
    ),
    productosServicios: truncate(values.productsOrServices, 3000),
    seccionesIncluir: truncate(
      joinWithOther(values.sectionsToInclude, 'Otra.', values.sectionsOther),
      600,
    ),
    funcionalidadesNecesarias: truncate(
      joinWithOther(values.featuresNeeded, 'Otra.', values.featuresOther),
      600,
    ),
    dominioPaginaActual: truncate(dominioFormatted, 400),
    materialesDisponibles: truncate(values.availableMaterials.join(', '), 600),
    referenciasWeb: truncate(values.referenceLinks, 2000),
    redesSociales: truncate(values.socialLinks, 1000),
    fechaEntregaDeseada: truncate(values.targetDate, 40),
    detallesAdicionales: truncate(values.additionalNotes, 3000),
    enlacesAdjuntos: truncate(values.attachmentLinks, 2000),
    estado: 'Nueva' as const,
    createdAt: serverTimestamp(),
  };
}

export async function saveSolicitudToDatabase(
  values: FormValues,
): Promise<string> {
  const id = generateSolicitudId();
  const path = `${COLLECTION_NAME}/${id}`;
  const payload = mapFormValuesToPayload(values);

  try {
    await setDoc(doc(db, COLLECTION_NAME, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeSolicitudes(
  onData: (records: SolicitudRecord[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SolicitudRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SolicitudRecord, 'id'>),
      }));
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    },
  );
}

export async function updateSolicitudEstado(
  id: string,
  estado: SolicitudEstado,
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {estado});
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSolicitud(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export const DATABASE_CSV_HEADERS = [
  'Fecha de Solicitud',
  'Nombre completo',
  'Empresa, negocio o proyecto',
  'A qué se dedica',
  'Teléfono / WhatsApp',
  'Correo electrónico',
  'Dirección',
  'Descripción de la marca',
  'Objetivo de la web',
  'Identidad visual',
  'Estilo o apariencia',
  'Tipo de página web',
  'Productos o servicios a presentar',
  'Secciones a incluir',
  'Funcionalidades necesarias',
  'Dominio o página actual',
  'Materiales disponibles',
  'Referencias web',
  'Redes sociales',
  'Fecha de entrega deseada',
  'Detalles adicionales',
  'Enlaces de Imágenes / Adjuntos',
] as const;

function csvEscape(value: string): string {
  const str = value ?? '';
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportSolicitudesToCsv(records: SolicitudRecord[]): void {
  const headerLine = DATABASE_CSV_HEADERS.map(csvEscape).join(',');
  const rows = records.map((r) =>
    [
      r.fechaSolicitud,
      r.nombreCompleto,
      r.empresaProyecto,
      r.actividad,
      r.telefono,
      r.correo,
      r.direccion,
      r.descripcionMarca,
      r.objetivoWeb,
      r.identidadVisual,
      r.estiloApariencia,
      r.tipoPaginaWeb,
      r.productosServicios,
      r.seccionesIncluir,
      r.funcionalidadesNecesarias,
      r.dominioPaginaActual,
      r.materialesDisponibles,
      r.referenciasWeb,
      r.redesSociales,
      r.fechaEntregaDeseada,
      r.detallesAdicionales,
      r.enlacesAdjuntos,
    ]
      .map(csvEscape)
      .join(','),
  );

  const csvContent = '\uFEFF' + [headerLine, ...rows].join('\r\n');
  const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Base_de_Datos_-_Solicitud_de_Paginas_Web.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
