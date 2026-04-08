import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    createTipoChasis,
    deleteTipoChasis,
    getTiposChasis,
    updateTipoChasis,
} from '@/src/services/catalogs.service';
import { ApiError } from '@/src/types/api';
import { TipoChasis } from '@/src/types/domain';

export default function TiposCatalogScreen() {
  const [items, setItems] = useState<TipoChasis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const data = await getTiposChasis();
      setItems(data);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.nombre.toLowerCase().includes(term));
  }, [items, search]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  async function saveItem() {
    if (!nombre.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updateTipoChasis(editId, { nombre: nombre.trim() });
      } else {
        await createTipoChasis({ nombre: nombre.trim() });
      }
      setNombre('');
      setEditId(null);
      await fetchData();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id: number) {
    setSaving(true);
    setError(null);
    try {
      await deleteTipoChasis(id);
      await fetchData();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Filtrar por nombre"
          style={styles.input}
        />

        <Pressable
          style={styles.button}
          onPress={() => {
            setShowForm(true);
            setEditId(null);
            setNombre('');
          }}>
          <Text style={styles.buttonText}>Nuevo</Text>
        </Pressable>

        {showForm ? (
          <>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de tipo"
              style={styles.input}
            />

            <View style={styles.row}>
              <Pressable style={styles.button} onPress={saveItem} disabled={saving}>
                <Text style={styles.buttonText}>{editId ? 'Actualizar' : 'Crear'}</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setNombre('');
                  setEditId(null);
                  setShowForm(false);
                }}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>

      {loading ? <ActivityIndicator size="large" color="#0284c7" style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <View style={styles.row}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setEditId(item.id);
                  setNombre(item.nombre);
                  setShowForm(true);
                }}>
                <Text style={styles.secondaryButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => removeItem(item.id)}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  filters: {
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButtonText: { color: '#0f172a', fontWeight: '700' },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
  loader: { marginTop: 16 },
  error: { color: '#dc2626', paddingHorizontal: 12, paddingTop: 10 },
  list: { padding: 12, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSub: { color: '#475569' },
});
