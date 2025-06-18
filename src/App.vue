<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      class="fixed left-0 top-0 h-full z-10"
    />
    <main 
      :class="[
        'flex-1 overflow-auto transition-all duration-300 min-h-screen',
        isSidebarCollapsed ? 'ml-20' : 'ml-64',
        'p-6'
      ]"
    >
      <div class="max-w-[1600px] mx-auto">
        <router-view />
      </div>
    </main>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, } from 'vue'
import { useAuth } from './composables/useAuth'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'

const {  initializeAuth } = useAuth()

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

onMounted(() => {
  initializeAuth()
})
</script>