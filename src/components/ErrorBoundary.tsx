import React from 'react';
import {AlertCircle, RotateCcw} from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  {children: React.ReactNode},
  ErrorBoundaryState
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, message: ''};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Ha ocurrido un error inesperado.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EBF5FF] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-sky-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h1 className="font-display text-lg font-bold text-slate-900">
                No se pudo completar la operación
              </h1>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Ocurrió un problema al comunicarnos con la base de datos. Intenta
              recargar la página para continuar.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Recargar página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
