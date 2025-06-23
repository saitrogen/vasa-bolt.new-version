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
                <tr v-for="barber in barbers" :key="barber.id" class="table-row">
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
      :title="editingBarber ? 'Edit Barber' : 'Invite New Barber'"
      @close="closeBarberModal"
    >
      <form @submit.prevent="handleSaveBarber" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
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
            <label class="block text-sm font-medium text-gray-700 mb-2">
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
            <label class="block text-sm font-medium text-gray-700 mb-2">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">
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
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-gray-700">Barber is active</span>
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
            :disabled="submitting"
            class="btn btn-primary"
          >
            {{ submitting ? 'Sending...' : (editingBarber ? 'Update Barber' : 'Send Invitation') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import type { Barber } from '../types'

const { addToast } = useToast()

const barbers = ref<Barber[]>([])
const loading = ref(true)
const submitting = ref(false)

const showBarberModal = ref(false)
const editingBarber = ref<Barber | null>(null)

const barberForm = reactive({
  name: '',
  phone_number_work: '',
  phone_number_home: '',
  email: '',
  home_address: '',
  is_active: true
})

const resetForm = () => {
  Object.assign(barberForm, {
    name: '',
    phone_number_work: '',
    phone_number_home: '',
    email: '',
    home_address: '',
    is_active: true
  })
}

const openNewBarberModal = () => {
  editingBarber.value = null
  resetForm()
  showBarberModal.value = true
}

const editBarber = (barber: Barber) => {
  editingBarber.value = barber
  Object.assign(barberForm, {
    name: barber.name,
    phone_number_work: barber.phone_number_work || '',
    phone_number_home: barber.phone_number_home || '',
    email: barber.email || '',
    home_address: barber.home_address || '',
    is_active: barber.is_active
  })
  showBarberModal.value = true
}

const closeBarberModal = () => {
  showBarberModal.value = false
  editingBarber.value = null
  resetForm()
}

const handleSaveBarber = async () => {
  if (editingBarber.value) {
    // Logic to UPDATE an existing barber
    // This remains the same, updating the public.barbers table directly
    const { error } = await supabase
      .from('barbers')
      .update({ 
        name: barberForm.name,
        phone_number_work: barberForm.phone_number_work,
        phone_number_home: barberForm.phone_number_home,
        email: barberForm.email,
        home_address: barberForm.home_address,
        is_active: barberForm.is_active,
       })
      .eq('id', editingBarber.value.id);

      // Add toast/error handling here...

  } else {
    // Logic to CREATE a new barber via invitation
    if (!barberForm.email) {
      addToast({ type: 'error', title: 'Email is required', message: 'You must provide an email to invite a new barber.' })
    return
  }
  
  submitting.value = true
  try {
      const { error } = await supabase.functions.invoke('invite-staff', {
        body: { barberData: barberForm },
      })
      
      if (error) throw error;

      addToast({ type: 'success', title: 'Invitation Sent', message: `Successfully invited ${barberForm.name}.` })
    closeBarberModal()
      fetchBarbers() // Refresh the list
    } catch (err: any) {
      // The Supabase client wraps the function error. The details are in `err.context`.
      const errorMessage = err.context?.details || err.message || 'An unknown error occurred.';
      addToast({ type: 'error', title: 'Invitation Error', message: errorMessage })
      console.error(err);
  } finally {
    submitting.value = false
    }
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
    addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to fetch barbers'
    })
  }
}

onMounted(() => {
  fetchBarbers()
})
</script>