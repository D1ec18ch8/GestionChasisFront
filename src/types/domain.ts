export type User = {
  id: number;
  name: string;
  email: string;
  activo?: boolean;
  [key: string]: unknown;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
};

export type AuthRegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type AuthResponse = {
  access_token?: string;
  token?: string;
  user?: User;
  message?: string;
};

export type TipoChasis = {
  id: number;
  nombre: string;
  [key: string]: unknown;
};

export type Ubicacion = {
  id: number;
  nombre: string;
  razon_social?: string;
  [key: string]: unknown;
};

export type Estado = {
  id: number;
  nombre: string;
  slug?: string;
  [key: string]: unknown;
};

export type EquipamientoMalEstado =
  | 'patas'
  | 'luces'
  | 'manoplas'
  | 'mangueras'
  | 'llantas';

export type Chasis = {
  id: number;
  nombre: string;
  categoria?: string;
  numero?: string;
  placa?: string;
  tipo_chasis_id: number;
  ubicacion_id?: number;
  estado_actual?: string;
  equipamientos_en_mal_estado?: EquipamientoMalEstado[];
  averia_patas?: boolean;
  averia_luces?: boolean;
  averia_manoplas?: boolean;
  averia_mangueras?: boolean;
  averia_llantas?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type ChasisPayload = {
  tipo_chasis_id: number;
  nombre: string;
  ubicacion_id?: number;
  categoria?: string;
  numero?: string;
  placa?: string;
  averia_patas?: boolean;
  averia_luces?: boolean;
  averia_manoplas?: boolean;
  averia_mangueras?: boolean;
  averia_llantas?: boolean;
};

export type ChasisFilters = {
  per_page?: number;
  search?: string;
  estado?: string;
  tipo_chasis_id?: number;
  ubicacion_id?: number;
  equipamiento_mal?: EquipamientoMalEstado;
};
