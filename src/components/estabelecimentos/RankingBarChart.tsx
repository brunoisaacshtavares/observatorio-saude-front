import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useState, forwardRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import { REGION_COLORS } from "../../utils/colors";
import { formatNumber } from "../../utils/formatters";

type Props = {
  title: string;
  data: { estado: string; uf?: string; regiao?: string; color?: string; estabelecimentos: number }[];
  onBarClick?: (ufOrEstado: { uf?: string; estado: string }) => void;
  asc?: boolean;
  onToggleAsc?: () => void;
  hideControls?: boolean;
  disableInteractions?: boolean;
};

type ChartDataItem = {
  estado: string;
  uf?: string;
  regiao?: string;
  color?: string;
  estabelecimentos: number;
  label: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    payload: ChartDataItem;
  }[];
};


const RankingBarChart = forwardRef<HTMLDivElement, Props>(
  ({ title, data, onBarClick, asc = false, onToggleAsc, hideControls = false, disableInteractions = false }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const sorted: ChartDataItem[] = [...data]
      .map((d) => ({ ...d, label: d.uf ?? d.estado }))
      .sort((a, b) => (asc ? a.estabelecimentos - b.estabelecimentos : b.estabelecimentos - a.estabelecimentos));

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
      if (active && payload && payload.length) {
        const p = payload[0]?.payload;
        if (!p) return null;
        return <div className="rounded-md bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-md ring-1 ring-slate-200">{`${p.estado}: ${formatNumber(p.estabelecimentos)}`}</div>;
      }
      return null;
    };
    return (
      <div className="card p-4" ref={ref}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">{title}</p>
          {!hideControls && onToggleAsc ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white bg-gradient-to-r from-[#004F6D] to-[#00A67D] shadow-sm ring-1 ring-white/20 hover:opacity-95 transition"
              onClick={() => {
                onToggleAsc();
                setHoveredIndex(null);
              }}
              title={asc ? "Ordem: crescente (maior à direita)" : "Ordem: decrescente (maior à esquerda)"}
              aria-label={asc ? "Ordenar decrescente" : "Ordenar crescente"}
            >
              <ArrowLeftRight size={16} className={`transition-transform duration-200 ${asc ? "rotate-180" : "rotate-0"}`} />
            </button>
          ) : null}
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
              barCategoryGap="25%"
              barGap={2}
              onMouseMove={
                disableInteractions
                  ? undefined
                  : (state) => {
                      const idx = typeof state?.activeTooltipIndex === "number" ? state.activeTooltipIndex : null;
                      setHoveredIndex(idx);
                    }
              }
              onMouseLeave={disableInteractions ? undefined : () => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip content={<CustomTooltip />} labelFormatter={() => ""} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
              <Bar dataKey="estabelecimentos" radius={[4, 4, 0, 0]} className={disableInteractions ? undefined : "cursor-pointer"} isAnimationActive animationBegin={0} animationDuration={350} animationEasing="ease-out" maxBarSize={40}>
                {sorted.map((entry, index) => {
                  const isHovered = hoveredIndex === index;
                  return <Cell key={`cell-${entry.label}`} fill={entry.color || "#004F6D"} fillOpacity={disableInteractions ? 0.85 : isHovered ? 1 : 0.85} cursor={disableInteractions ? undefined : "pointer"} onClick={disableInteractions ? undefined : () => onBarClick?.({ uf: entry.uf, estado: entry.estado })} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-nowrap items-center justify-between text-xs text-slate-600 w-[90%] mx-auto">
          {(
            [
              { nome: "Norte", cor: REGION_COLORS["Norte"] },
              { nome: "Nordeste", cor: REGION_COLORS["Nordeste"] },
              { nome: "Centro-Oeste", cor: REGION_COLORS["Centro-Oeste"] },
              { nome: "Sudeste", cor: REGION_COLORS["Sudeste"] },
              { nome: "Sul", cor: REGION_COLORS["Sul"] },
            ] as const
          ).map((r) => (
            <div key={r.nome} className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: r.cor }} aria-hidden />
              <span className="text-slate-700">{r.nome}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

RankingBarChart.displayName = 'RankingBarChart';

export default RankingBarChart;