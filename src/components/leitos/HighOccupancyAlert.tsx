import { AlertTriangle, TrendingUp } from "lucide-react";

type Props = {
  count: number;
  percentage: number;
  isLoading?: boolean;
  recommendation?: string;
};

export default function HighOccupancyAlert({ count, percentage, isLoading = false, recommendation }: Props) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-5">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-orange-100 rounded mb-2"></div>
          <div className="h-4 w-full bg-orange-100 rounded"></div>
        </div>
      </div>
    );
  }

  const getSeverityColor = () => {
    if (percentage >= 90) return "from-red-50 to-red-100 border-red-300";
    if (percentage >= 80) return "from-orange-50 to-red-50 border-orange-200";
    return "from-yellow-50 to-orange-50 border-yellow-200";
  };

  const getIconColor = () => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    return "text-yellow-600";
  };

  const getSeverityText = () => {
    if (percentage >= 90) return "Situação Crítica";
    if (percentage >= 80) return "Atenção: Hospitais com Alta Ocupação";
    return "Monitoramento Necessário";
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${getSeverityColor()} p-5`}>
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 ${getIconColor()}`}>
            <AlertTriangle size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              {getSeverityText()}
              {percentage >= 80 && <TrendingUp size={16} className={getIconColor()} />}
            </h3>
            <p className="text-sm text-slate-700 mt-1">
              <span className="font-bold text-lg">{count}</span> hospitais com taxa de ocupação superior a 80%
              {percentage > 0 && <span className="text-slate-600"> ({percentage.toFixed(1)}% do total monitorado)</span>}
            </p>
            {recommendation && <p className="text-xs text-slate-600 mt-2 italic">{recommendation}</p>}
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${getIconColor()}`}>{percentage.toFixed(0)}%</div>
            <p className="text-xs text-slate-500">dos hospitais</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20" />
      <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-white/10" />
    </div>
  );
}
