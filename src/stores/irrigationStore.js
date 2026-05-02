import { defineStore } from 'pinia'
import { ref } from 'vue'

function generateHistory(baseValue, hours = 24, pointsPerHour = 4) {
  const now = Date.now()
  const points = []
  let value = baseValue
  for (let i = hours * pointsPerHour; i >= 0; i--) {
    value = Math.max(15, Math.min(95, value + (Math.random() - 0.5) * 4))
    points.push({ t: now - i * (3600000 / pointsPerHour), v: parseFloat(value.toFixed(1)) })
  }
  return points
}

const ZONE_DEFAULTS = [
  { id: 0, name: 'Zona 1 — Jardín', moisture: 52.3, status: 'IDLE',       moistureStart: 40, moistureStop: 65, windowStart: '06:00', windowEnd: '08:00', window2Start: '20:00', window2End: '21:00', window2Enabled: true,  maxPumpS: 300 },
  { id: 1, name: 'Zona 2 — Huerto', moisture: 34.7, status: 'IRRIGATING', moistureStart: 35, moistureStop: 60, windowStart: '07:00', windowEnd: '09:00', window2Start: '19:00', window2End: '20:00', window2Enabled: false, maxPumpS: 180 },
  { id: 2, name: 'Zona 3 — Césped', moisture: 71.0, status: 'LOCKOUT',    moistureStart: 45, moistureStop: 70, windowStart: '06:30', windowEnd: '07:30', window2Start: '21:00', window2End: '22:00', window2Enabled: true,  maxPumpS: 240 },
  { id: 3, name: 'Zona 4 — Macetas', moisture: 58.2, status: 'IDLE',      moistureStart: 50, moistureStop: 75, windowStart: '08:00', windowEnd: '09:00', window2Start: '20:30', window2End: '21:30', window2Enabled: false, maxPumpS: 120 },
]

export const useIrrigationStore = defineStore('irrigation', () => {
  const zones = ref(
    ZONE_DEFAULTS.map(z => ({
      ...z,
      lastRead: new Date(Date.now() - Math.random() * 60000),
      history: generateHistory(z.moisture),
    }))
  )

  function updateZoneConfig(zoneId, config) {
    const zone = zones.value.find(z => z.id === zoneId)
    if (!zone) return
    Object.assign(zone, config)
  }

  return { zones, updateZoneConfig }
})
