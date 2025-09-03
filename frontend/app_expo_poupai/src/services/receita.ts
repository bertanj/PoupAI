import { api } from "../lib/api";

export type ReceitaCreate = {
  descricao?: string;
  valor: number;          
  data: string;           
  usuarioId: number;
};

export type Receita = ReceitaCreate & {
  id: number;
};

export async function criarReceita(body: ReceitaCreate) {
  const { data } = await api.post<Receita>("/api/Receita", body);
  return data;
}

export async function listarReceitas(usuarioId?: number) {
  
  const { data } = await api.get<Receita[]>("/api/Receita", {
    params: usuarioId ? { usuarioId } : undefined,
  });
  return data;
}

export async function deletarReceita(id: number) {
  await api.delete(`/api/Receita/${id}`);
}

export async function atualizarReceita(id: number, body: Partial<ReceitaCreate>) {
  const { data } = await api.put<Receita>(`/api/Receita/${id}`, body);
  return data;
}
