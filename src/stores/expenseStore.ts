import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { useToast } from '@/composables/useToast'

// Assuming ExpenseCategory is also needed or handled by its own store
type ExpenseCategory = Tables<'expense_categories'>;
export type ExpenseWithCategory = Tables<'expenses'> & {
  expense_categories: Pick<ExpenseCategory, 'id' | 'name'> | null // Allow null if category might not be joined
}

export const useExpenseStore = defineStore('expense', () => {
  const { addToast } = useToast()

  const expenses = ref<ExpenseWithCategory[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<any>(null)

  // --- Filters (optional, can be local to component or here) ---
  const filters = ref({
    startDate: '',
    endDate: '',
    category_id: '' as string | number, // Allow string for 'All' option
  })

  // --- Getters ---
  const getExpenseById = computed(() => {
    return (id: number) => expenses.value.find(e => e.id === id)
  })

  const filteredExpenses = computed(() => {
    let filtered = expenses.value
    if (filters.value.startDate) {
      filtered = filtered.filter(e => e.expense_date >= filters.value.startDate)
    }
    if (filters.value.endDate) {
      filtered = filtered.filter(e => e.expense_date <= filters.value.endDate)
    }
    if (filters.value.category_id && filters.value.category_id !== '') {
      filtered = filtered.filter(e => e.category_id === Number(filters.value.category_id))
    }
    return filtered
  })

  const totalFilteredAmount = computed(() => {
    return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  })


  // --- Actions ---
  const fetchExpenses = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*, expense_categories(id, name)') // Join with categories
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      expenses.value = data as ExpenseWithCategory[] || []
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error fetching expenses', message: (e as Error).message })
    } finally {
      loading.value = false
    }
  }

  const uploadBill = async (file: File, oldBillUrl?: string | null): Promise<string | null> => {
    // Optional: Delete old bill if replacing
    if (oldBillUrl) {
        const oldFileName = oldBillUrl.split('/').pop();
        if (oldFileName) {
            // Path in bucket might be different, e.g., public/expense-bills/filename
            // Be careful with constructing the path for deletion.
            // For simplicity, direct deletion attempt:
            // await supabase.storage.from('expense-bills').remove([`public/expense-bills/${oldFileName}`]);
        }
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileName = `${uniquePrefix}.${fileExt}`;
    // It's common to store files under a user or entity ID, e.g., `user_id/expense-bills/fileName`
    // For now, storing in a general path.
    const filePath = `public/${fileName}`; // Storage path for 'expense-bills' bucket

    const { error: uploadError } = await supabase.storage
      .from('expense-bills') // Bucket name
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      addToast({ type: 'error', title: 'Upload Failed', message: uploadError.message })
      return null
    }

    const { data } = supabase.storage.from('expense-bills').getPublicUrl(filePath)
    return data.publicUrl
  }


  const createExpense = async (expenseData: TablesInsert<'expenses'>, billFile?: File | null) => {
    submitting.value = true
    error.value = null
    try {
      let billUrlToSave = expenseData.bill_url; // Might be null or already set if not changing
      if (billFile) {
        const newBillUrl = await uploadBill(billFile);
        if (newBillUrl) {
          billUrlToSave = newBillUrl;
        } else {
          // Upload failed, but maybe proceed without bill or halt?
          // For now, proceed without new bill if upload fails.
          addToast({type: 'warning', title: 'Bill Upload Issue', message: 'Could not upload the bill, expense saved without it.'})
        }
      }

      const payload = { ...expenseData, bill_url: billUrlToSave };

      const { data: newExpense, error: insertError } = await supabase
        .from('expenses')
        .insert(payload)
        .select('*, expense_categories(id, name)') // Re-fetch with category
        .single()
      if (insertError) throw insertError

      expenses.value.unshift(newExpense as ExpenseWithCategory) // Add to top
      addToast({ type: 'success', title: 'Success', message: 'Expense created!' })
      return newExpense
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error creating expense', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const updateExpense = async (id: number, expenseData: TablesUpdate<'expenses'>, billFile?: File | null) => {
    submitting.value = true
    error.value = null
    try {
      let billUrlToSave = expenseData.bill_url; // Existing or new
      const currentExpense = expenses.value.find(exp => exp.id === id);

      if (billFile) {
        const newBillUrl = await uploadBill(billFile, currentExpense?.bill_url);
        if (newBillUrl) {
          billUrlToSave = newBillUrl;
        } else {
           addToast({type: 'warning', title: 'Bill Upload Issue', message: 'Could not upload new bill, expense updated with previous or no bill.'})
        }
      }

      const payload = { ...expenseData, bill_url: billUrlToSave };

      const { data: updatedExpense, error: updateError } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .select('*, expense_categories(id, name)') // Re-fetch with category
        .single()
      if (updateError) throw updateError

      const index = expenses.value.findIndex(e => e.id === id)
      if (index !== -1) {
        expenses.value[index] = updatedExpense as ExpenseWithCategory
      }
      addToast({ type: 'success', title: 'Success', message: 'Expense updated!' })
      return updatedExpense
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error updating expense', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const deleteExpense = async (id: number) => {
    submitting.value = true;
    error.value = null;
    try {
      // Optional: Delete associated bill from storage
      const expenseToDelete = expenses.value.find(exp => exp.id === id);
      if (expenseToDelete?.bill_url) {
        const fileName = expenseToDelete.bill_url.split('/').pop();
        if (fileName) {
          // Path in bucket might be different, e.g., public/fileName
          // await supabase.storage.from('expense-bills').remove([`public/${fileName}`]);
        }
      }

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;

      expenses.value = expenses.value.filter(e => e.id !== id);
      addToast({ type: 'success', title: 'Success', message: 'Expense deleted!' });
      return true;
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error deleting expense', message: (e as Error).message });
      return false;
    } finally {
      submitting.value = false;
    }
  };

  // Action to update filters
  const setFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters };
    // Optionally, trigger a fetch if filtering is server-side
    // fetchExpenses();
  };


  return {
    expenses, // Raw expenses
    loading,
    submitting,
    error,
    filters, // Expose filters state
    filteredExpenses, // Computed property for filtered expenses
    totalFilteredAmount, // Computed property for total of filtered
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    setFilters, // Action to update filters
    uploadBill, // Expose if needed directly, though usually part of create/update
  }
})

// Define ExpenseWithCategory in types/index.ts or similar:
// export type ExpenseCategorySlim = Pick<Tables<'expense_categories'>, 'id' | 'name'>;
// export interface ExpenseWithCategory extends Tables<'expenses'> {
//   expense_categories: ExpenseCategorySlim | null; // Or non-null if join is guaranteed and category_id is non-nullable
// }
// Ensure this type is imported and used.
// The storage path for `uploadBill` was simplified to `public/${fileName}`.
// If your bucket `expense-bills` has RLS policies that require user-specific folders,
// or if you prefer organizing by `user_id` or `expense_id`, the `filePath` logic would need adjustment.
// For example: `const filePath = `${userId}/expense-bills/${fileName}`;`
// Deleting old bills in `uploadBill` or `deleteExpense` is commented out for safety,
// as constructing the exact storage path from a public URL can be tricky and error-prone.
// It's safer to manage deletions with more robust path information if this feature is critical.
// The `expense_categories` join in `fetchExpenses`, `createExpense`, `updateExpense` ensures category name is available.
// The `ExpenseWithCategory` type should match this. The current definition:
// `expense_categories: Pick<ExpenseCategory, 'id' | 'name'> | null` looks good.
// Filter state and computed properties `filteredExpenses` and `totalFilteredAmount` are now part of the store.
// An action `setFilters` is provided to update filters from components.
// The `uploadBill` action now includes a parameter for `oldBillUrl` to potentially delete it, though the deletion logic itself is commented out.
// File naming for uploads includes a random component to further reduce collision chances: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`.
// The bucket name in `uploadBill` is specified as `expense-bills`. Ensure this matches your Supabase storage setup.
// The `filePath` in `uploadBill` is `public/${fileName}`. If your bucket RLS is set up for specific folder structures (e.g. per user), adjust this.
// The `deleteExpense` action also has commented-out logic for deleting the bill from storage.
// This is because deriving the exact storage path from the public URL can be unreliable. If bill deletion is essential,
// consider storing the storage path alongside the public URL when an expense is created/updated.
