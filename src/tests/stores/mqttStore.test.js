import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMqttStore } from '@/stores/mqttStore'

vi.stubEnv('VITE_MQTT_CMD_TOPIC', 'irrigation/cmd')

function makeFakeClient() {
  return {
    publish: vi.fn(),
  }
}

describe('mqttStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts disconnected with no error', () => {
    const store = useMqttStore()
    expect(store.connected).toBe(false)
    expect(store.deviceOnline).toBe(false)
    expect(store.error).toBeNull()
  })

  describe('publish', () => {
    it('returns false when no client is set', () => {
      const store = useMqttStore()
      store.connected = true
      expect(store.publish('topic', 'msg')).toBe(false)
    })

    it('returns false when disconnected', () => {
      const store = useMqttStore()
      store.setClient(makeFakeClient())
      expect(store.publish('topic', 'msg')).toBe(false)
    })

    it('returns true and calls client.publish when connected', () => {
      const store = useMqttStore()
      const client = makeFakeClient()
      store.setClient(client)
      store.connected = true
      const result = store.publish('irrigation/cmd', 'hello')
      expect(result).toBe(true)
      expect(client.publish).toHaveBeenCalledWith('irrigation/cmd', 'hello', { qos: 1 })
    })

    it('serializes objects to JSON', () => {
      const store = useMqttStore()
      const client = makeFakeClient()
      store.setClient(client)
      store.connected = true
      store.publish('topic', { cmd: 'zone_on', zone: 0 })
      expect(client.publish).toHaveBeenCalledWith(
        'topic',
        JSON.stringify({ cmd: 'zone_on', zone: 0 }),
        { qos: 1 },
      )
    })

    it('passes string payloads as-is', () => {
      const store = useMqttStore()
      const client = makeFakeClient()
      store.setClient(client)
      store.connected = true
      store.publish('topic', 'raw-string')
      expect(client.publish).toHaveBeenCalledWith('topic', 'raw-string', { qos: 1 })
    })
  })

  describe('sendCommand', () => {
    it('publishes to the configured MQTT command topic', () => {
      const store = useMqttStore()
      const client = makeFakeClient()
      store.setClient(client)
      store.connected = true
      store.sendCommand({ cmd: 'zone_on', zone: 1 })
      expect(client.publish).toHaveBeenCalledWith(
        'irrigation/cmd',
        JSON.stringify({ cmd: 'zone_on', zone: 1 }),
        { qos: 1 },
      )
    })

    it('returns false when not connected', () => {
      const store = useMqttStore()
      expect(store.sendCommand({ cmd: 'zone_on', zone: 0 })).toBe(false)
    })
  })

  describe('state mutations', () => {
    it('can set error message', () => {
      const store = useMqttStore()
      store.error = 'Connection refused'
      expect(store.error).toBe('Connection refused')
    })

    it('can toggle deviceOnline', () => {
      const store = useMqttStore()
      store.deviceOnline = true
      expect(store.deviceOnline).toBe(true)
    })
  })
})
