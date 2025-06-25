<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">Expense Categories</h3>
      <button @click="openCategoryModal()" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        New Category
      </button>
    </div>

    <!-- Categories List -->
    <div class="card">
      <ul class="divide-y divide-slate-200 dark:divide-slate-700">
        <li v-if="loading" v-for="n in 3" :key="n" class="p-4">
          <div class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-2 py-1">
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          </div>
        </li>
        <li v-for="category in categories" :key="category.id" class="p-4 flex justify-between items-center">
          <p class="font-medium">{{ category.name }}</p>
          <div>
            <button @click="openCategoryModal(category)" class="btn btn-sm btn-ghost">
              <PencilSquareIcon class="w-5 h-5" />
            </button>
            <button @click="deleteCategory(category)" class="btn btn-sm btn-ghost text-red-500 hover:text-red-700">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </li>
        <li v-if="!loading && categories.length === 0" class="p-4 text-center text-slate-500">
          No expense categories found.
        </li>
      </ul>
    </div>

    <!-- Category Modal -->
    <Modal :is-open="showModal" :title="isEditing ? 'Edit Category' : 'New Category'" @close="closeModal">
      <form @submit.prevent="saveCategory" class="space-y-4">
        <div>
          <label class="label">Category Name</label>
          <input v-model="form.name" type="text" class="input" required placeholder="e.g. Office Supplies">
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? 'Saving...' : 'Save Category' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/composables/useToast';
import Modal from './Modal.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

type ExpenseCategory = Tables<'expense_categories'>;

const { addToast } = useToast();
const categories = ref<ExpenseCategory[]>([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const isEditing = ref(false);

const defaultFormState = (): { id: number | null; name: string } => ({
    id: null,
    name: '',
})

const form = reactive(defaultFormState());

const fetchCategories = async () => {
  loading.value = true;
  const { data, error } = await supabase.from('expense_categories').select('*').order('name');
  if (error) {
    addToast({ type: 'error', title: 'Error', message: 'Could not fetch categories.' });
  } else {
    categories.value = data || [];
  }
  loading.value = false;
};

const openCategoryModal = (category: ExpenseCategory | null = null) => {
  if (category) {
    isEditing.value = true;
    form.id = category.id;
    form.name = category.name;
  } else {
    isEditing.value = false;
    Object.assign(form, defaultFormState());
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveCategory = async () => {
  if (!form.name.trim()) {
    addToast({ type: 'error', title: 'Validation Error', message: 'Category name cannot be empty.' });
    return;
  }
  submitting.value = true;

  try {
    if (isEditing.value && form.id) {
      const { error } = await supabase
        .from('expense_categories')
        .update({ name: form.name } as TablesUpdate<'expense_categories'>)
        .eq('id', form.id);
      if (error) throw error;
      addToast({ type: 'success', title: 'Success', message: 'Category updated.' });
    } else {
      const { error } = await supabase
        .from('expense_categories')
        .insert({ name: form.name } as TablesInsert<'expense_categories'>);
      if (error) throw error;
      addToast({ type: 'success', title: 'Success', message: 'Category created.' });
    }
    await fetchCategories();
    closeModal();
  } catch (error: any) {
    addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to save category.' });
  } finally {
    submitting.value = false;
  }
};

const deleteCategory = async (category: ExpenseCategory) => {
  if (!confirm(`Are you sure you want to delete the category "${category.name}"? This might affect existing expenses.`)) return;

  const { error } = await supabase.from('expense_categories').delete().eq('id', category.id);
  if (error) {
    addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete category.' });
  } else {
    addToast({ type: 'success', title: 'Success', message: 'Category deleted.' });
    await fetchCategories();
  }
};

onMounted(() => {
  fetchCategories();
});
</script> 