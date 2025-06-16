<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div class="text-sm text-gray-500">
        {{ format(new Date(), 'EEEE, MMMM d, yyyy') }}
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="card-content">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CalendarDaysIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Today's Appointments</div>
              <div class="text-2xl font-bold text-gray-900">{{ todayStats.appointments }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-content">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-8 w-8 text-success-600" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Today's Revenue</div>
              <div class="text-2xl font-bold text-gray-900">${{ todayStats.revenue }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-content">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserGroupIcon class="h-8 w-8 text-secondary-600" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Total Clients</div>
              <div class="text-2xl font-bold text-gray-900">{{ totalStats.clients }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-content">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-8 w-8 text-accent-600" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Active Barbers</div>
              <div class="text-2xl font-bold text-gray-900">{{ totalStats.barbers }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div class="card-content">
          <div class="grid grid-cols-2 gap-4">
            <router-link
              to="/appointments"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CalendarDaysIcon class="h-6 w-6 text-primary-600 mr-3" />
              <span class="font-medium">New Appointment</span>
            </router-link>
            
            <router-link
              to="/clients"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon class="h-6 w-6 text-secondary-600 mr-3" />
              <span class="font-medium">Add Client</span>
            </router-link>
            
            <router-link
              to="/expenses"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CurrencyDollarIcon class="h-6 w-6 text-success-600 mr-3" />
              <span class="font-medium">Log Expense</span>
            </router-link>
            
            <router-link
              to="/reports"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon class="h-6 w-6 text-accent-600 mr-3" />
              <span class="font-medium">View Reports</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Today's Appointments -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Today's Appointments</h3>
        </div>
        <div class="card-content">
          <div class="space-y-3">
            <div
              v-for="appointment in todayAppointments.slice(0, 5)"
              :key="appointment.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900">{{ appointment.client?.name }}</div>
                <div class="text-sm text-gray-500">{{ appointment.barber?.name }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ format(parseISO(appointment.start_time), 'h:mm a') }}
                </div>
                <div :class="['badge', getStatusBadgeClass(appointment.status)]">
                  {{ appointment.status }}
                </div>
              </div>
            </div>
            
            <div v-if="todayAppointments.length === 0" class="text-center py-4 text-gray-500">
              No appointments scheduled for today
            </div>
            
            <div v-if="todayAppointments.length > 5" class="text-center">
              <router-link to="/appointments" class="text-primary-600 hover:text-primary-700 font-medium">
                View all {{ todayAppointments.length }} appointments
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, parseISO, isToday } from 'date-fns'
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import type { Appointment, Client, Barber } from '../types'

const appointments = ref<Appointment[]>([])
const clients = ref<Client[]>([])
const barbers = ref<Barber[]>([])
const loading = ref(true)

const todayAppointments = computed(() => {
  return appointments.value.filter(appointment => {
    const appointmentDate = parseISO(appointment.start_time)
    return isToday(appointmentDate)
  })
})

const todayStats = computed(() => {
  const todayApps = todayAppointments.value
  const revenue = todayApps
    .filter(app => app.status === 'completed' && app.total_amount)
    .reduce((sum, app) => sum + (app.total_amount || 0), 0)
  
  return {
    appointments: todayApps.length,
    revenue: revenue.toFixed(2)
  }
})

const totalStats = computed(() => {
  return {
    clients: clients.value.length,
    barbers: barbers.value.filter(b => b.is_active).length
  }
})

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

const fetchData = async () => {
  try {
    loading.value = true
    
    // Fetch appointments with related data
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        barber:barbers(*)
      `)
      .order('start_time', { ascending: true })
    
    if (appointmentsData) {
      appointments.value = appointmentsData
    }
    
    // Fetch clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .order('name')
    
    if (clientsData) {
      clients.value = clientsData
    }
    
    // Fetch barbers
    const { data: barbersData } = await supabase
      .from('barbers')
      .select('*')
      .order('name')
    
    if (barbersData) {
      barbers.value = barbersData
    }
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>