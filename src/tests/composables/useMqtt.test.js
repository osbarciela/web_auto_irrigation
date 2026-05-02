import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMqttStore } from '@/stores/mqttStore'

vi.stubEnv('VITE_MQTT_HOST', 'ws://localhost:9001')
vi.stubEnv('VITE_MQTT_USER', 'test-user')
vi.stubEnv('VITE_MQTT_PASS', 'test-pass')
vi.stubEnv('VITE_MQTT_STATUS_TOPIC', 'irrigation/status')

const mockClient = {
  on: vi.fn(),
  end: vi.fn(),
  subscribe: vi.fn(),
  publish: vi.fn(),
}

vi.mock('mqtt', () => ({
  default: {
    connect: vi.fn(() => mockClient),
  },
}))

describe('useMqtt composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('connect calls mqtt.connect with correct host', async () => {
    const mqtt = (await import('mqtt')).default
    const { useMqtt } = await import('@/composables/useMqtt')
    const { connect } = useMqtt()
    connect()
    expect(mqtt.connect).toHaveBeenCalledWith(
      'ws://localhost:9001',
      expect.objectContaining({
        username: 'test-user',
        password: 'test-pass',
        clean: true,
      }),
    )
  })

  it('registers connect/reconnect/offline/error/message event handlers', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const { connect } = useMqtt()
    connect()
    const registeredEvents = mockClient.on.mock.calls.map(([event]) => event)
    expect(registeredEvents).toContain('connect')
    expect(registeredEvents).toContain('reconnect')
    expect(registeredEvents).toContain('offline')
    expect(registeredEvents).toContain('error')
    expect(registeredEvents).toContain('message')
  })

  it('on connect event sets store.connected = true and subscribes', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    const { connect } = useMqtt()
    connect()

    const connectHandler = mockClient.on.mock.calls.find(([e]) => e === 'connect')[1]
    connectHandler()

    expect(mqttStore.connected).toBe(true)
    expect(mqttStore.error).toBeNull()
    expect(mockClient.subscribe).toHaveBeenCalledWith('irrigation/status', { qos: 1 })
  })

  it('on reconnect event sets store.connected = false', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    mqttStore.connected = true
    const { connect } = useMqtt()
    connect()

    const handler = mockClient.on.mock.calls.find(([e]) => e === 'reconnect')[1]
    handler()
    expect(mqttStore.connected).toBe(false)
  })

  it('on offline event sets store.connected = false', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    mqttStore.connected = true
    const { connect } = useMqtt()
    connect()

    const handler = mockClient.on.mock.calls.find(([e]) => e === 'offline')[1]
    handler()
    expect(mqttStore.connected).toBe(false)
  })

  it('on error event sets store.error and disconnects', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    mqttStore.connected = true
    const { connect } = useMqtt()
    connect()

    const handler = mockClient.on.mock.calls.find(([e]) => e === 'error')[1]
    handler(new Error('ECONNREFUSED'))
    expect(mqttStore.error).toBe('ECONNREFUSED')
    expect(mqttStore.connected).toBe(false)
  })

  it('message handler sets deviceOnline=true when payload is "online"', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    const { connect } = useMqtt()
    connect()

    const handler = mockClient.on.mock.calls.find(([e]) => e === 'message')[1]
    handler('irrigation/status', Buffer.from('online'))
    expect(mqttStore.deviceOnline).toBe(true)
  })

  it('message handler sets deviceOnline=false when payload is not "online"', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    mqttStore.deviceOnline = true
    const { connect } = useMqtt()
    connect()

    const handler = mockClient.on.mock.calls.find(([e]) => e === 'message')[1]
    handler('irrigation/status', Buffer.from('offline'))
    expect(mqttStore.deviceOnline).toBe(false)
  })

  it('disconnect calls client.end and sets connected=false', async () => {
    const { useMqtt } = await import('@/composables/useMqtt')
    const mqttStore = useMqttStore()
    mqttStore.connected = true
    const { connect, disconnect } = useMqtt()
    connect()
    disconnect()
    expect(mockClient.end).toHaveBeenCalled()
    expect(mqttStore.connected).toBe(false)
  })
})
