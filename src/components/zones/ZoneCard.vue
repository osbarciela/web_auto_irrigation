<template>
  <div class="card flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-semibold text-white">{{ zone.name }}</h3>
        <p class="mt-0.5 text-xs text-gray-500">
          Última lectura: {{ lastReadRelative }}
        </p>
      </div>
      <span class="badge" :class="statusClass">{{ zone.status }}</span>
    </div>

    <!-- Moisture gauge -->
    <div>
      <div class="mb-1 flex items-end justify-between text-xs text-gray-400">
        <span>Humedad</span>
        <span class="text-lg font-bold text-white">{{ zone.moisture }}<span class="text-sm font-normal text-gray-400"> %</span></span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="moistureBarClass"
          :style="{ width: `${zone.moisture}%` }"
        />
      </div>
      <div class="mt-1 flex justify-between text-xs text-gray-600">
        <span>Inicio: {{ zone.moistureStart }}%</span>
        <span>Parada: {{ zone.moistureStop }}%</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex gap-2">
      <button
        class="btn-primary flex-1"
        :disabled="!mqttStore.connected || zone.status === 'IRRIGATING'"
        @click="sendOn"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M12 21a9 9 0 110-18 9 9 0 010 18zm0-5a4 4 0 110-8 4 4 0 010 8z"/>
        </svg>
        Encender
      </button>
      <button
        class="btn-ghost flex-1"
        :disabled="!mqttStore.connected || zone.status === 'IDLE'"
        @click="sendOff"
      >
        Apagar
      </button>
      <button
        class="btn-ghost px-3"
        title="Configurar zona"
        @click="$emit('configure', zone)"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMqttStore } from '@/stores/mqttStore'

const props = defineProps({ zone: { type: Object, required: true } })
defineEmits(['configure'])

const mqttStore = useMqttStore()

const statusClass = computed(() => ({
  'IDLE':       'bg-gray-800 text-gray-300',
  'IRRIGATING': 'bg-blue-900 text-blue-300',
  'LOCKOUT':    'bg-yellow-900 text-yellow-300',
}[props.zone.status] ?? 'bg-gray-800 text-gray-300'))

const moistureBarClass = computed(() => {
  const v = props.zone.moisture
  if (v < props.zone.moistureStart) return 'bg-red-500'
  if (v > props.zone.moistureStop)  return 'bg-blue-500'
  return 'bg-brand-500'
})

const lastReadRelative = computed(() => {
  const diff = Math.round((Date.now() - new Date(props.zone.lastRead).getTime()) / 1000)
  if (diff < 60) return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.round(diff / 60)}min`
  return `hace ${Math.round(diff / 3600)}h`
})

function sendOn()  { mqttStore.sendCommand({ cmd: 'zone_on',  zone: props.zone.id }) }
function sendOff() { mqttStore.sendCommand({ cmd: 'zone_off', zone: props.zone.id }) }
</script>
