import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

type Hospital = {
  id: string;
  nome: string;
  localizacao: string;
  leitosTotal: number;
  leitosSus: number;
};

type UfOption = { value: string; label: string };

type Props = {
  hospitals: Hospital[];
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
  ufOptions?: UfOption[];
  selectedUf?: string;
  onChangeUf?: (uf?: string) => void;
};

export default function HospitalsList({ hospitals, isLoading = false, page, totalPages, onPrev, onNext, ufOptions = [], selectedUf, onChangeUf }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">Principais Hospitais</h3>
          <div className="h-8 w-40 bg-slate-100 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Principais Hospitais</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="uf-select" className="text-xs text-slate-600 whitespace-nowrap">
            UF
          </label>
          <select id="uf-select" className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" value={selectedUf ?? ""} onChange={(e) => onChangeUf?.(e.target.value || undefined)}>
            <option value="">Todos (BR)</option>
            {ufOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={listRef} className="space-y-3 max-h-96 overflow-y-auto">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{hospital.nome}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-600">{hospital.localizacao}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Leitos: {hospital.leitosTotal}</span>
                  <span className="text-sm font-bold">Leitos Sus: {hospital.leitosSus}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {page !== undefined && totalPages !== undefined && (
        <div className="mt-4 flex items-center justify-between">
          <button type="button" className="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-700 disabled:opacity-50" onClick={onPrev} disabled={page <= 1}>
            Anterior
          </button>
          <div className="text-xs text-slate-600">
            Página {page} de {Math.max(totalPages, 1)}
          </div>
          <button type="button" className="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-700 disabled:opacity-50" onClick={onNext} disabled={page >= (totalPages || 1)}>
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
