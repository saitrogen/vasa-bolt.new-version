import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { useToast } from '@/composables/useToast'

type Service = Tables<'services'>

export const useServiceStore = defineStore('service', () => {
  const { addToast } = useToast()

  const services = ref<Service[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<any>(null)

  // --- Getters ---
  const getServiceById = computed(() => {
    return (id: string) => services.value.find(s => s.id === id)
  })

  const activeServices = computed(() => {
    return services.value.filter(s => s.is_active)
  })

  // --- Actions ---
  const fetchServices = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .order('name')
      if (fetchError) throw fetchError
      services.value = data || []
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error fetching services', message: (e as Error).message })
    } finally {
      loading.value = false
    }
  }

  const createService = async (serviceData: TablesInsert<'services'>) => {
    submitting.value = true
    error.value = null
    try {
      const { data: newService, error: insertError } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single()
      if (insertError) throw insertError
      services.value.push(newService)
      services.value.sort((a,b) => a.name.localeCompare(b.name));
      addToast({ type: 'success', title: 'Success', message: 'Service created successfully!' })
      return newService
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error creating service', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const updateService = async (id: string, serviceData: TablesUpdate<'services'>) => {
    submitting.value = true
    error.value = null
    try {
      const { data: updatedService, error: updateError } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single()
      if (updateError) throw updateError

      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = updatedService
        services.value.sort((a,b) => a.name.localeCompare(b.name));
      }
      addToast({ type: 'success', title: 'Success', message: 'Service updated successfully!' })
      return updatedService
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error updating service', message: (e as Error).message })
      return null
    } finally {
      submitting.value = false
    }
  }

  const updateServiceStatus = async (id: string, isActive: boolean) => {
    submitting.value = true;
    error.value = null;
    try {
      const { data: updatedService, error: updateError } = await supabase
        .from('services')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;

      const index = services.value.findIndex(s => s.id === id);
      if (index !== -1) {
        services.value[index] = updatedService;
      }
      addToast({ type: 'success', title: 'Success', message: `Service status updated!` });
      return updatedService;
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error updating service status', message: (e as Error).message });
      return null;
    } finally {
      submitting.value = false;
    }
  };

  const deleteService = async (id: string) => {
    submitting.value = true;
    error.value = null;
    try {
      // Consider implications: what if this service is part of historical appointments?
      // Supabase RLS or database constraints should handle this.
      // For now, direct delete.
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;

      services.value = services.value.filter(s => s.id !== id);
      addToast({ type: 'success', title: 'Success', message: 'Service deleted successfully!' });
      return true;
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error deleting service', message: (e as Error).message });
      return false;
    } finally {
      submitting.value = false;
    }
  };

  return {
    services,
    loading,
    submitting,
    error,
    fetchServices,
    createService,
    updateService,
    updateServiceStatus,
    deleteService,
    getServiceById,
    activeServices,
  }
})
