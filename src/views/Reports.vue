<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
      <div class="flex items-center gap-4">
        <select v-model="selectedReport" class="select w-full md:w-64">
          <option value="daily">Daily Summary</option>
          <option value="monthly">Monthly Summary</option>
          <option value="barber">Barber Performance</option>
        </select>
        <button @click="generateReport" class="btn btn-primary">Generate</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input v-model="filters.startDate" type="date" class="input" />
            <input v-model="filters.endDate" type="date" class="input" />
            <select v-if="selectedReport === 'barber'" v-model="filters.barberId" class="select">
                <option value="">All Barbers</option>
                <option v-for="barber in barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
            </select>
        </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <div class="min-w-full inline-block align-middle">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead>
                <tr>
                  <th v-for="header in reportHeaders" :key="header" scope="col" class="table-header px-6 py-3 text-left">{{ header }}</th>
                </tr>
              </thead>
              <tbody v-if="reportData.length > 0" class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-for="(row, index) in reportData" :key="index" class="table-row">
                  <td v-for="(header, i) in reportHeaders" :key="i" class="table-cell px-6 py-4">
                    {{ row[header] }}
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td :colspan="reportHeaders.length" class="text-center py-12">
                    <div class="text-slate-500 dark:text-slate-400">
                      <p>No data to display.</p>
                      <p class="text-sm">Select a report type and click "Generate".</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabase';
import type { Barber } from '../types';

const selectedReport = ref('daily');
const reportData = ref<any[]>([]);
const barbers = ref<Barber[]>([]);
const filters = reactive({
  startDate: '',
  endDate: '',
  barberId: ''
});

const reportHeaders = computed(() => {
  if (!reportData.value.length) return ['Report Data'];
  return Object.keys(reportData.value[0]);
});

const generateReport = async () => {
  let data: any[] | null = [];
  
  if (selectedReport.value === 'daily') {
      const { data: dailyData, error } = await supabase.rpc('get_daily_summary', {
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined
      });
      if (!error) data = dailyData;
  } else if (selectedReport.value === 'monthly') {
      const { data: monthlyData, error } = await supabase.rpc('get_monthly_summary', {
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined
      });
      if (!error) data = monthlyData;
  } else if (selectedReport.value === 'barber') {
      const { data: barberData, error } = await supabase.rpc('get_barber_performance', {
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          barber_id_param: filters.barberId || undefined
      });
      if (!error) data = barberData;
  }
  
  reportData.value = data || [];
};

const fetchBarbers = async () => {
  const { data, error } = await supabase.from('barbers').select('*');
  if (!error) barbers.value = data;
};

onMounted(() => {
  fetchBarbers();
});
</script>