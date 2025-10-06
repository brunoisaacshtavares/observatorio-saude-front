import { getRegionColor } from "../../utils/colors";
import { formatNumber } from "../../utils/formatters";

type RegionalData = {
  regiao: string;
  totalLeitos: number;
  populacao: number;
  leitosPor1000: number;
};

type Props = {
  data: RegionalData[];
  isLoading?: boolean;
};

const regionIcons = {
  Norte: "N",
  Nordeste: "NE",
  "Centro-Oeste": "CO",
  Sudeste: "SE",
  Sul: "S",
};

export default function RegionalAnalysis({ data, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Análise Regional</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.totalLeitos - a.totalLeitos);

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Análise Regional</h3>

      <div className="space-y-3">
        {sortedData.map((region) => (
          <div key={region.regiao} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getRegionColor(region.regiao) }}>
              {regionIcons[region.regiao as keyof typeof regionIcons] || region.regiao[0]}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-900">{region.regiao}</h4>
                <span className="text-sm font-bold text-[#004F6D]">{region.leitosPor1000.toFixed(2)} leitos/1000 hab</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-slate-700">{formatNumber(region.totalLeitos)}</strong> leitos
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    População: <strong className="text-slate-700">{formatNumber(region.populacao)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500 mb-1">Maior capacidade</p>
            <p className="font-semibold text-slate-900">{sortedData[0]?.regiao || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Melhor cobertura</p>
            <p className="font-semibold text-slate-900">{data.length > 0 ? [...data].sort((a, b) => b.leitosPor1000 - a.leitosPor1000)[0].regiao : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
