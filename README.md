# touchPad

Aplicación móvil (Expo/React Native) que convierte tu teléfono en un touchpad remoto. Envía eventos de movimiento y clic a un servidor mediante WebSocket.

## Características
- Área táctil con envío de movimientos a 60 FPS con buffer para suavizar.
- Botón de clic izquierdo y teclas rápidas ← →.
- Modal para configurar la IP del servidor con validación IPv4.
- Manejo básico de errores de conexión.

## Requisitos
- Node.js 18+ (o Bun).
- Expo CLI (se instala automáticamente con `npx expo`).
- Un servidor WebSocket escuchando en `ws://<IP_DEL_SERVIDOR>:8080` que entienda mensajes tipo:
  - `move,dx,dy`
  - `click,left`
  - `key,Left|Right`

## Instalación

Con npm:

```bash
npm install
```

Con bun:

```bash
bun install
```

## Ejecutar en desarrollo

- Inicia el proyecto:

```bash
npm run start
```

- Elige el destino:
  - Android: `npm run android`
  - iOS (macOS): `npm run ios`
  - Web: `npm run web`

En la primera ejecución, se abrirá un modal pidiéndote la IP del servidor. Ingresa solo la IPv4 (ej: `192.168.1.23`). La app construirá la URL WebSocket `ws://<IP>:8080` automáticamente.

## Estructura breve
- `App.tsx`: área táctil y botones; orquesta el envío de mensajes.
- `hooks/useWebSocket.tsx`: gestión de conexión WebSocket.
- `components/modals/AddressModal.tsx`: modal de entrada y validación de IP.
- `app.json`: configuración de Expo/eas.

## Variables y puertos
- Puerto WebSocket por defecto: `8080` (puedes cambiarlo en `components/modals/AddressModal.tsx`).

## Problemas comunes
- No conecta: verifica que el servidor WebSocket esté en la misma red y accesible desde el teléfono. Revisa firewall.
- En web no funciona igual que en dispositivo físico; prueba en Android/iOS para mejores gestos.

## Scripts
- `start`: Expo dev server
- `android`, `ios`, `web`: abre el proyecto en cada plataforma.

## Licencia
Este proyecto se publica sin licencia específica. Añade una si lo necesitas.
