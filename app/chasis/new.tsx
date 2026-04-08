import { router } from 'expo-router';
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
import { createChasis } from '@/src/services/chasis.service';
import { ApiError } from '@/src/types/api';
import { ChasisPayload, TipoChasis, Ubicacion } from '@/src/types/domain';

function pickFieldError(error?: ApiError, field?: string) {
  if (!error?.errors || !field) return null;

  const value = error.errors[field];
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export default function NewChasisScreen() {
  const [tipos, setTipos] = useState<TipoChasis[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [tipoModalVisible, setTipoModalVisible] = useState(false);
  const [ubicModalVisible, setUbicModalVisible] = useState(false);
  const [tipoFilterInput, setTipoFilterInput] = useState('');
  const [tipoFilterTerm, setTipoFilterTerm] = useState('');
  const [ubicFilterInput, setUbicFilterInput] = useState('');
  const [ubicFilterTerm, setUbicFilterTerm] = useState('');

  const [tipoChasisId, setTipoChasisId] = useState('');
  const [nombre, setNombre] = useState('');
  const [ubicacionId, setUbicacionId] = useState('');
  const [categoria, setCategoria] = useState('');
  const [numero, setNumero] = useState('');
  const [placa, setPlaca] = useState('');

  const [averiaPatas, setAveriaPatas] = useState(false);
  const [averiaLuces, setAveriaLuces] = useState(false);
  const [averiaManoplas, setAveriaManoplas] = useState(false);
  const [averiaMangueras, setAveriaMangueras] = useState(false);
  const [averiaLlantas, setAveriaLlantas] = useState(false);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [tiposData, ubicacionesData] = await Promise.all([getTiposChasis(), getUbicaciones()]);
        setTipos(tiposData);
        setUbicaciones(ubicacionesData);
      } catch (err) {
        setApiError(err as ApiError);
      } finally {
        setLoadingCatalogs(false);
      }
    }

    loadCatalogs();
  }, []);

  const payload = useMemo<ChasisPayload>(
    () => ({
      tipo_chasis_id: Number(tipoChasisId),
      nombre,
      ubicacion_id: ubicacionId ? Number(ubicacionId) : undefined,
      categoria: categoria || undefined,
      numero: numero || undefined,
      placa: placa || undefined,
      averia_patas: averiaPatas,
      averia_luces: averiaLuces,
      averia_manoplas: averiaManoplas,
      averia_mangueras: averiaMangueras,
      averia_llantas: averiaLlantas,
    }),
    [
      tipoChasisId,
      nombre,
      ubicacionId,
      categoria,
      numero,
      placa,
      averiaPatas,
      averiaLuces,
      averiaManoplas,
      averiaMangueras,
      averiaLlantas,
    ],
  );

  async function handleSave() {
    setSaving(true);
    setApiError(null);

    try {
      await createChasis(payload);
      router.replace('/(tabs)');
    } catch (err) {
      setApiError(err as ApiError);
    } finally {
      setSaving(false);
    }
  }

  const selectedTipo = tipos.find((item) => item.id === Number(tipoChasisId));
  const selectedUbicacion = ubicaciones.find((item) => item.id === Number(ubicacionId));
  const filteredTipos = useMemo(() => {
    const term = tipoFilterTerm.trim().toLowerCase();
    if (!term) return tipos;
    return tipos.filter((item) => item.nombre.toLowerCase().includes(term));
  }, [tipos, tipoFilterTerm]);
  const filteredUbicaciones = useMemo(() => {
    const term = ubicFilterTerm.trim().toLowerCase();
    if (!term) return ubicaciones;
    return ubicaciones.filter((item) => {
      const bag = `${item.nombre} ${item.codigo ?? ''}`.toLowerCase();
      return bag.includes(term);
    });
  }, [ubicaciones, ubicFilterTerm]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loadingCatalogs ? <ActivityIndicator size="large" color="#0284c7" /> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Campos requeridos</Text>

        <TextInput
          style={styles.input}
          placeholder="nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <Pressable style={styles.selector} onPress={() => setTipoModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedTipo ? selectedTipo.nombre : 'Selecciona tipo de chasis'}
          </Text>
        </Pressable>
        {!!pickFieldError(apiError ?? undefined, 'tipo_chasis_id') ? (
          <Text style={styles.error}>{pickFieldError(apiError ?? undefined, 'tipo_chasis_id')}</Text>
        ) : null}
        {!!pickFieldError(apiError ?? undefined, 'nombre') ? (
          <Text style={styles.error}>{pickFieldError(apiError ?? undefined, 'nombre')}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Opcionales</Text>
        <Pressable style={styles.selector} onPress={() => setUbicModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedUbicacion
              ? selectedUbicacion.nombre
              : 'Selecciona ubicacion'}
          </Text>
        </Pressable>

        <TextInput style={styles.input} placeholder="categoria" value={categoria} onChangeText={setCategoria} />
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

      {apiError?.message ? <Text style={styles.error}>{apiError.message}</Text> : null}

      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
      </Pressable>

      <Modal visible={tipoModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tipo de chasis</Text>
            <TextInput
              value={tipoFilterInput}
              onChangeText={setTipoFilterInput}
              placeholder="Buscar tipo"
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalActionButton} onPress={() => setTipoFilterTerm(tipoFilterInput.trim())}>
                <Text style={styles.modalActionText}>Filtrar</Text>
              </Pressable>
              <Pressable
                style={styles.modalActionSecondaryButton}
                onPress={() => {
                  setTipoFilterInput('');
                  setTipoFilterTerm('');
                }}>
                <Text style={styles.modalActionSecondaryText}>Limpiar</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {filteredTipos.map((item) => (
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
            <TextInput
              value={ubicFilterInput}
              onChangeText={setUbicFilterInput}
              placeholder="Buscar ubicacion"
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalActionButton} onPress={() => setUbicFilterTerm(ubicFilterInput.trim())}>
                <Text style={styles.modalActionText}>Filtrar</Text>
              </Pressable>
              <Pressable
                style={styles.modalActionSecondaryButton}
                onPress={() => {
                  setUbicFilterInput('');
                  setUbicFilterTerm('');
                }}>
                <Text style={styles.modalActionSecondaryText}>Limpiar</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {filteredUbicaciones.map((item) => (
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
  help: {
    fontSize: 12,
    color: '#64748b',
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
  error: {
    color: '#dc2626',
  },
});
