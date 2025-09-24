import { api } from "./api";
import type { ContagemPorEstado, ContagemTotal, EstabelecimentoItem, GeoJsonFeatureCollection, GeoJsonParams, Paginado } from "../types/cnes";
import { UF_METADATA } from "../utils/formatters";

export async function getTotalEstabelecimentosPorEstado() {
  const { data } = await api.get<ContagemPorEstado[]>("/api/v1/Estabelecimento/uf");
  return data;
}

export async function getEstabelecimentosInfo(page = 1, pageSize = 10) {
  const { data } = await api.get<Paginado<EstabelecimentoItem>>(`/api/v1/Estabelecimento/info?pageNumber=${page}&pageSize=${pageSize}`);
  return data;
}

async function fetchInfoByUfPaged(ufSigla: string, page: number, pageSize: number): Promise<Paginado<EstabelecimentoItem>> {
  const ufParam = ufSigla.toLowerCase();
  const { data } = await api.get<Paginado<EstabelecimentoItem>>(`/api/v1/Estabelecimento/info?Uf=${encodeURIComponent(ufParam)}&pageNumber=${page}&pageSize=${pageSize}`);
  return data;
}

export async function getTotalEstabelecimentos() {
  const { data } = await api.get<ContagemTotal>("/api/v1/Estabelecimento");
  return data;
}

export async function getEstabelecimentosPorUF(ufSigla: string, limit = 100) {
  const entry = Object.entries(UF_METADATA).find(([, meta]) => meta.sigla === ufSigla);
  if (!entry) return [] as EstabelecimentoItem[];
  const ufCode = Number(entry[0]);

  const items: EstabelecimentoItem[] = [];
  const pageSize = Math.min(30, limit);
  let page = 1;
  let totalPages = 1;
  while (items.length < limit && page <= totalPages) {
    const resp = await fetchInfoByUfPaged(ufSigla, page, pageSize);
    const pageItems = (resp.items || []).filter((it) => it.localizacao.codUf === ufCode);
    items.push(...pageItems);
    totalPages = resp.totalPages || 1;
    page += 1;
  }
  return items.slice(0, limit);
}

export type UFPageResult = {
  items: EstabelecimentoItem[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export async function getEstabelecimentosPorUFPage(ufSigla: string, page: number, pageSize = 30): Promise<UFPageResult> {
  const entry = Object.entries(UF_METADATA).find(([, meta]) => meta.sigla === ufSigla);
  if (!entry) return { items: [], page, pageSize, hasNextPage: false };
  const ufCode = Number(entry[0]);

  const cacheKey = `${ufSigla.toLowerCase()}:${page}:${pageSize}`;
  const cached = ufPageCache.get(cacheKey);
  if (cached) return cached;

  const resp = await fetchInfoByUfPaged(ufSigla, page, pageSize);
  const items = (resp.items || []).filter((it) => it.localizacao.codUf === ufCode);
  const result: UFPageResult = { items, page, pageSize, hasNextPage: page < (resp.totalPages || 1) };
  ufPageCache.set(cacheKey, result);
  return result;
}

const ufPageCache = new Map<string, UFPageResult>();

export const getEstabelecimentosGeoJson = async ({ bounds }: GeoJsonParams): Promise<GeoJsonFeatureCollection> => {
  const params = new URLSearchParams();

  if (bounds) {
    params.append('MinLatitude', bounds.getSouth().toString());
    params.append('MaxLatitude', bounds.getNorth().toString());
    params.append('MinLongitude', bounds.getWest().toString());
    params.append('MaxLongitude', bounds.getEast().toString());
  }

  const endpoint = `/api/v1/Estabelecimento/geojson?${params.toString()}`;
  const { data } = await api.get<GeoJsonFeatureCollection>(endpoint);
  return data;
};