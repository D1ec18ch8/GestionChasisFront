import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Cuenta</Text>
        <Text style={styles.title}>{user?.nombre ?? user?.name ?? 'Perfil de usuario'}</Text>
        <Text style={styles.subtitle}>{user?.email ?? 'N/A'}</Text>
        <View style={styles.heroRow}>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>Rol</Text>
            <Text style={styles.pillValue}>{String(user?.rol ?? 'usuario')}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>API</Text>
            <Text style={styles.pillValue}>{health}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informacion</Text>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.nombre ?? user?.name ?? 'N/A'}</Text>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>
        <Text style={styles.label}>Estado de API</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    gap: 8,
  },
  kicker: {
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    color: '#cbd5e1',
  },
  heroRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pillValue: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
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
