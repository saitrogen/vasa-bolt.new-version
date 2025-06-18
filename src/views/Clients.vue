<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
      <button
        @click="openNewClientModal"
        class="btn btn-primary"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Add Client
      </button>
    </div>
    
    <!-- Search and Filter -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search clients by name, phone, or email..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <div class="text-sm font-medium text-gray-600">
          {{ filteredClients.length }} client{{ filteredClients.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </div>
    
    <!-- Clients Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Appointments
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Visit
              </th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="client in paginatedClients"
              :key="client.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-5 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-semibold text-primary-700">
                        {{ getInitials(client.name) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-semibold text-gray-900">{{ client.name }}</div>
                    <div v-if="client.notes" class="text-sm text-gray-500 truncate max-w-xs mt-0.5">
                      {{ client.notes }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ client.phone_number }}</div>
                <div class="text-sm text-gray-500 mt-0.5">{{ client.email }}</div>
              </td>
              <td class="px-6 py-5 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ getClientAppointmentCount(client.id) }} appointments
                </div>
                <div class="text-sm text-gray-500 mt-0.5">
                  {{ getClientUpcomingCount(client.id) }} upcoming
                </div>
              </td>
              <td class="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                {{ getLastVisitDate(client.id) }}
              </td>
              <td class="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button
                    @click="viewClientHistory(client)"
                    class="text-primary-600 hover:text-primary-900 font-semibold transition-colors"
                  >
                    History
                  </button>
                  <button
                    @click="editClient(client)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ startIndex + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(endIndex, filteredClients.length) }}</span>
              of
              <span class="font-medium">{{ filteredClients.length }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Client Modal -->
    <Modal
      :is-open="showClientModal"
      :title="editingClient ? 'Edit Client' : 'Add New Client'"
      @close="closeClientModal"
    >
      <form @submit.prevent="saveClient" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            v-model="clientForm.name"
            type="text"
            required
            class="input"
            placeholder="Enter client's full name"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            v-model="clientForm.phone_number"
            type="tel"
            class="input"
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            v-model="clientForm.email"
            type="email"
            class="input"
            placeholder="client@example.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            v-model="clientForm.notes"
            rows="3"
            class="textarea"
            placeholder="Any preferences, allergies, or other notes..."
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeClientModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingClient ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Client History Modal -->
    <Modal
      :is-open="showHistoryModal"
      :title="`${selectedClient?.name} - Appointment History`"
      size="lg"
      @close="closeHistoryModal"
    >
      <div class="space-y-4">
        <div class="text-sm text-gray-600">
          Total appointments: {{ clientAppointments.length }}
        </div>
        
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="appointment in clientAppointments"
            :key="appointment.id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-gray-900">
                {{ format(parseISO(appointment.start_time), 'MMM d, yyyy') }}
              </div>
              <div :class="['badge', getStatusBadgeClass(appointment.status)]">
                {{ appointment.status }}
              </div>
            </div>
            <div class="text-sm text-gray-600">
              <div>Barber: {{ appointment.barber?.name }}</div>
              <div>Time: {{ format(parseISO(appointment.start_time), 'h:mm a') }}</div>
              <div v-if="appointment.services?.length">
                Services: {{ appointment.services.map(s => s.service?.name).join(', ') }}
              </div>
              <div v-if="appointment.total_amount">
                Amount: ${{ appointment.total_amount }}
              </div>
              <div v-if="appointment.notes" class="mt-1 italic">
                {{ appointment.notes }}
              </div>
            </div>
          </div>
          
          <div v-if="clientAppointments.length === 0" class="text-center py-8 text-gray-500">
            No appointments found for this client.
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { Client, Appointment } from '../types'

const { addToast } = useToast()

const clients = ref<Client[]>([])
const appointments = ref<Appointment[]>([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showClientModal = ref(false)
const editingClient = ref<Client | null>(null)
const showHistoryModal = ref(false)
const selectedClient = ref<Client | null>(null)

const clientForm = reactive({
  name: '',
  phone_number: '',
  email: '',
  notes: ''
})

const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  
  const query = searchQuery.value.toLowerCase()
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(query) ||
    (client.phone_number && client.phone_number.toLowerCase().includes(query)) ||
    (client.email && client.email.toLowerCase().includes(query))
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredClients.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedClients = computed(() => {
  return filteredClients.value.slice(startIndex.value, endIndex.value)
})

const displayedPages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const clientAppointments = computed(() => {
  if (!selectedClient.value) return []
  
  return appointments.value
    .filter(apt => apt.client_id === selectedClient.value!.id)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
})

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getClientAppointmentCount = (clientId: string) => {
  return appointments.value.filter(apt => apt.client_id === clientId).length
}

const getClientUpcomingCount = (clientId: string) => {
  const now = new Date()
  return appointments.value.filter(apt => 
    apt.client_id === clientId && 
    new Date(apt.start_time) > now &&
    apt.status !== 'cancelled'
  ).length
}

const getLastVisitDate = (clientId: string) => {
  const completedAppointments = appointments.value
    .filter(apt => apt.client_id === clientId && apt.status === 'completed')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  
  if (completedAppointments.length === 0) return 'Never'
  
  return format(parseISO(completedAppointments[0].start_time), 'MMM d, yyyy')
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    'booked': 'badge-default',
    'confirmed': 'badge-success',
    'completed': 'badge-success',
    'cancelled': 'badge-error',
    'no-show': 'badge-warning'
  }
  return classes[status as keyof typeof classes] || 'badge-default'
}

const resetForm = () => {
  Object.assign(clientForm, {
    name: '',
    phone_number: '',
    email: '',
    notes: ''
  })
}

const openNewClientModal = () => {
  editingClient.value = null
  resetForm()
  showClientModal.value = true
}

const editClient = (client: Client) => {
  editingClient.value = client
  Object.assign(clientForm, {
    name: client.name,
    phone_number: client.phone_number || '',
    email: client.email || '',
    notes: client.notes || ''
  })
  showClientModal.value = true
}

const closeClientModal = () => {
  showClientModal.value = false
  editingClient.value = null
  resetForm()
}

const viewClientHistory = (client: Client) => {
  selectedClient.value = client
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedClient.value = null
}

const saveClient = async () => {
  if (!clientForm.name.trim()) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Client name is required'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const clientData = {
      name: clientForm.name.trim(),
      phone_number: clientForm.phone_number.trim() || null,
      email: clientForm.email.trim() || null,
      notes: clientForm.notes.trim() || null
    }
    
    if (editingClient.value) {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingClient.value.id)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Client updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('clients')
        .insert(clientData)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Client created successfully'
      })
    }
    
    closeClientModal()
    await fetchClients()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save client'
    })
  } finally {
    submitting.value = false
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
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch clients'
    })
  }
}

const fetchAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        barber:barbers(*),
        services:appointment_services(
          *,
          service:services(*)
        )
      `)
      .order('start_time', { ascending: false })
    
    if (error) throw error
    
    appointments.value = data || []
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchClients(),
    fetchAppointments()
  ])
  loading.value = false
})
</script>