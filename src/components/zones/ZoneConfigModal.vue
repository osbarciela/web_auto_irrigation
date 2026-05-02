<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="card w-full max-w-lg">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">{{ zone.name }}</h2>
          <button class="text-gray-500 hover:text-white" @click="$emit('update:modelValue', false)">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form class="space-y-5" @submit.prevent="save">
          <!-- Humedad -->
          <fieldset class="space-y-3">
            <legend class="text-xs font-semibold uppercase tracking-wider text-gray-500">Umbrales de humedad</legend>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="text-sm text-gray-400">Inicio riego (%)</span>
                <input v-model.number="form.moisture_start" type="number" min="0" max="100" step="0.5"
                  class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
              </label>
              <label class="block">
                <span class="text-sm text-gray-400">Parada riego (%)</span>
                <input v-model.number="form.moisture_stop" type="number" min="0" max="100" step="0.5"
                  class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
              </label>
            </div>
          </fieldset>

          <!-- Ventana 1 -->
          <fieldset class="space-y-3">
            <legend class="text-xs font-semibold uppercase tracking-wider text-gray-500">Ventana horaria 1</legend>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="text-sm text-gray-400">Inicio</span>
                <input v-model="form.window_start" type="time"
                  class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
              </label>
              <label class="block">
                <span class="text-sm text-gray-400">Fin</span>
                <input v-model="form.window_end" type="time"
                  class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
              </label>
            </div>
          </fieldset>

          <!-- Ventana 2 -->
          <fieldset class="space-y-3">
            <div class="flex items-center justify-between">
              <legend class="text-xs font-semibold uppercase tracking-wider text-gray-500">Ventana horaria 2</legend>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input v-model="form.window2_enabled" type="checkbox"
                  class="rounded border-gray-700 bg-gray-800 text-brand-600" />
                Activa
              </label>
            </div>
            <div class="grid grid-cols-2 gap-3" :class="{ 'opacity-40 pointer-events-none': !form.window2_enabled }">
              <label class="block">
                <span class="text-sm text-gray-400">Inicio</span>
                <input v-model="form.window2_start" type="time"
                  class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
              </label>
              <label class="block">
                <span class="text-sm text-gray-400">Fin</span>
                <input v-model="form.window2_end" type="time"
                  class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
              </label>
            </div>
          </fieldset>

          <!-- Max pump -->
          <label class="block">
            <span class="text-sm text-gray-400">Tiempo máximo de bomba (segundos)</span>
            <input v-model.number="form.max_pump_s" type="number" min="10" max="3600" step="10"
              class="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 text-white" />
          </label>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="btn-ghost" @click="$emit('update:modelValue', false)">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="!mqttStore.connected">Guardar y enviar</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useMqttStore } from '@/stores/mqttStore'
import { useIrrigationStore } from '@/stores/irrigationStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  zone: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

const mqttStore = useMqttStore()
const irrigationStore = useIrrigationStore()

const form = reactive({
  moisture_start: 40,
  moisture_stop: 65,
  window_start: '06:00',
  window_end: '08:00',
  window2_start: '20:00',
  window2_end: '21:00',
  window2_enabled: true,
  max_pump_s: 300,
})

watch(() => props.zone, (z) => {
  if (!z) return
  form.moisture_start   = z.moistureStart
  form.moisture_stop    = z.moistureStop
  form.window_start     = z.windowStart
  form.window_end       = z.windowEnd
  form.window2_start    = z.window2Start
  form.window2_end      = z.window2End
  form.window2_enabled  = z.window2Enabled
  form.max_pump_s       = z.maxPumpS
}, { immediate: true })

function save() {
  const cmd = { cmd: 'set_zone_config', zone: props.zone.id, ...form }
  mqttStore.sendCommand(cmd)
  irrigationStore.updateZoneConfig(props.zone.id, {
    moistureStart:  form.moisture_start,
    moistureStop:   form.moisture_stop,
    windowStart:    form.window_start,
    windowEnd:      form.window_end,
    window2Start:   form.window2_start,
    window2End:     form.window2_end,
    window2Enabled: form.window2_enabled,
    maxPumpS:       form.max_pump_s,
  })
  emit('update:modelValue', false)
}
</script>
