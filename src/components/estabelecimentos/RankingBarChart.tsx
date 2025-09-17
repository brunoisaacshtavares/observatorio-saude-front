import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { formatNumber } from "../../utils/formatters";

type Props = {
  title: string;
  data: { estado: string; uf?: string; regiao?: string; color?: string; estabelecimentos: number }[];
  onBarClick?: (ufOrEstado: { uf?: string; estado: string }) => void;
  asc: boolean;
  onToggleAsc: () => void;
};

export default function RankingBarChart({ title, data, onBarClick, asc, onToggleAsc }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sorted = [...data].map((d) => ({ ...d, label: d.uf ?? d.estado })).sort((a, b) => (asc ? a.estabelecimentos - b.estabelecimentos : b.estabelecimentos - a.estabelecimentos));
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0]?.payload;
      if (!p) return null;
      return <div className="rounded-md bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-md ring-1 ring-slate-200">{`${p.estado}: ${formatNumber(p.estabelecimentos)}`}</div>;
    }
    return null;
  };
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{title}</p>
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
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
            barCategoryGap="25%"
            barGap={2}
            onMouseMove={(state: any) => {
              const idx = typeof state?.activeTooltipIndex === "number" ? state.activeTooltipIndex : null;
              setHoveredIndex(idx);
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip content={<CustomTooltip />} labelFormatter={() => ""} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
            <Bar dataKey="estabelecimentos" radius={[4, 4, 0, 0]} className="cursor-pointer" isAnimationActive animationBegin={0} animationDuration={350} animationEasing="ease-out" maxBarSize={40}>
              {sorted.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                return <Cell key={`cell-${entry.label}`} fill={entry.color || "#004F6D"} fillOpacity={isHovered ? 1 : 0.85} cursor="pointer" onClick={() => onBarClick?.({ uf: entry.uf, estado: entry.estado })} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
