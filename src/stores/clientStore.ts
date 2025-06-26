import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { useToast } from '@/composables/useToast'

type Client = Tables<'clients'>

export const useClientStore = defineStore('client', () => {
  const { addToast } = useToast()

  const clients = ref<Client[]>([])
  const selectedClient = ref<Client | null>(null)
  const loadingList = ref(false)
  const loadingSelected = ref(false)
  const submitting = ref(false)
  const error = ref<any>(null)

  // --- Getters ---
  const getClientById = computed(() => {
    return (id: string) => clients.value.find(c => c.id === id)
  })

  // --- Actions ---
  const fetchClients = async () => {
    loadingList.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('name')
      if (fetchError) throw fetchError
      clients.value = data || []
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error fetching clients', message: (e as Error).message })
    } finally {
      loadingList.value = false
    }
  }

  const fetchClientById = async (id: string) => {
    loadingSelected.value = true
    error.value = null
    selectedClient.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError
      selectedClient.value = data
      // Also update in the list if it exists or add it
      const index = clients.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clients.value[index] = data
      } else {
        clients.value.push(data)
        clients.value.sort((a, b) => a.name.localeCompare(b.name));
      }
      return data
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: `Error fetching client ${id}`, message: (e as Error).message })
      return null
    } finally {
      loadingSelected.value = false
    }
  }

  const createClient = async (clientData: TablesInsert<'clients'>) => {
    submitting.value = true
    error.value = null
    try {
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single()
      if (insertError) throw insertError
      clients.value.push(newClient)
      clients.value.sort((a, b) => a.name.localeCompare(b.name));
      addToast({ type: 'success', title: 'Success', message: 'Client created successfully!' })
      return newClient
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error creating client', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const updateClient = async (id: string, clientData: TablesUpdate<'clients'>) => {
    submitting.value = true
    error.value = null
    try {
      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single()
      if (updateError) throw updateError

      const index = clients.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clients.value[index] = updatedClient
        clients.value.sort((a, b) => a.name.localeCompare(b.name));
      }
      if (selectedClient.value && selectedClient.value.id === id) {
        selectedClient.value = updatedClient
      }
      addToast({ type: 'success', title: 'Success', message: 'Client updated successfully!' })
      return updatedClient
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error updating client', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const deleteClient = async (id: string) => {
    submitting.value = true;
    error.value = null;
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;

      clients.value = clients.value.filter(c => c.id !== id);
      if (selectedClient.value && selectedClient.value.id === id) {
        selectedClient.value = null;
      }
      addToast({ type: 'success', title: 'Success', message: 'Client deleted successfully!' });
      return true;
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error deleting client', message: (e as Error).message });
      return false;
    } finally {
      submitting.value = false;
    }
  };

  return {
    clients,
    selectedClient,
    loadingList,
    loadingSelected,
    submitting,
    error,
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
  }
})
