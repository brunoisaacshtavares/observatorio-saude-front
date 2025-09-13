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
