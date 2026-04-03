import { Redirect } from 'expo-router';

import { useAuth } from '@/src/context/auth-context';

export default function EntryPoint() {
  const { token, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Redirect href={token ? '/(tabs)' : '/(auth)/login'} />;
}
