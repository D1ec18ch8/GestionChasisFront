import axios, { AxiosError } from 'axios';

import { API_URL } from '@/src/config/env';
import { clearToken, getToken } from '@/src/storage/token';
import { ApiError, ApiErrorPayload, ApiListResponse, PaginatedResponse } from '@/src/types/api';

export const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const isTimeout = error.code === 'ECONNABORTED';
    const isNetworkError = !error.response;
    const status = error.response?.status ?? 500;
    const message = isTimeout
      ? 'La solicitud tardo demasiado en responder.'
      : isNetworkError
        ? `No se pudo conectar con la API (${API_URL}). Verifica que el backend este activo y la URL configurada.`
        : (error.response?.data?.message ??
          (status === 401 ? 'Sesion expirada o no autorizada.' : 'Ocurrio un error inesperado.'));

    if (status === 401) {
      await clearToken();
    }

    const apiError: ApiError = {
      status,
      message,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  },
);

export function normalizeList<T>(payload: ApiListResponse<T>): PaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return { data: payload };
  }

  return payload;
}
