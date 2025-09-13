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


export async function getTopUF() {
  const contagens = await getTotalEstabelecimentosPorEstado();

  return contagens
    .slice(0, 10)
    .map(item => ({ uf: item.codUf, qty: item.totalEstabelecimentos }));
}

export async function getUFCounts() {
  const contagens = await getTotalEstabelecimentosPorEstado();

  return contagens
    .map(item => ({
      uf: item.codUf,
      qty: item.totalEstabelecimentos,
      sigla: item.siglaUf,
      nome: item.nomeUf,
      regiao: item.regiao,
      populacao: item.populacao,
      cobertura: item.coberturaEstabelecimentos
    }))
    .sort((a, b) => b.qty - a.qty);
}
