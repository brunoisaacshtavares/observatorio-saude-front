export type BedsIndicators = {
  totalLeitos: number;
  leitosSus: number;
  criticos: number;
};

export type BedsByState = {
  codUf: number;
  nomeUf: string;
  siglaUf: string;
  regiao: string;
  populacao: number;
  totalLeitos: number;
  leitosSus: number;
  criticos: number;
  coberturaLeitosPor1kHab: number;
};

export type TopBedsHospital = {
  nomeEstabelecimento: string;
  localizacaoUf: string;
  enderecoCompleto: string;
  leitosSus: number;
  totalLeitos: number;
  codCnes: number;
};

export type LeitoItem = {
  codCnes?: number;
  nomeEstabelecimento?: string;
  enderecoCompleto?: string;
  localizacaoUf?: string;
  totalLeitos?: number;
  leitosSus?: number;
  tipoLeito?: string;
};

export type BedsByRegion = {
  nomeRegiao: string
  populacao: number
  totalLeitos: number
  leitosSus: number
  criticos: number
  coberturaLeitosPor1kHab: number
}


export type BedType = {
  id: string;
  label: string;
};

export type HospitalDetalhado = {
  codCnes: number;
  nomeEstabelecimento: string;
  dscrTipoUnidade: string;
  capacidade: {
    totalLeitos: number;
    leitosSus: number;
    qtdUtiTotalExist: number;
    qtdUtiTotalSus: number;
    qtdUtiAdultoExist: number;
    qtdUtiAdultoSus: number;
    qtdUtiPediatricoExist: number;
    qtdUtiPediatricoSus: number;
    qtdUtiNeonatalExist: number;
    qtdUtiNeonatalSus: number;
    qtdUtiQueimadoExist: number;
    qtdUtiQueimadoSus: number;
    qtdUtiCoronarianaExist: number;
    qtdUtiCoronarianaSus: number;
  };
  localizacao: {
    uf: string;
    enderecoCompleto: string;
  };
  servicos: {
    fazAtendimentoAmbulatorialSus: boolean;
    temCentroCirurgico: boolean;
    temCentroObstetrico: boolean;
    temCentroNeonatal: boolean;
    fazAtendimentoHospitalar: boolean;
    temServicoApoio: boolean;
    fazAtendimentoAmbulatorial: boolean;
  };
  organizacao: {
    tipoUnidade: number;
    tipoGestao: string;
    descricaoEsferaAdministrativa: string;
    codAtividade: number;
  };
  turno: {
    codTurnoAtendimento: number;
    dscrTurnoAtendimento: string;
  };
};
