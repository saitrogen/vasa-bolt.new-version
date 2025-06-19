<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Services</h1>
      <button @click="openNewServiceModal" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 md:mr-2" />
        <span class="hidden md:inline">Add Service</span>
      </button>
    </div>
    
    <!-- Services Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="service in services"
        :key="service.id"
        :class="[
          'card flex flex-col',
          !service.is_active && 'opacity-60'
        ]"
      >
        <div class="p-6 flex-grow">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ service.name }}
          </h3>
          <p v-if="service.description" class="text-slate-500 dark:text-slate-400 mt-1 min-h-[40px]">
            {{ service.description }}
          </p>
          <div class="flex items-baseline mt-4">
            <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ${{ service.price }}
            </span>
            <span class="text-sm text-slate-500 dark:text-slate-400 ml-1">/ {{ service.duration_minutes }} min</span>
          </div>
        </div>
        <div class="card-footer bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
          <button
            @click="editService(service)"
            class="btn btn-secondary"
          >
            Edit
          </button>
        </div>
      </div>
      
      <div v-if="services.length === 0 && !loading" class="col-span-full">
        <div class="text-center py-12">
          <WrenchScrewdriverIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No services</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first service.</p>
          <div class="mt-6">
            <button
              @click="openNewServiceModal"
              class="btn btn-primary"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Service Modal -->
    <Modal
      :is-open="showServiceModal"
      :title="editingService ? 'Edit Service' : 'Add New Service'"
      @close="closeServiceModal"
    >
      <form @submit.prevent="saveService" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Service Name *
          </label>
          <input
            v-model="serviceForm.name"
            type="text"
            required
            class="input"
            placeholder="e.g., Men's Haircut"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                v-model.number="serviceForm.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="input pl-8"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              v-model.number="serviceForm.duration_minutes"
              type="number"
              min="5"
              step="5"
              required
              class="input"
              placeholder="30"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            v-model="serviceForm.description"
            rows="3"
            class="textarea"
            placeholder="Optional description of the service..."
          ></textarea>
        </div>
        
        <div v-if="editingService">
          <label class="flex items-center">
            <input
              v-model="serviceForm.is_active"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-gray-700">Service is active</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeServiceModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingService ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
  PlusIcon,
  CurrencyDollarIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { Service } from '../types'

const { addToast } = useToast()

const services = ref<Service[]>([])
const loading = ref(true)
const submitting = ref(false)
const showServiceModal = ref(false)
const editingService = ref<Service | null>(null)

const serviceForm = reactive({
  name: '',
  price: 0,
  duration_minutes: 30,
  description: '',
  is_active: true
})

const resetForm = () => {
  Object.assign(serviceForm, {
    name: '',
    price: 0,
    duration_minutes: 30,
    description: '',
    is_active: true
  })
}

const openNewServiceModal = () => {
  openModal(null);
}

const editService = (service: Service) => {
  openModal(service);
}

const openModal = (service: Service | null) => {
  editingService.value = service
  if (service) {
    Object.assign(serviceForm, {
      name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes,
      description: service.description || '',
      is_active: service.is_active
    })
  } else {
    resetForm()
  }
  showServiceModal.value = true
}

const closeServiceModal = () => {
  showServiceModal.value = false
  editingService.value = null
  resetForm()
}

const saveService = async () => {
  if (!serviceForm.name.trim() || serviceForm.price <= 0 || serviceForm.duration_minutes <= 0) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please fill in all required fields with valid values'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const serviceData = {
      name: serviceForm.name.trim(),
      price: serviceForm.price,
      duration_minutes: serviceForm.duration_minutes,
      description: serviceForm.description.trim() || null,
      is_active: serviceForm.is_active
    }
    
    if (editingService.value) {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.value.id)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Service updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('services')
        .insert(serviceData)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Service created successfully'
      })
    }
    
    closeServiceModal()
    await fetchServices()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save service'
    })
  } finally {
    submitting.value = false
  }
}

const toggleServiceStatus = async (service: Service) => {
  try {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)
    
    if (error) throw error
    
    addToast({
      type: 'success',
      title: 'Success',
      message: `Service ${service.is_active ? 'deactivated' : 'activated'} successfully`
    })
    
    await fetchServices()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to update service status'
    })
  }
}

const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    services.value = data || []
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch services'
    })
  }
}

onMounted(async () => {
  loading.value = true
  await fetchServices()
  loading.value = false
})
</script>