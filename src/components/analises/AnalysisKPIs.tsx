import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type KpiProps = {
  label: string;
  valor: number;
  delta: number;
};

function KpiCard({ label, valor, delta }: KpiProps) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0 || !isFinite(delta);
  const Icon = isPositive ? ArrowUpRight : isNeutral ? Minus : ArrowDownRight;
  const color = isPositive ? "text-green-600" : isNeutral ? "text-slate-500" : "text-red-600";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="flex items-end justify-between gap-4 mt-1">
        <p className="text-3xl font-bold text-slate-800">{valor.toLocaleString("pt-BR")}</p>
        <div className={`flex items-center gap-0.5 ${color}`}>
          <Icon size={16} />
          <span className="text-sm font-semibold">{isNeutral ? "..." : `${delta.toFixed(1)}%`}</span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  data: {
    totalLeitos: { valor: number; delta: number };
    leitosSus: { valor: number; delta: number };
    criticos: { valor: number; delta: number };
    anoBase: number;
    anoComparacao: number;
  } | null;
};

export default function AnalysisKPIs({ data }: Props) {
  if (!data) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-2">
        Resumo: {data.anoComparacao} vs. {data.anoBase}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total de Leitos" {...data.totalLeitos} />
        <KpiCard label="Leitos SUS" {...data.leitosSus} />
        <KpiCard label="Leitos Críticos" {...data.criticos} />
      </div>
    </div>
  );
}