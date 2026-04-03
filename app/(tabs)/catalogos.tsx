import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getEstados, getTiposChasis, getUbicaciones } from '@/src/services/catalogs.service';
import { ApiError } from '@/src/types/api';
import { Estado, TipoChasis, Ubicacion } from '@/src/types/domain';

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {items.length ? (
        items.map((item) => (
          <Text key={item} style={styles.item}>
            - {item}
          </Text>
        ))
      ) : (
        <Text style={styles.empty}>Sin datos</Text>
      )}
    </View>
  );
}

export default function CatalogosScreen() {
  const [tipos, setTipos] = useState<TipoChasis[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [tiposData, ubicacionesData, estadosData] = await Promise.all([
          getTiposChasis(),
          getUbicaciones(),
          getEstados(),
        ]);

        setTipos(tiposData);
        setUbicaciones(ubicacionesData);
        setEstados(estadosData);
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

      <Block title="Tipos de chasis" items={tipos.map((item) => `${item.id} - ${item.nombre}`)} />
      <Block
        title="Ubicaciones"
        items={ubicaciones.map((item) => `${item.id} - ${item.nombre} (${item.razon_social ?? 'N/A'})`)}
      />
      <Block title="Estados" items={estados.map((item) => `${item.id} - ${item.nombre} (${item.slug ?? 'sin-slug'})`)} />
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
