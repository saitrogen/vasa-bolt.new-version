import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
import { useToast } from './useToast'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(false)

export function useAuth() {
  const router = useRouter()
  const { addToast } = useToast()

  const isAuthenticated = computed(() => !!user.value)

  const signIn = async (email: string, password: string) => {
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
}