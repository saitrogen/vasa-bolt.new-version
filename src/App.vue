<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      :is-dark="isDark"
      @toggle-dark-mode="toggleDarkMode"
      class="fixed left-0 top-0 h-full z-10"
    />
    <main 
      :class="[
        'flex-1 overflow-auto transition-all duration-300 min-h-screen',
        isSidebarCollapsed ? 'ml-20' : 'ml-64',
        'p-6'
      ]"
    >
      <div class="max-w-[1600px] mx-auto relative">
        <router-view />
      </div>
    </main>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from './composables/useAuth'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'

const { initializeAuth } = useAuth()

const isSidebarCollapsed = ref(false)
const isDark = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  initializeAuth()
  // Use localStorage if set, otherwise use system preference
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (storedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})
</script>