<template>
  <div class="space-y-6">
    <div class="sticky top-0 z-10 py-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm sm:-mx-4 sm:px-4">
      <div class="flex flex-row sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Expenses</h1>
        <button @click="openNewExpenseModal" class="btn btn-primary">
          <PlusIcon class="w-4 h-4 md:mr-2" />
          <span class=" md:inline">Add Expense</span>
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card p-4">
      <div class="sm:hidden mb-4">
        <button @click="showMobileFilters = !showMobileFilters" class="btn btn-outline w-full justify-center">
          <FunnelIcon class="w-4 h-4 mr-2" />
          {{ showMobileFilters ? 'Hide Filters' : 'Show Filters' }}
        </button>
      </div>

      <div v-show="showMobileFilters || !isMobile" class="transition-all">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <input v-model="filters.startDate" type="date" class="input" />
          <input v-model="filters.endDate" type="date" class="input" />
          <select v-model="filters.category_id" class="select">
            <option value="">All Categories</option>
            <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Quick Filters:</span>
          <button @click="setFilterDateRange('today')" class="btn btn-xs btn-outline">Today</button>
          <button @click="setFilterDateRange('this_month')" class="btn btn-xs btn-outline">This Month</button>
          <button @click="setFilterDateRange('last_month')" class="btn btn-xs btn-outline">Last Month</button>
          <button @click="clearDateFilters" class="btn btn-xs btn-ghost text-red-500 btn-outline">Clear Filter</button>
        </div>
      </div>
      
      <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ filteredExpenses.length }} expense{{ filteredExpenses.length !== 1 ? 's' : '' }}
        </div>
        <div class="flex items-center gap-2">
            <button @click="previewPdf" class="btn btn-sm btn-outline">
                <EyeIcon class="w-4 h-4 mr-2" />
                <span >Preview PDF</span>
            </button>
        <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Total: ${{ totalAmount.toFixed(2) }}
            </div>
        </div>
      </div>
    </div>
    
    <!-- Expenses Table -->
    <div class="card overflow-hidden">
      <!-- Desktop Table -->
      <div class="hidden sm:block overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
            <tr>
              <th scope="col" class="table-header px-6 py-3 text-left">Date</th>
              <th scope="col" class="table-header px-6 py-3 text-left">Name</th>
              <th scope="col" class="table-header px-6 py-3 text-left">Category</th>
              <th scope="col" class="table-header px-6 py-3 text-left">Notes</th>
              <th scope="col" class="table-header px-6 py-3 text-right">Amount</th>
              <th scope="col" class="table-header px-6 py-3 text-center">Bill</th>
              <th scope="col" class="table-header px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            <tr v-if="loading" v-for="n in 5" :key="n">
              <td class="px-6 py-4 whitespace-nowrap" colspan="7">
                <div class="animate-pulse flex space-x-4">
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && paginatedExpenses.length === 0">
              <td class="text-center py-10" colspan="7">
                <div class="text-center text-slate-500">
                  <p class="font-medium">No expenses found</p>
                  <p class="text-sm">Try adjusting your filters.</p>
                </div>
              </td>
            </tr>
            <tr v-for="expense in paginatedExpenses" :key="expense.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{
                formatDate(expense.expense_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {{ expense.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ expense.expense_categories.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ expense.notes }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                ${{ expense.amount.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <a v-if="expense.bill_url" :href="expense.bill_url" target="_blank" class="btn btn-xs btn-ghost">
                  <EyeIcon class="w-4 h-4" />
                </a>
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

      <!-- Mobile Cards -->
      <div class="block sm:hidden">
        <div v-if="loading" class="p-4">
          <div v-for="n in 5" :key="n" class="border-b border-slate-200 dark:border-slate-700 p-4">
            <div class="animate-pulse flex space-x-4">
              <div class="flex-1 space-y-2 py-1">
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!loading && paginatedExpenses.length === 0" class="p-10 text-center text-slate-500">
            <p class="font-medium">No expenses found</p>
            <p class="text-sm">Try adjusting your filters.</p>
        </div>
        <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
          <li v-for="expense in paginatedExpenses" :key="expense.id" class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ expense.name }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ expense.expense_categories.name }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(expense.expense_date) }}</p>
              </div>
              <p class="font-semibold text-lg text-slate-800 dark:text-slate-200">${{ expense.amount.toFixed(2) }}</p>
            </div>
            <p v-if="expense.notes" class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ expense.notes }}</p>
            <div class="mt-3 flex justify-end items-center gap-2">
              <a v-if="expense.bill_url" :href="expense.bill_url" target="_blank" class="btn btn-xs btn-ghost">
                <EyeIcon class="w-4 h-4 mr-1" /> Bill
              </a>
              <button @click="editExpense(expense)" class="btn btn-xs btn-ghost">
                <PencilSquareIcon class="w-4 h-4" />
              </button>
              <button @click="deleteExpense(expense)" class="btn btn-xs btn-ghost text-red-500">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </li>
        </ul>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer flex items-center justify-between">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{
            Math.min(endIndex, filteredExpenses.length) }}</span> of <span class="font-medium">{{
              filteredExpenses.length }}</span> results
        </div>
        <div class="flex items-center gap-1">
          <button @click="currentPage--" :disabled="currentPage === 1" class="btn btn-sm btn-outline">
            <ChevronLeftIcon class="h-4 w-4" />
            <span class="hidden sm:inline">Previous</span>
          </button>
          <button @click="currentPage++" :disabled="currentPage >= totalPages" class="btn btn-sm btn-outline">
            <span class="hidden sm:inline">Next</span>
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Expense Modal -->
    <Modal :is-open="showExpenseModal" :title="editingExpense ? 'Edit Expense' : 'Add New Expense'"
      @close="closeExpenseModal" size="xl">
      <form @submit.prevent="saveExpense" class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Expense Name *</label>
            <input v-model="expenseForm.name" type="text" required class="input" placeholder="e.g. Office lunch" />
          </div>
          <div>
            <label class="label">Amount *</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input v-model.number="expenseForm.amount" type="number" step="0.01" min="0" required class="input pl-8" placeholder="0.00" />
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Category *</label>
            <select v-model="expenseForm.category_id" required class="select">
              <option disabled value="">Select category</option>
              <option v-for="category in expenseCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Expense Date *</label>
            <input v-model="expenseForm.expense_date" type="date" required class="input" />
          </div>
        </div>
        
        <div>
          <label class="label">Notes / Description</label>
          <textarea v-model="expenseForm.notes" class="textarea" rows="3" placeholder="Add any relevant details..."></textarea>
          </div>

        <div>
          <label class="label">Upload Bill (optional)</label>
          <input type="file" @change="handleFileChange" class="file-input w-full" />
          <p v-if="editingExpense && expenseForm.bill_url" class="text-xs text-slate-500 mt-1">
            A file is already uploaded. Uploading a new one will replace it.
          </p>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeExpenseModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Create Expense') }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal :is-open="isPdfPreviewOpen" title="PDF Preview" @close="closePdfPreview" size="xl">
      <div class="w-full h-[75vh]">
        <iframe v-if="pdfSrc" :src="pdfSrc" class="w-full h-full border-0" title="PDF Preview"></iframe>
            </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" @click="closePdfPreview" class="btn btn-outline">Close</button>
        <a :href="pdfSrc" :download="`Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`" class="btn btn-primary">Download PDF</a>
      </div>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import { useBreakpoints } from '@/composables/useBreakpoints'

import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import Modal from '@/components/Modal.vue'

type ExpenseCategory = Tables<'expense_categories'>
type Expense = Tables<'expenses'> & {
  expense_categories: ExpenseCategory
}

const { addToast } = useToast()
const { width } = useBreakpoints()

const isMobile = computed(() => width.value < 640)

const loading = ref(false)
const submitting = ref(false)
const expenses = ref<Expense[]>([])
const expenseCategories = ref<ExpenseCategory[]>([])

const showExpenseModal = ref(false)
const editingExpense = ref<Expense | null>(null)
const isPdfPreviewOpen = ref(false)
const pdfSrc = ref('')
const showMobileFilters = ref(false)

const filters = reactive({
  startDate: '',
  endDate: '',
  category_id: '',
})

const setFilterDateRange = (period: 'today' | 'this_month' | 'last_month') => {
  const today = new Date();
  let start;
  let end;

  switch (period) {
    case 'today':
      start = today;
      end = today;
      break;
    case 'this_month':
      start = startOfMonth(today);
      end = endOfMonth(today);
      break;
    case 'last_month':
      const lastMonthDate = subMonths(today, 1);
      start = startOfMonth(lastMonthDate);
      end = endOfMonth(lastMonthDate);
      break;
  }

  filters.startDate = format(start, 'yyyy-MM-dd');
  filters.endDate = format(end, 'yyyy-MM-dd');
}

const clearDateFilters = () => {
  filters.startDate = '';
  filters.endDate = '';
}

const newExpenseForm = (): TablesInsert<'expenses'> => ({
  name: '',
  amount: 0,
  notes: '',
  expense_date: new Date().toISOString().substring(0, 10),
  category_id: '' as any, // So dropdown shows placeholder
  bill_url: null,
})

const expenseForm = ref<TablesInsert<'expenses'> | TablesUpdate<'expenses'>>(newExpenseForm())
const expenseBillFile = ref<File | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredExpenses = computed(() => {
  let filtered = expenses.value
  if (filters.startDate) {
    filtered = filtered.filter(e => e.expense_date >= filters.startDate)
  }
  if (filters.endDate) {
    filtered = filtered.filter(e => e.expense_date <= filters.endDate)
  }
  if (filters.category_id) {
    filtered = filtered.filter(e => e.category_id === Number(filters.category_id))
  }
  return filtered
})

const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((total, expense) => total + expense.amount, 0)
})

const totalPages = computed(() => Math.ceil(filteredExpenses.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)
const paginatedExpenses = computed(() => filteredExpenses.value.slice(startIndex.value, endIndex.value))

const fetchExpenses = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('expenses')
    .select('*, expense_categories(id, name)')
    .order('expense_date', { ascending: false })

  if (error) {
    addToast({ title: 'Error', message: 'Failed to fetch expenses.', type: 'error' })
    console.error(error)
  } else {
    expenses.value = data as any[]
  }
  loading.value = false
}

const fetchExpenseCategories = async () => {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    addToast({ title: 'Error', message: 'Failed to fetch expense categories.', type: 'error' })
    console.error(error)
  } else {
    expenseCategories.value = data
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    expenseBillFile.value = target.files[0]
  } else {
    expenseBillFile.value = null
  }
}

const uploadBill = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `public/expense-bills/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('expense-bills')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    addToast({ title: 'Error', message: 'Failed to upload bill.', type: 'error' })
    return null
  }

  const { data } = supabase.storage.from('expense-bills').getPublicUrl(filePath)
  return data.publicUrl
}

const saveExpense = async () => {
  if (submitting.value) return
  submitting.value = true

  let billUrl = editingExpense.value?.bill_url || null

  if (expenseBillFile.value) {
    const uploadedUrl = await uploadBill(expenseBillFile.value)
    if (uploadedUrl) {
      billUrl = uploadedUrl
    } else {
      // Upload failed, stop saving.
      submitting.value = false
      return
    }
  }

  const expenseData = { ...expenseForm.value, bill_url: billUrl }

  if (editingExpense.value) {
    // Update
    const { error } = await supabase
      .from('expenses')
      .update(expenseData as TablesUpdate<'expenses'>)
      .eq('id', editingExpense.value.id)

    if (error) {
      addToast({ title: 'Error', message: `Error updating expense: ${error.message}`, type: 'error' })
    } else {
      addToast({ title: 'Success', message: 'Expense updated successfully.', type: 'success' })
      closeExpenseModal()
      fetchExpenses()
    }
  } else {
    // Create
    const { error } = await supabase
      .from('expenses')
      .insert(expenseData as TablesInsert<'expenses'>)

    if (error) {
      addToast({ title: 'Error', message: `Error creating expense: ${error.message}`, type: 'error' })
    } else {
      addToast({ title: 'Success', message: 'Expense created successfully.', type: 'success' })
      closeExpenseModal()
      fetchExpenses()
    }
  }

  submitting.value = false
}

const openNewExpenseModal = () => {
  editingExpense.value = null
  expenseForm.value = newExpenseForm()
  expenseBillFile.value = null
  showExpenseModal.value = true
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  expenseForm.value = {
    ...expense,
    category_id: expense.category_id,
  }
  expenseBillFile.value = null
  showExpenseModal.value = true
}

const deleteExpense = async (expense: Expense) => {
  if (confirm(`Are you sure you want to delete the expense "${expense.name}"?`)) {
    const { error } = await supabase.from('expenses').delete().eq('id', expense.id)
    if (error) {
      addToast({ title: 'Error', message: `Error deleting expense: ${error.message}`, type: 'error' })
    } else {
      addToast({ title: 'Success', message: 'Expense deleted successfully.', type: 'success' })
      fetchExpenses()
    }
  }
}

const closeExpenseModal = () => {
  showExpenseModal.value = false
  editingExpense.value = null
}

const closePdfPreview = () => {
  isPdfPreviewOpen.value = false
  pdfSrc.value = ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (error) {
    return format(new Date(dateString), 'MMM d, yyyy')
  }
}

const previewPdf = () => {
  const doc = new jsPDF()
  
  const title = 'Expense Report'
  
  // Get date range from filters or from actual expenses
  let startDate = filters.startDate
  let endDate = filters.endDate
  
  if (!startDate || !endDate) {
    // If no filters, use the actual date range from expenses
    const sortedDates = [...filteredExpenses.value]
      .sort((a, b) => new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime())
    
    startDate = sortedDates[0]?.expense_date || new Date().toISOString().split('T')[0]
    endDate = sortedDates[sortedDates.length - 1]?.expense_date || new Date().toISOString().split('T')[0]
  }
  
  const dateRange = `From ${formatDate(startDate)} to ${formatDate(endDate)}`
    
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text(dateRange, 14, 30)

  const head = [['Date', 'Name', 'Category', 'Notes', 'Amount']]
  const body = filteredExpenses.value.map(e => [
    formatDate(e.expense_date),
    e.name,
    e.expense_categories.name,
    e.notes || '-',
    `$${e.amount.toFixed(2)}`
  ])
  
  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [41, 128, 185], // A shade of blue
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    foot: [['', '', '', 'Total', `$${totalAmount.value.toFixed(2)}`]],
    footStyles: {
      fontStyle: 'bold',
      fillColor: [84, 95, 107],
      textColor: 255,
    }
  })
  
  pdfSrc.value = doc.output('datauristring')
  isPdfPreviewOpen.value = true
}

onMounted(() => {
  fetchExpenses()
  fetchExpenseCategories()
})
</script>