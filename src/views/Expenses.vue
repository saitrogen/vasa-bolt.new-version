<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Expenses</h1>
      <button @click="openNewExpenseModal" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 md:mr-2" />
        <span class="hidden md:inline">Add Expense</span>
      </button>
    </div>
    
    <!-- Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="filters.startDate" type="date" class="input" />
        <input v-model="filters.endDate" type="date" class="input" />
        <select v-model="filters.category" class="select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ filteredExpenses.length }} expense{{ filteredExpenses.length !== 1 ? 's' : '' }}
        </div>
        <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Total: ${{ totalAmount.toFixed(2) }}
        </div>
      </div>
    </div>
    
    <!-- Expenses Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th scope="col" class="table-header px-6 py-3 text-left">Date</th>
              <th scope="col" class="table-header px-6 py-3 text-left">Expense</th>
              <th scope="col" class="table-header px-6 py-3 text-left hidden sm:table-cell">Category</th>
              <th scope="col" class="table-header px-6 py-3 text-right">Amount</th>
              <th scope="col" class="table-header px-6 py-3 text-center">Receipt</th>
              <th scope="col" class="table-header px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            <tr v-if="loading" v-for="n in 5" :key="n">
              <td class="px-6 py-4 whitespace-nowrap" colspan="6">
                <div class="animate-pulse flex space-x-4">
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && paginatedExpenses.length === 0">
              <td class="text-center py-10" colspan="6">
                <div class="text-center text-slate-500">
                  <p class="font-medium">No expenses found</p>
                  <p class="text-sm">Try adjusting your filters.</p>
                </div>
              </td>
            </tr>
            <tr v-for="expense in paginatedExpenses" :key="expense.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ formatDate(expense.expense_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ expense.description }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400 sm:hidden">{{ expense.category }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{{ expense.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-800 dark:text-slate-200">${{ expense.amount.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button v-if="expense.bill_image_url" @click="viewReceipt(expense.bill_image_url)" class="btn btn-xs btn-ghost">
                  <PaperClipIcon class="w-4 h-4" />
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editExpense(expense)" class="btn btn-sm btn-ghost">
                  <PencilSquareIcon class="w-5 h-5" />
                  <span class="sr-only">Edit</span>
                </button>
                <button @click="deleteExpense(expense)" class="btn btn-sm btn-ghost text-red-500 hover:text-red-700">
                  <TrashIcon class="w-5 h-5" />
                  <span class="sr-only">Delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer flex items-center justify-between">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{ Math.min(endIndex, filteredExpenses.length) }}</span> of <span class="font-medium">{{ filteredExpenses.length }}</span> results
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
        
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeExpenseModal"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Create Expense') }}
          </button>
        </div>
      </form>
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
  TrashIcon,
  PaperClipIcon
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
const fileInput = ref<HTMLInputElement | null>(null)

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
  startDate: '',
  endDate: ''
})

const expenseForm = reactive({
  expense_date: new Date().toISOString().substring(0, 10),
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
  
  if (filters.startDate) {
    filtered = filtered.filter(expense => expense.expense_date >= filters.startDate)
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(expense => expense.expense_date <= filters.endDate)
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

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  try {
    return format(parseISO(date), 'MMM d, yyyy')
  } catch (error) {
    console.error('Invalid date format:', date)
    return 'Invalid Date'
  }
}

const resetForm = () => {
  Object.assign(expenseForm, {
    expense_date: new Date().toISOString().substring(0, 10),
    category: '',
    description: '',
    amount: 0,
    bill_image_url: '',
    is_active: true
  })
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
    const fileName = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('bills').upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage.from('bills').getPublicUrl(data.path)
    
    expenseForm.bill_image_url = publicUrl
    
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
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

onMounted(() => {
  fetchExpenses()
})
</script>