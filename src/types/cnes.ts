import type { LatLngBounds } from "leaflet";

export type EstabelecimentoItem = {
  codCnes: number;
  dataExtracao: string;
  caracteristicas: {
    codUnidade: string;
    nmRazaoSocial: string;
    nmFantasia: string;
    numCnpj: string | null;
    numCnpjEntidade: string | null;
    email: string | null;
    numTelefone: string | null;
  };
  localizacao: {
    codUnidade: string;
    codCep: number | null;
    endereco: string | null;
    numero: number | null;
    bairro: string | null;
    latitude: number | null;
    longitude: number | null;
    codIbge: number | null;
    codUf: number | null;
  };
  organizacao: {
    codCnes: number;
    tpUnidade: number | null;
    tpGestao: string | null;
    dscrEsferaAdministrativa: string | null;
    dscrNivelHierarquia: string | null;
    dscrNaturezaOrganizacao: string | null;
  };
  turno: {
    codTurnoAtendimento: number | null;
    dscrTurnoAtendimento: string | null;
  };
  servico: {
    codCnes: number;
    fazAtendimentoAmbulatorialSus: boolean | null;
    temCentroCirurgico: boolean | null;
    temCentroObstetrico: boolean | null;
    temCentroNeonatal: boolean | null;
    fazAtendimentoHospitalar: boolean | null;
    temServicoApoio: boolean | null;
    fazAtendimentoAmbulatorial: boolean | null;
  };
};

export type Paginado<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ContagemPorEstado = {
  codUf: number;
  totalEstabelecimentos: number;
  nomeUf: string;
  siglaUf: string;
  regiao: string;
  populacao: number;
  coberturaEstabelecimentos: number
};

export type ContagemTotal = {
  totalEstabelecimentos: number;
};

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    nome: string;
    endereco: string;
    bairro: string;
    cep: number
  };
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface GeoJsonParams {
  uf?: string;
  bounds?: LatLngBounds;
  zoom : number
}

export interface ExportParams {
  format: 'csv' | 'xlsx';
  regiao?: string | null;
  ufs?: string[];
}