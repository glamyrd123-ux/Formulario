import React, {useEffect, useMemo, useState} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  ArrowLeft,
  Database,
  Download,
  Eye,
  LogOut,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {ADMIN_EMAIL, auth, googleProvider} from '../firebase';
import {
  DATABASE_CSV_HEADERS,
  deleteSolicitud,
  exportSolicitudesToCsv,
  SolicitudEstado,
  SolicitudRecord,
  subscribeSolicitudes,
  updateSolicitudEstado,
} from '../services/solicitudesService';

interface DatabaseViewProps {
  onBackToForm: () => void;
}

const ESTADOS: SolicitudEstado[] = [
  'Nueva',
  'En revisión',
  'Propuesta enviada',
  'Completada',
];

export const DatabaseView: React.FC<DatabaseViewProps> = ({onBackToForm}) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [records, setRecords] = useState<SolicitudRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [dataError, setDataError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todas');
  const [selectedRecord, setSelectedRecord] =
    useState<SolicitudRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthorizedAdmin = Boolean(
    user && user.email === ADMIN_EMAIL && user.emailVerified,
  );

  useEffect(() => {
    if (!authReady || !isAuthorizedAdmin) {
      setRecords([]);
      return;
    }

    setLoadingRecords(true);
    setDataError('');

    const unsub = subscribeSolicitudes(
      (data) => {
        setRecords(data);
        setLoadingRecords(false);
      },
      (err) => {
        setDataError(err.message);
        setLoadingRecords(false);
      },
    );

    return () => unsub();
  }, [authReady, isAuthorizedAdmin]);

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión con Google.',
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setRecords([]);
  };

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return records.filter((r) => {
      const matchesStatus =
        statusFilter === 'Todas' || r.estado === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        r.nombreCompleto.toLowerCase().includes(term) ||
        r.empresaProyecto.toLowerCase().includes(term) ||
        r.correo.toLowerCase().includes(term) ||
        r.telefono.toLowerCase().includes(term) ||
        r.dominioPaginaActual.toLowerCase().includes(term)
      );
    });
  }, [records, searchTerm, statusFilter]);

  const handleEstadoChange = async (id: string, estado: SolicitudEstado) => {
    await updateSolicitudEstado(id, estado);
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev) => (prev ? {...prev, estado} : null));
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSolicitud(id);
    setConfirmDeleteId(null);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F1FE] via-[#F0F7FF] to-[#E6F3FF] text-slate-900 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-white px-6 py-5 shadow-[0_6px_28px_-12px_rgba(14,116,184,0.12)]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                Base de Datos · Solicitudes de Páginas Web
              </h1>
              <p className="text-xs text-slate-500">
                22 columnas sincronizadas en tiempo real · Exportable a CSV
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToForm}
              className="inline-flex items-center gap-2 min-h-[40px] rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Volver al formulario</span>
            </button>

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 min-h-[40px] rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-sky-100 cursor-pointer whitespace-nowrap"
              >
                <LogOut className="h-4 w-4 text-sky-700" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>

        {!authReady ? (
          <div className="rounded-2xl border border-sky-200 bg-white p-10 text-center text-sm text-slate-600">
            Verificando sesión...
          </div>
        ) : !user ? (
          <div className="mx-auto max-w-md rounded-2xl border border-sky-200 bg-white p-8 text-center shadow-[0_6px_28px_-12px_rgba(14,116,184,0.12)]">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Acceso de administrador
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Para proteger los datos de tus clientes, inicia sesión con tu cuenta
              de Google autorizada ({ADMIN_EMAIL}) para consultar y descargar la
              base de datos.
            </p>
            {authError && (
              <p className="mt-3 text-xs font-medium text-rose-700">
                {authError}
              </p>
            )}
            <button
              type="button"
              onClick={handleSignIn}
              disabled={authLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 min-h-[44px] rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>
                {authLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
              </span>
            </button>
          </div>
        ) : !isAuthorizedAdmin ? (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Cuenta sin permisos de lectura
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Iniciaste sesión como <span className="font-medium">{user.email}</span>,
              pero solo la cuenta administradora ({ADMIN_EMAIL}) puede consultar
              las solicitudes registradas.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 cursor-pointer"
            >
              Cambiar de cuenta
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-sky-200 bg-white overflow-hidden shadow-[0_6px_28px_-12px_rgba(14,116,184,0.12)]">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sky-100 bg-sky-50/60 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, empresa o dominio..."
                    className="w-full min-h-[40px] rounded-xl border border-sky-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/15"
                  />
                </div>

                <select
                  aria-label="Filtrar por estado"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-[40px] rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Todas">Todos los estados</option>
                  {ESTADOS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {filteredRecords.length}{' '}
                  {filteredRecords.length === 1 ? 'registro' : 'registros'}
                </span>
                <button
                  type="button"
                  disabled={filteredRecords.length === 0}
                  onClick={() => exportSolicitudesToCsv(filteredRecords)}
                  className="inline-flex items-center gap-2 min-h-[40px] rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {dataError && (
              <div className="p-6 text-sm text-rose-700">{dataError}</div>
            )}

            {loadingRecords ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Cargando solicitudes desde la base de datos...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-display text-base font-semibold text-slate-900">
                  Aún no hay solicitudes registradas
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Cuando un cliente envíe el formulario, toda su información
                  aparecerá aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-sky-100 bg-sky-50/40 text-xs font-semibold text-slate-600">
                      <th className="px-4 py-3 whitespace-nowrap">Acciones</th>
                      <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                      {DATABASE_CSV_HEADERS.map((header) => (
                        <th key={header} className="px-4 py-3 whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {filteredRecords.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-sky-50/40 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(r)}
                              title="Ver detalle completo"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-700 hover:bg-sky-50 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {confirmDeleteId === r.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(r.id)}
                                  className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                                >
                                  Borrar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(r.id)}
                                title="Eliminar registro"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            aria-label={`Estado de ${r.nombreCompleto}`}
                            value={r.estado}
                            onChange={(e) =>
                              handleEstadoChange(
                                r.id,
                                e.target.value as SolicitudEstado,
                              )
                            }
                            className="rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-sky-500 focus:outline-none"
                          >
                            {ESTADOS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">
                          {r.fechaSolicitud}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                          {r.nombreCompleto}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-800">
                          {r.empresaProyecto || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-700">
                          {r.actividad || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">
                          {r.telefono}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {r.correo}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">
                          {r.direccion || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[240px] truncate text-slate-600">
                          {r.descripcionMarca || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-700">
                          {r.objetivoWeb || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {r.identidadVisual || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-700">
                          {r.estiloApariencia || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {r.tipoPaginaWeb || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[240px] truncate text-slate-600">
                          {r.productosServicios || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-600">
                          {r.seccionesIncluir || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-600">
                          {r.funcionalidadesNecesarias || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[260px] truncate font-medium text-sky-800">
                          {r.dominioPaginaActual || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-600">
                          {r.materialesDisponibles || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">
                          {r.referenciasWeb || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">
                          {r.redesSociales || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">
                          {r.fechaEntregaDeseada || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-600">
                          {r.detallesAdicionales || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[220px] truncate text-slate-600">
                          {r.enlacesAdjuntos || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-sky-200 bg-white p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
              <div>
                <p className="text-xs font-semibold text-sky-700 tabular-nums">
                  {selectedRecord.fechaSolicitud} · {selectedRecord.estado}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                  {selectedRecord.empresaProyecto || selectedRecord.nombreCompleto}
                </h2>
                <p className="text-sm text-slate-600">
                  {selectedRecord.nombreCompleto}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Cerrar detalle"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 text-slate-500 hover:bg-sky-50 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-5 divide-y divide-sky-100 text-sm">
              {[
                ['Fecha de Solicitud', selectedRecord.fechaSolicitud],
                ['Nombre completo', selectedRecord.nombreCompleto],
                [
                  'Empresa, negocio o proyecto',
                  selectedRecord.empresaProyecto || '—',
                ],
                ['A qué se dedica', selectedRecord.actividad || '—'],
                ['Teléfono / WhatsApp', selectedRecord.telefono],
                ['Correo electrónico', selectedRecord.correo],
                ['Dirección', selectedRecord.direccion || '—'],
                [
                  'Descripción de la marca',
                  selectedRecord.descripcionMarca || '—',
                ],
                ['Objetivo de la web', selectedRecord.objetivoWeb || '—'],
                ['Identidad visual', selectedRecord.identidadVisual || '—'],
                [
                  'Estilo o apariencia',
                  selectedRecord.estiloApariencia || '—',
                ],
                ['Tipo de página web', selectedRecord.tipoPaginaWeb || '—'],
                [
                  'Productos o servicios a presentar',
                  selectedRecord.productosServicios || '—',
                ],
                [
                  'Secciones a incluir',
                  selectedRecord.seccionesIncluir || '—',
                ],
                [
                  'Funcionalidades necesarias',
                  selectedRecord.funcionalidadesNecesarias || '—',
                ],
                [
                  'Dominio o página actual',
                  selectedRecord.dominioPaginaActual || '—',
                ],
                [
                  'Materiales disponibles',
                  selectedRecord.materialesDisponibles || '—',
                ],
                ['Referencias web', selectedRecord.referenciasWeb || '—'],
                ['Redes sociales', selectedRecord.redesSociales || '—'],
                [
                  'Fecha de entrega deseada',
                  selectedRecord.fechaEntregaDeseada || '—',
                ],
                [
                  'Detalles adicionales',
                  selectedRecord.detallesAdicionales || '—',
                ],
                [
                  'Enlaces de Imágenes / Adjuntos',
                  selectedRecord.enlacesAdjuntos || '—',
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2.5"
                >
                  <dt className="font-medium text-slate-600">{k}</dt>
                  <dd className="sm:col-span-2 text-slate-900 whitespace-pre-line break-words">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};
