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
      :appointments="appointments"
      :barbers="barbers"
      :loading="loading"
      @date-click="handleDateClick"
      @event-click="handleEventClick"
    />
    
    <!-- New/Edit Appointment Modal -->
    <Modal
      :is-open="isModalOpen"
      @close="closeModal"
      :title="editingAppointment ? 'Edit Appointment' : 'New Appointment'"
    >
      <form @submit.prevent="saveAppointment" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Client</label>
            <select
              v-model="form.client_id"
              required
              class="select"
            >
              <option value="">Select Client</option>
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
            <label class="block text-sm font-medium">Barber</label>
            <select
              v-model="form.barber_id"
              required
              class="select"
            >
              <option value="">Select Barber</option>
              <option
                v-for="barber in barbers"
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
            <label class="block text-sm font-medium">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium">Time</label>
            <input
              v-model="form.time"
              type="time"
              required
              class="input"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium">Services</label>
          <div class="max-h-60 overflow-y-auto card p-2 space-y-2 mt-1">
            <label
              v-for="service in services"
              :key="service.id"
              class="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                :value="service.id"
                v-model="form.service_ids"
                class="rounded text-primary-600 focus:ring-primary-500"
              />
              <span>{{ service.name }} - ${{ service.price }} ({{ service.duration_minutes }} min)</span>
            </label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="textarea"
            placeholder="Optional notes about the appointment"
          ></textarea>
        </div>
        
        <div v-if="editingAppointment">
          <label class="block text-sm font-medium">Status</label>
          <select
            v-model="form.status"
            class="select"
          >
            <option>scheduled</option>
            <option>completed</option>
            <option>cancelled</option>
            <option>no-show</option>
          </select>
        </div>
        
        <div v-if="form.status === 'completed'">
          <label class="block text-sm font-medium">Total Amount</label>
          <input
            v-model.number="form.total_amount"
            type="number"
            step="0.01"
            min="0"
            class="input"
            placeholder="Enter final amount"
          />
        </div>
        
        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="closeModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
          >
            Save
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
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Appointment, Client, Barber, Service } from '../types'

const { addToast } = useToast()

const appointments = ref<Appointment[]>([])
const clients = ref<Client[]>([])
const barbers = ref<Barber[]>([])
const services = ref<Service[]>([])
const loading = ref(true)
const isModalOpen = ref(false)
const editingAppointment = ref<Appointment | null>(null)

const form = reactive({
  id: null as string | null,
  client_id: '',
  barber_id: '',
  date: '',
  time: '',
  service_ids: [] as string[],
  status: 'scheduled',
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
  Object.assign(form, {
    client_id: '',
    barber_id: '',
    date: '',
    time: '',
    service_ids: [],
    status: 'scheduled',
    total_amount: 0,
    notes: ''
  })
}

const openModal = (appointment: Appointment | null) => {
  editingAppointment.value = appointment
  
  if (appointment) {
    const startTime = parseISO(appointment.start_time)
    form.id = appointment.id
    form.client_id = appointment.client_id
    form.barber_id = appointment.barber_id
    form.date = format(startTime, 'yyyy-MM-dd')
    form.time = format(startTime, 'HH:mm')
    form.status = appointment.status
    form.total_amount = appointment.total_amount || 0
    form.notes = appointment.notes || ''
    
    // Load appointment services
    if (appointment.services) {
      form.service_ids = appointment.services.map(s => s.service_id)
    }
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
  if (!form.client_id || !form.barber_id || !form.date || !form.time || form.service_ids.length === 0) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please fill in all required fields'
    })
    return
  }
  
  try {
    // Calculate duration and end time
    const selectedServices = services.value.filter(s => form.service_ids.includes(s.id))
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0)
    
    const startDateTime = new Date(`${form.date}T${form.time}`)
    const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000)
    
    const appointmentData = {
      client_id: form.client_id,
      barber_id: form.barber_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: form.status,
      total_amount: form.status === 'completed' ? form.total_amount : null,
      notes: form.notes || null
    }
    
    let appointmentId: string
    
    if (form.id) {
      // Update existing appointment
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', form.id)
      
      if (error) throw error
      
      appointmentId = form.id
      
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
      message: `Appointment ${form.id ? 'updated' : 'created'} successfully`
    })
    
    closeModal()
    await fetchAppointments()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save appointment'
    })
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

const handleDateClick = (arg: { dateStr: string }) => {
  openModal(null)
  form.date = arg.dateStr
}

const handleEventClick = (arg: { event: any }) => {
  openModal(arg.event.extendedProps as Appointment)
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