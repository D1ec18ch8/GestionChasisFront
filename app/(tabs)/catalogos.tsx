import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CatalogosScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Administracion</Text>
        <Text style={styles.title}>Catalogos</Text>
        <Text style={styles.subtitle}>Gestiona tipos, ubicaciones y estados desde un panel unico.</Text>
      </View>

      <Pressable style={[styles.card, styles.cardAccentBlue]} onPress={() => router.push('/catalogos/tipos')}>
        <Text style={styles.cardTitle}>Tipo de chasis</Text>
        <Text style={styles.cardSub}>Filtrar, listar, crear, editar y eliminar</Text>
      </Pressable>

      <Pressable style={[styles.card, styles.cardAccentTeal]} onPress={() => router.push('/catalogos/ubicaciones')}>
        <Text style={styles.cardTitle}>Ubicaciones</Text>
        <Text style={styles.cardSub}>Filtrar, listar, crear, editar y eliminar</Text>
      </Pressable>

      <Pressable style={[styles.card, styles.cardAccentAmber]} onPress={() => router.push('/catalogos/estados')}>
        <Text style={styles.cardTitle}>Estados</Text>
        <Text style={styles.cardSub}>Filtrar, listar, crear, editar y eliminar</Text>
      </Pressable>
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
    marginBottom: 4,
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
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    marginTop: 4,
    color: '#475569',
  },
  cardAccentBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  cardAccentTeal: {
    borderLeftWidth: 4,
    borderLeftColor: '#14b8a6',
  },
  cardAccentAmber: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
});
