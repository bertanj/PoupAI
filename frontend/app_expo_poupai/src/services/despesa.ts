import { api } from "../lib/api";

export type DespesaCreate = {
  descricao?: string;
  valor: number;          
  data: string;           
  usuarioId: number;
  categoriaId: number;    
};

export type Despesa = DespesaCreate & {
  id: number;
};

export async function criarDespesa(body: DespesaCreate) {
  const { data } = await api.post<Despesa>("/api/Despesa", body);
  return data;
}

export async function listarDespesas(usuarioId?: number) {
  const { data } = await api.get<Despesa[]>("/api/Despesa", {
    params: usuarioId ? { usuarioId } : undefined,
  });
  return data;
}

export async function deletarDespesa(id: number) {
  await api.delete(`/api/Despesa/${id}`);
}

export async function atualizarDespesa(id: number, body: Partial<DespesaCreate>) {
  const { data } = await api.put<Despesa>(`/api/Despesa/${id}`, body);
  return data;
}
