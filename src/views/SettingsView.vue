<template>
  <main class="mx-auto max-w-3xl px-4 py-6 space-y-6">
    <h1 class="text-lg font-semibold text-white">Configuración de zonas</h1>

    <div
      v-for="zone in zones"
      :key="zone.id"
      class="card space-y-5"
    >
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-white">{{ zone.name }}</h2>
        <span class="badge" :class="zone.status === 'IRRIGATING' ? 'bg-blue-900 text-blue-300' : 'bg-gray-800 text-gray-400'">
          {{ zone.status }}
        </span>
      </div>

      <form class="space-y-5" @submit.prevent="save(zone)">
        <fieldset class="grid grid-cols-2 gap-4">
          <legend class="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Humedad</legend>
          <label class="block">
            <span class="text-sm text-gray-400">Inicio riego (%)</span>
            <input
              v-model.number="forms[zone.id].moisture_start"
              type="number" min="0" max="100" step="0.5"
              class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white"
            />
          </label>
          <label class="block">
            <span class="text-sm text-gray-400">Parada riego (%)</span>
            <input
              v-model.number="forms[zone.id].moisture_stop"
              type="number" min="0" max="100" step="0.5"
              class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white"
            />
          </label>
        </fieldset>

        <fieldset class="grid grid-cols-2 gap-4">
          <legend class="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Ventana horaria 1</legend>
          <label class="block">
            <span class="text-sm text-gray-400">Inicio</span>
            <input v-model="forms[zone.id].window_start" type="time"
              class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
          </label>
          <label class="block">
            <span class="text-sm text-gray-400">Fin</span>
            <input v-model="forms[zone.id].window_end" type="time"
              class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
          </label>
        </fieldset>

        <fieldset class="space-y-3">
          <div class="flex items-center justify-between">
            <legend class="text-xs font-semibold uppercase tracking-wider text-gray-500">Ventana horaria 2</legend>
            <label class="flex items-center gap-2 text-sm text-gray-400">
              <input v-model="forms[zone.id].window2_enabled" type="checkbox"
                class="rounded border-gray-700 bg-gray-800 text-brand-600" />
              Activa
            </label>
          </div>
          <div class="grid grid-cols-2 gap-4" :class="{ 'opacity-40 pointer-events-none': !forms[zone.id].window2_enabled }">
            <label class="block">
              <span class="text-sm text-gray-400">Inicio</span>
              <input v-model="forms[zone.id].window2_start" type="time"
                class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
            </label>
            <label class="block">
              <span class="text-sm text-gray-400">Fin</span>
              <input v-model="forms[zone.id].window2_end" type="time"
                class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
            </label>
          </div>
        </fieldset>

        <label class="block">
          <span class="text-sm text-gray-400">Tiempo máximo de bomba (segundos)</span>
          <input
            v-model.number="forms[zone.id].max_pump_s"
            type="number" min="10" max="3600" step="10"
            class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white"
          />
        </label>

        <div class="flex items-center justify-between">
          <p v-if="savedZones.has(zone.id)" class="text-xs text-brand-400">Guardado y enviado</p>
          <p v-else class="text-xs text-gray-600">Los cambios se envían vía MQTT</p>
          <button type="submit" class="btn-primary" :disabled="!mqttStore.connected">
            Guardar zona {{ zone.id + 1 }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useIrrigationStore } from '@/stores/irrigationStore'
import { useMqttStore } from '@/stores/mqttStore'

const irrigationStore = useIrrigationStore()
const mqttStore = useMqttStore()
const zones = irrigationStore.zones
const savedZones = ref(new Set())

const forms = reactive(
  Object.fromEntries(
    zones.map(z => [z.id, {
      moisture_start:  z.moistureStart,
      moisture_stop:   z.moistureStop,
      window_start:    z.windowStart,
      window_end:      z.windowEnd,
      window2_start:   z.window2Start,
      window2_end:     z.window2End,
      window2_enabled: z.window2Enabled,
      max_pump_s:      z.maxPumpS,
    }])
  )
)

function save(zone) {
  const f = forms[zone.id]
  mqttStore.sendCommand({ cmd: 'set_zone_config', zone: zone.id, ...f })
  irrigationStore.updateZoneConfig(zone.id, {
    moistureStart:  f.moisture_start,
    moistureStop:   f.moisture_stop,
    windowStart:    f.window_start,
    windowEnd:      f.window_end,
    window2Start:   f.window2_start,
    window2End:     f.window2_end,
    window2Enabled: f.window2_enabled,
    maxPumpS:       f.max_pump_s,
  })
  savedZones.value = new Set([...savedZones.value, zone.id])
  setTimeout(() => {
    savedZones.value.delete(zone.id)
    savedZones.value = new Set(savedZones.value)
  }, 3000)
}
</script>
