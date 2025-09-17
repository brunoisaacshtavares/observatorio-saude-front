import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type Props = {
  title: string;
  data: { estado: string; uf?: string; regiao?: string; color?: string; estabelecimentos: number }[];
  onBarClick?: (ufOrEstado: { uf?: string; estado: string }) => void;
};

export default function RankingBarChart({ title, data, onBarClick }: Props) {
  const [asc, setAsc] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sorted = [...data].map((d) => ({ ...d, label: d.uf ?? d.estado })).sort((a, b) => (asc ? a.estabelecimentos - b.estabelecimentos : b.estabelecimentos - a.estabelecimentos));
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition" onClick={() => setAsc((v) => !v)} title={asc ? "Ordem: crescente (maior à direita)" : "Ordem: decrescente (maior à esquerda)"} aria-label={asc ? "Ordenar decrescente" : "Ordenar crescente"}>
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
            <Tooltip labelFormatter={() => ""} formatter={(value: any, _name: any, props: any) => [value, props.payload.estado]} />
            <Bar dataKey="estabelecimentos" radius={[4, 4, 0, 0]} className="cursor-pointer">
              {sorted.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                return <Cell key={`cell-${index}`} fill={entry.color || "#004F6D"} fillOpacity={isHovered ? 1 : 0.85} cursor="pointer" onClick={() => onBarClick?.({ uf: entry.uf, estado: entry.estado })} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
