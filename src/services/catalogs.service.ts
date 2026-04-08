import { http, normalizeList } from '@/src/lib/http';
import {
  Estado,
  EstadoPayload,
  TipoChasis,
  TipoChasisPayload,
  Ubicacion,
  UbicacionPayload,
} from '@/src/types/domain';

export async function getTiposChasis() {
  const { data } = await http.get('/tipos-chasis');
  return normalizeList<TipoChasis>(data).data;
}

export async function getTipoChasisById(id: number) {
  const { data } = await http.get<TipoChasis>(`/tipos-chasis/${id}`);
  return data;
}

export async function createTipoChasis(payload: TipoChasisPayload) {
  const { data } = await http.post<TipoChasis>('/tipos-chasis', payload);
  return data;
}

export async function updateTipoChasis(id: number, payload: Partial<TipoChasisPayload>) {
  const { data } = await http.put<TipoChasis>(`/tipos-chasis/${id}`, payload);
  return data;
}

export async function deleteTipoChasis(id: number) {
  await http.delete(`/tipos-chasis/${id}`);
}

export async function getUbicaciones() {
  const { data } = await http.get('/ubicaciones');
  return normalizeList<Ubicacion>(data).data;
}

export async function getUbicacionById(id: number) {
  const { data } = await http.get<Ubicacion>(`/ubicaciones/${id}`);
  return data;
}

export async function createUbicacion(payload: UbicacionPayload) {
  const { data } = await http.post<Ubicacion>('/ubicaciones', payload);
  return data;
}

export async function updateUbicacion(id: number, payload: Partial<UbicacionPayload>) {
  const { data } = await http.put<Ubicacion>(`/ubicaciones/${id}`, payload);
  return data;
}

export async function deleteUbicacion(id: number) {
  await http.delete(`/ubicaciones/${id}`);
}

export async function getEstados() {
  const { data } = await http.get('/estados');
  return normalizeList<Estado>(data).data;
}

export async function getEstadoById(id: number) {
  const { data } = await http.get<Estado>(`/estados/${id}`);
  return data;
}

export async function createEstado(payload: EstadoPayload) {
  const { data } = await http.post<Estado>('/estados', payload);
  return data;
}

export async function updateEstado(id: number, payload: Partial<EstadoPayload>) {
  const { data } = await http.put<Estado>(`/estados/${id}`, payload);
  return data;
}

export async function deleteEstado(id: number) {
  await http.delete(`/estados/${id}`);
}
