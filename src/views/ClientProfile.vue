<template>
  <div v-if="clientStore.loadingSelected && !clientStore.selectedClient" class="flex justify-center items-center h-64">
    <p class="text-slate-500 dark:text-slate-400">Loading client profile...</p>
  </div>
  <div v-else-if="!clientStore.selectedClient" class="flex justify-center items-center h-64">
     <p class="text-slate-500 dark:text-slate-400">Client not found.</p>
  </div>
  <div v-else class="max-w-5xl mx-auto space-y-6 p-6">
    <!-- Back Button -->
    <button @click="goBack" class="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium mb-2 btn-ghost">
      <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
      Back to Clients
    </button>
    <!-- Client Profile Card -->
    <div class="card flex flex-col md:flex-row items-center md:items-stretch">
      <div class="flex flex-col items-center justify-center md:w-1/4 p-6 border-r border-slate-200/80 dark:border-slate-800">
        <!-- Profile Picture Placeholder -->
        <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-3xl text-slate-500 dark:text-slate-400 mb-2">
          <span v-if="!clientStore.selectedClient">?</span>
          <span v-else>{{ clientStore.selectedClient.name?.charAt(0) }}</span>
        </div>
        <div class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{{ clientStore.selectedClient?.name || 'Name' }}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">Client ID: <span class="text-slate-700 dark:text-slate-300">{{ clientStore.selectedClient?.id || '—' }}</span></div>
      </div>
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Name</label>
          <input v-if="editMode" v-model="form.name" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ clientStore.selectedClient?.name || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Phone</label>
          <input v-if="editMode" v-model="form.phone_number" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ clientStore.selectedClient?.phone_number || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Email</label>
          <input v-if="editMode" v-model="form.email" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ clientStore.selectedClient?.email || '—' }}</div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Notes</label>
          <textarea v-if="editMode" v-model="form.notes" class="textarea" />
          <div v-else class="text-slate-900 dark:text-slate-100 whitespace-pre-line">{{ clientStore.selectedClient?.notes || '—' }}</div>
        </div>
      </div>
      <div class="flex flex-col justify-between p-6 md:w-32 md:border-l border-slate-200/80 dark:border-slate-800 items-end md:items-center">
        <button v-if="!editMode" @click="enableEditMode" class="btn btn-secondary mt-2 md:mt-0">Edit</button>
        <div v-else class="flex flex-wrap justify-end md:justify-center gap-2 mt-2 md:mt-0">
          <button @click="save" class="btn btn-primary" :disabled="clientStore.submitting">
             {{ clientStore.submitting ? 'Saving...' : 'Save' }}
          </button>
          <button @click="cancel" class="btn btn-outline">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Total Appointments</div>
        <div class="text-2xl text-slate-900 dark:text-slate-100 font-bold">{{ totalAppointmentsForClient }}</div>
      </div>
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Upcoming Appointments</div>
        <div class="text-2xl text-primary-600 dark:text-primary-400 font-bold">{{ upcomingAppointmentsForClient }}</div>
      </div>
    </div>

    <!-- Appointments and Collections -->
    <div class="card">
      <div class="flex border-b border-slate-200 dark:border-slate-700">
        <button :class="mainTabClass('appointments')" @click="mainTab = 'appointments'">Appointments</button>
        <button :class="mainTabClass('collections')" @click="mainTab = 'collections'">Collection</button>
      </div>

      <!-- Appointments Table -->
      <div v-if="mainTab === 'appointments'" class="p-6">
        <div class="flex gap-4 mb-4">
          <button :class="tabClass('previous')" @click="appointmentsTab = 'previous'">Previous</button>
          <button :class="tabClass('today')" @click="appointmentsTab = 'today'">Today</button>
          <button :class="tabClass('upcoming')" @click="appointmentsTab = 'upcoming'">Upcoming</button>
        </div>
        <div v-if="appointmentStore.loading" class="text-center py-4">Loading appointments...</div>
        <table v-else class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
              <th class="py-3 font-medium">Date</th>
              <th class="py-3 font-medium">Start Time</th>
              <th class="py-3 font-medium">End Time</th>
              <th class="py-3 font-medium">Barber</th>
            </tr>
          </thead>
          <tbody>
             <tr v-if="filteredAppointments.length === 0">
              <td colspan="4" class="text-center py-10 text-slate-500 dark:text-slate-400">No appointments for this period.</td>
            </tr>
            <tr v-for="appt in filteredAppointments" :key="appt.id" class="border-b border-slate-200/80 dark:border-slate-700/80">
              <td class="py-3">{{ formatDateDisplay(appt.start_time) }}</td>
              <td class="py-3">{{ formatTimeDisplay(appt.start_time) }}</td>
              <td class="py-3">{{ formatTimeDisplay(appt.end_time) }}</td>
              <td class="py-3">{{ appt.barber?.name || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Collections Placeholder -->
      <div v-if="mainTab === 'collections'" class="p-6">
        <p class="text-slate-500 dark:text-slate-400">Collections data for this client is not available yet.</p>
      </div>
    </div>
  </div>
  <Modal :is-open="isConfirmModalOpen" @close="isConfirmModalOpen = false" title="Confirm Save">
    <p class="text-slate-500 dark:text-slate-400">Are you sure you want to save these changes?</p>
    <div class="mt-6 flex justify-end gap-4">
      <button @click="isConfirmModalOpen = false" class="btn btn-outline">Cancel</button>
      <button @click="confirmSave" class="btn btn-primary" :disabled="clientStore.submitting">
         {{ clientStore.submitting ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useClientStore } from '@/stores/clientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import type { TablesUpdate } from '@/types/database' // Assuming Client is Tables<'clients'>
import Modal from '@/components/Modal.vue'
import { useToast } from '@/composables/useToast'
import { format as formatDateFns, parseISO, isToday, isFuture, isPast, startOfDay } from 'date-fns'


const route = useRoute()
const router = useRouter()
const clientId = computed(() => route.params.id as string)

const clientStore = useClientStore()
const appointmentStore = useAppointmentStore()

const { selectedClient, submitting: clientSubmitting, loadingSelected: clientLoading } = storeToRefs(clientStore)
const { appointments: allAppointmentsForClient, loading: appointmentsLoading } = storeToRefs(appointmentStore)


const editMode = ref(false)
const form = ref<Partial<TablesUpdate<'clients'>>>({})
const isConfirmModalOpen = ref(false)

const { addToast } = useToast()

const appointmentsTab = ref<'previous' | 'today' | 'upcoming'>('today')
const mainTab = ref<'appointments' | 'collections'>('appointments')


watch(selectedClient, (newClient) => {
  if (newClient) {
    form.value = { ...newClient }
  }
}, { immediate: true });


const enableEditMode = () => {
  if (clientStore.selectedClient) {
    form.value = { ...clientStore.selectedClient } // Initialize form with current client data
    editMode.value = true
  }
}

const save = () => {
  isConfirmModalOpen.value = true
}

const confirmSave = async () => {
  if (!clientStore.selectedClient?.id) return;

  const updateData: Partial<TablesUpdate<'clients'>> = {
    name: form.value.name,
    phone_number: form.value.phone_number || null,
    email: form.value.email || null,
    notes: form.value.notes || null
  };

  // Remove id from updateData if it exists
  if ('id' in updateData) delete updateData.id;

  const success = await clientStore.updateClient(clientStore.selectedClient.id, updateData)

  isConfirmModalOpen.value = false
  if (success) {
    editMode.value = false
    // Toast handled by store
  } else {
    // Error toast handled by store
  }
}

const cancel = () => {
  if (clientStore.selectedClient) {
    form.value = { ...clientStore.selectedClient }
  }
  editMode.value = false
}

const mainTabClass = (tab: string) => {
  const base = 'px-4 py-3 text-sm font-medium focus:outline-none'
  if (mainTab.value === tab) {
    return `${base} text-slate-900 dark:text-slate-100 border-b-2 border-primary-500`
  }
  return `${base} text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200`
}

const tabClass = (tab: string) => {
  const base = 'px-3 py-1 text-sm font-medium rounded-lg'
  if (appointmentsTab.value === tab) {
    return `${base} bg-slate-200/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100`
  }
  return `${base} text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50`
}

const clientAppointments = computed(() => {
  if (!allAppointmentsForClient.value || !clientId.value) return [];
  return allAppointmentsForClient.value.filter(a => a.client_id === clientId.value);
});

const filteredAppointments = computed(() => {
  const today = startOfDay(new Date())
  if (appointmentsTab.value === 'today') {
    return clientAppointments.value.filter(a => isToday(parseISO(a.start_time)))
  } else if (appointmentsTab.value === 'previous') {
    return clientAppointments.value.filter(a => isPast(parseISO(a.start_time)) && !isToday(parseISO(a.start_time)))
  } else { // upcoming
    return clientAppointments.value.filter(a => isFuture(parseISO(a.start_time)) && !isToday(parseISO(a.start_time)))
  }
})

const totalAppointmentsForClient = computed(() => clientAppointments.value.length);

const upcomingAppointmentsForClient = computed(() => {
  return clientAppointments.value.filter(a =>
    isFuture(parseISO(a.start_time)) &&
    a.status !== 'cancelled' &&
    a.status !== 'no-show'
  ).length;
});


function formatDateDisplay(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return formatDateFns(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return 'Invalid Date'
  }
}
function formatTimeDisplay(dateStr?: string | null) {
  if (!dateStr) return '—';
   try {
    return formatDateFns(parseISO(dateStr), 'h:mm a')
  } catch {
    return 'Invalid Time'
  }
}

const goBack = () => router.push({ name: 'Clients' })

onMounted(() => {
  if (clientId.value) {
    clientStore.fetchClientById(clientId.value)
    appointmentStore.fetchAppointments() // Fetches all appointments
  }
})

watch(clientId, (newId) => {
  if (newId) {
    clientStore.fetchClientById(newId)
    appointmentStore.fetchAppointments()
  }
})
</script>

<style scoped>
.input {
  @apply w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 mb-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
.textarea {
  @apply w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 mb-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
.card {
  @apply bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-0 overflow-hidden border border-slate-200/80 dark:border-slate-700/50;
}
.card-content {
  @apply p-6;
}
</style> 