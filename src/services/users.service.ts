import { http, normalizeList } from '@/src/lib/http';
import { Usuario, UsuarioPayload } from '@/src/types/domain';

const USERS_PATH = process.env.EXPO_PUBLIC_USERS_PATH ?? '/usuarios';

export async function getUsuarios() {
  const { data } = await http.get(USERS_PATH);
  return normalizeList<Usuario>(data).data;
}

export async function createUsuario(payload: UsuarioPayload) {
  const { data } = await http.post<Usuario>(USERS_PATH, payload);
  return data;
}

export async function updateUsuario(id: number, payload: Partial<UsuarioPayload>) {
  const { data } = await http.put<Usuario>(`${USERS_PATH}/${id}`, payload);
  return data;
}

export async function deleteUsuario(id: number) {
  await http.delete(`${USERS_PATH}/${id}`);
}
