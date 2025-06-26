<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Appointments</h1>
      <button @click="openModal(null)" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 md:mr-2" />
        <span class="hidden md:inline">New Appointment</span>
      </button>
    </div>
    
    <AppointmentCalendar
      :appointments="appointmentStore.appointments"
      :barbers="barberStore.barbers"
      @new-appointment="handleNewAppointment"
      @edit-appointment="handleEditAppointment"
      :loading="appointmentStore.loading || barberStore.loadingList"
    />
    
    <!-- New/Edit Appointment Modal -->
    <Modal
      :is-open="isModalOpen"
      @close="closeModal"
      :title="editingAppointment ? 'Edit Appointment' : 'New Appointment'"
    >
      <div class="flex border-b border-slate-200 dark:border-slate-700">
        <button
          v-for="tab in modalTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <form @submit.prevent="saveAppointment" class="py-6 space-y-6">
        <div v-show="activeTab === 'details'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Client</label>
              <select v-model="form.client_id" required class="select" :disabled="clientStore.loadingList">
                <option disabled value="">Select Client</option>
                <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="label">Barber</label>
              <select
                v-model="form.barber_id"
                required
                class="select"
                :disabled="barberStore.loadingList"
              >
                <option disabled value="">Select Barber</option>
                <option
                  v-for="barber in barberStore.barbers"
                  :key="barber.id"
                  :value="barber.id"
                >
                  {{ barber.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Date</label>
              <input
                v-model="form.date"
                type="date"
                required
                class="input"
              />
            </div>
            
            <div>
              <label class="label">Time</label>
              <input
                v-model="form.time"
                type="time"
                required
                class="input"
              />
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'services'">
          <label class="label">Services</label>
          <div v-if="serviceStore.loading" class="text-center py-4">Loading services...</div>
          <div v-else class="max-h-60 overflow-y-auto -m-2 p-2 space-y-1 mt-1 pretty-scrollbar">
            <label
              v-for="service in serviceStore.activeServices"
              :key="service.id"
              :class="['flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors',
                form.service_ids.includes(service.id) ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              ]"
            >
              <input
                type="checkbox"
                :value="service.id"
                v-model="form.service_ids"
                class="checkbox"
              />
              <span :class="['font-medium', form.service_ids.includes(service.id) ? 'text-primary-800 dark:text-primary-200' : 'text-slate-800 dark:text-slate-200']">{{ service.name }}</span>
              <span class="ml-auto text-sm" :class="[form.service_ids.includes(service.id) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400']">${{ service.price }}</span>
              <span class="text-xs" :class="[form.service_ids.includes(service.id) ? 'text-primary-500 dark:text-primary-400/80' : 'text-slate-400 dark:text-slate-500']">({{ service.duration_minutes }} min)</span>
            </label>
          </div>
        </div>

        <div v-show="activeTab === 'notes'">
          <div>
            <label class="label">Notes</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="textarea"
              placeholder="Optional notes about the appointment"
            ></textarea>
          </div>
        </div>

        <div v-if="editingAppointment" v-show="activeTab === 'status'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Status</label>
              <select
                v-model="form.status"
                class="select"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>
            <div v-if="form.status === 'completed'">
              <label class="label">Total Amount</label>
              <input
                v-model.number="form.total_amount"
                type="number"
                step="0.01"
                min="0"
                class="input"
                placeholder="Enter final amount"
              />
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="appointmentStore.loading">
            {{ appointmentStore.loading ? 'Saving...' : 'Save Appointment' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useBarberStore } from '@/stores/barberStore'
import { useClientStore } from '@/stores/clientStore'
import { useServiceStore } from '@/stores/serviceStore'
import AppointmentCalendar from '@/components/AppointmentCalendar.vue' // Adjusted path
import Modal from '@/components/Modal.vue' // Adjusted path
import { useToast } from '@/composables/useToast' // Adjusted path
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { AppointmentWithRelated } from '@/types' // Assuming Appointment is AppointmentWithRelated
import { format, parseISO } from 'date-fns'

const { addToast } = useToast()

const appointmentStore = useAppointmentStore()
const barberStore = useBarberStore()
const clientStore = useClientStore()
const serviceStore = useServiceStore()

// const { appointments /* other state if needed */ } = storeToRefs(appointmentStore)
// const { barbers } = storeToRefs(barberStore)
// const { clients } = storeToRefs(clientStore)
// const { services, activeServices } = storeToRefs(serviceStore)


const isModalOpen = ref(false)
const editingAppointment = ref<AppointmentWithRelated | null>(null)
const activeTab = ref('details')

const baseTabs = [
  { id: 'details', name: 'Details' },
  { id: 'services', name: 'Services' },
  { id: 'notes', name: 'Notes' },
]

const modalTabs = computed(() => {
  if (editingAppointment.value) {
    return [...baseTabs, { id: 'status', name: 'Status' }]
  }
  return baseTabs
})

const form = reactive({
  id: null as string | null | undefined,
  client_id: '',
  barber_id: '',
  date: '',
  time: '',
  service_ids: [] as string[],
  notes: '',
  status: 'scheduled',
  total_amount: 0
})

const resetForm = () => {
  form.id = null
  form.client_id = ''
  form.barber_id = ''
  form.date = new Date().toISOString().split('T')[0]
  form.time = ''
  form.service_ids = []
  form.notes = ''
  form.status = 'scheduled'
  form.total_amount = 0
  activeTab.value = 'details'
}

const openModal = (appointment: AppointmentWithRelated | null) => {
  editingAppointment.value = appointment
  activeTab.value = 'details' // Reset tab
  
  if (appointment) {
    const startDate = parseISO(appointment.start_time)
    form.id = appointment.id
    form.client_id = appointment.client_id || ''
    form.barber_id = appointment.barber_id || ''
    form.date = format(startDate, 'yyyy-MM-dd')
    form.time = format(startDate, 'HH:mm')
    // Ensure appointment_services and service_id are correctly accessed
    form.service_ids = appointment.appointment_services?.map(as => as.service_id).filter(id => id !== null) as string[] || []
    form.notes = appointment.notes || ''
    form.status = appointment.status || 'scheduled'
    form.total_amount = appointment.total_amount || 0
  } else {
    resetForm()
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingAppointment.value = null
  resetForm()
}

const saveAppointment = async () => {
  if (form.service_ids.length === 0) {
    addToast({ type: 'error', title: 'No services selected', message: 'Please select at least one service.' })
    return
  }

  const selectedStoreServices = serviceStore.services.filter(s => form.service_ids.includes(s.id))
  const totalDuration = selectedStoreServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const calculatedAmount = selectedStoreServices.reduce((sum, s) => sum + s.price, 0)

  const startTime = new Date(`${form.date}T${form.time}:00`) // Ensure seconds are included for ISO
  const endTime = new Date(startTime.getTime() + totalDuration * 60000)

  const appointmentData = {
    client_id: form.client_id,
    barber_id: form.barber_id,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: form.status,
    notes: form.notes,
    total_amount: form.status === 'completed' ? form.total_amount : calculatedAmount,
  }

  let success = false
  if (form.id) {
    const result = await appointmentStore.updateAppointment(form.id, appointmentData, form.service_ids)
    if(result) success = true
  } else {
    // For insert, 'id' should not be part of appointmentData
    const { id, ...insertData } = appointmentData
    const result = await appointmentStore.createAppointment(insertData, form.service_ids)
     if(result) success = true
  }

  if (success) {
    closeModal()
    // The store action already shows a toast and refreshes the list.
  }
  // Error handling is done within the store actions, including toasts.
}

const handleNewAppointment = (date?: Date, hour?: number) => {
  openModal(null) // Open with a null appointment to signify creation
  if (date) {
    form.date = format(date, 'yyyy-MM-dd')
    if (hour !== undefined) { // Check for undefined as hour can be 0
      const time = new Date()
      time.setHours(hour, 0, 0, 0)
      form.time = format(time, 'HH:mm')
    }
  }
}

const handleEditAppointment = (appointment: AppointmentWithRelated) => {
  openModal(appointment)
}

onMounted(() => {
  appointmentStore.fetchAppointments()
  barberStore.fetchBarbers()
  clientStore.fetchClients()
  serviceStore.fetchServices()
})
</script>