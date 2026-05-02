<template>
  <div class="card">
    <h3 class="mb-4 text-sm font-semibold text-gray-400">Humedad — últimas 24 h (demo)</h3>
    <Line :data="chartData" :options="chartOptions" class="max-h-64" />
    <p class="mt-2 text-center text-xs text-gray-600">Datos simulados · conectar backend InfluxDB</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps({
  zone: { type: Object, required: true },
})

const chartData = computed(() => ({
  labels: props.zone.history.map(p => {
    const d = new Date(p.t)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }),
  datasets: [
    {
      label: 'Humedad (%)',
      data: props.zone.history.map(p => p.v),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.08)',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.3,
    },
    {
      label: 'Inicio riego',
      data: props.zone.history.map(() => props.zone.moistureStart),
      borderColor: 'rgba(239,68,68,0.5)',
      borderWidth: 1,
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false,
    },
    {
      label: 'Parada riego',
      data: props.zone.history.map(() => props.zone.moistureStop),
      borderColor: 'rgba(59,130,246,0.5)',
      borderWidth: 1,
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: { labels: { color: '#9ca3af', boxWidth: 12, font: { size: 11 } } } },
  scales: {
    x: {
      ticks: { color: '#6b7280', maxTicksLimit: 8, font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      min: 0,
      max: 100,
      ticks: { color: '#6b7280', font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
  },
}
</script>
