<template>
  <div id="app">
    <div v-if="!isAuthenticated" class="min-h-screen">
      <router-view />
    </div>
    
    <div v-else class="flex min-h-screen bg-gray-50">
      <Sidebar :isCollapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />
      
      <main :class="['flex-1 overflow-auto transition-all duration-300', mainContentMargin]">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>
    
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuth } from './composables/useAuth'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'

const { isAuthenticated, initializeAuth } = useAuth()

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const mainContentMargin = computed(() => {
  return isCollapsed.value ? 'ml-20' : 'ml-64';
});

onMounted(() => {
  initializeAuth()
})
</script>