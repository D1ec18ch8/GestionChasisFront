import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useAuth } from '@/src/context/auth-context';
import { createUsuario, deleteUsuario, getUsuarios, updateUsuario } from '@/src/services/users.service';
import { ApiError } from '@/src/types/api';
import { Usuario } from '@/src/types/domain';

export default function UsuariosScreen() {
  const router = useRouter();
  const { user: currentUser, logout } = useAuth();
  const isAdmin = String(currentUser?.rol ?? '').toLowerCase() === 'admin';
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<'admin' | 'usuario'>('usuario');
  const [password, setPassword] = useState('');
  const [activo, setActivo] = useState(true);

  function normalizeRol(value?: string): 'admin' | 'usuario' {
    return String(value ?? '').toLowerCase() === 'admin' ? 'admin' : 'usuario';
  }

  async function loadItems() {
    setError(null);
    try {
      const data = await getUsuarios();
      setItems(data);
    } catch (err) {
      setError((err as ApiError).message);
      setItems([]);
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadItems().finally(() => setLoading(false));
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const bag = `${item.nombre} ${item.email} ${item.rol ?? ''}`.toLowerCase();
      return bag.includes(term);
    });
  }, [items, search]);

  if (!isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  function resetForm() {
    setEditId(null);
    setNombre('');
    setEmail('');
    setRol('usuario');
    setPassword('');
    setActivo(true);
    setShowForm(false);
  }

  function openNewUserModal() {
    setEditId(null);
    setNombre('');
    setEmail('');
    setRol('usuario');
    setPassword('');
    setActivo(true);
    setShowForm(true);
  }

  function openEditUserModal(item: Usuario) {
    setEditId(item.id);
    setNombre(item.nombre);
    setEmail(item.email);
    setRol(normalizeRol(item.rol));
    setPassword('');
    setActivo(item.activo !== false);
    setShowForm(true);
  }

  async function handleSave() {
    if (!nombre.trim() || !email.trim()) return;
    if (!editId && !password.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: nombre.trim(),
        email: email.trim(),
        rol,
        activo,
        password: password.trim() || undefined,
        password_confirmation: password.trim() || undefined,
      };

      if (editId) {
        await updateUsuario(editId, payload);
      } else {
        await createUsuario(payload);
      }

      await loadItems();
      resetForm();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const currentUserId = currentUser?.id;
    const currentRole = String(currentUser?.rol ?? '').toLowerCase();
    const canDelete = currentRole === 'admin' || currentUserId === id;

    if (!canDelete) {
      setError('No tienes permisos para eliminar este usuario.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await deleteUsuario(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editId === id) {
        resetForm();
      }

      if (currentUserId === id) {
        await logout();
        router.replace('/(auth)/login');
      }
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.status === 401) {
        await logout();
        router.replace('/(auth)/login');
        return;
      }

      if (apiError.status === 403) {
        setError(apiError.message || 'No tienes permisos para eliminar este usuario.');
        return;
      }

      if (apiError.status === 404) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setError(apiError.message || 'El usuario ya no existe.');
        return;
      }

      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 24 }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Seguridad</Text>
        <Text style={styles.heroTitle}>Usuarios</Text>
        <Text style={styles.subtitle}>Gestiona accesos, roles y estado de las cuentas desde un panel protegido.</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Filtrar por nombre, correo o rol"
          value={searchInput}
          onChangeText={setSearchInput}
        />
        <View style={styles.row}>
          <Pressable style={styles.primaryButton} onPress={() => setSearch(searchInput.trim())}>
            <Text style={styles.primaryButtonText}>Filtrar</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={openNewUserModal}>
            <Text style={styles.secondaryButtonText}>Nuevo usuario</Text>
          </Pressable>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {filtered.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.sub}>Correo: {item.email}</Text>
          <Text style={styles.sub}>Rol: {item.rol ?? 'usuario'}</Text>
          <Text style={styles.sub}>Estado: {item.activo === false ? 'Inactivo' : 'Activo'}</Text>

          <View style={styles.row}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => openEditUserModal(item)}>
              <Text style={styles.secondaryButtonText}>Editar</Text>
            </Pressable>
            {String(currentUser?.rol ?? '').toLowerCase() === 'admin' || currentUser?.id === item.id ? (
              <Pressable
                style={styles.dangerButton}
                onPress={() => setDeleteTargetId(item.id)}
                disabled={saving}>
                <Text style={styles.dangerButtonText}>Eliminar</Text>
              </Pressable>
            ) : (
              <View style={styles.noPermissionBox}>
                <Text style={styles.noPermissionText}>Sin permiso para eliminar</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      {!filtered.length ? <Text style={styles.empty}>No hay usuarios para mostrar.</Text> : null}

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={resetForm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editId ? 'Editar usuario' : 'Nuevo usuario'}</Text>

            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
              <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} />
              <View style={styles.roleWrapper}>
                <Text style={styles.switchLabel}>Rol</Text>
                <View style={styles.row}>
                  <Pressable
                    style={[styles.roleButton, rol === 'usuario' && styles.roleButtonActive]}
                    onPress={() => setRol('usuario')}>
                    <Text style={[styles.roleButtonText, rol === 'usuario' && styles.roleButtonTextActive]}>
                      Usuario
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.roleButton, rol === 'admin' && styles.roleButtonActive]}
                    onPress={() => setRol('admin')}>
                    <Text style={[styles.roleButtonText, rol === 'admin' && styles.roleButtonTextActive]}>
                      Administrador
                    </Text>
                  </Pressable>
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder={editId ? 'Nueva password (opcional)' : 'Password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Activo</Text>
                <Switch value={activo} onValueChange={setActivo} />
              </View>

              <View style={styles.row}>
                <Pressable style={styles.primaryButton} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Guardar</Text>}
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={resetForm} disabled={saving}>
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteTargetId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTargetId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar usuario</Text>
            <Text style={styles.modalMessage}>Esta accion no se puede deshacer.</Text>
            <View style={styles.row}>
              <Pressable style={styles.secondaryButton} onPress={() => setDeleteTargetId(null)} disabled={saving}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.dangerButton}
                onPress={async () => {
                  const id = deleteTargetId;
                  setDeleteTargetId(null);
                  if (id) {
                    await handleDelete(id);
                  }
                }}
                disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerButtonText}>Eliminar</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 10,
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  kicker: {
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sub: {
    color: '#475569',
  },
  form: {
    gap: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalMessage: {
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  switchLabel: {
    color: '#0f172a',
    fontWeight: '600',
  },
  roleWrapper: {
    gap: 6,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  roleButtonActive: {
    backgroundColor: '#0284c7',
  },
  roleButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  noPermissionBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  noPermissionText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    color: '#dc2626',
    paddingHorizontal: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#475569',
  },
});
