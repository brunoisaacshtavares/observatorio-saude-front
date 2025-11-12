import { MapPin, Search } from "lucide-react";
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
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onHospitalClick?: (hospitalId: string) => void;
};

export default function HospitalsList({ 
  hospitals, 
  isLoading = false, 
  page, 
  totalPages, 
  onPrev, 
  onNext, 
  ufOptions = [], 
  selectedUf, 
  onChangeUf, 
  searchQuery, 
  onSearchChange,
  onHospitalClick
}: Props) {
  
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

        <div className="relative mb-4">
          <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
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

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou código CNES..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div ref={listRef} className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {hospitals.map((hospital) => (
          <div 
            key={hospital.id} 
            className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer"
            onClick={() => onHospitalClick?.(hospital.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{hospital.nome}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-slate-400 min-w-fit" />
                  <p className="text-xs text-slate-600 truncate">{hospital.localizacao}</p>
                </div>
              </div>

              <div className="flex flex-col text-right gap-0.5 min-w-[120px]">
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Leitos:</span>
                  <span className="text-xs font-extrabold text-blue-600/90 whitespace-nowrap">
                    {hospital.leitosTotal.toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Leitos SUS:</span>
                  <span className="text-xs font-extrabold text-green-600/90 whitespace-nowrap">
                    {hospital.leitosSus.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {page !== undefined && totalPages !== undefined && (
        <div className="mt-4 flex items-center justify-between">
          <button type="button" className="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition" onClick={onPrev} disabled={page <= 1}>
            Anterior
          </button>
          <div className="text-xs text-slate-600">
            Página {page} de {Math.max(totalPages, 1)}
          </div>
          <button type="button" className="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition" onClick={onNext} disabled={page >= (totalPages || 1)}>
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
