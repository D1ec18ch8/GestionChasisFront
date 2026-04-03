import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/context/auth-context';

export default function PerfilScreen() {
  const { user, refreshMe, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    await refreshMe();
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    await logout();
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.name ?? 'N/A'}</Text>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>

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
});
