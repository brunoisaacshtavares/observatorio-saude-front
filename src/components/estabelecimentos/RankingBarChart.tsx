import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type Props = {
  title: string;
  data: { estado: string; uf?: string; estabelecimentos: number }[];
};

export default function RankingBarChart({ title, data }: Props) {
  const [asc, setAsc] = useState(false);
  const sorted = [...data].map((d) => ({ ...d, label: d.uf ?? d.estado })).sort((a, b) => (asc ? a.estabelecimentos - b.estabelecimentos : b.estabelecimentos - a.estabelecimentos));
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition" onClick={() => setAsc((v) => !v)} title={asc ? "Ordem: crescente (maior à direita)" : "Ordem: decrescente (maior à esquerda)"} aria-label={asc ? "Ordenar decrescente" : "Ordenar crescente"}>
          <ArrowLeftRight size={16} className={`transition-transform duration-200 ${asc ? "rotate-180" : "rotate-0"}`} />
        </button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="estabelecimentos" radius={[4, 4, 0, 0]} fill="#004F6D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
