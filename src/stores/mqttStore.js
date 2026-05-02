import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMqttStore = defineStore('mqtt', () => {
  const connected = ref(false)
  const deviceOnline = ref(false)
  const error = ref(null)

  let _client = null

  function setClient(client) {
    _client = client
  }

  function publish(topic, payload) {
    if (!_client || !connected.value) return false
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload)
    _client.publish(topic, message, { qos: 1 })
    return true
  }

  function sendCommand(cmd) {
    return publish(import.meta.env.VITE_MQTT_CMD_TOPIC, cmd)
  }

  return { connected, deviceOnline, error, setClient, publish, sendCommand }
})
