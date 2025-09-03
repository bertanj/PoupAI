import { api } from "../lib/api";

export type Transacao = { id: number; descricao?: string; valor: number; data: string; tipo: string; };

export async function getUltimasTransacoes(usuarioId: number, limit = 10, offset = 0) {
  const { data } = await api.get<Transacao[]>(`/api/Transacao/ultimas/usuario/${usuarioId}`, { params: { limit, offset } });
  return data;
}
