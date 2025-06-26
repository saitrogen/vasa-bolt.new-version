<template>
  <!-- Login page - Full screen layout -->
  <div v-if="$route.name === 'Login'" class="min-h-screen">
    <router-view />
    <Toast />
  </div>
  
  <!-- Main application layout with sidebar -->
  <div v-else class="flex h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Desktop Sidebar -->
    <Sidebar
      v-if="!uiStore.isMobile"
      :is-collapsed="uiStore.isSidebarCollapsed"
      @toggle-sidebar="uiStore.toggleSidebar"
      :is-dark="uiStore.isDark"
      @toggle-dark-mode="uiStore.toggleDarkMode"
      class="fixed left-0 top-0 h-full z-20"
    />

    <!-- Mobile Sidebar (Overlay) -->
    <Transition name="slide">
      <Sidebar
        v-if="uiStore.isMobile && uiStore.isMobileSidebarOpen"
        :is-collapsed="false"
        @toggle-sidebar="uiStore.toggleSidebar"
        :is-dark="uiStore.isDark"
        @toggle-dark-mode="uiStore.toggleDarkMode"
        class="fixed left-0 top-0 h-full z-40"
      />
    </Transition>
    <div v-if="uiStore.isMobile && uiStore.isMobileSidebarOpen" @click="uiStore.toggleSidebar" class="fixed inset-0 bg-black/50 z-30"></div>

    <div class="flex flex-col flex-1 w-full">
      <!-- Mobile Header -->
      <header v-if="uiStore.isMobile" class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 lg:hidden">
        <button @click="uiStore.toggleSidebar" class="p-2">
          <Menu class="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">VASA SALOON</h1>
        <div class="w-6"></div> <!-- Spacer -->
      </header>

      <main 
        :class="[
          'flex-1 overflow-auto transition-all duration-300 min-h-screen',
          uiStore.isMobile ? 'p-4' : 'p-6',
          !uiStore.isMobile && (uiStore.isSidebarCollapsed ? 'ml-20' : 'ml-64'),
        ]"
      >
        <div class="max-w-[1600px] mx-auto relative">
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
import { useUIStore } from '@/stores/ui' // Adjusted path
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'
import { Menu } from 'lucide-vue-next'

const { initializeAuth } = useAuth()
const uiStore = useUIStore()

onMounted(() => {
  initializeAuth()
  uiStore.initializeTheme()
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>