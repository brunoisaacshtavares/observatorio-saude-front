import { useState, useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { getBedsIndicators, getBedsByRegion } from "../../services/beds";
import { Loader2, AlertTriangle, BarChart3, Camera } from "lucide-react";
import html2canvas from "html2canvas";

import AnalysisFilters from "./AnalysisFilters";
import AnalysisKPIs from "./AnalysisKPIs";
import TendenciaLeitosChart from "./TendenciaLeitosChart";
import TabelasComparativas from "./TabelasComparativas";

import type { BedsByRegion, BedsIndicators } from "../../types/leitos";
import RegionalTrendChart from "./CoberturaRegionalChart";

type ComparisonData = {
  year: number;
  indicators: BedsIndicators;
  byRegion: BedsByRegion[];
};

export default function ComparativeAnalysisView() {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedBedType, setSelectedBedType] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const regions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"]

  const chartsContainerRef = useRef<HTMLDivElement | null>(null);

  const canRunQuery = selectedYears.length >= 2;

  const results = useQueries({
    queries: selectedYears.map((year) => {
      const queryParams = {
        year,
        month: selectedMonth ?? undefined,
        tipoLeito: selectedBedType || undefined,
      };
      return {
        queryKey: ["comparison-data", year, selectedMonth, selectedBedType],
        queryFn: async (): Promise<ComparisonData> => {
          const indicators = await getBedsIndicators(queryParams);
          const byRegion = await getBedsByRegion(queryParams);
          return { year, indicators, byRegion };
        },
        enabled: canRunQuery,
        staleTime: 60 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      };
    }),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const data: ComparisonData[] = useMemo(
    () =>
      results
        .filter((r) => r.isSuccess && r.data)
        .map((r) => r.data as ComparisonData),
    [results]
  );

  const kpiData = useMemo(() => {
    if (data.length < 1) return null;
    const sortedData = [...data].sort((a, b) => a.year - b.year);
    const firstYearData = sortedData[0].indicators;
    const lastYearData = sortedData[sortedData.length - 1].indicators;

    const calcDelta = (a: number, b: number) => (a > 0 ? ((b - a) / a) * 100 : 0);

    return {
      totalLeitos: {
        valor: lastYearData.totalLeitos,
        delta: calcDelta(firstYearData.totalLeitos, lastYearData.totalLeitos),
      },
      leitosSus: {
        valor: lastYearData.leitosSus,
        delta: calcDelta(firstYearData.leitosSus, lastYearData.leitosSus),
      },
      criticos: {
        valor: lastYearData.criticos,
        delta: calcDelta(firstYearData.criticos, lastYearData.criticos),
      },
      anoBase: sortedData[0].year,
      anoComparacao: sortedData[sortedData.length - 1].year,
    };
  }, [data]);

  const tendenciaData = useMemo(() => {
    return data
      .map((d) => ({
        ano: d.year,
        "Total de Leitos": d.indicators.totalLeitos,
        "Leitos SUS": d.indicators.leitosSus,
        "Leitos Críticos": d.indicators.criticos,
      }))
      .sort((a, b) => a.ano - b.ano);
  }, [data]);

  const regionalTrendData = useMemo(() => {
    const years = data.map((d) => d.year).sort((a, b) => a - b);

    return years.map((year) => {
      const row: { [key: string]: any } = { ano: year };
      const yearData = data.find((d) => d.year === year);

      regions.forEach((regionName) => {
        const regionStats = yearData?.byRegion.find(
          (r) => r.nomeRegiao === regionName
        );
        row[regionName] = regionStats?.coberturaLeitosPor1kHab ?? 0;
      });

      return row;
    });
  }, [data, regions]);

  const tableData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.year - b.year);
    const sortedYears = sortedData.map((d) => d.year);
    const indicatorsTable = {
      headers: ["Indicador", ...sortedYears.map((y) => `Ano ${y}`)],
      rows: [
        [
          "Total de Leitos",
          ...sortedData.map((d) => d.indicators.totalLeitos),
        ],
        ["Leitos SUS", ...sortedData.map((d) => d.indicators.leitosSus)],
        ["Leitos Críticos", ...sortedData.map((d) => d.indicators.criticos)],
      ],
    };

    const regionTable = {
      headers: ["Região", ...sortedYears.map((y) => `Leitos ${y}`)],
      rows: regions.map((regionName) => {
        const row: (string | number)[] = [regionName];
        sortedData.forEach((d) => {
          const regionStats = d.byRegion.find(
            (r) => r.nomeRegiao === regionName
          );
          row.push(regionStats?.totalLeitos ?? 0);
        });
        return row;
      }),
    };
    return { indicatorsTable, regionTable };
  }, [data]);

  const handleExportPNG = async (
    element: HTMLElement | null,
    filename: string
  ) => {
    if (!element) return;

    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: "#ffffff",
      scale: 2,
    });

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <AnalysisFilters
        selectedYears={selectedYears}
        selectedMonth={selectedMonth}
        selectedBedType={selectedBedType}
        onYearsChange={setSelectedYears}
        onMonthChange={setSelectedMonth}
        onBedTypeChange={setSelectedBedType}
      />

      {!canRunQuery && (
        <div className="card p-10 text-center">
          <BarChart3 size={40} className="mx-auto text-slate-400" />
          <p className="mt-2 text-slate-500">
            Por favor, selecione 2 ou mais anos para gerar a análise.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="card p-10 flex items-center justify-center gap-2 text-slate-600">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span>Buscando dados comparativos...</span>
        </div>
      )}

      {isError && (
        <div className="card p-10 flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-200">
          <AlertTriangle size={20} />
          <span>Falha ao buscar dados. Tente novamente mais tarde.</span>
        </div>
      )}

      {canRunQuery && !isLoading && !isError && data.length > 0 && (
        <div className="space-y-6">
          <AnalysisKPIs data={kpiData} />

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-800">
              Visualizações
            </h3>
            <button
              type="button"
              onClick={() =>
                handleExportPNG(
                  chartsContainerRef.current,
                  "graficos_analise.png"
                )
              }
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Camera size={16} />
              Exportar Gráficos (PNG)
            </button>
          </div>

          <div
            ref={chartsContainerRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div 
              className={`card p-4 ${selectedBedType ? 'lg:col-span-2' : ''}`}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Evolução de Leitos (Série Histórica)
              </h3>
              <div>
                <TendenciaLeitosChart data={tendenciaData} />
              </div>
            </div>
            
            {!selectedBedType && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Cobertura Regional (Leitos / 1k Hab.)
                </h3>
                <div>
                  <RegionalTrendChart
                    data={regionalTrendData}
                  />
                </div>
              </div>
            )}
          </div>

          <TabelasComparativas
            data={tableData}
            selectedYears={selectedYears}
          />
        </div>
      )}
    </div>
  );
}