import { X, Building, Bed, Stethoscope, Clock, CheckCircle, XCircle } from "lucide-react";
import type { HospitalDetalhado } from "../../types/leitos";

type Props = {
  hospital: HospitalDetalhado | null;
  onClose: () => void;
};

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mt-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-slate-500">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">{children}</div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="py-1">
    <span className="text-xs text-slate-500 block">{label}</span>
    <span className="text-slate-800 font-medium">{value}</span>
  </div>
);

const ServiceBadge: React.FC<{ label: string; available: boolean }> = ({ label, available }) => (
  <div className={`flex items-center gap-1.5 py-1 px-2 rounded ${available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
    {available ? <CheckCircle size={14} /> : <XCircle size={14} />}
    <span className="text-xs font-medium">{label}</span>
  </div>
);

export default function HospitalDetailModal({ hospital, onClose }: Props) {
  if (!hospital) {
    return null;
  }

  const { capacidade, localizacao, servicos, organizacao, turno } = hospital;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6"
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{hospital.nomeEstabelecimento}</h2>
            <p className="text-sm text-slate-500">
              {hospital.dscrTipoUnidade} (CNES: {hospital.codCnes})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-4 divide-y divide-slate-100">
          <DetailSection title="Organização e Localização" icon={<Building size={16} />}>
            <InfoItem label="Endereço" value={localizacao.enderecoCompleto} />
            <InfoItem label="UF" value={localizacao.uf} />
            <InfoItem label="Gestão" value={organizacao.tipoGestao} />
            <InfoItem label="Esfera Administrativa" value={organizacao.descricaoEsferaAdministrativa} />
          </DetailSection>

          <DetailSection title="Capacidade de Leitos" icon={<Bed size={16} />}>
            <InfoItem label="Total de Leitos" value={capacidade.totalLeitos} />
            <InfoItem label="Leitos SUS" value={capacidade.leitosSus} />
            <InfoItem label="UTI Total (Existentes)" value={capacidade.qtdUtiTotalExist} />
            <InfoItem label="UTI Total (SUS)" value={capacidade.qtdUtiTotalSus} />
            
            <InfoItem label="UTI Adulto (Exist / SUS)" value={`${capacidade.qtdUtiAdultoExist} / ${capacidade.qtdUtiAdultoSus}`} />
            <InfoItem label="UTI Pediátrico (Exist / SUS)" value={`${capacidade.qtdUtiPediatricoExist} / ${capacidade.qtdUtiPediatricoSus}`} />
            <InfoItem label="UTI Neonatal (Exist / SUS)" value={`${capacidade.qtdUtiNeonatalExist} / ${capacidade.qtdUtiNeonatalSus}`} />
            <InfoItem label="UTI Queimado (Exist / SUS)" value={`${capacidade.qtdUtiQueimadoExist} / ${capacidade.qtdUtiQueimadoSus}`} />
            <InfoItem label="UTI Coronariana (Exist / SUS)" value={`${capacidade.qtdUtiCoronarianaExist} / ${capacidade.qtdUtiCoronarianaSus}`} />
          </DetailSection>

          <DetailSection title="Serviços Disponíveis" icon={<Stethoscope size={16} />}>
            <ServiceBadge label="Atendimento Ambulatorial" available={servicos.fazAtendimentoAmbulatorial} />
            <ServiceBadge label="Atendimento Ambulatorial (SUS)" available={servicos.fazAtendimentoAmbulatorialSus} />
            <ServiceBadge label="Atendimento Hospitalar" available={servicos.fazAtendimentoHospitalar} />
            <ServiceBadge label="Centro Cirúrgico" available={servicos.temCentroCirurgico} />
            <ServiceBadge label="Centro Obstétrico" available={servicos.temCentroObstetrico} />
            <ServiceBadge label="Centro Neonatal" available={servicos.temCentroNeonatal} />
            <ServiceBadge label="Serviço de Apoio" available={servicos.temServicoApoio} />
          </DetailSection>

          <DetailSection title="Atendimento" icon={<Clock size={16} />}>
            <InfoItem label="Turno de Atendimento" value={turno.dscrTurnoAtendimento} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}