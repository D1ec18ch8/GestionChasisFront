import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getUbicaciones } from '@/src/services/catalogs.service';
import { getChasis } from '@/src/services/chasis.service';
import {
  downloadGeneralMovimientosPdf,
  downloadHistorialChasisPdf,
  getHistorialAcciones,
  getHistorialMovimientos,
} from '@/src/services/history.service';
import { ApiError } from '@/src/types/api';
import { Ubicacion } from '@/src/types/domain';
import { HistorialAccion, HistorialMovimiento } from '@/src/types/history';

function HistoryCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {rows.length ? (
        rows.map((row, index) => (
          <Text key={`${row}-${index}`} style={styles.item}>
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
  const [placaInput, setPlacaInput] = useState('');
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);

  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapAcciones = useCallback((data: HistorialAccion[]) => {
    return data.map(
      (item) =>
        `${item.id} | chasis:${item.chasis_id ?? 'N/A'} | ${item.accion ?? 'sin-accion'} | ${item.created_at ?? ''}`,
    );
  }, []);

  const mapMovimientos = useCallback((data: HistorialMovimiento[]) => {
    function resolveLocationFromId(
      item: HistorialMovimiento,
      idCandidates: string[],
    ) {
      for (const key of idCandidates) {
        const rawId = (item as Record<string, unknown>)[key];
        const id =
          typeof rawId === 'number'
            ? rawId
            : typeof rawId === 'string' && rawId.trim()
              ? Number(rawId)
              : NaN;

        if (!Number.isNaN(id)) {
          const found = ubicaciones.find((ubic) => ubic.id === id);
          return found?.nombre ?? `ID ${id}`;
        }
      }

      return null;
    }

    function resolveLocation(
      item: HistorialMovimiento,
      candidates: string[],
    ) {
      for (const key of candidates) {
        const value = (item as Record<string, unknown>)[key];

        if (typeof value === 'string' && value.trim()) {
          return value;
        }

        if (value && typeof value === 'object') {
          const obj = value as Record<string, unknown>;
          if (typeof obj.nombre === 'string' && obj.nombre.trim()) {
            return obj.nombre;
          }
        }
      }

      return 'N/A';
    }

    return data.map(
      (item) => {
        const origenFromText = resolveLocation(item, [
          'origen',
          'ubicacion_origen',
          'origen_nombre',
          'ubicacion_origen_nombre',
          'ubicacion_anterior',
          'from',
        ]);
        const origenFromId = resolveLocationFromId(item, [
          'origen_id',
          'ubicacion_origen_id',
          'ubicacion_anterior_id',
          'from_id',
        ]);

        const destinoFromText = resolveLocation(item, [
          'destino',
          'ubicacion_destino',
          'destino_nombre',
          'ubicacion_destino_nombre',
          'ubicacion_nueva',
          'to',
        ]);
        const destinoFromId = resolveLocationFromId(item, [
          'destino_id',
          'ubicacion_destino_id',
          'ubicacion_nueva_id',
          'to_id',
        ]);

        const origen = origenFromText !== 'N/A' ? origenFromText : (origenFromId ?? 'N/A');
        const destino = destinoFromText !== 'N/A' ? destinoFromText : (destinoFromId ?? 'N/A');

        return `${item.id} | chasis:${item.chasis_id ?? 'N/A'} | ${origen} -> ${destino} | ${item.created_at ?? ''}`;
      },
    );
  }, [ubicaciones]);

  function downloadArrayBufferAsPdf(buffer: ArrayBuffer, fileName: string) {
    if (Platform.OS !== 'web') {
      Alert.alert('PDF', 'La descarga directa de PDF esta habilitada en web.');
      return;
    }

    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function handlePdfDownload(kind: 'general' | 'placa') {
    setDownloadingPdf(true);
    setError(null);
    try {
      if (kind === 'general') {
        const data = await downloadGeneralMovimientosPdf();
        downloadArrayBufferAsPdf(data, 'historial-movimientos-general.pdf');
      }

      if (kind === 'placa') {
        const placa = placaInput.trim();
        if (!placa) {
          throw {
            status: 422,
            message: 'Debes escribir una placa para generar PDF por chasis.',
          } as ApiError;
        }

        const result = await getChasis({ search: placa, per_page: 100 });
        const matched = result.data.find(
          (item) => (item.placa ?? '').toLowerCase().trim() === placa.toLowerCase(),
        );

        if (!matched) {
          throw {
            status: 404,
            message: `No se encontro chasis con placa ${placa}.`,
          } as ApiError;
        }

        const data = await downloadHistorialChasisPdf(matched.id);
        downloadArrayBufferAsPdf(data, `historial-movimientos-${placa}.pdf`);
      }
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setDownloadingPdf(false);
    }
  }

  const loadHistory = useCallback(async (inputMode: string) => {
    setLoading(true);
    setError(null);

    try {
      if (inputMode === 'acciones-global') {
        const data = await getHistorialAcciones({ per_page: 30 });
        setRows(mapAcciones(data.data));
      }

      if (inputMode === 'movimientos-global') {
        const data = await getHistorialMovimientos({ per_page: 30 });
        setRows(mapMovimientos(data.data));
      }

      setMode(inputMode);
    } catch (err) {
      setError((err as ApiError).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [mapAcciones, mapMovimientos]);

  useEffect(() => {
    loadHistory('acciones-global');
  }, [loadHistory]);

  useEffect(() => {
    async function loadUbicaciones() {
      try {
        const data = await getUbicaciones();
        setUbicaciones(data);
      } catch {
        setUbicaciones([]);
      }
    }

    loadUbicaciones();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator size="large" color="#0284c7" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Consulta de historial</Text>
        <View style={styles.row}>
          <Pressable style={styles.modeButton} onPress={() => setMode('acciones-global')}>
            <Text style={styles.modeText}>Acciones</Text>
          </Pressable>
          <Pressable style={styles.modeButton} onPress={() => setMode('movimientos-global')}>
            <Text style={styles.modeText}>Movimientos</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={() => loadHistory(mode)}>
          <Text style={styles.refreshText}>Consultar</Text>
        </Pressable>
      </View>

      <HistoryCard title={`Resultado: ${mode}`} rows={rows} />

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Exportacion PDF de movimientos</Text>
        <Text style={styles.helper}>
          Usa placa para generar el PDF de un solo chasis.
        </Text>
        <TextInput
          style={styles.input}
          value={placaInput}
          onChangeText={setPlacaInput}
          placeholder="Placa para PDF individual"
        />
        <View style={styles.row}>
          <Pressable style={styles.pdfButton} onPress={() => handlePdfDownload('general')} disabled={downloadingPdf}>
            <Text style={styles.pdfButtonText}>PDF General (todos)</Text>
          </Pressable>
          <Pressable style={styles.pdfButton} onPress={() => handlePdfDownload('placa')} disabled={downloadingPdf}>
            <Text style={styles.pdfButtonText}>PDF por placa</Text>
          </Pressable>
        </View>
      </View>
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
  helper: {
    color: '#64748b',
    fontSize: 12,
  },
  pdfButton: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  error: {
    color: '#dc2626',
  },
});
