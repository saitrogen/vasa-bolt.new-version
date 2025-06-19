<template>
  <div class="max-w-5xl mx-auto space-y-6 p-6">
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
          <span v-if="!barber">?</span>
          <span v-else>{{ barber.name?.charAt(0) }}</span>
        </div>
        <div class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{{ barber?.name || 'Name' }}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">Staff ID: <span class="text-slate-700 dark:text-slate-300">{{ barber?.id || '—' }}</span></div>
      </div>
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Name</label>
          <input v-if="editMode" v-model="form.name" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barber?.name || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Phone (Work)</label>
          <input v-if="editMode" v-model="form.phone_number_work" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barber?.phone_number_work || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Phone (Home)</label>
          <input v-if="editMode" v-model="form.phone_number_home" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barber?.phone_number_home || '—' }}</div>
        </div>
        <div>
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Email</label>
          <input v-if="editMode" v-model="form.email" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barber?.email || '—' }}</div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-slate-500 dark:text-slate-400 mb-1 text-xs">Address</label>
          <input v-if="editMode" v-model="form.home_address" class="input" />
          <div v-else class="text-slate-900 dark:text-slate-100">{{ barber?.home_address || '—' }}</div>
        </div>
      </div>
      <div class="flex flex-col justify-between p-6 md:w-32 md:border-l border-slate-200/80 dark:border-slate-800 items-end md:items-center">
        <button v-if="!editMode" @click="editMode = true" class="btn btn-secondary mt-2 md:mt-0">Edit</button>
        <div v-else class="flex gap-2 mt-2 md:mt-0">
          <button @click="save" class="btn btn-primary">Save</button>
          <button @click="cancel" class="btn btn-outline">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Visa & Passport Section (Placeholders) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card card-content">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Visa Number</div>
        <div class="text-slate-900 dark:text-slate-100 mb-4">—</div>
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Visa Expiry</div>
        <div class="text-slate-900 dark:text-slate-100">—</div>
      </div>
      <div class="card card-content">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Passport Number</div>
        <div class="text-slate-900 dark:text-slate-100 mb-4">—</div>
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Visa Expiry</div>
        <div class="text-slate-900 dark:text-slate-100">—</div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Today's Appointments</div>
        <div class="text-2xl text-slate-900 dark:text-slate-100 font-bold">{{ stats.todayAppointments }}</div>
      </div>
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Today's Collection</div>
        <div class="text-2xl text-green-600 dark:text-green-500 font-bold">${{ stats.todayCollection.toFixed(2) }}</div>
      </div>
      <div class="card card-content flex flex-col items-center">
        <div class="text-slate-500 dark:text-slate-400 mb-2 text-xs">Monthly Collection</div>
        <div class="text-2xl text-slate-900 dark:text-slate-100 font-bold">${{ stats.monthlyCollection.toFixed(2) }}</div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="card card-content">
      <div class="flex gap-4 mb-4">
        <button :class="tabClass('previous')" @click="appointmentsTab = 'previous'">Previous</button>
        <button :class="tabClass('today')" @click="appointmentsTab = 'today'">Today</button>
        <button :class="tabClass('upcoming')" @click="appointmentsTab = 'upcoming'">Upcoming</button>
      </div>
      <table class="w-full text-left">
        <thead>
          <tr class="table-header">
            <th class="py-2">Date</th>
            <th class="py-2">Start Time</th>
            <th class="py-2">End Time</th>
            <th class="py-2">Client</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in filteredAppointments" :key="appt.id" class="table-row">
            <td class="table-cell">{{ formatDate(appt.start_time) }}</td>
            <td class="table-cell">{{ formatTime(appt.start_time) }}</td>
            <td class="table-cell">{{ formatTime(appt.end_time) }}</td>
            <td class="table-cell">{{ appt.client?.name || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Collection Table (Today) -->
    <div class="card card-content">
      <div class="flex gap-4 mb-4">
        <button class="tab-active">Today</button>
        <!-- Add more tabs if needed -->
      </div>
      <table class="w-full text-left">
        <thead>
          <tr class="table-header">
            <th class="py-2">Date</th>
            <th class="py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="col in todayCollections" :key="col.id" class="table-row">
            <td class="table-cell">{{ formatDate(col.collection_date) }}</td>
            <td class="table-cell text-green-600 dark:text-green-500 font-bold">${{ col.total_amount_manually_entered.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import type { Barber, Appointment, DailyCollection, Client } from '../types'

const route = useRoute()
const router = useRouter()
const barberId = route.params.id as string

const barber = ref<Barber | null>(null)
const editMode = ref(false)
const form = ref<any>({})

const appointments = ref<Appointment[]>([])
const todayCollections = ref<DailyCollection[]>([])
const stats = ref({ todayAppointments: 0, todayCollection: 0, monthlyCollection: 0 })
const appointmentsTab = ref<'previous' | 'today' | 'upcoming'>('today')

const fetchBarber = async () => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('id', barberId)
    .single()
  if (!error && data) {
    barber.value = data
    form.value = { ...data }
  }
}

const fetchAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, client:clients(*)')
    .eq('barber_id', barberId)
    .order('start_time', { ascending: false })
  if (!error && data) {
    appointments.value = data
    // Stats
    const today = new Date().toISOString().slice(0, 10)
    stats.value.todayAppointments = data.filter((a: any) => a.start_time.startsWith(today)).length
  }
}

const fetchCollections = async () => {
  const { data, error } = await supabase
    .from('daily_collections')
    .select('*')
    .eq('barber_id', barberId)
    .order('collection_date', { ascending: false })
  if (!error && data) {
    todayCollections.value = data.filter((c: any) => c.collection_date === new Date().toISOString().slice(0, 10))
    // Stats
    stats.value.todayCollection = todayCollections.value.reduce((sum, c) => sum + c.total_amount_manually_entered, 0)
    // Monthly
    const month = new Date().toISOString().slice(0, 7)
    stats.value.monthlyCollection = data.filter((c: any) => c.collection_date.startsWith(month)).reduce((sum, c) => sum + c.total_amount_manually_entered, 0)
  }
}

const save = async () => {
  const { error } = await supabase
    .from('barbers')
    .update(form.value)
    .eq('id', barberId)
  if (!error) {
    editMode.value = false
    fetchBarber()
  }
}

const cancel = () => {
  form.value = { ...barber.value }
  editMode.value = false
}

const tabClass = (tab: string) =>
  appointmentsTab.value === tab
    ? 'tab-active'
    : 'tab-inactive'

const filteredAppointments = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  if (appointmentsTab.value === 'today') {
    return appointments.value.filter(a => a.start_time.startsWith(today))
  } else if (appointmentsTab.value === 'previous') {
    return appointments.value.filter(a => a.start_time < today)
  } else {
    return appointments.value.filter(a => a.start_time > today)
  }
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const goBack = () => router.push({ name: 'Barbers' })

onMounted(() => {
  fetchBarber()
  fetchAppointments()
  fetchCollections()
})
</script>

<style scoped>
.input {
  @apply w-full bg-gray-800 text-white rounded-lg px-3 py-2 mb-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
}
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition;
}
.btn-secondary {
  @apply bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition;
}
.tab-active {
  @apply px-4 py-2 rounded-t-lg bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 font-semibold shadow;
}
.tab-inactive {
  @apply px-4 py-2 rounded-t-lg bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition;
}
</style> 