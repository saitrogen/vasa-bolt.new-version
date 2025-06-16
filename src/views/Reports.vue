<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
    </div>
    
    <!-- Report Type Selector -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center space-x-4">
        <label class="block text-sm font-medium text-gray-700">
          Report Type:
        </label>
        <div class="flex space-x-2">
          <button
            v-for="type in reportTypes"
            :key="type.value"
            @click="selectedReportType = type.value as 'appointments' | 'manual' | 'expenses'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedReportType === type.value
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-if="selectedReportType !== 'expenses'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Barber
          </label>
          <select v-model="filters.barberId" class="select">
            <option value="">All Barbers</option>
            <option v-for="barber in barbers" :key="barber.id" :value="barber.id">
              {{ barber.name }}
            </option>
          </select>
        </div>
        
        <div v-if="selectedReportType === 'expenses'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select v-model="filters.category" class="select">
            <option value="">All Categories</option>
            <option v-for="category in expenseCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            v-model="filters.fromDate"
            type="date"
            class="input"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            v-model="filters.toDate"
            type="date"
            class="input"
          />
        </div>
        
        <div class="flex items-end">
          <button
            @click="generateReport"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? 'Generating...' : 'Generate Report' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Report Results -->
    <div v-if="reportData.length > 0" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="card-content">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-8 w-8 text-success-600" />
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Total Amount</div>
                <div class="text-2xl font-bold text-gray-900">${{ totalAmount.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedReportType === 'appointments'" class="card">
          <div class="card-content">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CalendarDaysIcon class="h-8 w-8 text-primary-600" />
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Total Appointments</div>
                <div class="text-2xl font-bold text-gray-900">{{ reportData.length }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedReportType !== 'expenses'" class="card">
          <div class="card-content">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-8 w-8 text-secondary-600" />
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Average per {{ selectedReportType === 'appointments' ? 'Appointment' : 'Day' }}</div>
                <div class="text-2xl font-bold text-gray-900">${{ averageAmount.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedReportType === 'expenses'" class="card">
          <div class="card-content">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <DocumentTextIcon class="h-8 w-8 text-accent-600" />
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Total Expenses</div>
                <div class="text-2xl font-bold text-gray-900">{{ reportData.length }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Report Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ reportTypes.find(t => t.value === selectedReportType)?.label }} Report
          </h3>
        </div>
        
        <div class="overflow-x-auto">
          <!-- Appointments Report -->
          <table v-if="selectedReportType === 'appointments'" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barber
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in reportData" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ format(parseISO(item.start_time), 'MMM d, yyyy') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.client?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.barber?.name }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ item.services?.map((s: any) => s.service?.name).join(', ') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${{ (item.total_amount || 0).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Manual Collections Report -->
          <table v-else-if="selectedReportType === 'manual'" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barber
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointments
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in reportData" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ format(parseISO(item.collection_date), 'MMM d, yyyy') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.barber?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${{ item.total_amount_manually_entered.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.number_of_appointments || 'Not specified' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ item.notes || 'No notes' }}
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Expenses Report -->
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in reportData" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ format(parseISO(item.expense_date), 'MMM d, yyyy') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ item.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ item.description }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${{ item.amount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="item.bill_image_url" class="flex items-center">
                    <button
                      @click="viewReceipt(item.bill_image_url)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      <DocumentIcon class="w-5 h-5" />
                    </button>
                  </div>
                  <span v-else class="text-gray-400">No receipt</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!loading && hasGeneratedReport" class="text-center py-12">
      <ChartBarIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No data found</h3>
      <p class="mt-1 text-sm text-gray-500">
        No records match your selected criteria. Try adjusting your filters.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import type { Barber } from '../types'

const { addToast } = useToast()

const reportData = ref<any[]>([])
const barbers = ref<Barber[]>([])
const loading = ref(false)
const hasGeneratedReport = ref(false)
const selectedReportType = ref<'appointments' | 'manual' | 'expenses'>('appointments')

const reportTypes = [
  { label: 'Collections from Appointments', value: 'appointments' },
  { label: 'Manual Collections', value: 'manual' },
  { label: 'Expenses', value: 'expenses' }
]

const expenseCategories = [
  'Rent',
  'Utilities',
  'Supplies',
  'Equipment',
  'Maintenance',
  'Marketing',
  'Insurance',
  'Professional Services',
  'Other'
]

const filters = reactive({
  barberId: '',
  category: '',
  fromDate: '',
  toDate: ''
})

const totalAmount = computed(() => {
  if (selectedReportType.value === 'appointments') {
    return reportData.value.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  } else if (selectedReportType.value === 'manual') {
    return reportData.value.reduce((sum, item) => sum + item.total_amount_manually_entered, 0)
  } else {
    return reportData.value.reduce((sum, item) => sum + item.amount, 0)
  }
})

const averageAmount = computed(() => {
  if (reportData.value.length === 0) return 0
  return totalAmount.value / reportData.value.length
})

const generateReport = async () => {
  loading.value = true
  hasGeneratedReport.value = true
  
  try {
    let query
    let dateField
    
    if (selectedReportType.value === 'appointments') {
      query = supabase
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
        .eq('status', 'completed')
        .not('total_amount', 'is', null)
      
      dateField = 'start_time'
    } else if (selectedReportType.value === 'manual') {
      query = supabase
        .from('daily_collections')
        .select(`
          *,
          barber:barbers(*)
        `)
      
      dateField = 'collection_date'
    } else {
      query = supabase
        .from('expenses')
        .select('*')
      
      dateField = 'expense_date'
    }
    
    // Apply filters
    if (filters.barberId && selectedReportType.value !== 'expenses') {
      query = query.eq('barber_id', filters.barberId)
    }
    
    if (filters.category && selectedReportType.value === 'expenses') {
      query = query.eq('category', filters.category)
    }
    
    if (filters.fromDate) {
      query = query.gte(dateField, filters.fromDate)
    }
    
    if (filters.toDate) {
      query = query.lte(dateField, filters.toDate)
    }
    
    // Order by date
    query = query.order(dateField, { ascending: false })
    
    const { data, error } = await query
    
    if (error) throw error
    
    reportData.value = data || []
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to generate report'
    })
  } finally {
    loading.value = false
  }
}

const viewReceipt = (url: string) => {
  window.open(url, '_blank')
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

onMounted(async () => {
  await fetchBarbers()
})
</script>