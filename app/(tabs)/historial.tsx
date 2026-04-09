import { encode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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
import {
  downloadGeneralMovimientosPdf,
  downloadMovimientosPdf,
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

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function HistorialScreen() {
  const [rows, setRows] = useState<string[]>([]);
  const [mode, setMode] = useState('acciones-global');
  const [selectedMode, setSelectedMode] = useState('acciones-global');
  const [placaInput, setPlacaInput] = useState('');
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);

  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getChasisNombre(item: Record<string, unknown>) {
    const chasisObj = item.chasis as Record<string, unknown> | undefined;
    if (chasisObj) {
      if (typeof chasisObj.nombre === 'string' && chasisObj.nombre.trim()) {
        return chasisObj.nombre;
      }

      if (typeof chasisObj.placa === 'string' && chasisObj.placa.trim()) {
        return chasisObj.placa;
      }
    }

    return `id:${item.chasis_id ?? 'N/A'}`;
  }

  const mapAcciones = useCallback((data: HistorialAccion[]) => {
    return data.map(
      (item) =>
        `${item.id} | chasis:${getChasisNombre(item as Record<string, unknown>)} | ${item.accion ?? 'sin-accion'} | ${formatDate(item.created_at)}`,
    );
  }, []);

  const mapMovimientos = useCallback((data: HistorialMovimiento[]) => {
    return data.map((item) => {
      // Intenta obtener ubicaciones desde detalle (JSON del backend)
      const detalle = (item as Record<string, unknown>).detalle as Record<string, unknown> | undefined;
      
      let origen = 'N/A';
      let destino = 'N/A';

      if (detalle) {
        // Si existe el objeto detalle, obtén origen y destino
        if (typeof detalle.origen === 'string' && detalle.origen.trim()) {
          origen = detalle.origen;
        }
        if (typeof detalle.destino === 'string' && detalle.destino.trim()) {
          destino = detalle.destino;
        }
      }

      // Si detalle no tiene los valores, intenta buscar por IDs en item
      if (origen === 'N/A') {
        for (const key of ['origen_id', 'ubicacion_origen_id', 'ubicacion_anterior_id', 'from_id']) {
          const rawId = (item as Record<string, unknown>)[key];
          const id =
            typeof rawId === 'number'
              ? rawId
              : typeof rawId === 'string' && rawId.trim()
                ? Number(rawId)
                : NaN;

          if (!Number.isNaN(id)) {
            const found = ubicaciones.find((ubic) => ubic.id === id);
            if (found) {
              origen = found.nombre;
              break;
            }
          }
        }
      }

      if (destino === 'N/A') {
        for (const key of ['destino_id', 'ubicacion_destino_id', 'ubicacion_nueva_id', 'to_id']) {
          const rawId = (item as Record<string, unknown>)[key];
          const id =
            typeof rawId === 'number'
              ? rawId
              : typeof rawId === 'string' && rawId.trim()
                ? Number(rawId)
                : NaN;

          if (!Number.isNaN(id)) {
            const found = ubicaciones.find((ubic) => ubic.id === id);
            if (found) {
              destino = found.nombre;
              break;
            }
          }
        }
      }

      return `${item.id} | chasis:${getChasisNombre(item as Record<string, unknown>)} | ${origen} -> ${destino} | ${formatDate(item.created_at)}`;
    });
  }, [ubicaciones]);

  async function downloadArrayBufferAsPdf(buffer: ArrayBuffer, fileName: string) {
    if (Platform.OS === 'web') {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return;
    }

    const base64 = encode(buffer);
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

    if (!baseDir) {
      throw {
        status: 500,
        message: 'No se pudo acceder al almacenamiento del dispositivo.',
      } as ApiError;
    }

    const fileUri = `${baseDir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir PDF',
        UTI: 'com.adobe.pdf',
      });
      return;
    }

    Alert.alert('PDF generado', `Archivo guardado en: ${fileUri}`);
  }

  async function handlePdfDownload(kind: 'general' | 'placa') {
    setDownloadingPdf(true);
    setError(null);
    try {
      if (kind === 'general') {
        const data = await downloadGeneralMovimientosPdf();
        await downloadArrayBufferAsPdf(data, 'historial-movimientos-general.pdf');
      }

      if (kind === 'placa') {
        const placa = placaInput.trim();
        if (!placa) {
          throw {
            status: 422,
            message: 'Debes escribir una placa para generar PDF por chasis.',
          } as ApiError;
        }

        const data = await downloadMovimientosPdf(placa);
        await downloadArrayBufferAsPdf(data, `historial-movimientos-${placa}.pdf`);
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
    // Cargar ubicaciones primero
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

  useEffect(() => {
    // Carga inicial al montar el componente solo una vez
    let isMounted = true;
    
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getHistorialAcciones({ per_page: 30 });
        if (isMounted) {
          setRows(mapAcciones(data.data));
          setMode('acciones-global');
        }
      } catch (err) {
        if (isMounted) {
          setError((err as ApiError).message);
          setRows([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [mapAcciones]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Auditoria</Text>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>Consulta acciones y movimientos con exportacion PDF lista para revisar o compartir.</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#0284c7" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Consulta de historial</Text>
        <View style={styles.row}>
          <Pressable
            style={[
              styles.modeButton,
              selectedMode === 'acciones-global' && styles.modeButtonActive,
            ]}
            onPress={() => setSelectedMode('acciones-global')}>
            <Text style={[styles.modeText, selectedMode === 'acciones-global' && styles.modeTextActive]}>
              Acciones
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              selectedMode === 'movimientos-global' && styles.modeButtonActive,
            ]}
            onPress={() => setSelectedMode('movimientos-global')}>
            <Text style={[styles.modeText, selectedMode === 'movimientos-global' && styles.modeTextActive]}>
              Movimientos
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.refreshButton} onPress={() => loadHistory(selectedMode)}>
          <Text style={styles.refreshText}>Consultar</Text>
        </Pressable>
      </View>

      <HistoryCard title={`Resultado: ${mode}`} rows={rows} />

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Exportacion PDF de movimientos</Text>
        <Text style={styles.helper}>Usa placa para generar el PDF de un solo chasis.</Text>
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
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  kicker: {
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 6,
    lineHeight: 20,
  },
  block: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
  modeButtonActive: {
    backgroundColor: '#0284c7',
  },
  modeText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 12,
  },
  modeTextActive: {
    color: '#fff',
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
    backgroundColor: '#0f172a',
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
