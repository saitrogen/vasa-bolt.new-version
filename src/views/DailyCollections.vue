<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Daily Collections</h1>
      <div class="flex gap-2">
        <button @click="generatePDF" class="btn btn-outline">
          <ArrowDownTrayIcon class="w-4 h-4 md:mr-2" />
          <span class="hidden md:inline">Download PDF</span>
        </button>
        <button @click="openModal(null)" class="btn btn-primary">
          <PlusIcon class="w-4 h-4 md:mr-2" />
          <span class="hidden md:inline">Add Collection</span>
        </button>
      </div>
    </div>
    
    <!-- Info Banner -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
      <div class="flex">
        <InformationCircleIcon class="h-5 w-5 text-blue-400 dark:text-blue-300 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">Manual Collection Entry</h3>
          <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <p>This section allows you to manually record daily collection totals as a safety net or transitional tool. 
            The primary revenue tracking is automatically calculated from completed appointments.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card p-4">
      <!-- Quick Range Buttons -->
      <div class="mb-4">
        <div class="flex flex-wrap gap-2">
          <button @click="setDateRange('today')" class="btn btn-outline btn-sm">Today</button>
          <button @click="setDateRange('thisWeek')" class="btn btn-outline btn-sm">This Week</button>
          <button @click="setDateRange('thisMonth')" class="btn btn-outline btn-sm">This Month</button>
          <button @click="setDateRange('previousMonth')" class="btn btn-outline btn-sm">Previous Month</button>
          <button @click="clearDateRange()" class="btn btn-ghost btn-sm">Clear</button>
        </div>
      </div>
      
      <!-- Date Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="filters.startDate" type="date" class="input" />
        <input v-model="filters.endDate" type="date" class="input" />
        <select v-model="filters.barberId" class="select">
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
                  <th scope="col" class="table-header px-6 py-3 text-left">Date</th>
                  <th scope="col" class="table-header px-6 py-3 text-left">Barber</th>
                  <th scope="col" class="table-header px-6 py-3 text-right"># Appointments</th>
                  <th scope="col" class="table-header px-6 py-3 text-right">Calculated Amount</th>
                  <th scope="col" class="table-header px-6 py-3 text-right">Manual Amount</th>
                  <th scope="col" class="table-header px-6 py-3 text-right">Difference</th>
                  <th scope="col" class="table-header px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-for="collection in filteredCollections" :key="collection.id" class="table-row">
                  <td class="table-cell px-6 py-4">{{ formatDate(collection.collection_date) }}</td>
                  <td class="table-cell px-6 py-4 font-medium">{{ collection.barber?.name || 'N/A' }}</td>
                  <td class="table-cell px-6 py-4 text-right">{{ collection.number_of_appointments ?? 0 }}</td>
                  <td class="table-cell px-6 py-4 text-right">${{ collection.total_amount_calculated?.toFixed(2) ?? '0.00' }}</td>
                  <td class="table-cell px-6 py-4 text-right">${{ collection.total_amount_manually_entered?.toFixed(2) ?? '0.00' }}</td>
                  <td class="table-cell px-6 py-4 text-right" :class="getDifferenceClass(collection.total_amount_calculated, collection.total_amount_manually_entered)">
                    ${{ getDifference(collection.total_amount_calculated, collection.total_amount_manually_entered) }}
                  </td>
                  <td class="table-cell px-6 py-4 text-right">
                    <button @click="openModal(collection)" class="btn btn-ghost">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <Modal :is-open="isModalOpen" :title="editingCollection ? 'Edit Collection' : 'Add Collection'" @close="closeModal">
      <form @submit.prevent="saveCollection" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Date</label>
          <input v-model="form.collection_date" type="date" required class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium">Barber</label>
          <select v-model="form.barber_id" required class="select">
            <option value="">Select Barber</option>
            <option v-for="barber in barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Manual Amount</label>
          <input v-model.number="form.total_amount_manually_entered" type="number" step="0.01" required class="input" placeholder="eg. 1230.00"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Number of Appointments</label>
          <input v-model.number="form.number_of_appointments" type="number" step="1" required class="input" placeholder="eg. 10.."/>
        </div>
        <div>
          <label class="block text-sm font-medium">Notes</label>
          <textarea v-model="form.notes" class="textarea"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="closeModal" class="btn btn-outline">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>

    <Modal :is-open="isPdfPreviewOpen" title="PDF Preview" @close="closePdfPreview" size="xl">
      <div class="w-full h-[75vh]">
        <iframe v-if="pdfSrc" :src="pdfSrc" class="w-full h-full border-0" title="PDF Preview"></iframe>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" @click="closePdfPreview" class="btn btn-outline">Close</button>
        <a :href="pdfSrc" :download="`vasa-saloon-collections-${new Date().toISOString().slice(0, 10)}.pdf`" class="btn btn-primary">Download PDF</a>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '../composables/useToast';
import Modal from '../components/Modal.vue';
import { PlusIcon, InformationCircleIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline';
import type { DailyCollection, Barber, Appointment } from '../types';

type DailyCollectionWithRelations = DailyCollection & {
  barber: Barber | null;
  total_amount_calculated?: number;
};

const { addToast } = useToast();

const collections = ref<DailyCollectionWithRelations[]>([]);
const barbers = ref<Barber[]>([]);
const appointments = ref<Appointment[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const editingCollection = ref<DailyCollectionWithRelations | null>(null);
const isPdfPreviewOpen = ref(false);
const pdfSrc = ref('');

const filters = reactive({
  startDate: '',
  endDate: '',
  barberId: ''
});

const form = reactive({
  id: null as string | null,
  collection_date: new Date().toISOString().substring(0, 10),
  barber_id: '',
  total_amount_manually_entered: null as number | null,
  number_of_appointments: null as number | null,
  notes: ''
});

const filteredCollections = computed(() => {
  return collections.value.filter(c => {
    const date = new Date(c.collection_date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (filters.barberId && c.barber_id !== filters.barberId) return false;

    return true;
  });
});

const formatDate = (date: string) => format(parseISO(date), 'MMM d, yyyy');

const getDifference = (calculated: number | undefined, manual: number) => {
  if (calculated === undefined) return 'N/A';
  const diff = manual - calculated;
  return diff.toFixed(2);
};

const getDifferenceClass = (calculated: number | undefined, manual: number) => {
  if (calculated === undefined) return '';
  const diff = manual - calculated;
  if (diff > 0) return 'text-green-500';
  if (diff < 0) return 'text-red-500';
  return '';
};

const openModal = (collection: DailyCollectionWithRelations | null) => {
  editingCollection.value = collection;
  if (collection) {
    form.id = collection.id;
    form.collection_date = collection.collection_date;
    form.barber_id = collection.barber_id;
    form.total_amount_manually_entered = collection.total_amount_manually_entered;
    form.number_of_appointments = collection.number_of_appointments || null;
    form.notes = collection.notes || '';
  } else {
    form.id = null;
    form.collection_date = new Date().toISOString().substring(0, 10);
    form.barber_id = '';
    form.total_amount_manually_entered = null;
    form.number_of_appointments = null;
    form.notes = '';
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const closePdfPreview = () => {
  isPdfPreviewOpen.value = false;
  pdfSrc.value = ''; // Clear src to release memory
};

const saveCollection = async () => {
  if (form.total_amount_manually_entered == null || form.total_amount_manually_entered <= 0) {
    addToast({ type: 'error', title: 'Invalid Input', message: 'Manual Amount must be a positive number.' });
    return;
  }
  if (form.number_of_appointments == null || form.number_of_appointments <= 0) {
    addToast({ type: 'error', title: 'Invalid Input', message: 'Number of Appointments must be a positive number.' });
    return;
  }

  const dataToSave = {
    collection_date: form.collection_date,
    barber_id: form.barber_id,
    total_amount_manually_entered: form.total_amount_manually_entered,
    number_of_appointments: form.number_of_appointments,
    notes: form.notes
  };

  let error;
  if (form.id) {
    ({ error } = await supabase.from('daily_collections').update(dataToSave).eq('id', form.id));
  } else {
    ({ error } = await supabase.from('daily_collections').insert(dataToSave));
  }

  if (error) {
    addToast({ type: 'error', title: 'Error', message: error.message });
  } else {
    addToast({ type: 'success', title: 'Success', message: 'Collection saved!' });
    closeModal();
    fetchCollections();
  }
};

const fetchCollections = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from('daily_collections')
    .select('*, barber:barbers(*)')
    .order('collection_date', { ascending: false });

  if (error) {
    addToast({ type: 'error', title: 'Error', message: error.message });
    collections.value = [];
  } else {
    const collectionsWithCalculated = (data || []).map(c => {
      const collectionDate = c.collection_date;
      const relatedAppointments = appointments.value.filter(a => a.barber_id === c.barber_id && a.start_time.startsWith(collectionDate) && a.status === 'completed');
      const total_amount_calculated = relatedAppointments.reduce((sum, a) => sum + (a.total_amount || 0), 0);
      return { ...c, total_amount_calculated };
    });
    collections.value = collectionsWithCalculated;
  }
  loading.value = false;
};

const fetchBarbers = async () => {
  const { data, error } = await supabase.from('barbers').select('*');
  if (!error) barbers.value = data;
};

const fetchAppointments = async () => {
  const { data, error } = await supabase.from('appointments').select('*');
  if (!error) appointments.value = data;
};

const setDateRange = (range: string) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (range) {
    case 'today':
      startDate = startOfDay(today);
      endDate = endOfDay(today);
      break;
    case 'thisWeek':
      startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
      endDate = endOfWeek(today, { weekStartsOn: 1 });
      break;
    case 'thisMonth':
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      break;
    case 'previousMonth':
      const lastMonth = subMonths(today, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    default:
      return;
  }

  filters.startDate = format(startDate, 'yyyy-MM-dd');
  filters.endDate = format(endDate, 'yyyy-MM-dd');
};

const clearDateRange = () => {
  filters.startDate = '';
  filters.endDate = '';
};

const generatePDF = () => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const tableData = filteredCollections.value;

  if (tableData.length === 0) {
    addToast({ type: 'error', title: 'No Data', message: 'There is no data to generate a PDF for the selected filters.' });
    return;
  }

  // Determine which barbers to include in the report
  let reportBarbers: Barber[] = [];
  if (filters.barberId) {
    const selectedBarber = barbers.value.find(b => b.id === filters.barberId);
    if (selectedBarber) {
      reportBarbers = [selectedBarber];
    }
  } else {
    const barberIdsInData = [...new Set(tableData.map(item => item.barber_id))];
    reportBarbers = barbers.value.filter(b => barberIdsInData.includes(b.id));
  }

  const uniqueDates = [...new Set(tableData.map(item => item.collection_date))].sort();

  // Create pivot data structure: Map<date, Map<barber_id, {appointments, collection}>>
  const pivotData = new Map();
  uniqueDates.forEach(date => {
    const dailyData = new Map();
    reportBarbers.forEach(barber => {
      const entry = tableData.find(d => d.collection_date === date && d.barber_id === barber.id);
      dailyData.set(barber.id, {
        appointments: entry?.number_of_appointments ?? 0,
        collection: entry?.total_amount_manually_entered ?? 0,
      });
    });
    pivotData.set(date, dailyData);
  });
  
  // Build headers for autotable
  const head: any[] = [
    [{ content: 'Date', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, ...reportBarbers.map(b => ({ content: b.name, colSpan: 2, styles: { halign: 'center' } })), { content: 'Total', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }],
    reportBarbers.flatMap(() => ['No:Appoint', 'Collection'])
  ];

  // Build body for autotable
  const body: any[] = uniqueDates.map(date => {
    const row = [formatDate(date)];
    let dailyTotal = 0;
    reportBarbers.forEach(barber => {
      const data = pivotData.get(date)?.get(barber.id);
      row.push(data?.appointments ?? '-');
      row.push(data?.collection.toFixed(2) ?? '0.00');
      dailyTotal += data?.collection ?? 0;
    });
    row.push(dailyTotal.toFixed(2));
    return row;
  });

  // Build footer/total row
  const footerRow: any[] = [{ content: 'Total', styles: { fontStyle: 'bold' } }];
  let grandTotalCollection = 0;
  reportBarbers.forEach(barber => {
    const barberAppointments = tableData.filter(d => d.barber_id === barber.id).reduce((sum, d) => sum + (d.number_of_appointments || 0), 0);
    const barberCollection = tableData.filter(d => d.barber_id === barber.id).reduce((sum, d) => sum + (d.total_amount_manually_entered || 0), 0);
    grandTotalCollection += barberCollection;
    
    footerRow.push({ content: barberAppointments.toString(), styles: { fontStyle: 'bold' } });
    footerRow.push({ content: barberCollection.toFixed(2), styles: { fontStyle: 'bold' } });
  });
  footerRow.push({ content: grandTotalCollection.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } });
  
  body.push(footerRow);

  doc.setFontSize(18);
  doc.text('VASA SALOON - Daily Collections Report', 14, 22);
  const dateRange = `Period: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`;
  doc.setFontSize(11);
  doc.text(dateRange, 14, 30);

  autoTable(doc, {
    head: head,
    body: body,
    startY: 38,
    theme: 'grid',
    headStyles: { fillColor: [243, 244, 246], textColor: 17, fontStyle: 'bold', halign: 'center' },
    styles: { halign: 'center' },
    columnStyles: {
      0: { halign: 'left' }
    },
    didDrawPage: (data) => {
      // For multi-page tables, you might want a footer on each page
      // This example just adds a total row at the very end.
    }
  });
  
  pdfSrc.value = doc.output('datauristring');
  isPdfPreviewOpen.value = true;
};

onMounted(async () => {
  await fetchBarbers();
  await fetchAppointments();
  await fetchCollections();
});
</script>