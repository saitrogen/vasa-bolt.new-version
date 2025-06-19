<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Appointments</h1>
    </div>
    
    <AppointmentCalendar
      :appointments="appointments"
      :barbers="barbers"
      :loading="loading"
      @new-appointment="openNewAppointmentModal"
      @edit-appointment="openEditAppointmentModal"
    />
    
    <!-- New/Edit Appointment Modal -->
    <Modal
      :is-open="showAppointmentModal"
      :title="editingAppointment ? 'Edit Appointment' : 'New Appointment'"
      size="lg"
      @close="closeAppointmentModal"
    >
      <form @submit.prevent="saveAppointment" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            <select
              v-model="appointmentForm.client_id"
              required
              class="select"
            >
              <option value="">Select a client</option>
              <option
                v-for="client in clients"
                :key="client.id"
                :value="client.id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Barber *
            </label>
            <select
              v-model="appointmentForm.barber_id"
              required
              class="select"
            >
              <option value="">Select a barber</option>
              <option
                v-for="barber in activeBarbers"
                :key="barber.id"
                :value="barber.id"
              >
                {{ barber.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              v-model="appointmentForm.date"
              type="date"
              required
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              v-model="appointmentForm.time"
              type="time"
              required
              class="input"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Services *
          </label>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            <label
              v-for="service in activeServices"
              :key="service.id"
              class="flex items-center space-x-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <input
                type="checkbox"
                :value="service.id"
                v-model="appointmentForm.service_ids"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div class="flex-1">
                <div class="font-medium">{{ service.name }}</div>
                <div class="text-sm text-gray-500">
                  ${{ service.price }} • {{ service.duration_minutes }}min
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <div v-if="editingAppointment">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            v-model="appointmentForm.status"
            class="select"
          >
            <option value="booked">Booked</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
        
        <div v-if="appointmentForm.status === 'completed'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Total Amount
          </label>
          <input
            v-model.number="appointmentForm.total_amount"
            type="number"
            step="0.01"
            min="0"
            class="input"
            placeholder="Enter final amount"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            v-model="appointmentForm.notes"
            rows="3"
            class="textarea"
            placeholder="Optional notes about the appointment"
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeAppointmentModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingAppointment ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import AppointmentCalendar from '../components/AppointmentCalendar.vue'
import Modal from '../components/Modal.vue'
import type { Appointment, Client, Barber, Service } from '../types'

const { addToast } = useToast()

const appointments = ref<Appointment[]>([])
const clients = ref<Client[]>([])
const barbers = ref<Barber[]>([])
const services = ref<Service[]>([])
const loading = ref(true)
const submitting = ref(false)
const showAppointmentModal = ref(false)
const editingAppointment = ref<Appointment | null>(null)

const appointmentForm = reactive({
  client_id: '',
  barber_id: '',
  date: '',
  time: '',
  service_ids: [] as string[],
  status: 'booked',
  total_amount: 0,
  notes: ''
})

const activeBarbers = computed(() => {
  return barbers.value.filter(barber => barber.is_active)
})

const activeServices = computed(() => {
  return services.value.filter(service => service.is_active)
})

const resetForm = () => {
  Object.assign(appointmentForm, {
    client_id: '',
    barber_id: '',
    date: '',
    time: '',
    service_ids: [],
    status: 'booked',
    total_amount: 0,
    notes: ''
  })
}

const openNewAppointmentModal = (date?: Date, hour?: number) => {
  editingAppointment.value = null
  resetForm()
  
  if (date) {
    appointmentForm.date = format(date, 'yyyy-MM-dd')
  }
  if (hour !== undefined) {
    appointmentForm.time = `${hour.toString().padStart(2, '0')}:00`
  }
  
  showAppointmentModal.value = true
}

const openEditAppointmentModal = (appointment: Appointment) => {
  editingAppointment.value = appointment
  
  const startTime = parseISO(appointment.start_time)
  appointmentForm.client_id = appointment.client_id
  appointmentForm.barber_id = appointment.barber_id
  appointmentForm.date = format(startTime, 'yyyy-MM-dd')
  appointmentForm.time = format(startTime, 'HH:mm')
  appointmentForm.status = appointment.status
  appointmentForm.total_amount = appointment.total_amount || 0
  appointmentForm.notes = appointment.notes || ''
  
  // Load appointment services
  if (appointment.services) {
    appointmentForm.service_ids = appointment.services.map(s => s.service_id)
  }
  
  showAppointmentModal.value = true
}

const closeAppointmentModal = () => {
  showAppointmentModal.value = false
  editingAppointment.value = null
  resetForm()
}

const saveAppointment = async () => {
  if (!appointmentForm.client_id || !appointmentForm.barber_id || !appointmentForm.date || !appointmentForm.time || appointmentForm.service_ids.length === 0) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please fill in all required fields'
    })
    return
  }
  
  submitting.value = true
  
  try {
    // Calculate duration and end time
    const selectedServices = services.value.filter(s => appointmentForm.service_ids.includes(s.id))
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0)
    
    const startDateTime = new Date(`${appointmentForm.date}T${appointmentForm.time}`)
    const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000)
    
    const appointmentData = {
      client_id: appointmentForm.client_id,
      barber_id: appointmentForm.barber_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: appointmentForm.status,
      total_amount: appointmentForm.status === 'completed' ? appointmentForm.total_amount : null,
      notes: appointmentForm.notes || null
    }
    
    let appointmentId: string
    
    if (editingAppointment.value) {
      // Update existing appointment
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', editingAppointment.value.id)
      
      if (error) throw error
      
      appointmentId = editingAppointment.value.id
      
      // Delete existing appointment services
      await supabase
        .from('appointment_services')
        .delete()
        .eq('appointment_id', appointmentId)
      
    } else {
      // Create new appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()
      
      if (error) throw error
      appointmentId = data.id
    }
    
    // Add appointment services
    const appointmentServices = selectedServices.map(service => ({
      appointment_id: appointmentId,
      service_id: service.id,
      price_at_booking: service.price,
      duration_at_booking: service.duration_minutes,
      quantity: 1
    }))
    
    const { error: servicesError } = await supabase
      .from('appointment_services')
      .insert(appointmentServices)
    
    if (servicesError) throw servicesError
    
    addToast({
      type: 'success',
      title: 'Success',
      message: `Appointment ${editingAppointment.value ? 'updated' : 'created'} successfully`
    })
    
    closeAppointmentModal()
    await fetchAppointments()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save appointment'
    })
  } finally {
    submitting.value = false
  }
}

const fetchAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        barber:barbers(*),
        services:appointment_services(
          *,
          service:services(*)
        )
      `)
      .order('start_time', { ascending: true })
    
    if (error) throw error
    
    appointments.value = data || []
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch appointments'
    })
  }
}

const fetchClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    clients.value = data || []
  } catch (error: any) {
    console.error('Error fetching clients:', error)
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
    console.error('Error fetching barbers:', error)
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
    console.error('Error fetching services:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchAppointments(),
    fetchClients(),
    fetchBarbers(),
    fetchServices()
  ])
  loading.value = false
})
</script>