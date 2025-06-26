import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { useToast } from '@/composables/useToast'

type ExpenseCategory = Tables<'expense_categories'>

export const useExpenseCategoryStore = defineStore('expenseCategory', () => {
  const { addToast } = useToast()

  const categories = ref<ExpenseCategory[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<any>(null)

  // --- Getters ---
  const getCategoryById = computed(() => {
    return (id: number) => categories.value.find(c => c.id === id)
  })

  const activeCategories = computed(() => {
    return categories.value.filter(c => c.is_active)
  })

  // --- Actions ---
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name')
      if (fetchError) throw fetchError
      categories.value = data || []
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error fetching expense categories', message: (e as Error).message })
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (categoryData: TablesInsert<'expense_categories'>) => {
    submitting.value = true
    error.value = null
    try {
      // Ensure is_active is set if not provided, defaulting to true
      const payload = { is_active: true, ...categoryData };

      const { data: newCategory, error: insertError } = await supabase
        .from('expense_categories')
        .insert(payload)
        .select()
        .single()
      if (insertError) throw insertError
      categories.value.push(newCategory)
      categories.value.sort((a,b) => a.name.localeCompare(b.name));
      addToast({ type: 'success', title: 'Success', message: 'Expense category created!' })
      return newCategory
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error creating category', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const updateCategory = async (id: number, categoryData: TablesUpdate<'expense_categories'>) => {
    submitting.value = true
    error.value = null
    try {
      const { data: updatedCategory, error: updateError } = await supabase
        .from('expense_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single()
      if (updateError) throw updateError

      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
        categories.value.sort((a,b) => a.name.localeCompare(b.name));
      }
      addToast({ type: 'success', title: 'Success', message: 'Expense category updated!' })
      return updatedCategory
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error updating category', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    submitting.value = true;
    error.value = null;
    try {
      // Check if any expenses use this category
      const { data: expensesWithCategory, error: checkError } = await supabase
        .from('expenses')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (expensesWithCategory && expensesWithCategory.length > 0) {
        addToast({ type: 'error', title: 'Deletion Blocked', message: 'Cannot delete category as it is being used by one or more expenses.' });
        return false;
      }

      const { error: deleteError } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;

      categories.value = categories.value.filter(c => c.id !== id);
      addToast({ type: 'success', title: 'Success', message: 'Expense category deleted!' });
      return true;
    } catch (e) {
      error.value = e;
      // If it's a specific foreign key constraint error from DB, catch it, though the check above is proactive.
      if ((e as any).message?.includes('foreign key constraint')) {
         addToast({ type: 'error', title: 'Deletion Failed', message: 'This category is in use and cannot be deleted.' });
      } else {
         addToast({ type: 'error', title: 'Error deleting category', message: (e as Error).message });
      }
      return false;
    } finally {
      submitting.value = false;
    }
  };

  return {
    categories,
    loading,
    submitting,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    activeCategories,
  }
})
