import { http } from '@/src/lib/http';
import { AuthLoginPayload, AuthRegisterPayload, AuthResponse, User } from '@/src/types/domain';

export async function login(payload: AuthLoginPayload) {
  const { data } = await http.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: AuthRegisterPayload) {
  const { data } = await http.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function logout() {
  await http.post('/auth/logout');
}

export async function me() {
  const { data } = await http.get<User>('/auth/me');
  return data;
}

export async function updateProfile(payload: Partial<User>) {
  const { data } = await http.put<User>('/auth/profile', payload);
  return data;
}
