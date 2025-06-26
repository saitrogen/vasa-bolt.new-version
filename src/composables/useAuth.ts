import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth' // Adjusted path

export function useAuth() {
  const authStore = useAuthStore()

  // Expose store state and actions.
  // storeToRefs is used to ensure reactivity for state properties.
  const { user, loading, isAuthenticated } = storeToRefs(authStore)
  const { signIn, signOut, initializeAuth } = authStore

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    initializeAuth
  }
}