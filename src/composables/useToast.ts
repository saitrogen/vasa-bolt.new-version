import { ref, reactive } from 'vue'
import type { Toast } from '../types'

const toasts = reactive<Toast[]>([])

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    toasts.push(newToast)
    
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
    }
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}