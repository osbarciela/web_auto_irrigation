import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useIrrigationStore } from '@/stores/irrigationStore'

describe('irrigationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with 4 zones', () => {
    const store = useIrrigationStore()
    expect(store.zones).toHaveLength(4)
  })

  it('each zone has required properties', () => {
    const store = useIrrigationStore()
    store.zones.forEach((zone) => {
      expect(zone).toHaveProperty('id')
      expect(zone).toHaveProperty('name')
      expect(zone).toHaveProperty('moisture')
      expect(zone).toHaveProperty('status')
      expect(zone).toHaveProperty('history')
      expect(zone).toHaveProperty('moistureStart')
      expect(zone).toHaveProperty('moistureStop')
    })
  })

  it('zones have unique ids 0–3', () => {
    const store = useIrrigationStore()
    const ids = store.zones.map((z) => z.id)
    expect(ids).toEqual([0, 1, 2, 3])
  })

  it('each zone history has 24h data points', () => {
    const store = useIrrigationStore()
    store.zones.forEach((zone) => {
      expect(zone.history.length).toBeGreaterThan(0)
      expect(zone.history[0]).toHaveProperty('t')
      expect(zone.history[0]).toHaveProperty('v')
    })
  })

  it('moisture values are within 0–100 range', () => {
    const store = useIrrigationStore()
    store.zones.forEach((zone) => {
      expect(zone.moisture).toBeGreaterThanOrEqual(0)
      expect(zone.moisture).toBeLessThanOrEqual(100)
    })
  })

  describe('updateZoneConfig', () => {
    it('updates config fields on the correct zone', () => {
      const store = useIrrigationStore()
      store.updateZoneConfig(0, { moistureStart: 30, moistureStop: 70 })
      expect(store.zones[0].moistureStart).toBe(30)
      expect(store.zones[0].moistureStop).toBe(70)
    })

    it('does not affect other zones', () => {
      const store = useIrrigationStore()
      const originalMoistureStart = store.zones[1].moistureStart
      store.updateZoneConfig(0, { moistureStart: 99 })
      expect(store.zones[1].moistureStart).toBe(originalMoistureStart)
    })

    it('does nothing for a non-existent zone id', () => {
      const store = useIrrigationStore()
      const snapshot = store.zones.map((z) => ({ ...z }))
      store.updateZoneConfig(99, { moistureStart: 10 })
      store.zones.forEach((zone, i) => {
        expect(zone.moistureStart).toBe(snapshot[i].moistureStart)
      })
    })

    it('can update name and status', () => {
      const store = useIrrigationStore()
      store.updateZoneConfig(2, { name: 'Zona Modificada', status: 'IDLE' })
      expect(store.zones[2].name).toBe('Zona Modificada')
      expect(store.zones[2].status).toBe('IDLE')
    })
  })
})
