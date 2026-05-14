import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useMqttStore } from '@/stores/mqttStore'
import { useIrrigationStore } from '@/stores/irrigationStore'
import ZoneConfigModal from '@/components/zones/ZoneConfigModal.vue'

vi.stubEnv('VITE_MQTT_CMD_TOPIC', 'irrigation/cmd')

function makeZone(overrides = {}) {
  return {
    id: 1,
    name: 'Zona 2 — Huerto',
    moistureStart: 35,
    moistureStop: 60,
    windowStart: '07:00',
    windowEnd: '09:00',
    window2Start: '19:00',
    window2End: '20:00',
    window2Enabled: false,
    maxPumpS: 180,
    ...overrides,
  }
}

function mountModal(zone, modelValue = true) {
  return mount(ZoneConfigModal, {
    props: { modelValue, zone },
    attachTo: document.body,
  })
}

describe('ZoneConfigModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not render content when modelValue is false', () => {
    const wrapper = mountModal(makeZone(), false)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('renders form when modelValue is true', () => {
    const wrapper = mountModal(makeZone())
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('displays the zone name in the header', () => {
    const wrapper = mountModal(makeZone())
    expect(wrapper.text()).toContain('Zona 2 — Huerto')
  })

  it('initializes form with zone values', () => {
    const zone = makeZone({ moistureStart: 35, moistureStop: 60, maxPumpS: 180 })
    const wrapper = mountModal(zone)
    const inputs = wrapper.findAll('input[type="number"]')
    expect(inputs[0].element.value).toBe('35')
    expect(inputs[1].element.value).toBe('60')
  })

  it('save button is disabled when MQTT is not connected', () => {
    const wrapper = mountModal(makeZone())
    const saveBtn = wrapper.find('button[type="submit"]')
    expect(saveBtn.attributes('disabled')).toBeDefined()
  })

  it('save button is enabled when MQTT is connected', async () => {
    const store = useMqttStore()
    store.connected = true
    const wrapper = mountModal(makeZone())
    const saveBtn = wrapper.find('button[type="submit"]')
    expect(saveBtn.attributes('disabled')).toBeUndefined()
  })

  it('cancel button emits update:modelValue false', async () => {
    const wrapper = mountModal(makeZone())
    const cancelBtn = wrapper.find('button[type="button"]')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('close icon button emits update:modelValue false', async () => {
    const wrapper = mountModal(makeZone())
    const closeBtn = wrapper.find('.mb-5 button')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('submit sends set_zone_config command and updates store', async () => {
    const mqttStore = useMqttStore()
    const irrigationStore = useIrrigationStore()
    mqttStore.connected = true
    const sendSpy = vi.spyOn(mqttStore, 'sendCommand').mockReturnValue(true)
    const updateSpy = vi.spyOn(irrigationStore, 'updateZoneConfig')

    const zone = makeZone({ id: 1 })
    const wrapper = mountModal(zone)

    await wrapper.find('form').trigger('submit')

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ cmd: 'set_zone_config', zone: 1 }),
    )
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        moistureStart: 35,
        moistureStop: 60,
        maxPumpS: 180,
      }),
    )
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('watches zone prop and updates form when zone changes', async () => {
    const zone1 = makeZone({ moistureStart: 35 })
    const zone2 = makeZone({ moistureStart: 50 })
    const wrapper = mountModal(zone1)

    await wrapper.setProps({ zone: zone2 })

    const inputs = wrapper.findAll('input[type="number"]')
    expect(inputs[0].element.value).toBe('50')
  })
})
