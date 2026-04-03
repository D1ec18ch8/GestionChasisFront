import { http, normalizeList } from '@/src/lib/http';
import { PaginatedResponse } from '@/src/types/api';
import { HistorialAccion, HistorialFilters, HistorialMovimiento } from '@/src/types/history';

export async function getHistorialAcciones(filters: HistorialFilters = {}) {
  const { data } = await http.get('/historial/acciones', { params: filters });
  return normalizeList<HistorialAccion>(data) as PaginatedResponse<HistorialAccion>;
}

export async function getHistorialMovimientos(filters: HistorialFilters = {}) {
  const { data } = await http.get('/historial/movimientos', { params: filters });
  return normalizeList<HistorialMovimiento>(data) as PaginatedResponse<HistorialMovimiento>;
}

async function downloadPdf(path: string) {
  const { data } = await http.get<ArrayBuffer>(path, {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/pdf',
    },
  });

  return data;
}

export function downloadGeneralUbicacionesPdf() {
  return downloadPdf('/historial/ubicaciones/pdf/general');
}

export function downloadGeneralMovimientosPdf() {
  return downloadPdf('/historial/movimientos/pdf/general');
}

export function downloadMovimientosPdf() {
  return downloadPdf('/historial/movimientos/pdf');
}

export function downloadHistorialChasisPdf(chasisId: number) {
  return downloadPdf(`/historial/chasis/${chasisId}/pdf`);
}

export function downloadHistorialUbicacionesChasisPdf(chasisId: number) {
  return downloadPdf(`/historial/ubicaciones/chasis/${chasisId}/pdf`);
}
