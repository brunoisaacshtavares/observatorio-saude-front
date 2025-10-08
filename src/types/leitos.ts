export type BedsIndicators = {
  totalLeitos: number;
  leitosDisponiveis: number;
  ocupacaoMedia: number;
  criticos: number;
};

export type BedsByState = {
  codUf: number;
  nomeUf: string;
  siglaUf: string;
  regiao: string;
  populacao: number;
  totalLeitos: number;
  leitosDisponiveis: number;
  ocupacaoMedia: number;
  criticos: number;
  coberturaLeitosPor1kHab: number;
};

export type TopBedsHospital = {
  nomeEstabelecimento: string;
  localizacaoUf: string;
  enderecoCompleto: string;
  leitosOcupados: number;
  leitosDisponiveis: number;
  totalLeitos: number;
  porcentagemOcupacao: number;
  codCnes: number;
};

// Minimal shape for the Leitos endpoint items used for occupancy calculations
export type LeitoItem = {
  codCnes?: number;
  nomeEstabelecimento?: string;
  enderecoCompleto?: string;
  localizacaoUf?: string;
  totalLeitos?: number;
  leitosDisponiveis?: number;
  porcentagemOcupacao: number;
};
