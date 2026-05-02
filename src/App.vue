<template>
  <AppHeader />
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useMqtt } from '@/composables/useMqtt'

const { connect } = useMqtt()
onMounted(connect)
</script>
