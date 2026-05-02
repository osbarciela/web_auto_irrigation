<template>
  <div class="flex items-center gap-2 text-sm">
    <span class="relative flex h-2.5 w-2.5">
      <span
        v-if="mqttStore.connected"
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"
      />
      <span
        class="relative inline-flex h-2.5 w-2.5 rounded-full"
        :class="mqttStore.connected ? 'bg-brand-500' : 'bg-red-500'"
      />
    </span>
    <span class="text-gray-400">
      Broker:
      <span :class="mqttStore.connected ? 'text-brand-400' : 'text-red-400'">
        {{ mqttStore.connected ? 'conectado' : 'desconectado' }}
      </span>
    </span>
    <span v-if="mqttStore.connected" class="text-gray-600">·</span>
    <span v-if="mqttStore.connected" class="text-gray-400">
      ESP32:
      <span :class="mqttStore.deviceOnline ? 'text-brand-400' : 'text-yellow-400'">
        {{ mqttStore.deviceOnline ? 'online' : 'offline' }}
      </span>
    </span>
  </div>
</template>

<script setup>
import { useMqttStore } from '@/stores/mqttStore'
const mqttStore = useMqttStore()
</script>
