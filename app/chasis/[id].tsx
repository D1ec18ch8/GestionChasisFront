import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { getTiposChasis, getUbicaciones } from '@/src/services/catalogs.service';
import { deleteChasis, getChasisById, updateChasis } from '@/src/services/chasis.service';
import { ApiError } from '@/src/types/api';
import { Chasis, TipoChasis, Ubicacion } from '@/src/types/domain';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? 'N/A'}</Text>
    </View>
  );
}

export default function ChasisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [ubicSearchInput, setUbicSearchInput] = useState('');
  const [ubicSearchTerm, setUbicSearchTerm] = useState('');
  const [data, setData] = useState<Chasis | null>(null);
  const [tipos, setTipos] = useState<TipoChasis[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [result, tiposData, ubicacionesData] = await Promise.all([
          getChasisById(Number(id)),
          getTiposChasis(),
          getUbicaciones(),
        ]);
        setData(result);
        setTipos(tiposData);
        setUbicaciones(ubicacionesData);
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function handleDelete() {
    Alert.alert('Eliminar chasis', 'Esta accion no se puede deshacer.', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteChasis(Number(id));
            router.replace('/(tabs)');
          } catch (err) {
            setError((err as ApiError).message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  async function handleMoveLocation(newUbicacionId: number) {
    if (!data) return;

    setMoving(true);
    setError(null);
    try {
      const updated = await updateChasis(data.id, { ubicacion_id: newUbicacionId });
      setData(updated);
      setMoveModalVisible(false);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setMoving(false);
    }
  }

  const filteredUbicaciones = useMemo(() => {
    const term = ubicSearchTerm.trim().toLowerCase();
    if (!term) return ubicaciones;
    return ubicaciones.filter((item) => {
      const bag = `${item.nombre} ${item.codigo ?? ''}`.toLowerCase();
      return bag.includes(term);
    });
  }, [ubicSearchTerm, ubicaciones]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 30 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!data) {
    return <Text style={styles.empty}>No se encontro el chasis.</Text>;
  }

  const tipoNombre = tipos.find((item) => item.id === data.tipo_chasis_id)?.nombre ?? 'N/A';
  const ubicacionNombre =
    ubicaciones.find((item) => item.id === data.ubicacion_id)?.nombre ??
    (data.ubicacion_id ? String(data.ubicacion_id) : 'N/A');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Field label="Nombre" value={data.nombre} />
        <Field label="Estado actual" value={data.estado_actual} />
        <Field label="Tipo chasis" value={tipoNombre} />
        <Field label="Ubicacion" value={ubicacionNombre} />
        <Field label="Numero" value={data.numero} />
        <Field label="Placa" value={data.placa} />
        <Field
          label="Equipamientos en mal estado"
          value={data.equipamientos_en_mal_estado?.length ? data.equipamientos_en_mal_estado.join(', ') : 'Ninguno'}
        />
      </View>

      <Pressable style={styles.editButton} onPress={() => router.push(`/chasis/${id}/edit`)}>
        <Text style={styles.editText}>Editar chasis</Text>
      </Pressable>

      <Pressable style={styles.moveButton} onPress={() => setMoveModalVisible(true)} disabled={moving}>
        {moving ? <ActivityIndicator color="#fff" /> : <Text style={styles.editText}>Mover ubicacion</Text>}
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
        {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>Eliminar</Text>}
      </Pressable>

      <Modal visible={moveModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona nueva ubicacion</Text>
            <TextInput
              value={ubicSearchInput}
              onChangeText={setUbicSearchInput}
              placeholder="Buscar ubicacion"
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalActionButton} onPress={() => setUbicSearchTerm(ubicSearchInput.trim())}>
                <Text style={styles.modalActionText}>Filtrar</Text>
              </Pressable>
              <Pressable
                style={styles.modalActionSecondaryButton}
                onPress={() => {
                  setUbicSearchInput('');
                  setUbicSearchTerm('');
                }}>
                <Text style={styles.modalActionSecondaryText}>Limpiar</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {filteredUbicaciones.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => handleMoveLocation(item.id)}>
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.cancelButton} onPress={() => setMoveModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  field: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
  },
  value: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 18,
  },
  editButton: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  moveButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  editText: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: '#dc2626',
    marginTop: 20,
    textAlign: 'center',
  },
  empty: {
    color: '#334155',
    marginTop: 20,
    textAlign: 'center',
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
    maxHeight: '70%',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalList: {
    maxHeight: 280,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalActionSecondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalActionSecondaryText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalItemText: {
    color: '#0f172a',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});
