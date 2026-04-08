import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/context/auth-context';
import { ping } from '@/src/services/health.service';
import { ApiError } from '@/src/types/api';

export default function PerfilScreen() {
  const { user, refreshMe, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<string>('sin verificar');
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    await refreshMe();
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    setError(null);
    await logout();
    setLoading(false);
  }

  async function handlePing() {
    setLoading(true);
    setError(null);
    try {
      const result = await ping();
      setHealth(result.message ?? result.status ?? 'ok');
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.name ?? 'N/A'}</Text>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>
        <Text style={styles.label}>API</Text>
        <Text style={styles.value}>{health}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.healthButton} onPress={handlePing} disabled={loading}>
          <Text style={styles.buttonText}>Probar /ping</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={handleRefresh} disabled={loading}>
          <Text style={styles.buttonText}>Refrescar perfil</Text>
        </Pressable>
        <Pressable style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cerrar sesion</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 6,
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  healthButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#0284c7',
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: '#dc2626',
  },
});
