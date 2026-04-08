import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chasis/new" options={{ title: 'Nuevo chasis' }} />
          <Stack.Screen name="chasis/[id]" options={{ title: 'Detalle de chasis' }} />
          <Stack.Screen name="chasis/[id]/edit" options={{ title: 'Editar chasis' }} />
          <Stack.Screen name="catalogos/tipos" options={{ title: 'Tipos de chasis' }} />
          <Stack.Screen name="catalogos/ubicaciones" options={{ title: 'Ubicaciones' }} />
          <Stack.Screen name="catalogos/estados" options={{ title: 'Estados' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
