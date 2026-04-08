import axios, { AxiosError } from 'axios';

import { API_URL } from '@/src/config/env';
import { clearToken, getToken } from '@/src/storage/token';
import { ApiError, ApiErrorPayload, ApiListResponse, PaginatedResponse } from '@/src/types/api';

export const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

function getClientTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

http.interceptors.request.use(async (config) => {
  const token = await getToken();
  const timeZone = getClientTimeZone();
  const utcOffsetMinutes = -new Date().getTimezoneOffset();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (timeZone) {
    config.headers['X-Timezone'] = timeZone;
  }

  config.headers['X-UTC-Offset-Minutes'] = String(utcOffsetMinutes);

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const isTimeout = error.code === 'ECONNABORTED';
    const isNetworkError = !error.response;
    const status = error.response?.status ?? 500;
    
    let message = '';
    if (isTimeout) {
      message = 'La solicitud tardo demasiado en responder.';
    } else if (isNetworkError) {
      message = `No se pudo conectar con la API (${API_URL}). Verifica que el backend este activo y la URL configurada.`;
    } else if (status === 401) {
      message = 'Sesión expirada. Por favor inicia sesión nuevamente.';
    } else {
      message = error.response?.data?.message ?? 'Ocurrio un error inesperado.';
    }

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
