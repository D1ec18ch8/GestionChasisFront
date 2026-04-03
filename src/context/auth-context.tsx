import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import * as authService from '@/src/services/auth.service';
import { clearToken, getToken, setToken } from '@/src/storage/token';
import { ApiError } from '@/src/types/api';
import { AuthLoginPayload, AuthRegisterPayload, User } from '@/src/types/domain';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: AuthLoginPayload) => Promise<void>;
  register: (payload: AuthRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readTokenFromLoginResponse(response: { access_token?: string; token?: string }) {
  return response.access_token ?? response.token ?? null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const savedToken = await getToken();

        if (!savedToken) {
          setLoading(false);
          return;
        }

        setTokenState(savedToken);
        const profile = await authService.me();
        setUser(profile);
      } catch {
        await clearToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (payload) => {
        const response = await authService.login(payload);
        const authToken = readTokenFromLoginResponse(response);

        if (!authToken) {
          throw {
            status: 500,
            message: 'No se recibio token en login.',
          } as ApiError;
        }

        await setToken(authToken);
        setTokenState(authToken);

        const profile = response.user ?? (await authService.me());
        setUser(profile);
      },
      register: async (payload) => {
        const response = await authService.register(payload);
        const authToken = readTokenFromLoginResponse(response);

        if (!authToken) {
          throw {
            status: 500,
            message: 'No se recibio token en registro.',
          } as ApiError;
        }

        await setToken(authToken);
        setTokenState(authToken);

        const profile = response.user ?? (await authService.me());
        setUser(profile);
      },
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          await clearToken();
          setTokenState(null);
          setUser(null);
        }
      },
      refreshMe: async () => {
        const profile = await authService.me();
        setUser(profile);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
