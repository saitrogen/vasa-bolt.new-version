import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/composables/useToast';

export const useReportStore = defineStore('reports', () => {
  const { addToast } = useToast();

  const currentReportData = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<any>(null);

  const fetchDailySummaryReport = async (startDate?: string, endDate?: string) => {
    loading.value = true;
    error.value = null;
    currentReportData.value = [];
    try {
      const { data, error: rpcError } = await supabase.rpc('get_daily_summary', {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (rpcError) throw rpcError;
      currentReportData.value = data || [];
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error fetching daily summary', message: (e as Error).message });
    } finally {
      loading.value = false;
    }
  };

  const fetchMonthlySummaryReport = async (startDate?: string, endDate?: string) => {
    loading.value = true;
    error.value = null;
    currentReportData.value = [];
    try {
      const { data, error: rpcError } = await supabase.rpc('get_monthly_summary', {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (rpcError) throw rpcError;
      currentReportData.value = data || [];
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error fetching monthly summary', message: (e as Error).message });
    } finally {
      loading.value = false;
    }
  };

  const fetchBarberPerformanceReport = async (startDate?: string, endDate?: string, barberId?: string | number) => {
    loading.value = true;
    error.value = null;
    currentReportData.value = [];
    try {
      const { data, error: rpcError } = await supabase.rpc('get_barber_performance', {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        barber_id_param: barberId ? Number(barberId) : undefined, // Ensure barber_id_param is number or undefined
      });
      if (rpcError) throw rpcError;
      currentReportData.value = data || [];
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error fetching barber performance', message: (e as Error).message });
    } finally {
      loading.value = false;
    }
  };

  return {
    currentReportData,
    loading,
    error,
    fetchDailySummaryReport,
    fetchMonthlySummaryReport,
    fetchBarberPerformanceReport,
  };
});
