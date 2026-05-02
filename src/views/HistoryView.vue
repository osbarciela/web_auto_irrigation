<template>
  <main class="mx-auto max-w-6xl px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Historial de humedad</h1>
      <div class="flex gap-2">
        <button
          v-for="zone in zones"
          :key="zone.id"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="selectedId === zone.id ? 'bg-brand-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'"
          @click="selectedId = zone.id"
        >
          Z{{ zone.id + 1 }}
        </button>
      </div>
    </div>

    <MoistureChart v-if="selectedZone" :zone="selectedZone" />

    <!-- All zones mini-cards -->
    <section>
      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Todas las zonas</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <MoistureChart v-for="zone in zones" :key="zone.id" :zone="zone" />
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIrrigationStore } from '@/stores/irrigationStore'
import MoistureChart from '@/components/charts/MoistureChart.vue'

const irrigationStore = useIrrigationStore()
const zones = irrigationStore.zones
const selectedId = ref(0)
const selectedZone = computed(() => zones.find(z => z.id === selectedId.value))
</script>
