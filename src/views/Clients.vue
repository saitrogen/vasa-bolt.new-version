<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Clients</h1>
      <div class="flex items-center gap-2">
        <div class="relative w-full md:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
          </div>
          <input v-model="searchQuery" type="text" placeholder="Search clients..." class="input pl-10 w-full">
        </div>
        <button @click="openNewClientModal" class="btn btn-primary">
          <PlusIcon class="w-4 h-4 md:mr-2" />
          <span class="hidden md:inline">New Client</span>
        </button>
      </div>
    </div>
    
    <!-- Clients Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th scope="col" class="table-header px-6 py-3 text-left">Client</th>
              <th scope="col" class="table-header px-6 py-3 text-left hidden sm:table-cell">Contact</th>
              <th scope="col" class="table-header px-6 py-3 text-center hidden md:table-cell">Appointments</th>
              <th scope="col" class="table-header px-6 py-3 text-left hidden lg:table-cell">Last Visit</th>
              <th scope="col" class="table-header px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            <tr v-if="loading" v-for="n in 5" :key="n">
              <td class="px-6 py-4 whitespace-nowrap" colspan="5">
                <div class="animate-pulse flex space-x-4">
                  <div class="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && paginatedClients.length === 0">
              <td class="text-center py-10" colspan="5">
                <div class="text-center text-slate-500">
                  <p class="font-medium">No clients found</p>
                  <p v-if="searchQuery" class="text-sm">Try adjusting your search.</p>
                </div>
              </td>
            </tr>
            <tr v-for="client in paginatedClients" :key="client.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" @click="goToClientProfile(client)">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                      {{ getInitials(client.name) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ client.name }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400 lg:hidden">{{ client.email || client.phone_number }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                <div class="text-sm text-slate-900 dark:text-slate-100">{{ client.email }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400">{{ client.phone_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ getClientAppointmentCount(client.id) }} Total</span>
                <span v-if="getClientUpcomingCount(client.id) > 0" class="ml-2 badge badge-success">{{ getClientUpcomingCount(client.id) }} Upcoming</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                {{ getLastVisitDate(client.id) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click.stop="editClient(client)" class="btn btn-sm btn-ghost">
                  <PencilSquareIcon class="w-5 h-5" />
                  <span class="sr-only">Edit</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer flex items-center justify-between">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="btn btn-sm btn-outline"
          >
            <ChevronLeftIcon class="h-4 w-4" />
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="btn btn-sm btn-outline"
          >
            Next
            <ChevronRightIcon class="h-4 w-4" />
          </button>
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
          <label class="label">Full Name *</label>
          <input
            v-model="clientForm.name"
            type="text"
            required
            class="input"
            placeholder="Enter client's full name"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Phone Number</label>
            <input
              v-model="clientForm.phone_number"
              type="tel"
              class="input"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label class="label">Email Address</label>
            <input
              v-model="clientForm.email"
              type="email"
              class="input"
              placeholder="client@example.com"
            />
          </div>
        </div>
        
        <div>
          <label class="label">Notes</label>
          <textarea
            v-model="clientForm.notes"
            rows="4"
            class="textarea"
            placeholder="Any preferences, allergies, or other notes..."
          ></textarea>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeClientModal"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingClient ? 'Update Client' : 'Create Client') }}
          </button>
        </div>
      </form>
    </Modal>
    
    <!-- Client History Modal -->
    <Modal
      v-if="selectedClient"
      :is-open="showHistoryModal"
      :title="`${selectedClient.name}`"
      size="lg"
      @close="closeHistoryModal"
    >
      <div class="space-y-4">
        <div class="text-sm text-slate-500 dark:text-slate-400">
          Total appointments: {{ clientAppointments.length }}
        </div>
        
        <div class="space-y-3 max-h-[60vh] overflow-y-auto -m-3 p-3 pretty-scrollbar">
          <div
            v-if="clientAppointments.length === 0"
            class="text-center py-10 text-slate-500"
          >
            No appointments found for this client.
          </div>
          <div
            v-for="appointment in clientAppointments"
            :key="appointment.id"
            class="card card-compact"
          >
            <div class="card-body">
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-slate-800 dark:text-slate-200">
                    {{ format(parseISO(appointment.start_time), 'EEEE, MMM d, yyyy') }}
                  </div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">
                    {{ format(parseISO(appointment.start_time), 'h:mm a') }} with {{ appointment.barber?.name }}
                  </div>
                </div>
                <div :class="['badge', getStatusBadgeClass(appointment.status)]">
                  {{ appointment.status }}
                </div>
              </div>
              <div class="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <div v-if="appointment.services?.length" class="flex items-center gap-2">
                  <TagIcon class="w-4 h-4 text-slate-400" />
                  <span>{{ appointment.services.map(s => s.service?.name).join(', ') }}</span>
                </div>
                <div v-if="appointment.total_amount" class="flex items-center gap-2">
                  <CurrencyDollarIcon class="w-4 h-4 text-slate-400" />
                  <span>${{ appointment.total_amount }}</span>
                </div>
                <div v-if="appointment.notes" class="pt-1 flex items-start gap-2">
                  <ChatBubbleLeftRightIcon class="w-4 h-4 text-slate-400 mt-0.5" />
                  <span class="italic">{{ appointment.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { Client, Appointment } from '../types'
import { useRouter } from 'vue-router'

const { addToast } = useToast()
const router = useRouter()

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
    (client.phone_number && client.phone_number.includes(query)) ||
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
    'scheduled': 'badge-info',
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

// const viewClientHistory = (client: Client) => {
//   selectedClient.value = client
//   showHistoryModal.value = true
// }

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
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

const fetchAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, barber:barbers(name), services:appointment_services(service:services(name))')
    
    if (error) throw error
    
    appointments.value = data || []
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
  }
}

const goToClientProfile = (client: any) => {
  router.push({ name: 'ClientProfile', params: { id: client.id } })
}

watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(async () => {
  await fetchClients()
  await fetchAppointments()
})
</script>