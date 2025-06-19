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
        class="card flex flex-col transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary-500/10"
      >
        <div class="p-5 flex-grow">
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 pr-4">
              {{ service.name }}
            </h3>
            <div
              @click.stop="toggleServiceStatus(service)"
              :class="[
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-primary-500',
                service.is_active ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                  service.is_active ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </div>
          </div>
          <p v-if="service.description" class="text-slate-500 dark:text-slate-400 mt-2 text-sm min-h-[40px]">
            {{ service.description }}
          </p>
          <div class="flex items-center gap-6 mt-4 text-sm">
            <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold">
              <CurrencyDollarIcon class="w-5 h-5" />
              <span>${{ service.price }}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ClockIcon class="w-5 h-5" />
              <span>{{ service.duration_minutes }} min</span>
            </div>
          </div>
        </div>
        <div class="card-footer bg-slate-50 dark:bg-slate-800/50 p-3">
          <button
            @click="editService(service)"
            class="btn btn-sm btn-ghost w-full"
          >
            <PencilSquareIcon class="w-4 h-4 mr-2" />
            Edit
          </button>
        </div>
      </div>
      
      <div v-if="loading" v-for="n in 4" :key="`skel-${n}`" class="card">
        <div class="p-5">
          <div class="animate-pulse flex flex-col space-y-4">
            <div class="flex justify-between items-start">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div class="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div class="space-y-2">
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
            <div class="flex gap-6">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-slate-50 dark:bg-slate-800/50 p-3">
          <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
        </div>
      </div>
      
      <div v-if="!loading && services.length === 0" class="col-span-full">
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
          <label class="label">
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
            <label class="label">
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
            <label class="label">
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
          <label class="label">
            Description
          </label>
          <textarea
            v-model="serviceForm.description"
            rows="3"
            class="textarea"
            placeholder="Optional description of the service..."
          ></textarea>
        </div>
        
        <div v-if="editingService" class="form-control">
          <label class="label cursor-pointer justify-start">
            <input
              v-model="serviceForm.is_active"
              type="checkbox"
              class="checkbox"
            />
            <span class="label-text ml-3">Service is active</span>
          </label>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeServiceModal"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service') }}
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
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
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
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchServices()
})
</script>