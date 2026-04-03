import { Redirect, Slot } from 'expo-router';

import { useAuth } from '@/src/context/auth-context';

export default function AuthLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
}
