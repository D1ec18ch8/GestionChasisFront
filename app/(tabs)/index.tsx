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
        estado: estado || undefined,
      });
      setChasis(result.data);
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
    backgroundColor: '#f8fafc',
  },
  filters: {
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    padding: 12,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
