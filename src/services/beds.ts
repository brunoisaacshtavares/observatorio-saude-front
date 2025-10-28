import { api } from "./api";
import type { BedsIndicators, BedsByState, TopBedsHospital, LeitoItem } from "../types/leitos";

export async function getBedsIndicators(year: number) {
  const { data } = await api.get<BedsIndicators>(`/api/v1/Leitos/indicadores?Ano=${encodeURIComponent(String(year))}`);
  return data;
}

export async function getBedsByState(year: number, ufs?: string[]) {
  const params = new URLSearchParams();
  params.append("Ano", String(year));
  if (ufs && ufs.length > 0) {
    ufs.forEach((uf) => params.append("Ufs", uf));
  }
  const qs = params.toString();
  const { data } = await api.get<BedsByState[]>(`/api/v1/Leitos/indicadores-por-estado?${qs}`);
  return data;
}

export async function getTopBeds(year: number, count: number = 30) {
  const params = new URLSearchParams();
  params.append("Count", String(count));
  params.append("Ano", String(year));
  const qs = params.toString();
  const { data } = await api.get<string | TopBedsHospital[]>(`/api/v1/Leitos/top-leitos?${qs}`, {
    headers: { accept: "text/plain" },
  });
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as TopBedsHospital[];
    } catch {
      return [] as TopBedsHospital[];
    }
  }
  return data;
}

export type LeitosPage = {
  items: LeitoItem[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export async function getLeitosPage(params: { pageNumber?: number; pageSize?: number; ufs?: string[]; tipoLeito?: string }) {
  const search = new URLSearchParams();
  // Leitos endpoint expects capitalized param names
  if (params.pageNumber !== undefined) search.append("PageNumber", String(params.pageNumber));
  if (params.pageSize !== undefined) search.append("PageSize", String(params.pageSize));
  if (params.ufs && params.ufs.length > 0) {
    // API expects multiple Uf entries or a single Uf? Provided curl shows Uf with quoted CSV; we'll send multiple Uf entries for safety
    params.ufs.forEach((uf) => search.append("Uf", uf));
  }
  if (params.tipoLeito) {
    search.append("Tipo", params.tipoLeito); // Nome correto do parâmetro é "Tipo"
  }
  const qs = search.toString();
  const { data } = await api.get<string | LeitosPage>(`/api/v1/Leitos?${qs}`, { headers: { accept: "text/plain" } });
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as LeitosPage;
    } catch {
      return { items: [], currentPage: 1, pageSize: params.pageSize || 10, totalCount: 0, totalPages: 0 } as LeitosPage;
    }
  }
  return data as LeitosPage;
}

export async function getAllLeitos(params: { ufs?: string[]; pageSize?: number; maxPages?: number; tipoLeito?: string }) {
  const pageSize = params.pageSize ?? 100;
  const maxPages = params.maxPages ?? 200; // safety cap
  let page = 1;
  let totalPages = 1;
  const items: LeitoItem[] = [];

  while (page <= totalPages && page <= maxPages) {
    const resp = await getLeitosPage({ pageNumber: page, pageSize, ufs: params.ufs, tipoLeito: params.tipoLeito });
    items.push(...(resp.items || []));
    totalPages = resp.totalPages || 1;
    page += 1;
  }

  return items;
}
