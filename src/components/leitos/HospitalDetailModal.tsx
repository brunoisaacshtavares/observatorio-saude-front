import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building, Bed, Stethoscope, Clock, CheckCircle, XCircle, TrendingUp, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import type { HospitalDetalhado } from "../../types/leitos";
import { getLeitosPageDetailed } from "../../services/beds";

type Props = {
  hospital: HospitalDetalhado | null;
  onClose: () => void;
};

const MIN_YEAR = 2007;

const BedsHistoryChart = ({ codCnes, range }: { codCnes: number, range: number }) => {
  const currentYear = new Date().getFullYear();

  const yearsToFetch = useMemo(() => {
    const startYear = Math.max(MIN_YEAR, currentYear - range + 1);
    const years = [];
    for (let y = startYear; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear, range]);

  const { data: historyData, isLoading, isFetching } = useQuery({
    queryKey: ["hospital-history-real", codCnes, yearsToFetch],
    queryFn: async () => {
      const requests = yearsToFetch.map(year => 
        getLeitosPageDetailed({
          pageNumber: 1,
          pageSize: 1, 
          codCnes: codCnes,
          year: year,
        })
      );

      const responses = await Promise.all(requests);

      return responses.map((res, index) => {
        const hospitalData = res.items[0];
        return {
          ano: yearsToFetch[index],
          total: hospitalData?.capacidade?.totalLeitos || 0,
          sus: hospitalData?.capacidade?.leitosSus || 0,
        };
      }).filter(item => item.total > 0);
    },
    enabled: !!codCnes,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || isFetching) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Carregando dados de {yearsToFetch[0]} a {currentYear}...</span>
      </div>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-lg">
        Sem dados históricos para este período.
      </div>
    );
  }

  return (
    <div className="h-64 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="ano" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            name="Total de Leitos" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            strokeWidth={2}
            animationDuration={800}
          />
          <Area 
            type="monotone" 
            dataKey="sus" 
            name="Leitos SUS" 
            stroke="#22c55e" 
            fillOpacity={1} 
            fill="url(#colorSus)" 
            strokeWidth={2}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; fullWidth?: boolean }> = ({ title, icon, children, fullWidth }) => (
  <div className="mt-6 first:mt-2">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-slate-500 p-1.5 bg-slate-50 rounded-md">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className={`grid gap-x-6 gap-y-3 text-sm ${fullWidth ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {children}
    </div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col border-b border-slate-50 pb-2 last:border-0">
    <span className="text-xs text-slate-500 mb-0.5">{label}</span>
    <span className="text-slate-800 font-medium">{value}</span>
  </div>
);
const CapacityItem: React.FC<{ label: string; total: number; sus: number }> = ({ label, total, sus }) => (
  <div className="flex flex-col border-b border-slate-50 pb-2 last:border-0">
    <span className="text-xs text-slate-500 mb-1.5">{label}</span>
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
        <span className="text-sm font-semibold text-slate-900">{total}</span>
      </div>
      <div className="w-px h-8 bg-slate-200"></div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-green-600">SUS</span>
        <span className="text-sm font-semibold text-green-700">{sus}</span>
      </div>
    </div>
  </div>
);

const ServiceBadge: React.FC<{ label: string; available: boolean }> = ({ label, available }) => (
  <div className={`flex items-center gap-2 py-1.5 px-3 rounded-md border ${available ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"}`}>
    {available ? <CheckCircle size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
    <span className="text-xs font-medium">{label}</span>
  </div>
);

export default function HospitalDetailModal({ hospital, onClose }: Props) {
  const [historyRange, setHistoryRange] = useState<number>(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hospital) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [hospital]);

  if (!hospital || !mounted) return null;

  const { capacidade, localizacao, servicos, organizacao, turno } = hospital;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{hospital.nomeEstabelecimento}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                CNES: {hospital.codCnes}
              </span>
              <span className="text-sm text-slate-500 border-l border-slate-300 pl-2">
                {hospital.dscrTipoUnidade}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                   <TrendingUp className="text-blue-600" size={18} />
                   <h3 className="font-semibold text-slate-800">Evolução da Capacidade</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-500" />
                  <select 
                    value={historyRange}
                    onChange={(e) => setHistoryRange(Number(e.target.value))}
                    className="text-xs border border-slate-300 rounded-md py-1 px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={3}>Últimos 3 anos</option>
                    <option value={5}>Últimos 5 anos</option>
                    <option value={10}>Últimos 10 anos</option>
                    <option value={15}>Últimos 15 anos</option>
                    <option value={100}>Histórico Completo (desde 2007)</option>
                  </select>
                </div>
             </div>
             <BedsHistoryChart codCnes={hospital.codCnes} range={historyRange} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <DetailSection title="Organização e Localização" icon={<Building size={18} />}>
                <InfoItem label="Endereço" value={localizacao.enderecoCompleto} />
                <InfoItem label="UF / Município" value={`${localizacao.uf} `} />
                <InfoItem label="Gestão" value={organizacao.tipoGestao} />
                <InfoItem label="Esfera Administrativa" value={organizacao.descricaoEsferaAdministrativa} />
              </DetailSection>

              <DetailSection title="Atendimento" icon={<Clock size={18} />}>
                <InfoItem label="Turno de Atendimento" value={turno.dscrTurnoAtendimento} />
              </DetailSection>
            </div>

            <div className="space-y-6">
              <DetailSection title="Capacidade Atual" icon={<Bed size={18} />}>
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-2">
                    <div>
                        <span className="text-xs text-blue-600 font-semibold uppercase">Total Geral</span>
                        <p className="text-2xl font-bold text-blue-900">{capacidade.totalLeitos}</p>
                    </div>
                    <div>
                        <span className="text-xs text-green-600 font-semibold uppercase">Total SUS</span>
                        <p className="text-2xl font-bold text-green-900">{capacidade.leitosSus}</p>
                    </div>
                </div>
                <CapacityItem 
                    label="UTI Total" 
                    total={capacidade.qtdUtiTotalExist} 
                    sus={capacidade.qtdUtiTotalSus} 
                />
                <CapacityItem 
                    label="UTI Adulto" 
                    total={capacidade.qtdUtiAdultoExist} 
                    sus={capacidade.qtdUtiAdultoSus} 
                />
                <CapacityItem 
                    label="UTI Pediátrico" 
                    total={capacidade.qtdUtiPediatricoExist} 
                    sus={capacidade.qtdUtiPediatricoSus} 
                />
                <CapacityItem 
                    label="UTI Neonatal" 
                    total={capacidade.qtdUtiNeonatalExist} 
                    sus={capacidade.qtdUtiNeonatalSus} 
                />
              </DetailSection>

              <DetailSection title="Serviços Disponíveis" icon={<Stethoscope size={18} />} fullWidth>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <ServiceBadge label="Ambulatorial" available={servicos.fazAtendimentoAmbulatorial} />
                    <ServiceBadge label="Ambulatorial SUS" available={servicos.fazAtendimentoAmbulatorialSus} />
                    <ServiceBadge label="Internação" available={servicos.fazAtendimentoHospitalar} />
                    <ServiceBadge label="Centro Cirúrgico" available={servicos.temCentroCirurgico} />
                    <ServiceBadge label="Centro Obstétrico" available={servicos.temCentroObstetrico} />
                    <ServiceBadge label="Neonatologia" available={servicos.temCentroNeonatal} />
                    <ServiceBadge label="Serviço de Apoio" available={servicos.temServicoApoio} />
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-3 text-xs text-center text-slate-400">
          Dados detalhados do estabelecimento CNES {hospital.nomeEstabelecimento} - {hospital.codCnes}.
        </div>
      </div>
    </div>,
    document.body
  );
}