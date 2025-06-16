<template>
  <div id="app">
    <div v-if="!isAuthenticated" class="min-h-screen">
      <router-view />
    </div>
    
    <div v-else class="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>
    
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'

const { isAuthenticated, initializeAuth } = useAuth()

onMounted(() => {
  initializeAuth()
})
</script>