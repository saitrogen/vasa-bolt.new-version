<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Services</h1>
      <button
        @click="openNewServiceModal"
        class="btn btn-primary"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Add Service
      </button>
    </div>
    
    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="service in services"
        :key="service.id"
        :class="[
          'card hover:shadow-md transition-shadow cursor-pointer',
          !service.is_active && 'opacity-60'
        ]"
      >
        <div class="card-content">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {{ service.name }}
              </h3>
              <p v-if="service.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {{ service.description }}
              </p>
              <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center">
                  <CurrencyDollarIcon class="w-4 h-4 mr-1" />
                  ${{ service.price }}
                </div>
                <div class="flex items-center">
                  <ClockIcon class="w-4 h-4 mr-1" />
                  {{ service.duration_minutes }}min
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div :class="[
                'w-3 h-3 rounded-full',
                service.is_active ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"></div>
              <Menu as="div" class="relative">
                <MenuButton class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EllipsisVerticalIcon class="w-5 h-5" />
                </MenuButton>
                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <MenuItems class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="editService(service)"
                          :class="[
                            active ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300',
                            'block w-full text-left px-4 py-2 text-sm'
                          ]"
                        >
                          Edit Service
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="toggleServiceStatus(service)"
                          :class="[
                            active ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300',
                            'block w-full text-left px-4 py-2 text-sm'
                          ]"
                        >
                          {{ service.is_active ? 'Deactivate' : 'Activate' }}
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
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
  editingService.value = null
  resetForm()
  showServiceModal.value = true
}

const editService = (service: Service) => {
  editingService.value = service
  Object.assign(serviceForm, {
    name: service.name,
    price: service.price,
    duration_minutes: service.duration_minutes,
    description: service.description || '',
    is_active: service.is_active
  })
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