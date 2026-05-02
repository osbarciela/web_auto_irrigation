import { onUnmounted } from 'vue'
import mqtt from 'mqtt'
import { useMqttStore } from '@/stores/mqttStore'

export function useMqtt() {
  const mqttStore = useMqttStore()
  let client = null

  function connect() {
    const host = import.meta.env.VITE_MQTT_HOST
    const statusTopic = import.meta.env.VITE_MQTT_STATUS_TOPIC

    client = mqtt.connect(host, {
      clientId: `riego-ui-${Math.random().toString(16).slice(2, 8)}`,
      username: import.meta.env.VITE_MQTT_USER,
      password: import.meta.env.VITE_MQTT_PASS,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 3000,
    })

    mqttStore.setClient(client)

    client.on('connect', () => {
      mqttStore.connected = true
      mqttStore.error = null
      client.subscribe(statusTopic, { qos: 1 })
    })

    client.on('reconnect', () => {
      mqttStore.connected = false
    })

    client.on('offline', () => {
      mqttStore.connected = false
    })

    client.on('error', (err) => {
      mqttStore.error = err.message
      mqttStore.connected = false
    })

    client.on('message', (topic, payload) => {
      if (topic === statusTopic) {
        const msg = payload.toString().toLowerCase()
        mqttStore.deviceOnline = msg === 'online'
      }
    })
  }

  function disconnect() {
    if (client) {
      client.end()
      mqttStore.connected = false
    }
  }

  onUnmounted(disconnect)

  return { connect, disconnect }
}
