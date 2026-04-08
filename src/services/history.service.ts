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

async function downloadPdf(path: string, params?: Record<string, unknown>) {
  const { data } = await http.get<ArrayBuffer>(path, {
    params,
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/pdf',
    },
  });

  return data;
}

export function downloadGeneralMovimientosPdf() {
  return downloadPdf('/historial/movimientos/pdf');
}

export function downloadMovimientosPdf(placa?: string) {
  return downloadPdf('/historial/movimientos/pdf', placa ? { placa } : undefined);
}
