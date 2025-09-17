import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, Cell } from "recharts";

type Props = {
  title: string;
  data: { estado: string; regiao?: string; color?: string; populacao: number; estabelecimentos: number }[];
};

export default function ScatterChartCard({ title, data }: Props) {
  const enriched = data.map((d) => ({
    ...d,
    z: Math.max(20, Math.min(72, (d.estabelecimentos / 4500) * 72)),
  }));
  const hasData = enriched.length > 0;
  const minX = hasData ? Math.min(...enriched.map((d) => d.populacao)) : 0;
  const maxX = hasData ? Math.max(...enriched.map((d) => d.populacao)) : 1;
  const minY = hasData ? Math.min(...enriched.map((d) => d.estabelecimentos)) : 0;
  const maxY = hasData ? Math.max(...enriched.map((d) => d.estabelecimentos)) : 1;
  const padX = hasData ? (maxX - minX) * 0.05 : 0;
  const padY = hasData ? (maxY - minY) * 0.05 : 0;

  // Build nice rounded ticks for Y axis (e.g., 75.000 instead of 75.245)
  const niceNum = (range: number, round: boolean) => {
    if (range <= 0 || !isFinite(range)) return 1;
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction = 1;
    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
  };

  const getNiceScale = (min: number, max: number, maxTicks = 6) => {
    if (!hasData) return { domainMin: 0, domainMax: 1, ticks: [] as number[] };
    const range = Math.max(1, max - min);
    const niceRange = niceNum(range, false);
    const step = Math.max(1, niceNum(niceRange / Math.max(2, maxTicks - 1), true));
    const domainMin = Math.max(0, Math.floor(min / step) * step);
    const domainMax = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = domainMin; v <= domainMax + 0.5 * step; v += step) {
      ticks.push(Math.round(v));
    }
    return { domainMin, domainMax, step, ticks } as { domainMin: number; domainMax: number; step: number; ticks: number[] };
  };

  const yNice = getNiceScale(Math.max(0, minY - padY), maxY + padY, 6);

  return (
    <div className="card p-4">
      <p className="text-sm font-medium text-slate-700 mb-3">{title}</p>
      <div className="h-72 rounded-lg bg-gradient-to-tr from-slate-50 to-emerald-50">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="populacao" name="População" tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} tickLine={false} axisLine={false} fontSize={12} domain={hasData ? [Math.max(0, minX - padX), maxX + padX] : ["auto", "auto"]} />
            <YAxis type="number" dataKey="estabelecimentos" name="Estabelecimentos" tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v)} allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} domain={hasData ? [yNice.domainMin, yNice.domainMax] : ["auto", "auto"]} ticks={hasData ? yNice.ticks : undefined} />
            <ZAxis type="number" dataKey="z" range={[20, 72]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-md bg-white/95 backdrop-blur px-3 py-2 shadow ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-900">{d.estado}</div>
                    <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                      <div>
                        População: <span className="font-medium text-slate-800">{(d.populacao / 1_000_000).toFixed(2)}M</span>
                      </div>
                      <div>
                        Estabelecimentos: <span className="font-medium text-slate-800">{d.estabelecimentos.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={enriched} shape="circle">
              {enriched.map((e, idx) => (
                <Cell key={`cell-${idx}`} fill={e.color || "#00A67D"} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
