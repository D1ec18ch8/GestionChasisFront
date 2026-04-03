export type HistorialAccion = {
  id: number;
  chasis_id?: number;
  accion?: 'creacion' | 'actualizacion' | 'eliminacion' | string;
  descripcion?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type HistorialMovimiento = {
  id: number;
  chasis_id?: number;
  origen?: string;
  destino?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type HistorialFilters = {
  per_page?: number;
  chasis_id?: number;
  accion?: 'creacion' | 'actualizacion' | 'eliminacion';
};
