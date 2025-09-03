import api from "../lib/api";

export type Meta = {
  id: number;
  descricao: string;
  valorAlvo: number;
  valorAtual: number;
  data: string;     
  atingida: boolean;
  usuarioId: number;
};

export async function getMetas(usuarioId: number): Promise<Meta[]> {
  const { data } = await api.get<Meta[]>(`/api/Meta/usuario/${usuarioId}`);
  return data;
}

export async function criarMeta(meta: Meta): Promise<Meta> {
  const { data } = await api.post<Meta>(`/api/Meta`, meta);
  return data;
}

export async function alterarValor(metaId: number, delta: number): Promise<Meta> {
  const { data } = await api.patch<Meta>(`/api/Meta/${metaId}/valor?delta=${delta}`);
  return data;
}

export async function removerMeta(metaId: number): Promise<void> {
  await api.delete(`/api/Meta/${metaId}`);
}