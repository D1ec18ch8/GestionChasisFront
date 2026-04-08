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
    createEstado,
    deleteEstado,
    getEstados,
    updateEstado,
} from '@/src/services/catalogs.service';
import { ApiError } from '@/src/types/api';
import { Estado } from '@/src/types/domain';

function isProtectedState(item: Estado) {
  const value = (item.slug ?? item.nombre ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  return value === 'optimo' || value === 'revision';
}

export default function EstadosCatalogScreen() {
  const [items, setItems] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const data = await getEstados();
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
    return items.filter((item) => `${item.nombre} ${item.slug ?? ''}`.toLowerCase().includes(term));
  }, [items, search]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  async function saveItem() {
    if (!nombre.trim() || !slug.trim()) return;

    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updateEstado(editId, { nombre: nombre.trim(), slug: slug.trim() });
      } else {
        await createEstado({ nombre: nombre.trim(), slug: slug.trim() });
      }
      setNombre('');
      setSlug('');
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
      await deleteEstado(id);
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
          placeholder="Filtrar por nombre o slug"
          style={styles.input}
        />

        <Pressable
          style={styles.button}
          onPress={() => {
            setEditId(null);
            setNombre('');
            setSlug('');
            setShowForm(true);
          }}>
          <Text style={styles.buttonText}>Nuevo</Text>
        </Pressable>

        {showForm ? (
          <>
            <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" style={styles.input} />
            <TextInput value={slug} onChangeText={setSlug} placeholder="Slug" style={styles.input} />

            <View style={styles.row}>
              <Pressable style={styles.button} onPress={saveItem} disabled={saving}>
                <Text style={styles.buttonText}>{editId ? 'Actualizar' : 'Crear'}</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setNombre('');
                  setSlug('');
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
            <Text style={styles.cardSub}>Slug: {item.slug ?? 'sin-slug'}</Text>

            {isProtectedState(item) ? (
              <Text style={styles.protected}>Estado base protegido</Text>
            ) : (
              <View style={styles.row}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setEditId(item.id);
                    setNombre(item.nombre);
                    setSlug(item.slug ?? '');
                    setShowForm(true);
                  }}>
                  <Text style={styles.secondaryButtonText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => removeItem(item.id)}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </Pressable>
              </View>
            )}
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
  protected: { color: '#64748b', fontWeight: '600' },
});
