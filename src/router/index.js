import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import HistoryView from '@/views/HistoryView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
  { path: '/',         name: 'dashboard', component: DashboardView },
  { path: '/history',  name: 'history',   component: HistoryView },
  { path: '/settings', name: 'settings',  component: SettingsView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
