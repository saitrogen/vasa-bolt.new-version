<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Expenses</h1>
      <button
        @click="openNewExpenseModal"
        class="btn btn-primary"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Add Expense
      </button>
    </div>
    
    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select v-model="filters.category" class="select">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
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
            @click="clearFilters"
            class="btn btn-outline w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          {{ filteredExpenses.length }} expense{{ filteredExpenses.length !== 1 ? 's' : '' }}
        </div>
        <div class="text-lg font-semibold text-gray-900">
          Total: ${{ totalAmount.toFixed(2) }}
        </div>
      </div>
    </div>
    
    <!-- Expenses Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
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
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="expense in paginatedExpenses"
              :key="expense.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ format(parseISO(expense.expense_date), 'MMM d, yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ expense.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="max-w-xs truncate">{{ expense.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ expense.amount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="expense.bill_image_url" class="flex items-center">
                  <button
                    @click="viewReceipt(expense.bill_image_url)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <DocumentIcon class="w-5 h-5" />
                  </button>
                </div>
                <span v-else class="text-gray-400">No receipt</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="editExpense(expense)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteExpense(expense)"
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
              <span class="font-medium">{{ Math.min(endIndex, filteredExpenses.length) }}</span>
              of
              <span class="font-medium">{{ filteredExpenses.length }}</span>
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
    
    <!-- Expense Modal -->
    <Modal
      :is-open="showExpenseModal"
      :title="editingExpense ? 'Edit Expense' : 'Add New Expense'"
      @close="closeExpenseModal"
    >
      <form @submit.prevent="saveExpense" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              v-model="expenseForm.expense_date"
              type="date"
              required
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              v-model="expenseForm.category"
              required
              class="select"
            >
              <option value="">Select category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              v-model.number="expenseForm.amount"
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
            Description *
          </label>
          <textarea
            v-model="expenseForm.description"
            rows="3"
            required
            class="textarea"
            placeholder="Describe the expense..."
          ></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Receipt Image
          </label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p class="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeExpenseModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingExpense ? 'Update' : 'Create') }}
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
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { Expense } from '../types'

const { addToast } = useToast()

const expenses = ref<Expense[]>([])
const loading = ref(true)
const submitting = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const showExpenseModal = ref(false)
const editingExpense = ref<Expense | null>(null)
const fileInput = ref<HTMLInputElement>()

const categories = [
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
  category: '',
  fromDate: '',
  toDate: ''
})

const expenseForm = reactive({
  expense_date: '',
  category: '',
  description: '',
  amount: 0,
  bill_image_url: ''
})

const filteredExpenses = computed(() => {
  let filtered = expenses.value
  
  if (filters.category) {
    filtered = filtered.filter(expense => expense.category === filters.category)
  }
  
  if (filters.fromDate) {
    filtered = filtered.filter(expense => expense.expense_date >= filters.fromDate)
  }
  
  if (filters.toDate) {
    filtered = filtered.filter(expense => expense.expense_date <= filters.toDate)
  }
  
  return filtered.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
})

const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const totalPages = computed(() => {
  return Math.ceil(filteredExpenses.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedExpenses = computed(() => {
  return filteredExpenses.value.slice(startIndex.value, endIndex.value)
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
  Object.assign(expenseForm, {
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    description: '',
    amount: 0,
    bill_image_url: ''
  })
}

const clearFilters = () => {
  Object.assign(filters, {
    category: '',
    fromDate: '',
    toDate: ''
  })
  currentPage.value = 1
}

const openNewExpenseModal = () => {
  editingExpense.value = null
  resetForm()
  showExpenseModal.value = true
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  Object.assign(expenseForm, {
    expense_date: expense.expense_date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    bill_image_url: expense.bill_image_url || ''
  })
  showExpenseModal.value = true
}

const closeExpenseModal = () => {
  showExpenseModal.value = false
  editingExpense.value = null
  resetForm()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    addToast({
      type: 'error',
      title: 'File too large',
      message: 'Please select a file smaller than 10MB'
    })
    return
  }
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `expense-receipts/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    const { data } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)
    
    expenseForm.bill_image_url = data.publicUrl
    
    addToast({
      type: 'success',
      title: 'Success',
      message: 'Receipt uploaded successfully'
    })
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Upload failed',
      message: error.message || 'Failed to upload receipt'
    })
  }
}

const viewReceipt = (url: string) => {
  window.open(url, '_blank')
}

const saveExpense = async () => {
  if (!expenseForm.expense_date || !expenseForm.category || !expenseForm.description || expenseForm.amount <= 0) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please fill in all required fields with valid values'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const expenseData = {
      expense_date: expenseForm.expense_date,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: expenseForm.amount,
      bill_image_url: expenseForm.bill_image_url || null
    }
    
    if (editingExpense.value) {
      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', editingExpense.value.id)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Expense updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('expenses')
        .insert(expenseData)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Expense created successfully'
      })
    }
    
    closeExpenseModal()
    await fetchExpenses()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to save expense'
    })
  } finally {
    submitting.value = false
  }
}

const deleteExpense = async (expense: Expense) => {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id)
    
    if (error) throw error
    
    // Delete associated image if exists
    if (expense.bill_image_url) {
      const fileName = expense.bill_image_url.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('receipts')
          .remove([`expense-receipts/${fileName}`])
      }
    }
    
    addToast({
      type: 'success',
      title: 'Success',
      message: 'Expense deleted successfully'
    })
    
    await fetchExpenses()
    
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to delete expense'
    })
  }
}

const fetchExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
    
    if (error) throw error
    
    expenses.value = data || []
  } catch (error: any) {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch expenses'
    })
  }
}

onMounted(async () => {
  loading.value = true
  await fetchExpenses()
  loading.value = false
})
</script>