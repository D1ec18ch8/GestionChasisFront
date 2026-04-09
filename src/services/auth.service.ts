import { http } from '@/src/lib/http';
import {
    AuthLoginPayload,
    AuthMeResponse,
    AuthRegisterPayload,
    AuthResponse,
    User,
} from '@/src/types/domain';

function extractUser(payload: User | AuthMeResponse | AuthResponse) {
  if ('user' in payload && payload.user) {
    return payload.user;
  }

  return payload as User;
}

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
  const { data } = await http.get<User | AuthMeResponse>('/auth/me');
  return extractUser(data);
}

export async function updateProfile(payload: Partial<User>) {
  const { data } = await http.put<User | AuthResponse>('/auth/profile', payload);
  return extractUser(data);
}
