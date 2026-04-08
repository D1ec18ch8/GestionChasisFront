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
    createUbicacion,
    deleteUbicacion,
    getUbicaciones,
    updateUbicacion,
} from '@/src/services/catalogs.service';
import { ApiError } from '@/src/types/api';
import { Ubicacion } from '@/src/types/domain';

export default function UbicacionesCatalogScreen() {
  const [items, setItems] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [aduana, setAduana] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fax, setFax] = useState('');
  const [email, setEmail] = useState('');

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const data = await getUbicaciones();
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
    return items.filter((item) => {
      const bag = `${item.nombre} ${item.codigo ?? ''} ${item.razon_social ?? ''}`.toLowerCase();
      return bag.includes(term);
    });
  }, [items, search]);

  function resetForm() {
    setEditId(null);
    setNombre('');
    setCodigo('');
    setRazonSocial('');
    setAduana('');
    setDireccion('');
    setTelefono('');
    setFax('');
    setEmail('');
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  async function saveItem() {
    if (!nombre.trim() || !codigo.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        razon_social: razonSocial.trim() || undefined,
        aduana: aduana.trim() || undefined,
        direccion: direccion.trim() || undefined,
        telefono: telefono.trim() || undefined,
        fax: fax.trim() || undefined,
        email: email.trim() || undefined,
      };

      if (editId) {
        await updateUbicacion(editId, payload);
      } else {
        await createUbicacion(payload);
      }
      resetForm();
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
      await deleteUbicacion(id);
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
          placeholder="Filtrar por nombre/codigo"
          style={styles.input}
        />

        <Pressable
          style={styles.button}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}>
          <Text style={styles.buttonText}>Nuevo</Text>
        </Pressable>

        {showForm ? (
          <>
            <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" style={styles.input} />
            <TextInput value={codigo} onChangeText={setCodigo} placeholder="Codigo" style={styles.input} />
            <TextInput value={razonSocial} onChangeText={setRazonSocial} placeholder="Razon social" style={styles.input} />
            <TextInput value={aduana} onChangeText={setAduana} placeholder="Aduana" style={styles.input} />
            <TextInput value={direccion} onChangeText={setDireccion} placeholder="Direccion" style={styles.input} />
            <TextInput value={telefono} onChangeText={setTelefono} placeholder="Telefono" style={styles.input} />
            <TextInput value={fax} onChangeText={setFax} placeholder="Fax" style={styles.input} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <Pressable style={styles.button} onPress={saveItem} disabled={saving}>
                <Text style={styles.buttonText}>{editId ? 'Actualizar' : 'Crear'}</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  resetForm();
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
            <Text style={styles.cardSub}>Cod: {item.codigo ?? 'N/A'} | RS: {item.razon_social ?? 'N/A'}</Text>
            <Text style={styles.cardSub}>Aduana: {item.aduana ?? 'N/A'}</Text>
            <Text style={styles.cardSub}>Direccion: {item.direccion ?? 'N/A'}</Text>
            <Text style={styles.cardSub}>Telefono: {item.telefono ?? 'N/A'} | Fax: {item.fax ?? 'N/A'}</Text>
            <Text style={styles.cardSub}>Email: {item.email ?? 'N/A'}</Text>
            <View style={styles.row}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setEditId(item.id);
                  setNombre(item.nombre);
                  setCodigo(item.codigo ?? '');
                  setRazonSocial(item.razon_social ?? '');
                  setAduana(item.aduana ?? '');
                  setDireccion(item.direccion ?? '');
                  setTelefono(item.telefono ?? '');
                  setFax(item.fax ?? '');
                  setEmail(item.email ?? '');
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
