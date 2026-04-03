import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getHistorialAcciones, getHistorialMovimientos } from '@/src/services/history.service';
import { ApiError } from '@/src/types/api';
import { HistorialAccion, HistorialMovimiento } from '@/src/types/history';

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
  const [acciones, setAcciones] = useState<HistorialAccion[]>([]);
  const [movimientos, setMovimientos] = useState<HistorialMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [accionesData, movimientosData] = await Promise.all([
          getHistorialAcciones({ per_page: 20 }),
          getHistorialMovimientos({ per_page: 20 }),
        ]);

        setAcciones(accionesData.data);
        setMovimientos(movimientosData.data);
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator size="large" color="#0284c7" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <HistoryCard
        title="Acciones"
        rows={acciones.map(
          (item) =>
            `${item.id} | chasis:${item.chasis_id ?? 'N/A'} | ${item.accion ?? 'sin-accion'} | ${item.created_at ?? ''}`,
        )}
      />

      <HistoryCard
        title="Movimientos"
        rows={movimientos.map(
          (item) =>
            `${item.id} | chasis:${item.chasis_id ?? 'N/A'} | ${item.origen ?? 'N/A'} -> ${item.destino ?? 'N/A'} | ${item.created_at ?? ''}`,
        )}
      />
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
