import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getHistorialAcciones,
  getHistorialAccionesByChasis,
  getHistorialChasis,
  getHistorialGeneral,
  getHistorialMovimientos,
  getHistorialMovimientosByChasis,
  getHistorialUbicaciones,
  getHistorialUbicacionesByChasis,
} from '@/src/services/history.service';
import { ApiError } from '@/src/types/api';
import { HistorialAccion, HistorialGeneral, HistorialMovimiento } from '@/src/types/history';

function HistoryCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {rows.length ? (
        rows.map((row) => (
          <Text key={row} style={styles.item}>
            - {row}
          </Text>
        ))
      ) : (
        <Text style={styles.empty}>Sin registros</Text>
      )}
    </View>
  );
}

export default function HistorialScreen() {
  const [rows, setRows] = useState<string[]>([]);
  const [mode, setMode] = useState('acciones-global');
  const [chasisId, setChasisId] = useState('');
  const [accion, setAccion] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function mapAcciones(data: HistorialAccion[]) {
    return data.map(
      (item) =>
        `${item.id} | chasis:${item.chasis_id ?? 'N/A'} | ${item.accion ?? 'sin-accion'} | ${item.created_at ?? ''}`,
    );
  }

  function mapMovimientos(data: HistorialMovimiento[]) {
    return data.map(
      (item) =>
        `${item.id} | chasis:${item.chasis_id ?? 'N/A'} | ${item.origen ?? 'N/A'} -> ${item.destino ?? 'N/A'} | ${item.created_at ?? ''}`,
    );
  }

  function mapGeneral(data: HistorialGeneral[]) {
    return data.map(
      (item) =>
        `${item.id ?? 'N/A'} | chasis:${item.chasis_id ?? 'N/A'} | ${item.tipo ?? 'general'} | ${item.descripcion ?? ''} | ${item.created_at ?? ''}`,
    );
  }

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {
        per_page: 30,
        accion: (accion || undefined) as 'creacion' | 'actualizacion' | 'eliminacion' | undefined,
      };

      const id = Number(chasisId);
      const hasChasis = Number.isFinite(id) && id > 0;

      if (mode === 'general-global') {
        const data = await getHistorialGeneral(filters);
        setRows(mapGeneral(data.data));
      }

      if (mode === 'acciones-global') {
        const data = await getHistorialAcciones(filters);
        setRows(mapAcciones(data.data));
      }

      if (mode === 'movimientos-global') {
        const data = await getHistorialMovimientos(filters);
        setRows(mapMovimientos(data.data));
      }

      if (mode === 'ubicaciones-global') {
        const data = await getHistorialUbicaciones(filters);
        setRows(mapMovimientos(data.data));
      }

      if (mode === 'chasis-general') {
        if (!hasChasis) throw { message: 'Ingresa chasis_id valido.' } as ApiError;
        const data = await getHistorialChasis(id, filters);
        setRows(mapGeneral(data.data));
      }

      if (mode === 'chasis-acciones') {
        if (!hasChasis) throw { message: 'Ingresa chasis_id valido.' } as ApiError;
        const data = await getHistorialAccionesByChasis(id, filters);
        setRows(mapAcciones(data.data));
      }

      if (mode === 'chasis-movimientos') {
        if (!hasChasis) throw { message: 'Ingresa chasis_id valido.' } as ApiError;
        const data = await getHistorialMovimientosByChasis(id, filters);
        setRows(mapMovimientos(data.data));
      }

      if (mode === 'chasis-ubicaciones') {
        if (!hasChasis) throw { message: 'Ingresa chasis_id valido.' } as ApiError;
        const data = await getHistorialUbicacionesByChasis(id, filters);
        setRows(mapMovimientos(data.data));
      }
    } catch (err) {
      setError((err as ApiError).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [accion, chasisId, mode]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator size="large" color="#0284c7" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Consulta de historial</Text>
        <TextInput
          style={styles.input}
          value={chasisId}
          onChangeText={setChasisId}
          keyboardType="number-pad"
          placeholder="chasis_id (solo para modos por chasis)"
        />
        <TextInput
          style={styles.input}
          value={accion}
          onChangeText={setAccion}
          placeholder="accion opcional: creacion | actualizacion | eliminacion"
        />

        <View style={styles.row}>
          <Pressable style={styles.modeButton} onPress={() => setMode('general-global')}>
            <Text style={styles.modeText}>General</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('acciones-global')}>
            <Text style={styles.modeText}>Acciones</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('movimientos-global')}>
            <Text style={styles.modeText}>Movimientos</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('ubicaciones-global')}>
            <Text style={styles.modeText}>Ubicaciones</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.modeButton} onPress={() => setMode('chasis-general')}>
            <Text style={styles.modeText}>Chasis General</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('chasis-acciones')}>
            <Text style={styles.modeText}>Chasis Acciones</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('chasis-movimientos')}>
            <Text style={styles.modeText}>Chasis Movs</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('chasis-ubicaciones')}>
            <Text style={styles.modeText}>Chasis Ubics</Text>
          </Pressable>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadHistory}>
          <Text style={styles.refreshText}>Consultar</Text>
        </Pressable>
      </View>

      <HistoryCard title={`Resultado: ${mode}`} rows={rows} />
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
  block: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  modeButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modeText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 12,
  },
  refreshButton: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '700',
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  item: {
    color: '#334155',
  },
  empty: {
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
  },
});
