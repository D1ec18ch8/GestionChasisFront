import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getTiposChasis } from '@/src/services/catalogs.service';
import { getChasis } from '@/src/services/chasis.service';
import { ApiError } from '@/src/types/api';
import { Chasis, TipoChasis } from '@/src/types/domain';

function ChasisItem({ item, tipos }: { item: Chasis; tipos: TipoChasis[] }) {
  const tipoNombre = tipos.find((tipo) => tipo.id === item.tipo_chasis_id)?.nombre ?? 'N/A';

  return (
    <Link href={`/chasis/${item.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.badge}>{item.estado_actual ?? 'sin estado'}</Text>
        </View>

        <Text style={styles.cardSub}>Tipo: {tipoNombre}</Text>
        <Text style={styles.cardSub}>Placa: {item.placa ?? 'N/A'}</Text>

        {item.equipamientos_en_mal_estado?.length ? (
          <Text style={styles.warning}>
            Equipamiento en mal estado: {item.equipamientos_en_mal_estado.join(', ')}
          </Text>
        ) : (
          <Text style={styles.ok}>Sin averias reportadas</Text>
        )}
      </Pressable>
    </Link>
  );
}

export default function ChasisScreen() {
  const [chasis, setChasis] = useState<Chasis[]>([]);
  const [tipos, setTipos] = useState<TipoChasis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [estadoInput, setEstadoInput] = useState('');
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);

    try {
      const result = await getChasis({
        per_page: 30,
        search: search || undefined,
      });

      const estadoTerm = estado.trim().toLowerCase();
      if (!estadoTerm) {
        setChasis(result.data);
        return;
      }

      const filtered = result.data.filter((item) => {
        const rawEstado = `${item.estado_actual ?? ''}`.toLowerCase();
        const nestedEstado = (item as { estado?: { nombre?: string; slug?: string } }).estado;
        const nombre = `${nestedEstado?.nombre ?? ''}`.toLowerCase();
        const slug = `${nestedEstado?.slug ?? ''}`.toLowerCase();
        return `${rawEstado} ${nombre} ${slug}`.includes(estadoTerm);
      });

      setChasis(filtered);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }, [estado, search]);

  const fetchTipos = useCallback(async () => {
    try {
      const data = await getTiposChasis();
      setTipos(data);
    } catch {
      setTipos([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchData(), fetchTipos()]).finally(() => setLoading(false));
  }, [fetchData, fetchTipos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Control operativo</Text>
        <Text style={styles.heroTitle}>Chasis</Text>
        <Text style={styles.heroSubtitle}>Busca, filtra y revisa el estado de cada unidad desde una vista mas clara.</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Resultados</Text>
            <Text style={styles.heroStatValue}>{chasis.length}</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Filtros</Text>
            <Text style={styles.heroStatValue}>{search || estado ? 'Activos' : 'Base'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.filters}>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Buscar por nombre, placa o numero"
          style={styles.input}
        />
        <TextInput
          value={estadoInput}
          onChangeText={setEstadoInput}
          placeholder="Estado (slug), ejemplo: revision"
          style={styles.input}
        />

        <View style={styles.row}>
          <Pressable
            style={styles.button}
            onPress={() => {
              setSearch(searchInput.trim());
              setEstado(estadoInput.trim());
            }}>
            <Text style={styles.buttonText}>Filtrar</Text>
          </Pressable>
          <Link href="/chasis/new" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Nuevo</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0284c7" style={styles.loader} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={chasis}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ChasisItem item={item} tipos={tipos} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No hay chasis para mostrar.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    marginBottom: 12,
  },
  kicker: {
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#cbd5e1',
    marginTop: 6,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 12,
  },
  heroStatLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  filters: {
    padding: 12,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  list: {
    paddingTop: 12,
    paddingBottom: 96,
    gap: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    color: '#475569',
  },
  badge: {
    backgroundColor: '#e0f2fe',
    color: '#0c4a6e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: 'capitalize',
  },
  warning: {
    color: '#b45309',
    fontWeight: '600',
  },
  ok: {
    color: '#166534',
    fontWeight: '600',
  },
  loader: {
    marginTop: 16,
  },
  error: {
    color: '#dc2626',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#475569',
  },
});
