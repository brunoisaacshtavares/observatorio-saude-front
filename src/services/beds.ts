import { api } from "./api";
import type { BedsIndicators, BedsByState, TopBedsHospital, LeitoItem } from "../types/leitos";

export async function getBedsIndicators(year: number, month?: number, bedType?: string) {
  const params = new URLSearchParams();
  params.append("Ano", String(year));

  if (month) {
    const monthStr = String(month).padStart(2, "0");
    const anomes = `${year}${monthStr}`;
    params.append("Anomes", anomes);
  }

  if (bedType) {
    params.append("Tipo", bedType);
  }

  const { data } = await api.get<BedsIndicators>(`/api/v1/Leitos/indicadores?${params.toString()}`);
  return data;
}

export async function getBedsByState(year: number, ufs?: string[], month?: number, bedType?: string) {
  const params = new URLSearchParams();
  params.append("Ano", String(year));

  if (ufs && ufs.length > 0) {
    ufs.forEach((uf) => params.append("Ufs", uf));
  }

  if (month) {
    const monthStr = String(month).padStart(2, "0");
    const anomes = `${year}${monthStr}`;
    params.append("Anomes", anomes);
  }

  if (bedType) {
    params.append("Tipo", bedType);
  }

  const qs = params.toString();
  const { data } = await api.get<BedsByState[]>(`/api/v1/Leitos/indicadores-por-estado?${qs}`);
  return data;
}

export async function getTopBeds(year: number, count: number = 30, month?: number, bedType?: string) {
  const params = new URLSearchParams();
  params.append("Count", String(count));
  params.append("Ano", String(year));

  if (month) {
    const monthStr = String(month).padStart(2, "0");
    const anomes = `${year}${monthStr}`;
    params.append("Anomes", anomes);
  }

  if (bedType) {
    params.append("Tipo", bedType);
  }

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

export async function getLeitosPage(params: { pageNumber?: number; pageSize?: number; ufs?: string[]; tipoLeito?: string; year?: number; month?: number }) {
  const search = new URLSearchParams();
  if (params.pageNumber !== undefined) search.append("PageNumber", String(params.pageNumber));
  if (params.pageSize !== undefined) search.append("PageSize", String(params.pageSize));
  if (params.ufs && params.ufs.length > 0) {
    params.ufs.forEach((uf) => search.append("Uf", uf));
  }
  if (params.tipoLeito) {
    search.append("Tipo", params.tipoLeito);
  }
  if (params.year) {
    search.append("Ano", String(params.year));
  }
  if (params.month && params.year) {
    const monthStr = String(params.month).padStart(2, "0");
    const anomes = `${params.year}${monthStr}`;
    search.append("Anomes", anomes);
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

export async function getAllLeitos(params: { ufs?: string[]; pageSize?: number; maxPages?: number; tipoLeito?: string; year?: number; month?: number }) {
  const pageSize = params.pageSize ?? 100;
  const maxPages = params.maxPages ?? 200;
  let page = 1;
  let totalPages = 1;
  const items: LeitoItem[] = [];

  while (page <= totalPages && page <= maxPages) {
    const resp = await getLeitosPage({
      pageNumber: page,
      pageSize,
      ufs: params.ufs,
      tipoLeito: params.tipoLeito,
      year: params.year,
      month: params.month,
    });
    items.push(...(resp.items || []));
    totalPages = resp.totalPages || 1;
    page += 1;
  }

  return items;
}
