# Web Auto Irrigation

Dashboard web para el sistema de riego automático basado en ESP32. Permite monitorizar la humedad del suelo en tiempo real, controlar zonas de riego y configurar umbrales y ventanas horarias, todo mediante comunicación MQTT.

## Stack

- **Vue 3** + Composition API
- **Vite 6**
- **Pinia** — gestión de estado
- **Vue Router 4**
- **Chart.js** + vue-chartjs — gráficas de humedad
- **MQTT.js** — conexión WebSocket al broker
- **Tailwind CSS 3** + @tailwindcss/forms

## Requisitos previos

- Node.js 18+
- Broker MQTT con soporte WebSocket (Mosquitto, EMQX, HiveMQ…)
- ESP32 con el firmware de riego publicando en los topics configurados

## Instalación

```bash
git clone https://github.com/osbarciela/web_auto_irrigation.git
cd web_auto_irrigation
npm install
cp .env.example .env   # editar con tus valores reales
npm run dev
```

## Configuración

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_MQTT_HOST` | URL WebSocket del broker | `ws://192.168.1.100:9001` |
| `VITE_MQTT_USER` | Usuario MQTT | `riego_user` |
| `VITE_MQTT_PASS` | Contraseña MQTT | `••••••••` |
| `VITE_MQTT_CMD_TOPIC` | Topic de comandos al ESP32 | `irrigation/cmd` |
| `VITE_MQTT_STATUS_TOPIC` | Topic de estado del dispositivo | `irrigation/status` |

> El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite HMR) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualizar el build |

## Arquitectura

```
src/
├── composables/
│   └── useMqtt.js          # Conexión y ciclo de vida del cliente MQTT
├── stores/
│   ├── mqttStore.js        # Estado de conexión y publicación de mensajes
│   └── irrigationStore.js  # Zonas, humedad e historial
├── components/
│   ├── layout/             # AppHeader, ConnectionBadge
│   ├── zones/              # ZoneCard, ZoneConfigModal
│   └── charts/             # MoistureChart
├── views/
│   ├── DashboardView.vue   # Grid de zonas + controles del dispositivo
│   ├── HistoryView.vue     # Histórico de humedad
│   └── SettingsView.vue    # Configuración por zona vía MQTT
└── router/index.js
```

## Protocolo MQTT

Los comandos se publican en JSON en `VITE_MQTT_CMD_TOPIC`:

```json
{ "cmd": "publish_metrics" }
{ "cmd": "restart" }
{ "cmd": "set_zone_config", "zone": 0, "moisture_start": 35, "moisture_stop": 65, ... }
```

El estado del dispositivo se recibe en `VITE_MQTT_STATUS_TOPIC` como texto plano (`online` / `offline`).

## Licencia

MIT
