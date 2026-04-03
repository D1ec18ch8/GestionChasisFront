import { http, normalizeList } from '@/src/lib/http';
import { Estado, TipoChasis, Ubicacion } from '@/src/types/domain';

export async function getTiposChasis() {
  const { data } = await http.get('/tipos-chasis');
  return normalizeList<TipoChasis>(data).data;
}

export async function getUbicaciones() {
  const { data } = await http.get('/ubicaciones');
  return normalizeList<Ubicacion>(data).data;
}

export async function getEstados() {
  const { data } = await http.get('/estados');
  return normalizeList<Estado>(data).data;
}
