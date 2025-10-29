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
