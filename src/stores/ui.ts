import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBreakpoints } from '@/composables/useBreakpoints' // Adjusted path

export const useUIStore = defineStore('ui', () => {
  const { width } = useBreakpoints()

  const isMobile = computed(() => width.value < 1024)
  const isSidebarCollapsed = ref(false)
  const isMobileSidebarOpen = ref(false)
  const isDark = ref(false)

  const toggleSidebar = () => {
    if (isMobile.value) {
      isMobileSidebarOpen.value = !isMobileSidebarOpen.value
    } else {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }
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

  const initializeTheme = () => {
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
  }

  return {
    isMobile,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    isDark,
    toggleSidebar,
    toggleDarkMode,
    initializeTheme
  }
})
