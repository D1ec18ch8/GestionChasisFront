# Gestion Chasis Front (React Native + Expo)

Frontend mobile/web conectado a la API de Gestion Chasis.

## Requisitos

1. Node.js 20+
2. API backend disponible

## Configuracion de entorno

Define la URL de la API con variable publica de Expo:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

Notas:

1. En Android emulador, usa `http://10.0.2.2:8000/api`.
2. Si no defines variable, el frontend usa por defecto:
	- Android: `http://10.0.2.2:8000/api`
	- Web/iOS: `http://localhost:8000/api`

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm start
```

Opciones:

1. `npm run android`
2. `npm run web`

## Modulos implementados

1. Login JWT
2. Perfil y cierre de sesion
3. Listado de chasis con filtros
4. Detalle y eliminacion de chasis
5. Alta de chasis (sin enviar `estado` ni `estado_id`)
6. Catalogos (tipos, ubicaciones, estados)
7. Historial (acciones y movimientos)

## Estructura principal

1. `app/(auth)` flujo de autenticacion
2. `app/(tabs)` vistas principales
3. `app/chasis` formulario y detalle
4. `src/lib/http.ts` cliente Axios con bearer token y manejo de errores
5. `src/context/auth-context.tsx` estado global de sesion
6. `src/services/*` servicios por modulo API
