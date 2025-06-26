import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase' // Adjusted path
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast' // Adjusted path
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  // Router and Toast need to be initialized within actions or getters,
  // or passed as arguments if needed outside of component context.
  // For now, we'll initialize them where needed.

  const isAuthenticated = computed(() => !!user.value)

  const signIn = async (email: string, password: string) => {
    const router = useRouter()
    const { addToast } = useToast()
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      user.value = data.user
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been successfully logged in.',
      })

      router.push('/')
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid email or password',
      })
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    const router = useRouter()
    const { addToast } = useToast()
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      addToast({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      })

      router.push('/login')
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Logout Failed',
        message: error.message,
      })
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = async () => {
    // Initialize router here if navigation is needed upon auth init,
    // though typically initializeAuth in App.vue doesn't redirect.
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null

    supabase.auth.onAuthStateChange((_, session) => {
      user.value = session?.user || null
      // If user becomes null and current route is not /login, redirect.
      // This requires router access.
      // const router = useRouter(); // This might not work as expected here.
      // if (!user.value && router.currentRoute.value.path !== '/login') {
      //   router.push('/login');
      // }
    })
  }

  // Call initializeAuth when the store is created for the first time.
  // This is a common pattern but be mindful of SSR if it's ever introduced.
  // initializeAuth() // We'll call this from App.vue as before for consistency.


  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    initializeAuth
  }
})
