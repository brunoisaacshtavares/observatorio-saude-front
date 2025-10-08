import { MapPin, AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

type Hospital = {
  id: string;
  nome: string;
  localizacao: string;
  leitosTotal: number;
  leitosDisponiveis: number;
  percentualOcupacao: number;
};

type Props = {
  hospitals: Hospital[];
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function HospitalsList({ hospitals, isLoading = false, page, totalPages, onPrev, onNext }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [page]);
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPercentageTextColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Principais Hospitais</h3>
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
      <h3 className="text-base font-semibold text-slate-900 mb-4">Principais Hospitais</h3>

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
                {hospital.percentualOcupacao >= 80 && <AlertTriangle size={16} className="text-orange-500" />}
                <div className={`px-2 py-1 rounded-full ${getOccupancyColor(hospital.percentualOcupacao)} bg-opacity-10`}>
                  <span className={`text-sm font-bold ${getPercentageTextColor(hospital.percentualOcupacao)}`}>{hospital.percentualOcupacao}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Ocupação</span>
                <span className="text-slate-900 font-medium">
                  {hospital.leitosTotal - hospital.leitosDisponiveis} / {hospital.leitosTotal} leitos
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${getProgressBarColor(hospital.percentualOcupacao)}`} style={{ width: `${hospital.percentualOcupacao}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Disponíveis: {hospital.leitosDisponiveis}</span>
                <span className="text-slate-500">Total: {hospital.leitosTotal}</span>
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
