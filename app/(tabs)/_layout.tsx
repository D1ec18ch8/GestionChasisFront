import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { useAuth } from '@/src/context/auth-context';

export default function TabLayout() {
  const { token, loading, user } = useAuth();
  const isAdmin = String(user?.rol ?? '').toLowerCase() === 'admin';

  if (loading) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
        sceneStyle: {
          backgroundColor: '#0f172a',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderTopColor: '#1e293b',
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
          borderRadius: 0,
          position: 'relative',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          borderRadius: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chasis',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="truck-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="catalogos"
        options={{
          title: 'Catalogos',
          tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
        }}
      />
      {isAdmin ? (
        <Tabs.Screen
          name="usuarios"
          options={{
            title: 'Usuarios',
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
          }}
        />
      ) : null}
    </Tabs>
  );
}
