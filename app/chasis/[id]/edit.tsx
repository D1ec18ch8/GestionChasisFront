import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { getTiposChasis, getUbicaciones } from '@/src/services/catalogs.service';
import { getChasisById, updateChasis } from '@/src/services/chasis.service';
import { ApiError } from '@/src/types/api';
import { ChasisPayload, TipoChasis, Ubicacion } from '@/src/types/domain';

export default function EditChasisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [tipos, setTipos] = useState<TipoChasis[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tipoModalVisible, setTipoModalVisible] = useState(false);
  const [ubicModalVisible, setUbicModalVisible] = useState(false);

  const [tipoChasisId, setTipoChasisId] = useState('');
  const [nombre, setNombre] = useState('');
  const [ubicacionId, setUbicacionId] = useState('');
  const [numero, setNumero] = useState('');
  const [placa, setPlaca] = useState('');

  const [averiaPatas, setAveriaPatas] = useState(false);
  const [averiaLuces, setAveriaLuces] = useState(false);
  const [averiaManoplas, setAveriaManoplas] = useState(false);
  const [averiaMangueras, setAveriaMangueras] = useState(false);
  const [averiaLlantas, setAveriaLlantas] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tiposData, ubicacionesData, chasis] = await Promise.all([
          getTiposChasis(),
          getUbicaciones(),
          getChasisById(Number(id)),
        ]);

        setTipos(tiposData);
        setUbicaciones(ubicacionesData);

        setTipoChasisId(String(chasis.tipo_chasis_id ?? ''));
        setNombre(chasis.nombre ?? '');
        setUbicacionId(chasis.ubicacion_id ? String(chasis.ubicacion_id) : '');
        setNumero(chasis.numero ?? '');
        setPlaca(chasis.placa ?? '');
        setAveriaPatas(Boolean(chasis.averia_patas));
        setAveriaLuces(Boolean(chasis.averia_luces));
        setAveriaManoplas(Boolean(chasis.averia_manoplas));
        setAveriaMangueras(Boolean(chasis.averia_mangueras));
        setAveriaLlantas(Boolean(chasis.averia_llantas));
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const payload = useMemo<Partial<ChasisPayload>>(
    () => ({
      tipo_chasis_id: Number(tipoChasisId),
      nombre,
      placa,
      ubicacion_id: ubicacionId ? Number(ubicacionId) : undefined,
      numero: numero || undefined,
      averia_patas: averiaPatas,
      averia_luces: averiaLuces,
      averia_manoplas: averiaManoplas,
      averia_mangueras: averiaMangueras,
      averia_llantas: averiaLlantas,
    }),
    [
      tipoChasisId,
      nombre,
      placa,
      ubicacionId,
      numero,
      averiaPatas,
      averiaLuces,
      averiaManoplas,
      averiaMangueras,
      averiaLlantas,
    ],
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateChasis(Number(id), payload);
      router.replace('/(tabs)');
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 30 }} />;
  }

  const selectedTipo = tipos.find((item) => item.id === Number(tipoChasisId));
  const selectedUbicacion = ubicaciones.find((item) => item.id === Number(ubicacionId));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Campos</Text>

        <TextInput style={styles.input} placeholder="nombre" value={nombre} onChangeText={setNombre} />

        <Pressable style={styles.selector} onPress={() => setTipoModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedTipo ? selectedTipo.nombre : 'Selecciona tipo de chasis'}
          </Text>
        </Pressable>

        <Pressable style={styles.selector} onPress={() => setUbicModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedUbicacion
              ? selectedUbicacion.nombre
              : 'Selecciona ubicacion'}
          </Text>
        </Pressable>

        <TextInput style={styles.input} placeholder="numero" value={numero} onChangeText={setNumero} />
        <TextInput style={styles.input} placeholder="placa" value={placa} onChangeText={setPlaca} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Averias</Text>

        <View style={styles.switchRow}>
          <Text>Averia patas</Text>
          <Switch value={averiaPatas} onValueChange={setAveriaPatas} />
        </View>
        <View style={styles.switchRow}>
          <Text>Averia luces</Text>
          <Switch value={averiaLuces} onValueChange={setAveriaLuces} />
        </View>
        <View style={styles.switchRow}>
          <Text>Averia manoplas</Text>
          <Switch value={averiaManoplas} onValueChange={setAveriaManoplas} />
        </View>
        <View style={styles.switchRow}>
          <Text>Averia mangueras</Text>
          <Switch value={averiaMangueras} onValueChange={setAveriaMangueras} />
        </View>
        <View style={styles.switchRow}>
          <Text>Averia llantas</Text>
          <Switch value={averiaLlantas} onValueChange={setAveriaLlantas} />
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar cambios</Text>}
      </Pressable>

      <Modal visible={tipoModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tipo de chasis</Text>
            <ScrollView style={styles.modalList}>
              {tipos.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setTipoChasisId(String(item.id));
                    setTipoModalVisible(false);
                  }}>
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.secondaryButton} onPress={() => setTipoModalVisible(false)}>
              <Text style={styles.secondaryButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={ubicModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ubicacion</Text>
            <ScrollView style={styles.modalList}>
              {ubicaciones.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setUbicacionId(String(item.id));
                    setUbicModalVisible(false);
                  }}>
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.secondaryButton} onPress={() => setUbicModalVisible(false)}>
              <Text style={styles.secondaryButtonText}>Cerrar</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectorText: {
    color: '#0f172a',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
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
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalItemText: {
    color: '#0f172a',
  },
  error: {
    color: '#dc2626',
  },
});
