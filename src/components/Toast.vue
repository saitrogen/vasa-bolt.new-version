<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-start space-x-3 p-4 rounded-lg shadow-lg max-w-sm',
          'bg-white border-l-4',
          toastClasses[toast.type]
        ]"
      >
        <div :class="['flex-shrink-0 w-5 h-5', iconClasses[toast.type]]">
          <CheckCircleIcon v-if="toast.type === 'success'" />
          <ExclamationCircleIcon v-else-if="toast.type === 'error'" />
          <ExclamationTriangleIcon v-else-if="toast.type === 'warning'" />
          <InformationCircleIcon v-else />
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            {{ toast.title }}
          </p>
          <p v-if="toast.message" class="mt-1 text-sm text-gray-500">
            {{ toast.message }}
          </p>
        </div>
        
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'border-success-500',
  error: 'border-error-500',
  warning: 'border-warning-500',
  info: 'border-primary-500'
}

const iconClasses = {
  success: 'text-success-500',
  error: 'text-error-500',
  warning: 'text-warning-500',
  info: 'text-primary-500'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>