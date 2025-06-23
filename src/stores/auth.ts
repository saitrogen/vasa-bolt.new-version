import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const { addToast } = useToast()

  const isAuthenticated = computed(() => !!user.value)

  async function signIn(email: string, password: string) {
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
      return true
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid email or password',
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
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
      return true
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Logout Failed',
        message: error.message,
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null

    supabase.auth.onAuthStateChange((_, session) => {
      user.value = session?.user || null
    })
  }

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    initializeAuth
  }
}) 