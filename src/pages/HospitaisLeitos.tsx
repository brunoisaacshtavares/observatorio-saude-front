import { useState, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import BedsStatCard from "../components/leitos/BedsStatCard";
import BedsCapacityChart from "../components/leitos/BedsCapacityChart";
import BedsPer1000Chart from "../components/leitos/BedsPer1000Chart";
import HospitalsList from "../components/leitos/HospitalsList";
import RegionalAnalysis from "../components/leitos/RegionalAnalysis";
import HighOccupancyAlert from "../components/leitos/HighOccupancyAlert";
import { Bed, CheckCircle, Activity, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type BedsOverview = {
  totalLeitos: number;
  leitosDisponiveis: number;
  ocupacaoMedia: number;
  leitosCriticos: number;
};

type StateBedsData = {
  uf: string;
  estado: string;
  total: number;
  disponiveis: number;
  regiao: string;
  populacao: number;
  leitosPor1000: number;
};

type Hospital = {
  id: string;
  nome: string;
  localizacao: string;
  leitosTotal: number;
  leitosDisponiveis: number;
  percentualOcupacao: number;
};

type RegionalData = {
  regiao: string;
  totalLeitos: number;
  populacao: number;
  leitosPor1000: number;
};

type HighOccupancyData = {
  count: number;
  percentage: number;
  recommendation?: string;
};

export default function HospitaisLeitos() {
  const [mockData] = useState({
    overview: {
      totalLeitos: 388195,
      leitosDisponiveis: 58229,
      ocupacaoMedia: 85,
      leitosCriticos: 12,
    },
    stateData: [
      { uf: "SP", estado: "São Paulo", total: 75000, disponiveis: 12000, regiao: "Sudeste", populacao: 46000000, leitosPor1000: 1.63 },
      { uf: "MG", estado: "Minas Gerais", total: 45000, disponiveis: 8000, regiao: "Sudeste", populacao: 21000000, leitosPor1000: 2.14 },
      { uf: "RJ", estado: "Rio de Janeiro", total: 40000, disponiveis: 6000, regiao: "Sudeste", populacao: 17000000, leitosPor1000: 2.35 },
      { uf: "BA", estado: "Bahia", total: 35000, disponiveis: 7000, regiao: "Nordeste", populacao: 15000000, leitosPor1000: 2.33 },
      { uf: "PR", estado: "Paraná", total: 30000, disponiveis: 5000, regiao: "Sul", populacao: 11000000, leitosPor1000: 2.73 },
      { uf: "RS", estado: "Rio Grande do Sul", total: 28000, disponiveis: 4500, regiao: "Sul", populacao: 11000000, leitosPor1000: 2.55 },
      { uf: "PE", estado: "Pernambuco", total: 25000, disponiveis: 3000, regiao: "Nordeste", populacao: 9600000, leitosPor1000: 2.6 },
      { uf: "CE", estado: "Ceará", total: 22000, disponiveis: 3500, regiao: "Nordeste", populacao: 9200000, leitosPor1000: 2.39 },
      { uf: "PA", estado: "Pará", total: 20000, disponiveis: 4000, regiao: "Norte", populacao: 8700000, leitosPor1000: 2.3 },
      { uf: "SC", estado: "Santa Catarina", total: 18000, disponiveis: 2500, regiao: "Sul", populacao: 7300000, leitosPor1000: 2.47 },
    ] as StateBedsData[],
    hospitals: [
      { id: "1", nome: "Hospital das Clínicas - SP", localizacao: "São Paulo, SP", leitosTotal: 2400, leitosDisponiveis: 180, percentualOcupacao: 93 },
      { id: "2", nome: "Hospital Santa Casa - RJ", localizacao: "Rio de Janeiro, RJ", leitosTotal: 850, leitosDisponiveis: 110, percentualOcupacao: 87 },
      { id: "3", nome: "Hospital de Base - DF", localizacao: "Brasília, DF", leitosTotal: 700, leitosDisponiveis: 120, percentualOcupacao: 83 },
      { id: "4", nome: "Hospital Albert Einstein", localizacao: "São Paulo, SP", leitosTotal: 650, leitosDisponiveis: 150, percentualOcupacao: 77 },
      { id: "5", nome: "Hospital Sírio-Libanês", localizacao: "São Paulo, SP", leitosTotal: 500, leitosDisponiveis: 75, percentualOcupacao: 85 },
      { id: "6", nome: "Hospital Moinhos de Vento", localizacao: "Porto Alegre, RS", leitosTotal: 480, leitosDisponiveis: 60, percentualOcupacao: 88 },
    ] as Hospital[],
    regionalData: [
      { regiao: "Sudeste", totalLeitos: 180221, populacao: 89632912, leitosPor1000: 2.01 },
      { regiao: "Nordeste", totalLeitos: 105764, populacao: 57374243, leitosPor1000: 1.84 },
      { regiao: "Sul", totalLeitos: 73037, populacao: 30402587, leitosPor1000: 2.4 },
      { regiao: "Norte", totalLeitos: 34170, populacao: 18906962, leitosPor1000: 1.81 },
      { regiao: "Centro-Oeste", totalLeitos: 14567, populacao: 16504303, leitosPor1000: 0.88 },
    ] as RegionalData[],
    highOccupancy: {
      count: 12,
      percentage: 87,
      recommendation: "Recomenda-se monitoramento constante e possíveis medidas de contingência.",
    },
  });

  /*
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["beds-overview"],
    queryFn: () => fetch("/api/beds/overview").then(res => res.json()),
  });

  const { data: stateData, isLoading: isLoadingState } = useQuery({
    queryKey: ["beds-by-state"],
    queryFn: () => fetch("/api/beds/by-state").then(res => res.json()),
  });

  const { data: hospitalsData, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ["hospitals-occupancy"],
    queryFn: () => fetch("/api/hospitals/occupancy").then(res => res.json()),
  });

  const { data: regionalData, isLoading: isLoadingRegional } = useQuery({
    queryKey: ["beds-regional"],
    queryFn: () => fetch("/api/beds/regional").then(res => res.json()),
  });

  const { data: highOccupancyData, isLoading: isLoadingHighOccupancy } = useQuery({
    queryKey: ["hospitals-high-occupancy"],
    queryFn: () => fetch("/api/hospitals/high-occupancy").then(res => res.json()),
  });
  */

  const isLoadingOverview = false;
  const isLoadingState = false;
  const isLoadingHospitals = false;
  const isLoadingRegional = false;
  const isLoadingHighOccupancy = false;

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <PageHeader title="Hospitais e Leitos" description="Monitoramento de capacidade hospitalar e disponibilidade de leitos" />

      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BedsStatCard label="Total de Leitos" value={mockData.overview.totalLeitos} sublabel="Em todo o Brasil" icon={<Bed />} iconColor="blue" isLoading={isLoadingOverview} />
        <BedsStatCard label="Leitos Disponíveis" value={mockData.overview.leitosDisponiveis} sublabel="Prontos para uso" icon={<CheckCircle />} iconColor="green" isLoading={isLoadingOverview} />
        <BedsStatCard label="Ocupação Média" value={`${mockData.overview.ocupacaoMedia}%`} sublabel="Taxa nacional" icon={<Activity />} iconColor="yellow" isLoading={isLoadingOverview} />
        <BedsStatCard label="Críticos" value={mockData.overview.leitosCriticos} sublabel="UTI e emergência" icon={<AlertCircle />} iconColor="red" isLoading={isLoadingOverview} />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BedsCapacityChart data={mockData.stateData} isLoading={isLoadingState} />
        <BedsPer1000Chart data={mockData.stateData} isLoading={isLoadingState} />
      </div>

      {/* Lista de Hospitais e Análise Regional */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HospitalsList hospitals={mockData.hospitals} isLoading={isLoadingHospitals} />
        <RegionalAnalysis data={mockData.regionalData} isLoading={isLoadingRegional} />
      </div>

      {/* Alerta de Alta Ocupação */}
      <HighOccupancyAlert count={mockData.highOccupancy.count} percentage={mockData.highOccupancy.percentage} recommendation={mockData.highOccupancy.recommendation} isLoading={isLoadingHighOccupancy} />
    </div>
  );
}
