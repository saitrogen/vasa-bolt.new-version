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
          <input v-model="localFilters.startDate" type="date" class="input" @change="applyFilters" />
          <input v-model="localFilters.endDate" type="date" class="input" @change="applyFilters" />
          <select v-model="localFilters.category_id" class="select" @change="applyFilters">
            <option value="">All Categories</option>
            <option v-for="cat in categoryStore.activeCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Quick Filters:</span>
          <button @click="setFilterDateRange('today')" class="btn btn-xs btn-outline">Today</button>
          <button @click="setFilterDateRange('this_month')" class="btn btn-xs btn-outline">This Month</button>
          <button @click="setFilterDateRange('last_month')" class="btn btn-xs btn-outline">Last Month</button>
          <button @click="clearAllFilters" class="btn btn-xs btn-ghost text-red-500 btn-outline">Clear Filter</button>
        </div>
      </div>
      
      <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ expenseStore.filteredExpenses.length }} expense{{ expenseStore.filteredExpenses.length !== 1 ? 's' : '' }}
        </div>
        <div class="flex items-center gap-2">
            <button @click="previewPdf" class="btn btn-sm btn-outline">
                <EyeIcon class="w-4 h-4 mr-2" />
                <span >Preview PDF</span>
            </button>
        <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Total: ${{ expenseStore.totalFilteredAmount.toFixed(2) }}
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
            <tr v-if="expenseStore.loading && paginatedExpenses.length === 0" v-for="n in 5" :key="`skel-desk-${n}`">
              <td class="px-6 py-4 whitespace-nowrap" colspan="7">
                <div class="animate-pulse flex space-x-4">
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!expenseStore.loading && paginatedExpenses.length === 0">
              <td class="text-center py-10" colspan="7">
                <div class="text-center text-slate-500 dark:text-slate-400">
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
                {{ expense.expense_categories?.name || 'N/A' }}
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
                <button @click="confirmDeleteExpense(expense)" class="btn btn-sm btn-ghost text-red-500 hover:text-red-700">
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
        <div v-if="expenseStore.loading && paginatedExpenses.length === 0" class="p-4">
          <div v-for="n in 3" :key="`skel-mob-${n}`" class="border-b border-slate-200 dark:border-slate-700 p-4">
            <div class="animate-pulse flex space-x-4">
              <div class="flex-1 space-y-2 py-1">
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!expenseStore.loading && paginatedExpenses.length === 0" class="p-10 text-center text-slate-500 dark:text-slate-400">
            <p class="font-medium">No expenses found</p>
            <p class="text-sm">Try adjusting your filters.</p>
        </div>
        <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
          <li v-for="expense in paginatedExpenses" :key="expense.id" class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ expense.name }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ expense.expense_categories?.name || 'N/A' }}</p>
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
              <button @click="confirmDeleteExpense(expense)" class="btn btn-xs btn-ghost text-red-500">
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
            Math.min(endIndex, expenseStore.filteredExpenses.length) }}</span> of <span class="font-medium">{{
              expenseStore.filteredExpenses.length }}</span> results
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
            <select v-model="expenseForm.category_id" required class="select" :disabled="categoryStore.loading">
              <option disabled value="">Select category</option>
              <option v-for="category in categoryStore.activeCategories" :key="category.id" :value="category.id">
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
          <button type="submit" :disabled="expenseStore.submitting" class="btn btn-primary">
            {{ expenseStore.submitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Create Expense') }}
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
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { useExpenseStore, type ExpenseWithCategory } from '@/stores/expenseStore'
import { useExpenseCategoryStore } from '@/stores/expenseCategoryStore'
import { useToast } from '@/composables/useToast'
import { useBreakpoints } from '@/composables/useBreakpoints'

import type { TablesInsert, TablesUpdate } from '@/types/database'
import Modal from '@/components/Modal.vue'


const { addToast } = useToast()
const { width } = useBreakpoints()
const expenseStore = useExpenseStore()
const categoryStore = useExpenseCategoryStore()

const { loading: expensesLoading, submitting: expensesSubmitting, filteredExpenses: storeFilteredExpenses, totalFilteredAmount } = storeToRefs(expenseStore)
const { categories: expenseCategories, loading: categoriesLoading } = storeToRefs(categoryStore)


const isMobile = computed(() => width.value < 640)

const showExpenseModal = ref(false)
const editingExpense = ref<ExpenseWithCategory | null>(null)
const isPdfPreviewOpen = ref(false)
const pdfSrc = ref('')
const showMobileFilters = ref(false)

// Local component copy of filters to interact with inputs
const localFilters = reactive({
  startDate: expenseStore.filters.startDate,
  endDate: expenseStore.filters.endDate,
  category_id: expenseStore.filters.category_id,
})

// Watch localFilters to update store filters
watch(localFilters, (newFilters) => {
  expenseStore.setFilters(newFilters)
  currentPage.value = 1; // Reset to first page on filter change
})

const applyFilters = () => {
  expenseStore.setFilters({ ...localFilters });
}

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
  localFilters.startDate = format(start, 'yyyy-MM-dd');
  localFilters.endDate = format(end, 'yyyy-MM-dd');
  applyFilters();
}

const clearAllFilters = () => {
  localFilters.startDate = '';
  localFilters.endDate = '';
  localFilters.category_id = '';
  applyFilters();
}


const newExpenseForm = (): Omit<TablesInsert<'expenses'>, 'user_id'> => ({ // user_id will be set by RLS or trigger
  name: '',
  amount: 0,
  notes: '',
  expense_date: new Date().toISOString().substring(0, 10),
  category_id: undefined, // Use undefined for type consistency with number | undefined
  bill_url: null,
})

const expenseForm = ref<Omit<TablesInsert<'expenses'>, 'user_id' | 'id'> | Omit<TablesUpdate<'expenses'>, 'user_id' | 'id'>>(newExpenseForm())
const expenseBillFile = ref<File | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)


const totalPages = computed(() => Math.ceil(expenseStore.filteredExpenses.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)
const paginatedExpenses = computed(() => expenseStore.filteredExpenses.slice(startIndex.value, endIndex.value))


const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    expenseBillFile.value = target.files[0]
  } else {
    expenseBillFile.value = null
  }
}


const saveExpense = async () => {
  if (expenseStore.submitting) return

  const currentEditingId = editingExpense.value?.id;

  const payload = {
    ...expenseForm.value,
    category_id: Number(expenseForm.value.category_id) // Ensure category_id is a number
  };

  let success = false;
  if (currentEditingId) {
    const result = await expenseStore.updateExpense(currentEditingId, payload as TablesUpdate<'expenses'>, expenseBillFile.value);
    if (result) success = true;
  } else {
    const result = await expenseStore.createExpense(payload as TablesInsert<'expenses'>, expenseBillFile.value);
    if (result) success = true;
  }

  if (success) {
    closeExpenseModal();
  }
}

const openNewExpenseModal = () => {
  editingExpense.value = null
  const formVals = newExpenseForm();
  expenseForm.value = {
    name: formVals.name,
    amount: formVals.amount,
    notes: formVals.notes,
    expense_date: formVals.expense_date,
    category_id: categoryStore.activeCategories[0]?.id || undefined, // Default to first active category or undefined
    bill_url: formVals.bill_url,
  };
  expenseBillFile.value = null
  showExpenseModal.value = true
}

const editExpense = (expense: ExpenseWithCategory) => {
  editingExpense.value = expense
  expenseForm.value = { // Explicitly map fields to avoid passing extra properties like 'expense_categories'
    name: expense.name,
    amount: expense.amount,
    notes: expense.notes,
    expense_date: expense.expense_date,
    category_id: expense.category_id,
    bill_url: expense.bill_url,
  }
  expenseBillFile.value = null
  showExpenseModal.value = true
}

const confirmDeleteExpense = async (expense: ExpenseWithCategory) => {
  if (confirm(`Are you sure you want to delete the expense "${expense.name}"?`)) {
    await expenseStore.deleteExpense(expense.id)
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (error) {
    // Fallback for dates that might not be full ISO strings (e.g. 'yyyy-MM-dd')
    try {
        return format(new Date(dateString + 'T00:00:00'), 'MMM d, yyyy') // Assume local timezone if not specified
    } catch (e2) {
        console.error("Error formatting date:", dateString, e2);
        return "Invalid Date";
    }
  }
}

const previewPdf = () => {
  const doc = new jsPDF()
  
  const title = 'Expense Report'
  
  let reportStartDate = localFilters.startDate
  let reportEndDate = localFilters.endDate
  
  if (!reportStartDate || !reportEndDate) {
    const sortedDates = [...expenseStore.filteredExpenses]
      .map(e => e.expense_date)
      .filter(d => d !== null)
      .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime()) // Add null check for a and b
    
    reportStartDate = sortedDates[0] || new Date().toISOString().split('T')[0]
    reportEndDate = sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0]
  }
  
  const dateRange = `From ${formatDate(reportStartDate)} to ${formatDate(reportEndDate)}`
    
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text(dateRange, 14, 30)

  const head = [['Date', 'Name', 'Category', 'Notes', 'Amount']]
  const body = expenseStore.filteredExpenses.map(e => [
    formatDate(e.expense_date),
    e.name,
    e.expense_categories?.name || 'N/A',
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
      // Column indices are 0-based
      4: { halign: 'right' } // Amount column
    },
    foot: [['', '', '', 'Total', `$${expenseStore.totalFilteredAmount.toFixed(2)}`]],
    footStyles: {
      fontStyle: 'bold',
      fillColor: [84, 95, 107], // A dark grey
      textColor: 255,
    }
  })
  
  pdfSrc.value = doc.output('datauristring')
  isPdfPreviewOpen.value = true
}

onMounted(() => {
  expenseStore.fetchExpenses()
  categoryStore.fetchCategories()
  // Initialize localFilters from store filters after fetching, if necessary, or on created
  localFilters.startDate = expenseStore.filters.startDate;
  localFilters.endDate = expenseStore.filters.endDate;
  localFilters.category_id = expenseStore.filters.category_id;
})
</script>