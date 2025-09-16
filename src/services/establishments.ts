import { api } from "./api";
import type { ContagemPorEstado, ContagemTotal, EstabelecimentoItem, Paginado } from "../types/cnes";

export async function getTotalEstabelecimentosPorEstado() {
  const { data } = await api.get<ContagemPorEstado[]>('/api/v1/estabelecimento/uf');
  return data;
}

export async function getEstabelecimentos(page = 1, pageSize = 10) {
  const { data } = await api.get<Paginado<EstabelecimentoItem>>(`/api/v1/Estabelecimento?pageNumber=${page}&pageSize=${pageSize}`);
  return data;
}

export async function getTotalEstabelecimentos() {
  const { data } = await api.get<ContagemTotal>('/api/v1/estabelecimento');
  return data;
}

export async function getEstabelecimentosPorUF(ufSigla: string, limit = 100) {
  const entry = Object.entries(UF_METADATA).find(([, meta]) => meta.sigla === ufSigla);
  if (!entry) return [] as EstabelecimentoItem[];
  const ufCode = Number(entry[0]);

  const items: EstabelecimentoItem[] = [];
  const pageSize = Math.min(100, limit);
  let page = 1;
  while (items.length < limit) {
    const resp = await getEstabelecimentos(page, pageSize);
    const matches = resp.items.filter((it) => it.localizacao.codUf === ufCode);
    items.push(...matches);
    if (resp.items.length < pageSize) break;
    page += 1;
  }
  return items.slice(0, limit);
}
