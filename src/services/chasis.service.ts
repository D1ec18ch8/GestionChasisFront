import { http, normalizeList } from '@/src/lib/http';
import { PaginatedResponse } from '@/src/types/api';
import { Chasis, ChasisFilters, ChasisPayload } from '@/src/types/domain';

export async function getChasis(filters: ChasisFilters = {}) {
  const { data } = await http.get('/chasis', { params: filters });
  return normalizeList<Chasis>(data) as PaginatedResponse<Chasis>;
}

export async function getChasisById(id: number) {
  const { data } = await http.get<Chasis>(`/chasis/${id}`);
  return data;
}

export async function createChasis(payload: ChasisPayload) {
  const { data } = await http.post<Chasis>('/chasis', payload);
  return data;
}

export async function updateChasis(id: number, payload: Partial<ChasisPayload>) {
  const { data } = await http.put<Chasis>(`/chasis/${id}`, payload);
  return data;
}

export async function deleteChasis(id: number) {
  await http.delete(`/chasis/${id}`);
}
