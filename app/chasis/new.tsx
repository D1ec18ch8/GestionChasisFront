import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
      const result = await createChasis(payload);
      router.replace(`/chasis/${result.id}`);
    } catch (err) {
      setApiError(err as ApiError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loadingCatalogs ? <ActivityIndicator size="large" color="#0284c7" /> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Campos requeridos</Text>

        <TextInput
          style={styles.input}
          placeholder="tipo_chasis_id (ej: 1)"
          value={tipoChasisId}
          onChangeText={setTipoChasisId}
          keyboardType="number-pad"
        />
        {tipos.length ? (
          <Text style={styles.help}>Tipos disponibles: {tipos.map((item) => `${item.id}:${item.nombre}`).join(' | ')}</Text>
        ) : null}
        {!!pickFieldError(apiError ?? undefined, 'tipo_chasis_id') ? (
          <Text style={styles.error}>{pickFieldError(apiError ?? undefined, 'tipo_chasis_id')}</Text>
        ) : null}

        <TextInput style={styles.input} placeholder="nombre" value={nombre} onChangeText={setNombre} />
        {!!pickFieldError(apiError ?? undefined, 'nombre') ? (
          <Text style={styles.error}>{pickFieldError(apiError ?? undefined, 'nombre')}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Opcionales</Text>
        <TextInput
          style={styles.input}
          placeholder="ubicacion_id"
          value={ubicacionId}
          onChangeText={setUbicacionId}
          keyboardType="number-pad"
        />
        {ubicaciones.length ? (
          <Text style={styles.help}>
            Ubicaciones: {ubicaciones.map((item) => `${item.id}:${item.nombre}`).join(' | ')}
          </Text>
        ) : null}

        <TextInput style={styles.input} placeholder="categoria" value={categoria} onChangeText={setCategoria} />
        <TextInput style={styles.input} placeholder="numero" value={numero} onChangeText={setNumero} />
        <TextInput style={styles.input} placeholder="placa" value={placa} onChangeText={setPlaca} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Averias (estado se calcula en backend)</Text>

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
  error: {
    color: '#dc2626',
  },
});
