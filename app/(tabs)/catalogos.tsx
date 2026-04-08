import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function CatalogosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogos</Text>
      <Text style={styles.subtitle}>Selecciona el modulo a gestionar</Text>

      <Link href="/catalogos/tipos" asChild>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tipo de chasis</Text>
          <Text style={styles.cardSub}>Filtrar, listar, crear, editar y eliminar</Text>
        </View>
      </Link>

      <Link href="/catalogos/ubicaciones" asChild>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicaciones</Text>
          <Text style={styles.cardSub}>Filtrar, listar, crear, editar y eliminar</Text>
        </View>
      </Link>

      <Link href="/catalogos/estados" asChild>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estados</Text>
          <Text style={styles.cardSub}>Filtrar, listar, crear, editar y eliminar</Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    marginTop: 4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    marginTop: 4,
    color: '#475569',
  },
});
