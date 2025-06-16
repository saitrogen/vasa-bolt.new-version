<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Daily Collections (Manual Entry)</h1>
      <button
        @click="openNewCollectionModal"
        class="btn btn-primary"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Add Collection
      </button>
    </div>
    
    <!-- Info Banner -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex">
        <InformationCircleIcon class="h-5 w-5 text-blue-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Manual Collection Entry</h3>
          <div class="mt-2 text-sm text-blue-700">
            <p>This section allows you to manually record daily collection totals as a safety net or transitional tool. 
            The primary revenue tracking is automatically calculated from completed appointments.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
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
            @click="clearFilters"
            class="btn btn-outline w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          {{ filteredCollections.length }} collection{{ filteredCollections.length !== 1 ? 's' : '' }}
        </div>
        <div class="text-lg font-semibold text-gray-900">
          Total: ${{ totalAmount.toFixed(2) }}
        </div>
      </div>
    </div>
    
    <!-- Collections Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
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
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="collection in paginatedCollections"
              :key="collection.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ format(parseISO(collection.collection_date), 'MMM d, yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ collection.barber?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ collection.total_amount_manually_entered.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ collection.number_of_appointments || 'Not specified' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div class="max-w-xs truncate">
                  {{ collection.notes || 'No notes' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="editCollection(collection)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteCollection(collection)"
                    class="text-error-600 hover:text-error-900"
                  >
                    Delete
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
              <span class="font-medium">{{ Math.min(endIndex, filteredCollections.length) }}</span>
              of
              <span class="font-medium">{{ filteredCollections.length }}</span>
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
    
    <!-- Collection Modal -->
    <Modal
      :is-open="showCollectionModal"
      :title="editingCollection ? 'Edit Collection' : 'Add Daily Collection'"
      @close="closeCollectionModal"
    >
      <form @submit.prevent="saveCollection" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Barber *
            </label>
            <select
              v-model="collectionForm.barber_id"
              required
              class="select"
            >
              <option value="">Select a barber</option>
              <option v-for="barber in activeBarbers" :key="barber.id" :value="barber.id">
                {{ barber.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              v-model="collectionForm.collection_date"
              type="date"
              required
              class="input"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Total Amount *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                v-model.number="collectionForm.total_amount_manually_entered"
                type="number"
                step="0.01"
                min="0"
                required
                class="input pl-8"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Number of Appointments
            </label>
            <input
              v-model.number="collectionForm.number_of_appointments"
              type="number"
              min="0"
              class="input"
              placeholder="Optional"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            v-model="collectionForm.notes"
            rows="3"
            class="textarea"
            placeholder="Optional notes about this collection..."
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeCollectionModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingCollection ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  PlusIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { DailyCollection, Barber } from '../types'

const { addToast } = useToast()

const collections = ref<DailyCollection[]>([])
const barbers = ref<Barber[]>([])
const loading = ref(true)
const submitting = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const showCollectionModal = ref(false)
const editingCollection = ref<DailyCollection | null>(null)

const filters = reactive({
  barberId: '',
  fromDate: '',
  toDate: ''
})

const collectionForm = reactive({
  barber_id: '',
  collection_date: '',
  total_amount_manually_entered: 0,
  number_of_appointments: null as number | null,
  notes: ''
})

const activeBarbers = computed(() => {
  return barbers.value.filter(barber => barber.is_active)
})

const filteredCollections = computed(() => {
  let filtered = collections.value
  
  if (filters.barberId) {
    filtered = filtered.filter(collection => collection.barber_id === filters.barberId)
  }
  
  if (filters.fromDate) {
    filtered = filtered.filter(collection => collection.collection_date >= filters.fromDate)
  }
  
  if (filters.toDate) {
    filtered = filtered.filter(collection => collection.collection_date <= filters.toDate)
  }
  
  return filtered.sort((a, b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime())
})

const totalAmount = computed(() => {
  return filteredCollections.value.reduce((sum, collection) => sum + collection.total_amount_manually_entered, 0)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCollections.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedCollections = computed(() => {
  return filteredCollections.value.slice(startIndex.value, endIndex.value)
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

const resetForm = () => {
  Object.assign(collectionForm, {
    barber_id: '',
    collection_date: format(new Date(), 'yyyy-MM-dd'),
    total_amount_manually_entered: 0,
    number_of_appointments: null,
    notes: ''
  })
}

const clearFilters = () => {
  Object.assign(filters, {
    barberId: '',
    fromDate: '',
    toDate: ''
  })
  currentPage.value = 1
}

const openNewCollectionModal = () => {
  editingCollection.value = null
  resetForm()
  showCollectionModal.value = true
}

const editCollection = (collection: DailyCollection) => {
  editingCollection.value = collection
  Object.assign(collectionForm, {
    barber_id: collection.barber_id,
    collection_date: collection.collection_date,
    total_amount_manually_entered: collection.total_amount_manually_entered,
    number_of_appointments: collection.number_of_appointments,
    notes: collection.notes || ''
  })
  showCollectionModal.value = true
}

const closeCollectionModal = () => {
  showCollectionModal.value = false
  editingCollection.value = null
  resetForm()
}

const saveCollection = async () => {
  if (!collectionForm.barber_id || !collectionForm.collection_date || collectionForm.total_amount_manually_entered <= 0) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please fill in all required fields with valid values'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const collectionData = {
      barber_id: collectionForm.barber_id,
      collection_date: collectionForm.collection_date,
      total_amount_manually_entered: collectionForm.total_amount_manually_entered,
      number_of_appointments: collectionForm.number_of_appointments,
      notes: collectionForm.notes.trim() || null
    }
    
    if (editingCollection.value) {
      const { error } = await supabase
        .from('daily_collections')
        .update(collectionData)
        .eq('id', editingCollection.value.id)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Collection updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('daily_collections')
        .insert(collectionData)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Collection created successfully'
      })
    }
    
    closeCollectionModal()
    await fetchCollections()
    
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      addToast({
        type: 'error',
        title: 'Duplicate Entry',
        message: 'A collection for this barber and date already exists'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to save collection'
      })
    }
  } finally {
    submitting.value = false
  }
}

const deleteCollection = async (collection: DailyCollection) => {
  if (!confirm('Are you sure you want to delete this collection entry?')) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('daily_collections')
      .delete()
      .eq('id', collection.id)
    
    if (error) throw error
    
    addToast({
      type: 'success',
      title: 'Success',
      message: 'Collection deleted successfully'
    })
    
    await fetchCollections()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to delete collection'
    })
  }
}

const fetchCollections = async () => {
  try {
    const { data, error } = await supabase
      .from('daily_collections')
      .select(`
        *,
        barber:barbers(*)
      `)
      .order('collection_date', { ascending: false })
    
    if (error) throw error
    
    collections.value = data || []
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch collections'
    })
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

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchCollections(),
    fetchBarbers()
  ])
  loading.value = false
})
</script>