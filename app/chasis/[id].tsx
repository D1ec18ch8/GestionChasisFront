import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { deleteChasis, getChasisById } from '@/src/services/chasis.service';
import { ApiError } from '@/src/types/api';
import { Chasis } from '@/src/types/domain';

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
  const [data, setData] = useState<Chasis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getChasisById(Number(id));
        setData(result);
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 30 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!data) {
    return <Text style={styles.empty}>No se encontro el chasis.</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Field label="Nombre" value={data.nombre} />
        <Field label="Estado actual" value={data.estado_actual} />
        <Field label="Tipo chasis id" value={data.tipo_chasis_id} />
        <Field label="Ubicacion id" value={data.ubicacion_id} />
        <Field label="Categoria" value={data.categoria} />
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

      <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
        {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>Eliminar</Text>}
      </Pressable>
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
});
