<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Barbers</h1>
      <button
        @click="openNewBarberModal"
        class="btn btn-primary"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Add Barber
      </button>
    </div>
    
    <!-- Barbers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="barber in barbers"
        :key="barber.id"
        :class="[
          'card hover:shadow-md transition-shadow',
          !barber.is_active && 'opacity-60'
        ]"
      >
        <div class="card-content">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-xl font-medium text-gray-700">
                    {{ getInitials(barber.name) }}
                  </span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ barber.name }}
                </h3>
                <div class="mt-1 space-y-1">
                  <div v-if="barber.phone_number_work" class="text-sm text-gray-600">
                    Work: {{ barber.phone_number_work }}
                  </div>
                  <div v-if="barber.email" class="text-sm text-gray-600">
                    {{ barber.email }}
                  </div>
                </div>
                <div class="mt-2 flex items-center">
                  <div :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    barber.is_active
                      ? 'bg-success-100 text-success-800'
                      : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ barber.is_active ? 'Active' : 'Inactive' }}
                  </div>
                </div>
              </div>
            </div>
            <Menu as="div" class="relative">
              <MenuButton class="p-1 text-gray-400 hover:text-gray-600">
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
                <MenuItems class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div class="py-1">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="editBarber(barber)"
                        :class="[
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full text-left px-4 py-2 text-sm'
                        ]"
                      >
                        Edit Barber
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="manageSchedule(barber)"
                        :class="[
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full text-left px-4 py-2 text-sm'
                        ]"
                      >
                        Manage Schedule
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="toggleBarberStatus(barber)"
                        :class="[
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full text-left px-4 py-2 text-sm'
                        ]"
                      >
                        {{ barber.is_active ? 'Deactivate' : 'Activate' }}
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
      
      <div v-if="barbers.length === 0 && !loading" class="col-span-full">
        <div class="text-center py-12">
          <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No barbers</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding your first barber.</p>
          <div class="mt-6">
            <button
              @click="openNewBarberModal"
              class="btn btn-primary"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Barber
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Barber Modal -->
    <Modal
      :is-open="showBarberModal"
      :title="editingBarber ? 'Edit Barber' : 'Add New Barber'"
      @close="closeBarberModal"
    >
      <form @submit.prevent="saveBarber" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            v-model="barberForm.name"
            type="text"
            required
            class="input"
            placeholder="Enter barber's full name"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Work Phone
            </label>
            <input
              v-model="barberForm.phone_number_work"
              type="tel"
              class="input"
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Personal Phone
            </label>
            <input
              v-model="barberForm.phone_number_home"
              type="tel"
              class="input"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            v-model="barberForm.email"
            type="email"
            class="input"
            placeholder="barber@example.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Home Address
          </label>
          <textarea
            v-model="barberForm.home_address"
            rows="3"
            class="textarea"
            placeholder="Enter home address..."
          ></textarea>
        </div>
        
        <div v-if="editingBarber">
          <label class="flex items-center">
            <input
              v-model="barberForm.is_active"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-gray-700">Barber is active</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeBarberModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingBarber ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Schedule Modal -->
    <Modal
      :is-open="showScheduleModal"
      :title="`${selectedBarber?.name} - Schedule Management`"
      size="lg"
      @close="closeScheduleModal"
    >
      <div class="space-y-6">
        <!-- Weekly Schedule -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Schedule</h3>
          <div class="space-y-3">
            <div
              v-for="(day, index) in weekDays"
              :key="day"
              class="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg"
            >
              <div class="w-20 text-sm font-medium text-gray-700">
                {{ day }}
              </div>
              <label class="flex items-center">
                <input
                  v-model="scheduleForm.weeklySchedule[index].isOff"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">Day Off</span>
              </label>
              <div v-if="!scheduleForm.weeklySchedule[index].isOff" class="flex items-center space-x-2">
                <input
                  v-model="scheduleForm.weeklySchedule[index].startTime"
                  type="time"
                  class="input text-sm"
                />
                <span class="text-gray-500">to</span>
                <input
                  v-model="scheduleForm.weeklySchedule[index].endTime"
                  type="time"
                  class="input text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Date Overrides -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Date Overrides</h3>
            <button
              @click="addDateOverride"
              class="btn btn-outline btn-sm"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              Add Override
            </button>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="(override, index) in scheduleForm.dateOverrides"
              :key="index"
              class="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg"
            >
              <input
                v-model="override.date"
                type="date"
                class="input text-sm"
              />
              <label class="flex items-center">
                <input
                  v-model="override.isOff"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">Full Day Off</span>
              </label>
              <div v-if="!override.isOff" class="flex items-center space-x-2">
                <input
                  v-model="override.startTime"
                  type="time"
                  class="input text-sm"
                />
                <span class="text-gray-500">to</span>
                <input
                  v-model="override.endTime"
                  type="time"
                  class="input text-sm"
                />
              </div>
              <button
                @click="removeDateOverride(index)"
                class="text-error-600 hover:text-error-800"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            @click="closeScheduleModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            @click="saveSchedule"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : 'Save Schedule' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
  PlusIcon,
  UsersIcon,
  EllipsisVerticalIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { Barber, BarberSchedule } from '../types'

const { addToast } = useToast()

const barbers = ref<Barber[]>([])
const schedules = ref<BarberSchedule[]>([])
const loading = ref(true)
const submitting = ref(false)
const showBarberModal = ref(false)
const showScheduleModal = ref(false)
const editingBarber = ref<Barber | null>(null)
const selectedBarber = ref<Barber | null>(null)

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const barberForm = reactive({
  name: '',
  phone_number_work: '',
  phone_number_home: '',
  email: '',
  home_address: '',
  is_active: true
})

const scheduleForm = reactive({
  weeklySchedule: weekDays.map((_, index) => ({
    dayOfWeek: index,
    isOff: false,
    startTime: '09:00',
    endTime: '17:00'
  })),
  dateOverrides: [] as Array<{
    date: string
    isOff: boolean
    startTime: string
    endTime: string
  }>
})

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const resetBarberForm = () => {
  Object.assign(barberForm, {
    name: '',
    phone_number_work: '',
    phone_number_home: '',
    email: '',
    home_address: '',
    is_active: true
  })
}

const resetScheduleForm = () => {
  scheduleForm.weeklySchedule = weekDays.map((_, index) => ({
    dayOfWeek: index,
    isOff: false,
    startTime: '09:00',
    endTime: '17:00'
  }))
  scheduleForm.dateOverrides = []
}

const openNewBarberModal = () => {
  editingBarber.value = null
  resetBarberForm()
  showBarberModal.value = true
}

const editBarber = (barber: Barber) => {
  editingBarber.value = barber
  Object.assign(barberForm, {
    name: barber.name,
    phone_number_work: barber.phone_number_work || '',
    phone_number_home: barber.phone_number_home || '',
    email: barber.email || '',
    home_address: barber.home_address || '',
    is_active: barber.is_active
  })
  showBarberModal.value = true
}

const closeBarberModal = () => {
  showBarberModal.value = false
  editingBarber.value = null
  resetBarberForm()
}

const manageSchedule = async (barber: Barber) => {
  selectedBarber.value = barber
  resetScheduleForm()
  
  // Load existing schedule
  const barberSchedules = schedules.value.filter(s => s.barber_id === barber.id)
  
  // Load weekly schedule
  barberSchedules.forEach(schedule => {
    if (schedule.day_of_week !== null) {
      const dayIndex = schedule.day_of_week
      scheduleForm.weeklySchedule[dayIndex] = {
        dayOfWeek: dayIndex,
        isOff: schedule.is_day_off,
        startTime: schedule.start_time || '09:00',
        endTime: schedule.end_time || '17:00'
      }
    }
  })
  
  // Load date overrides
  scheduleForm.dateOverrides = barberSchedules
    .filter(s => s.specific_date_override)
    .map(s => ({
      date: s.specific_date_override!,
      isOff: s.is_day_off,
      startTime: s.override_start_time || '09:00',
      endTime: s.override_end_time || '17:00'
    }))
  
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  selectedBarber.value = null
  resetScheduleForm()
}

const addDateOverride = () => {
  scheduleForm.dateOverrides.push({
    date: '',
    isOff: false,
    startTime: '09:00',
    endTime: '17:00'
  })
}

const removeDateOverride = (index: number) => {
  scheduleForm.dateOverrides.splice(index, 1)
}

const saveBarber = async () => {
  if (!barberForm.name.trim()) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Barber name is required'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const barberData = {
      name: barberForm.name.trim(),
      phone_number_work: barberForm.phone_number_work.trim() || null,
      phone_number_home: barberForm.phone_number_home.trim() || null,
      email: barberForm.email.trim() || null,
      home_address: barberForm.home_address.trim() || null,
      is_active: barberForm.is_active
    }
    
    if (editingBarber.value) {
      const { error } = await supabase
        .from('barbers')
        .update(barberData)
        .eq('id', editingBarber.value.id)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Barber updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('barbers')
        .insert(barberData)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Barber created successfully'
      })
    }
    
    closeBarberModal()
    await fetchBarbers()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save barber'
    })
  } finally {
    submitting.value = false
  }
}

const saveSchedule = async () => {
  if (!selectedBarber.value) return
  
  submitting.value = true
  
  try {
    // Delete existing schedules for this barber
    await supabase
      .from('barber_schedules')
      .delete()
      .eq('barber_id', selectedBarber.value.id)
    
    const scheduleData: any[] = []
    
    // Add weekly schedules
    scheduleForm.weeklySchedule.forEach((day, index) => {
      scheduleData.push({
        barber_id: selectedBarber.value!.id,
        day_of_week: index,
        start_time: day.isOff ? null : day.startTime,
        end_time: day.isOff ? null : day.endTime,
        is_day_off: day.isOff
      })
    })
    
    // Add date overrides
    scheduleForm.dateOverrides.forEach(override => {
      if (override.date) {
        scheduleData.push({
          barber_id: selectedBarber.value!.id,
          specific_date_override: override.date,
          override_start_time: override.isOff ? null : override.startTime,
          override_end_time: override.isOff ? null : override.endTime,
          is_day_off: override.isOff
        })
      }
    })
    
    if (scheduleData.length > 0) {
      const { error } = await supabase
        .from('barber_schedules')
        .insert(scheduleData)
      
      if (error) throw error
    }
    
    addToast({
      type: 'success',
      title: 'Success',
      message: 'Schedule saved successfully'
    })
    
    closeScheduleModal()
    await fetchSchedules()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save schedule'
    })
  } finally {
    submitting.value = false
  }
}

const toggleBarberStatus = async (barber: Barber) => {
  try {
    const { error } = await supabase
      .from('barbers')
      .update({ is_active: !barber.is_active })
      .eq('id', barber.id)
    
    if (error) throw error
    
    addToast({
      type: 'success',
      title: 'Success',
      message: `Barber ${barber.is_active ? 'deactivated' : 'activated'} successfully`
    })
    
    await fetchBarbers()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to update barber status'
    })
  }
}

const fetchBarbers = async () => {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    barbers.value = data || []
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch barbers'
    })
  }
}

const fetchSchedules = async () => {
  try {
    const { data, error } = await supabase
      .from('barber_schedules')
      .select('*')
    
    if (error) throw error
    
    schedules.value = data || []
  } catch (error: any) {
    console.error('Error fetching schedules:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchBarbers(),
    fetchSchedules()
  ])
  loading.value = false
})
</script>