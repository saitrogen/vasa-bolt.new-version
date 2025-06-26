<template>
  <div v-if="barberStore.loadingSelected && !barberStore.selectedBarber" class="flex justify-center items-center h-64">
    <p class="text-slate-500 dark:text-slate-400">Loading barber profile...</p>
  </div>
  <div v-else-if="!barberStore.selectedBarber" class="flex justify-center items-center h-64">
    <p class="text-slate-500 dark:text-slate-400">Barber not found.</p>
  </div>
  <div v-else class="max-w-5xl mx-auto space-y-6 p-6">
    <!-- Back Button -->
    <button @click="goBack" class="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium mb-2 btn-ghost">
      <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
      Back to Barbers
    </button>
    <!-- Staff Profile Card -->
    <div class="card flex flex-col md:flex-row items-center md:items-stretch">
      <div class="flex flex-col items-center justify-center md:w-1/4 p-6 border-r border-slate-200/80 dark:border-slate-800">
        <!-- Profile Picture Placeholder -->
        <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-3xl text-slate-500 dark:text-slate-400 mb-2">
          <span v-if="!barberStore.selectedBarber">?</span>
          <span v-else>{{ barberStore.selectedBarber.name?.charAt(0) }}</span>
        </div>
        <div class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{{ barberStore.selectedBarber?.name || 'Name' }}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">Staff ID: <span class="text-slate-700 dark:text-slate-300">{{ barberStore.selectedBarber?.id || '—' }}</span></div>
      </div>
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Name</label>
          <input v-if="editMode" v-model="form.name" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.name || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Phone (Work)</label>
          <input v-if="editMode" v-model="form.phone_number_work" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.phone_number_work || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Phone (Home)</label>
          <input v-if="editMode" v-model="form.phone_number_home" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.phone_number_home || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Email</label>
          <input v-if="editMode" v-model="form.email" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.email || '—' }}</div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Address</label>
          <input v-if="editMode" v-model="form.home_address" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.home_address || '—' }}</div>
        </div>
      </div>
      <div class="flex flex-col justify-between p-6 md:w-32 md:border-l border-slate-200/80 dark:border-slate-800 items-end md:items-center">
        <button v-if="!editMode" @click="enableEditMode" class="btn btn-secondary mt-2 md:mt-0">Edit</button>
        <div v-else class="flex flex-wrap justify-end md:justify-center gap-2 mt-2 md:mt-0">
          <button @click="save" class="btn btn-primary" :disabled="barberStore.submitting">
            {{ barberStore.submitting ? 'Saving...' : 'Save' }}
          </button>
          <button @click="cancel" class="btn btn-outline">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Visa & Passport Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card card-content">
        <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Visa Number</label>
        <input v-if="editMode" v-model="form.visa_number" class="input" />
        <div v-else class="text-slate-900 dark:text-slate-100 mb-4">{{ barberStore.selectedBarber?.visa_number || '—' }}</div>
        
        <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Visa Expiry</label>
        <input v-if="editMode" v-model="form.visa_expiry_date" type="date" class="input" />
        <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.visa_expiry_date || '—' }}</div>
      </div>
      <div class="card card-content">
        <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Passport Number</label>
        <input v-if="editMode" v-model="form.passport_number" class="input" />
        <div v-else class="text-slate-900 dark:text-slate-100 mb-4">{{ barberStore.selectedBarber?.passport_number || '—' }}</div>

        <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Passport Expiry</label>
        <input v-if="editMode" v-model="form.passport_expiry_date" type="date" class="input" />
        <div v-else class="text-slate-900 dark:text-slate-100">{{ barberStore.selectedBarber?.passport_expiry_date || '—' }}</div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Today's Appointments</div>
        <div class="text-2xl text-slate-900 dark:text-slate-100 font-bold">{{ todayAppointmentsCount }}</div>
      </div>
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Today's Collection</div>
        <div class="text-2xl text-green-600 dark:text-green-500 font-bold">${{ todayCollectionTotal.toFixed(2) }}</div>
      </div>
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Monthly Collection</div>
        <div class="text-2xl text-slate-900 dark:text-slate-100 font-bold">${{ monthlyCollectionTotal.toFixed(2) }}</div>
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
              <th class="py-3 font-medium">Client</th>
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
              <td class="py-3">{{ appt.client?.name || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Collections Table -->
      <div v-if="mainTab === 'collections'" class="p-6">
        <div class="flex gap-4 mb-4">
          <button :class="tabClass('today_collections')" @click="collectionsTab = 'today'">Today</button>
           <button :class="tabClass('month_collections')" @click="collectionsTab = 'this_month'">This Month</button>
        </div>
        <div v-if="collectionStore.loading" class="text-center py-4">Loading collections...</div>
        <table v-else class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
              <th class="py-3 font-medium">Date</th>
              <th class="py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
             <tr v-if="displayedCollections.length === 0">
              <td colspan="2" class="text-center py-10 text-slate-500 dark:text-slate-400">No collections for this period.</td>
            </tr>
            <tr v-for="col in displayedCollections" :key="col.id" class="border-b border-slate-200/80 dark:border-slate-700/80">
              <td class="py-3">{{ formatDateDisplay(col.collection_date) }}</td>
              <td class="py-3 text-green-600 dark:text-green-500 font-semibold">${{ col.total_amount_manually_entered?.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <Modal :is-open="isConfirmModalOpen" @close="isConfirmModalOpen = false" title="Confirm Save">
    <p class="text-slate-500 dark:text-slate-400">Are you sure you want to save these changes?</p>
    <div class="mt-6 flex justify-end gap-4">
      <button @click="isConfirmModalOpen = false" class="btn btn-outline">Cancel</button>
      <button @click="confirmSave" class="btn btn-primary" :disabled="barberStore.submitting">
        {{ barberStore.submitting ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBarberStore } from '@/stores/barberStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useCollectionStore } from '@/stores/collectionStore'
import type { TablesUpdate } from '@/types/database'
import Modal from '@/components/Modal.vue' // Adjusted path
import { useToast } from '@/composables/useToast' // Adjusted path
import { format as formatDateFns, parseISO, isToday, isFuture, isPast, startOfDay } from 'date-fns'


const route = useRoute()
const router = useRouter()
const barberId = computed(() => route.params.id as string)

const barberStore = useBarberStore()
const appointmentStore = useAppointmentStore()
const collectionStore = useCollectionStore()

const { selectedBarber, submitting: barberSubmitting, loadingSelected: barberLoading } = storeToRefs(barberStore)
const { appointments: allAppointmentsForBarber, loading: appointmentsLoading } = storeToRefs(appointmentStore)
// Use a specific getter for collections for this barber
const barberCollections = computed(() => collectionStore.getCollectionsForBarber(barberId.value))


const editMode = ref(false)
const form = ref<Partial<TablesUpdate<'barbers'>>>({})
const isConfirmModalOpen = ref(false)

const { addToast } = useToast()

const appointmentsTab = ref<'previous' | 'today' | 'upcoming'>('today')
const mainTab = ref<'appointments' | 'collections'>('appointments')
const collectionsTab = ref<'today' | 'this_month'>('today');


watch(selectedBarber, (newBarber) => {
  if (newBarber) {
    form.value = { ...newBarber }
  }
}, { immediate: true })

const enableEditMode = () => {
  if (barberStore.selectedBarber) {
    form.value = { ...barberStore.selectedBarber }
    editMode.value = true
  }
}

const save = () => {
  isConfirmModalOpen.value = true
}

const confirmSave = async () => {
  if (!barberStore.selectedBarber?.id) return;

  // Ensure only actual values are sent, nullify empty strings for optional fields
  const updateData: Partial<TablesUpdate<'barbers'>> = {
    ...form.value,
    phone_number_work: form.value.phone_number_work || null,
    phone_number_home: form.value.phone_number_home || null,
    email: form.value.email || null,
    home_address: form.value.home_address || null,
    visa_number: form.value.visa_number || null,
    visa_expiry_date: form.value.visa_expiry_date || null,
    passport_number: form.value.passport_number || null,
    passport_expiry_date: form.value.passport_expiry_date || null,
  };
  
  // Remove id from updateData if it exists, as it's used in eq()
  if ('id' in updateData) delete updateData.id;


  const success = await barberStore.updateBarber(barberStore.selectedBarber.id, updateData)

  isConfirmModalOpen.value = false
  if (success) {
    // Toast is handled by store
    editMode.value = false
    // Data re-fetch or update is handled by store, selectedBarber should be reactive
  } else {
    // Error toast handled by store
  }
}

const cancel = () => {
  if (barberStore.selectedBarber) {
    form.value = { ...barberStore.selectedBarber }
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
  if ((mainTab.value === 'appointments' && appointmentsTab.value === tab) ||
      (mainTab.value === 'collections' && collectionsTab.value === tab)) {
    return `${base} bg-slate-200/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100`
  }
  return `${base} text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50`
}

const filteredAppointments = computed(() => {
  const today = startOfDay(new Date())
  if (!allAppointmentsForBarber.value) return []

  const barberAppts = allAppointmentsForBarber.value.filter(a => a.barber_id === barberId.value);

  if (appointmentsTab.value === 'today') {
    return barberAppts.filter(a => isToday(parseISO(a.start_time)))
  } else if (appointmentsTab.value === 'previous') {
    return barberAppts.filter(a => isPast(parseISO(a.start_time)) && !isToday(parseISO(a.start_time)))
  } else { // upcoming
    return barberAppts.filter(a => isFuture(parseISO(a.start_time)) && !isToday(parseISO(a.start_time)))
  }
})

const displayedCollections = computed(() => {
  if (collectionsTab.value === 'today') {
    return collectionStore.getTodayCollectionsForBarber(barberId.value);
  } else { // this_month
    return collectionStore.getThisMonthCollectionsForBarber(barberId.value);
  }
});

const todayAppointmentsCount = computed(() => {
  if (!allAppointmentsForBarber.value) return 0;
  const barberAppts = allAppointmentsForBarber.value.filter(a => a.barber_id === barberId.value);
  return barberAppts.filter(a => isToday(parseISO(a.start_time))).length
})

const todayCollectionTotal = computed(() => {
  return collectionStore.getTodayCollectionsForBarber(barberId.value)
    .reduce((sum, c) => sum + (c.total_amount_manually_entered || 0), 0)
})

const monthlyCollectionTotal = computed(() => {
  return collectionStore.getThisMonthCollectionsForBarber(barberId.value)
    .reduce((sum, c) => sum + (c.total_amount_manually_entered || 0), 0)
})


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

const goBack = () => router.push({ name: 'Barbers' })

onMounted(() => {
  if (barberId.value) {
    barberStore.fetchBarberById(barberId.value)
    // Fetch all appointments initially, then filter, or use a specific store action
    // For now, assuming appointmentStore.appointments holds all, and we filter client-side
    // or that appointmentStore.fetchAppointmentsByBarberId exists and is called
    appointmentStore.fetchAppointments() // This fetches ALL appointments. Consider a more specific fetch.
                                         // Or rely on the global list and filter as done in computed.
                                         // If AppointmentStore.getAppointmentsByBarberId(barberId) is reactive, use that.
                                         // For now, the computed property filters the main list.
    collectionStore.fetchCollectionsByBarberId(barberId.value)
  }
})

// Watch for route changes if the component is reused for different barber IDs without remounting
watch(barberId, (newId) => {
  if (newId) {
    barberStore.fetchBarberById(newId)
    appointmentStore.fetchAppointments() // Re-fetch or re-filter
    collectionStore.fetchCollectionsByBarberId(newId)
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
/* Ensure card styles are globally available or define them here if specific */
.card {
  @apply bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-0 overflow-hidden border border-slate-200/80 dark:border-slate-700/50;
}
.card-content {
  @apply p-6;
}
</style> 