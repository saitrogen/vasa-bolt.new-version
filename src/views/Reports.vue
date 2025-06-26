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
        <button @click="generateReport" class="btn btn-primary" :disabled="reportStore.loading">
          {{ reportStore.loading ? 'Generating...' : 'Generate' }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input v-model="filters.startDate" type="date" class="input" />
            <input v-model="filters.endDate" type="date" class="input" />
            <select v-if="selectedReport === 'barber'" v-model="filters.barberId" class="select" :disabled="barberStore.loadingList">
                <option value="">All Barbers</option>
                <option v-for="barber in barberStore.barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
            </select>
        </div>
    </div>

    <div class="card overflow-hidden">
      <div v-if="reportStore.loading" class="p-6 text-center text-slate-500 dark:text-slate-400">
        Loading report data...
      </div>
      <div v-else class="overflow-x-auto">
        <div class="min-w-full inline-block align-middle">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead>
                <tr>
                  <th v-for="header in reportHeaders" :key="header" scope="col" class="table-header px-6 py-3 text-left">{{ header }}</th>
                </tr>
              </thead>
              <tbody v-if="reportStore.currentReportData.length > 0" class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-for="(row, index) in reportStore.currentReportData" :key="index" class="table-row">
                  <td v-for="(header, i) in reportHeaders" :key="i" class="table-cell px-6 py-4 whitespace-nowrap">
                    {{ formatTableCell(row[header]) }}
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td :colspan="reportHeaders.length || 1" class="text-center py-12">
                    <div class="text-slate-500 dark:text-slate-400">
                      <p>No data to display.</p>
                      <p class="text-sm">Select a report type and filters, then click "Generate".</p>
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
import { storeToRefs } from 'pinia';
import { useReportStore } from '@/stores/reportStore';
import { useBarberStore } from '@/stores/barberStore';
import { format, parseISO } from 'date-fns';


const reportStore = useReportStore();
const barberStore = useBarberStore();

const { currentReportData, loading: reportLoading } = storeToRefs(reportStore);
const { barbers, loadingList: barbersLoading } = storeToRefs(barberStore);

const selectedReport = ref('daily');
const filters = reactive({
  startDate: '',
  endDate: '',
  barberId: ''
});

const reportHeaders = computed(() => {
  if (!currentReportData.value || currentReportData.value.length === 0) return ['Report Data'];
  return Object.keys(currentReportData.value[0]).map(header =>
    header.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
});

const formatTableCell = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  // Check if it's a date-like string (ISO format)
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/)) {
    try {
      return format(parseISO(value), 'MMM d, yyyy');
    } catch (e) {
      // Not a valid date, return as is
    }
  }
  // Check if it's a number that looks like a monetary value
  if (typeof value === 'number' && !Number.isInteger(value)) {
     if (value.toString().includes('.')) { // Heuristic for monetary values
        return `$${value.toFixed(2)}`;
     }
  }
  return value.toString();
};


const generateReport = async () => {
  const { startDate, endDate, barberId } = filters;
  if (selectedReport.value === 'daily') {
      await reportStore.fetchDailySummaryReport(startDate, endDate);
  } else if (selectedReport.value === 'monthly') {
      await reportStore.fetchMonthlySummaryReport(startDate, endDate);
  } else if (selectedReport.value === 'barber') {
      await reportStore.fetchBarberPerformanceReport(startDate, endDate, barberId);
  }
};

onMounted(() => {
  barberStore.fetchBarbers();
  // Optionally generate a default report on load
  // generateReport();
});
</script>