<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Barbers</h1>
      <button @click="openNewBarberModal" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 md:mr-2" />
        <span class="hidden md:inline">Add Barber</span>
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <div class="min-w-full inline-block align-middle">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead>
                <tr>
                  <th scope="col" class="table-header px-6 py-3 text-left">Name</th>
                  <th scope="col" class="table-header px-6 py-3 text-left">Phone</th>
                  <th scope="col" class="table-header px-6 py-3 text-left">Email</th>
                  <th scope="col" class="table-header px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-if="barberStore.loadingList && barberStore.barbers.length === 0" v-for="n in 3" :key="`skel-${n}`">
                  <td colspan="4" class="px-6 py-4">
                    <div class="animate-pulse flex space-x-4">
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    </div>
                  </td>
                </tr>
                <tr v-if="!barberStore.loadingList && barberStore.barbers.length === 0">
                   <td colspan="4" class="text-center py-10 text-slate-500 dark:text-slate-400">No barbers found.</td>
                </tr>
                <tr v-for="barber in barberStore.barbers" :key="barber.id" class="table-row">
                  <td class="table-cell px-6 py-4">
                    <router-link :to="`/barbers/${barber.id}`" class="font-medium hover:underline">
                      {{ barber.name }}
                    </router-link>
                  </td>
                  <td class="table-cell px-6 py-4">{{ barber.phone_number_work }}</td>
                  <td class="table-cell px-6 py-4">{{ barber.email }}</td>
                  <td class="table-cell px-6 py-4 text-right">
                    <button @click="editBarber(barber)" class="btn btn-ghost">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Barber Modal -->
    <Modal
      :is-open="showBarberModal"
      :title="editingBarber ? 'Edit Barber' : 'Add New Barber'"
      @close="closeBarberModal"
    >
      <form @submit.prevent="saveBarber" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            v-model="barberForm.name"
            type="text"
            required
            class="input"
            placeholder="Enter barber's full name"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Phone
            </label>
            <input
              v-model="barberForm.phone_number_work"
              type="tel"
              class="input"
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personal Phone
            </label>
            <input
              v-model="barberForm.phone_number_home"
              type="tel"
              class="input"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            v-model="barberForm.email"
            type="email"
            class="input"
            placeholder="barber@example.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Home Address
          </label>
          <textarea
            v-model="barberForm.home_address"
            rows="3"
            class="textarea"
            placeholder="Enter home address..."
          ></textarea>
        </div>
        
        <div v-if="editingBarber">
          <label class="flex items-center">
            <input
              v-model="barberForm.is_active"
              type="checkbox"
              class="checkbox checkbox-primary"
            />
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Barber is active</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeBarberModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="barberStore.submitting"
            class="btn btn-primary"
          >
            {{ barberStore.submitting ? 'Saving...' : (editingBarber ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useBarberStore } from '@/stores/barberStore' // Adjusted path
import { useToast } from '@/composables/useToast' // Adjusted path
import Modal from '@/components/Modal.vue' // Adjusted path
import type { Tables } from '@/types/database' // Assuming Barber is Tables<'barbers'>

type Barber = Tables<'barbers'>;

const { addToast } = useToast()
const barberStore = useBarberStore()
// const { barbers, loadingList, submitting } = storeToRefs(barberStore) // If needed directly

const showBarberModal = ref(false)
const editingBarber = ref<Barber | null>(null)

const barberForm = reactive({
  id: null as string | null | undefined, // Add id for editing context
  name: '',
  phone_number_work: '',
  phone_number_home: '',
  email: '',
  home_address: '',
  is_active: true
})

const resetForm = () => {
  barberForm.id = null;
  barberForm.name = '';
  barberForm.phone_number_work = '';
  barberForm.phone_number_home = '';
  barberForm.email = '';
  barberForm.home_address = '';
  barberForm.is_active = true;
}

const openNewBarberModal = () => {
  editingBarber.value = null
  resetForm()
  showBarberModal.value = true
}

const editBarber = (barber: Barber) => {
  editingBarber.value = barber
  barberForm.id = barber.id; // Set id for editing context
  barberForm.name = barber.name;
  barberForm.phone_number_work = barber.phone_number_work || '';
  barberForm.phone_number_home = barber.phone_number_home || '';
  barberForm.email = barber.email || '';
  barberForm.home_address = barber.home_address || '';
  barberForm.is_active = barber.is_active;
  showBarberModal.value = true
}

const closeBarberModal = () => {
  showBarberModal.value = false
  editingBarber.value = null
  resetForm()
}

const saveBarber = async () => {
  if (!barberForm.name.trim()) {
    addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Barber name is required'
    })
    return
  }
  
  const barberData = {
    name: barberForm.name.trim(),
    phone_number_work: barberForm.phone_number_work.trim() || null,
    phone_number_home: barberForm.phone_number_home.trim() || null,
    email: barberForm.email.trim() || null,
    home_address: barberForm.home_address.trim() || null,
    is_active: barberForm.is_active
  }
  
  let success = false;
  if (editingBarber.value && barberForm.id) {
    const result = await barberStore.updateBarber(barberForm.id, barberData)
    if (result) success = true;
  } else {
    const result = await barberStore.createBarber(barberData)
    if (result) success = true;
  }

  if (success) {
    closeBarberModal()
    // Toast and list refresh handled by store
  }
  // Error toast handled by store
}


onMounted(async () => {
  barberStore.fetchBarbers()
})
</script>