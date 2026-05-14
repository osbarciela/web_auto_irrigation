import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useMqttStore } from '@/stores/mqttStore'
import ConnectionBadge from '@/components/layout/ConnectionBadge.vue'

describe('ConnectionBadge', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows "desconectado" when broker is not connected', () => {
    const wrapper = mount(ConnectionBadge)
    expect(wrapper.text()).toContain('desconectado')
  })

  it('shows "conectado" when broker is connected', async () => {
    const store = useMqttStore()
    store.connected = true
    const wrapper = mount(ConnectionBadge)
    expect(wrapper.text()).toContain('conectado')
  })

  it('hides device status section when disconnected', async () => {
    const wrapper = mount(ConnectionBadge)
    expect(wrapper.text()).not.toContain('ESP32')
  })

  it('shows ESP32 status when connected', async () => {
    const store = useMqttStore()
    store.connected = true
    store.deviceOnline = true
    const wrapper = mount(ConnectionBadge)
    expect(wrapper.text()).toContain('ESP32')
    expect(wrapper.text()).toContain('online')
  })

  it('shows ESP32 as offline when connected but device is offline', async () => {
    const store = useMqttStore()
    store.connected = true
    store.deviceOnline = false
    const wrapper = mount(ConnectionBadge)
    expect(wrapper.text()).toContain('offline')
  })

  it('indicator dot is green when connected', async () => {
    const store = useMqttStore()
    store.connected = true
    const wrapper = mount(ConnectionBadge)
    const dot = wrapper.find('.bg-brand-500')
    expect(dot.exists()).toBe(true)
  })

  it('indicator dot is red when disconnected', async () => {
    const wrapper = mount(ConnectionBadge)
    const dot = wrapper.find('.bg-red-500')
    expect(dot.exists()).toBe(true)
  })
})
