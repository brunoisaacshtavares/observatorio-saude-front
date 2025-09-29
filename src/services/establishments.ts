import { api } from "./api";
import type { ContagemPorEstado, ContagemTotal, EstabelecimentoItem, ExportParams, GeoJsonFeatureCollection, GeoJsonParams, Paginado } from "../types/cnes";
import { UF_METADATA } from "../utils/formatters";
import { convertCsvToXlsxBuffer } from "../utils/exporters";

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

export const getEstabelecimentosGeoJson = async ({ bounds, zoom }: GeoJsonParams): Promise<GeoJsonFeatureCollection> => {
  const params = new URLSearchParams();

  if (bounds) {
    params.append('MinLatitude', bounds.getSouth().toString());
    params.append('MaxLatitude', bounds.getNorth().toString());
    params.append('MinLongitude', bounds.getWest().toString());
    params.append('MaxLongitude', bounds.getEast().toString());
    params.append('Zoom', zoom.toString());
  }

  const endpoint = `/api/v1/Estabelecimento/geojson?${params.toString()}`;
  const { data } = await api.get<GeoJsonFeatureCollection>(endpoint);
  return data;
};

export async function exportEstabelecimentos({ format, ufs }: Omit<ExportParams, 'regiao'>) {
  const params = new URLSearchParams();
  params.append('Format', 'csv');

  if (ufs && ufs.length > 0) {
    ufs.forEach(uf => params.append('Uf', uf));
  }
  
  const relativeUrl = `/api/v1/Estabelecimento/export-details?${params.toString()}`;
  const absoluteUrl = `${api.defaults.baseURL || ''}${relativeUrl}`;

  try {
    const response = await fetch(absoluteUrl);

    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status} ${response.statusText}`);
    }

    const triggerDownload = (blob: Blob, filename: string) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    };

    if (format === 'xlsx') {
      const csvText = await response.text();
      
      const buffer = await convertCsvToXlsxBuffer(csvText);
      
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      triggerDownload(blob, `estabelecimentos_cnes.xlsx`);

    } else {
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `estabelecimentos_cnes.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      triggerDownload(blob, filename);
    }
  } catch (error) {
    console.error("Erro ao exportar estabelecimentos:", error);
    throw error;
  }
}