<template>
  <main class="mx-auto max-w-6xl px-4 py-6 space-y-6">
    <!-- Zone grid -->
    <section>
      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Zonas de riego</h2>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ZoneCard
          v-for="zone in zones"
          :key="zone.id"
          :zone="zone"
          @configure="openConfig"
        />
      </div>
    </section>

    <!-- Device controls -->
    <section class="card">
      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Control del dispositivo</h2>
      <div class="flex flex-wrap gap-3">
        <button class="btn-ghost" :disabled="!mqttStore.connected" @click="publishMetrics">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Forzar métricas
        </button>
        <button class="btn-danger" :disabled="!mqttStore.connected" @click="confirmRestart">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Reiniciar ESP32
        </button>
        <span v-if="!mqttStore.connected" class="self-center text-xs text-yellow-500">
          Sin conexión al broker
        </span>
      </div>

      <p v-if="lastAction" class="mt-3 text-xs text-gray-500">{{ lastAction }}</p>
    </section>

    <!-- Config modal -->
    <ZoneConfigModal v-if="selectedZone" v-model="showModal" :zone="selectedZone" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useIrrigationStore } from '@/stores/irrigationStore'
import { useMqttStore } from '@/stores/mqttStore'
import ZoneCard from '@/components/zones/ZoneCard.vue'
import ZoneConfigModal from '@/components/zones/ZoneConfigModal.vue'

const irrigationStore = useIrrigationStore()
const mqttStore = useMqttStore()

const zones = irrigationStore.zones
const showModal = ref(false)
const selectedZone = ref(null)
const lastAction = ref('')

function openConfig(zone) {
  selectedZone.value = zone
  showModal.value = true
}

function publishMetrics() {
  mqttStore.sendCommand({ cmd: 'publish_metrics' })
  lastAction.value = `Métricas solicitadas a las ${new Date().toLocaleTimeString()}`
}

function confirmRestart() {
  if (!confirm('¿Reiniciar el ESP32?')) return
  mqttStore.sendCommand({ cmd: 'restart' })
  lastAction.value = `Reinicio enviado a las ${new Date().toLocaleTimeString()}`
}
</script>
