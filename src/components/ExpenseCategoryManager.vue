<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Expense Categories</h3>
      <button @click="openCategoryModal()" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        New Category
      </button>
    </div>

    <!-- Categories List -->
    <div class="card">
      <ul class="divide-y divide-slate-200 dark:divide-slate-700">
        <li v-if="categoryStore.loading && categoryStore.categories.length === 0" v-for="n in 3" :key="`skel-${n}`" class="p-4">
          <div class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          </div>
        </li>
        <li v-for="category in categoryStore.categories" :key="category.id" class="p-4 flex justify-between items-center">
          <p class="font-medium text-slate-800 dark:text-slate-200">{{ category.name }}</p>
          <div class="flex items-center gap-1">
            <button
              @click="openCategoryModal(category)"
              class="btn btn-xs btn-ghost"
              title="Edit Category"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button
              @click="confirmDeleteCategory(category)"
              class="btn btn-xs btn-ghost text-red-500 hover:text-red-700"
              title="Delete Category"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </li>
        <li v-if="!categoryStore.loading && categoryStore.categories.length === 0" class="p-4 text-center text-slate-500 dark:text-slate-400">
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
         <div>
          <label class="label cursor-pointer flex items-center">
            <input type="checkbox" v-model="form.is_active" class="checkbox checkbox-primary" />
            <span class="label-text ml-2 dark:text-gray-300">Active</span>
          </label>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="categoryStore.submitting" class="btn btn-primary">
            {{ categoryStore.submitting ? 'Saving...' : 'Save Category' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useExpenseCategoryStore } from '@/stores/expenseCategoryStore';
import { useToast } from '@/composables/useToast';
import Modal from './Modal.vue'; // Assuming Modal.vue is in the same directory or adjust path
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

type ExpenseCategory = Tables<'expense_categories'>;

const { addToast } = useToast();
const categoryStore = useExpenseCategoryStore();
// const { categories, loading, submitting } = storeToRefs(categoryStore); // If direct template access needed

const showModal = ref(false);
const isEditing = ref(false);

const defaultFormState = (): { id: number | null; name: string; is_active: boolean } => ({
    id: null,
    name: '',
    is_active: true,
})

const form = reactive(defaultFormState());


const openCategoryModal = (category: ExpenseCategory | null = null) => {
  if (category) {
    isEditing.value = true;
    form.id = category.id;
    form.name = category.name;
    form.is_active = category.is_active;
  } else {
    isEditing.value = false;
    Object.assign(form, defaultFormState());
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false; // Ensure isEditing is reset
  Object.assign(form, defaultFormState()); // Reset form on close
};

const saveCategory = async () => {
  if (!form.name.trim()) {
    addToast({ type: 'error', title: 'Validation Error', message: 'Category name cannot be empty.' });
    return;
  }

  const payload: Partial<TablesInsert<'expense_categories'> | TablesUpdate<'expense_categories'>> = {
      name: form.name,
      is_active: form.is_active,
  };

  let success = false;
  if (isEditing.value && form.id) {
    const result = await categoryStore.updateCategory(form.id, payload as TablesUpdate<'expense_categories'>);
    if (result) success = true;
  } else {
    const result = await categoryStore.createCategory(payload as TablesInsert<'expense_categories'>);
    if (result) success = true;
  }

  if (success) {
    closeModal();
    // Toast and list refresh handled by store
  }
  // Error toast handled by store
};

const confirmDeleteCategory = async (category: ExpenseCategory) => {
  if (!confirm(`Are you sure you want to delete the category "${category.name}"? This might affect existing expenses if not handled by database constraints or store logic.`)) return;

  const success = await categoryStore.deleteCategory(category.id);
  if (success) {
    // Toast handled by store
  } else {
     // Error toast handled by store, potentially with specific message if category is in use
  }
};

onMounted(() => {
  categoryStore.fetchCategories();
});
</script> 