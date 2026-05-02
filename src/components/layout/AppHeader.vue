<template>
  <header class="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <div class="flex items-center gap-3">
        <svg class="h-6 w-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/>
        </svg>
        <span class="font-semibold tracking-tight text-white">Riego Automático</span>
      </div>

      <nav class="hidden gap-1 sm:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          active-class="bg-gray-800 text-white"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <ConnectionBadge />
    </div>

    <!-- Mobile nav -->
    <div class="flex border-t border-gray-800 sm:hidden">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex-1 py-2 text-center text-xs font-medium text-gray-400 transition-colors hover:text-white"
        active-class="text-brand-400"
      >
        {{ link.label }}
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import ConnectionBadge from './ConnectionBadge.vue'

const links = [
  { to: '/',         label: 'Dashboard' },
  { to: '/history',  label: 'Historial' },
  { to: '/settings', label: 'Ajustes' },
]
</script>
