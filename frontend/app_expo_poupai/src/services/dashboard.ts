import api from "../lib/api";

export type ResumoMensal = {
  saldo: number;
  totalreceitas: number;
  totaldespesas: number;
};

export type CategoriaItem = {
  categoria: string;
  total: number;
};

export async function getResumoMensal(
  usuarioId: number,
  ano: number,
  mes: number
): Promise<ResumoMensal> {
  const { data } = await api.get<ResumoMensal>(
    `/api/Dashboard/resumo/${ano}/${mes}/usuario/1`
  );
  return data;
}

export async function getGastosPorCategoria(
  usuarioId: number,
  ano: number,
  mes: number
): Promise<CategoriaItem[]> {
  const { data } = await api.get<CategoriaItem[]>(
    `/api/Dashboard/gastosPorCategoria/${ano}/${mes}/usuario/1`
  );
  return data;
}
