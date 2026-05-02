import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useMqttStore } from '@/stores/mqttStore'
import ZoneCard from '@/components/zones/ZoneCard.vue'

vi.stubEnv('VITE_MQTT_CMD_TOPIC', 'irrigation/cmd')

function makeZone(overrides = {}) {
  return {
    id: 0,
    name: 'Zona 1 — Jardín',
    moisture: 52.3,
    status: 'IDLE',
    moistureStart: 40,
    moistureStop: 65,
    lastRead: new Date(),
    ...overrides,
  }
}

describe('ZoneCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the zone name', () => {
    const wrapper = mount(ZoneCard, { props: { zone: makeZone() } })
    expect(wrapper.text()).toContain('Zona 1 — Jardín')
  })

  it('renders the moisture value', () => {
    const wrapper = mount(ZoneCard, { props: { zone: makeZone({ moisture: 52.3 }) } })
    expect(wrapper.text()).toContain('52.3')
  })

  it('renders the status badge', () => {
    const wrapper = mount(ZoneCard, { props: { zone: makeZone({ status: 'IRRIGATING' }) } })
    expect(wrapper.text()).toContain('IRRIGATING')
  })

  describe('status badge classes', () => {
    it('applies gray class for IDLE', () => {
      const wrapper = mount(ZoneCard, { props: { zone: makeZone({ status: 'IDLE' }) } })
      const badge = wrapper.find('.badge')
      expect(badge.classes()).toContain('bg-gray-800')
    })

    it('applies blue class for IRRIGATING', () => {
      const wrapper = mount(ZoneCard, { props: { zone: makeZone({ status: 'IRRIGATING' }) } })
      const badge = wrapper.find('.badge')
      expect(badge.classes()).toContain('bg-blue-900')
    })

    it('applies yellow class for LOCKOUT', () => {
      const wrapper = mount(ZoneCard, { props: { zone: makeZone({ status: 'LOCKOUT' }) } })
      const badge = wrapper.find('.badge')
      expect(badge.classes()).toContain('bg-yellow-900')
    })
  })

  describe('moisture bar color', () => {
    it('is red when below moistureStart', () => {
      const wrapper = mount(ZoneCard, {
        props: { zone: makeZone({ moisture: 20, moistureStart: 40, moistureStop: 65 }) },
      })
      const bar = wrapper.find('.h-full')
      expect(bar.classes()).toContain('bg-red-500')
    })

    it('is blue when above moistureStop', () => {
      const wrapper = mount(ZoneCard, {
        props: { zone: makeZone({ moisture: 80, moistureStart: 40, moistureStop: 65 }) },
      })
      const bar = wrapper.find('.h-full')
      expect(bar.classes()).toContain('bg-blue-500')
    })

    it('is brand (green) when within range', () => {
      const wrapper = mount(ZoneCard, {
        props: { zone: makeZone({ moisture: 52, moistureStart: 40, moistureStop: 65 }) },
      })
      const bar = wrapper.find('.h-full')
      expect(bar.classes()).toContain('bg-brand-500')
    })
  })

  describe('Encender button', () => {
    it('is disabled when MQTT is not connected', () => {
      const wrapper = mount(ZoneCard, { props: { zone: makeZone() } })
      const btn = wrapper.findAll('button')[0]
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('is disabled when zone is IRRIGATING', async () => {
      const store = useMqttStore()
      store.connected = true
      const wrapper = mount(ZoneCard, {
        props: { zone: makeZone({ status: 'IRRIGATING' }) },
      })
      const btn = wrapper.findAll('button')[0]
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('is enabled when connected and zone is IDLE', async () => {
      const store = useMqttStore()
      store.connected = true
      const wrapper = mount(ZoneCard, { props: { zone: makeZone({ status: 'IDLE' }) } })
      const btn = wrapper.findAll('button')[0]
      expect(btn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Apagar button', () => {
    it('is disabled when MQTT is not connected', () => {
      const wrapper = mount(ZoneCard, { props: { zone: makeZone() } })
      const btn = wrapper.findAll('button')[1]
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('is disabled when zone is IDLE', async () => {
      const store = useMqttStore()
      store.connected = true
      const wrapper = mount(ZoneCard, { props: { zone: makeZone({ status: 'IDLE' }) } })
      const btn = wrapper.findAll('button')[1]
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('is enabled when connected and zone is IRRIGATING', async () => {
      const store = useMqttStore()
      store.connected = true
      const wrapper = mount(ZoneCard, {
        props: { zone: makeZone({ status: 'IRRIGATING' }) },
      })
      const btn = wrapper.findAll('button')[1]
      expect(btn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('commands', () => {
    it('sendOn calls mqttStore.sendCommand with zone_on', async () => {
      const store = useMqttStore()
      store.connected = true
      const spy = vi.spyOn(store, 'sendCommand')
      const wrapper = mount(ZoneCard, { props: { zone: makeZone({ id: 2, status: 'IDLE' }) } })
      await wrapper.findAll('button')[0].trigger('click')
      expect(spy).toHaveBeenCalledWith({ cmd: 'zone_on', zone: 2 })
    })

    it('sendOff calls mqttStore.sendCommand with zone_off', async () => {
      const store = useMqttStore()
      store.connected = true
      const spy = vi.spyOn(store, 'sendCommand')
      const wrapper = mount(ZoneCard, {
        props: { zone: makeZone({ id: 3, status: 'IRRIGATING' }) },
      })
      await wrapper.findAll('button')[1].trigger('click')
      expect(spy).toHaveBeenCalledWith({ cmd: 'zone_off', zone: 3 })
    })
  })

  it('configure button emits configure event with zone', async () => {
    const zone = makeZone()
    const wrapper = mount(ZoneCard, { props: { zone } })
    await wrapper.findAll('button')[2].trigger('click')
    expect(wrapper.emitted('configure')).toBeTruthy()
    expect(wrapper.emitted('configure')[0][0]).toEqual(zone)
  })

  describe('lastReadRelative', () => {
    it('shows seconds ago for recent reads', () => {
      const zone = makeZone({ lastRead: new Date(Date.now() - 30000) })
      const wrapper = mount(ZoneCard, { props: { zone } })
      expect(wrapper.text()).toContain('hace 30s')
    })

    it('shows minutes ago for reads within the hour', () => {
      const zone = makeZone({ lastRead: new Date(Date.now() - 5 * 60 * 1000) })
      const wrapper = mount(ZoneCard, { props: { zone } })
      expect(wrapper.text()).toContain('hace 5min')
    })

    it('shows hours ago for old reads', () => {
      const zone = makeZone({ lastRead: new Date(Date.now() - 2 * 3600 * 1000) })
      const wrapper = mount(ZoneCard, { props: { zone } })
      expect(wrapper.text()).toContain('hace 2h')
    })
  })
})
