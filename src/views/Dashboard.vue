<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400">Welcome back, Admin!</p>
      </div>
      <div class="flex items-center space-x-2 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <CalendarDaysIcon class="w-5 h-5 text-slate-500 dark:text-slate-400" />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ todayFormatted }}</span>
      </div>
    </div>

    <!-- Summary Cards -->
     <div v-if="overallLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="card p-6 animate-pulse">
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="card in summaryCards" :key="card.title" class="card p-6 flex items-center space-x-4">
        <div class="p-3 rounded-full" :class="card.color">
          <component :is="card.icon" class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ card.title }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ card.value }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link v-for="action in quickActions" :key="action.name" :to="action.to"
          class="card p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <div class="p-3 bg-primary-100 dark:bg-primary-500/10 rounded-full mb-2">
            <component :is="action.icon" class="w-6 h-6 text-primary-600 dark:text-primary-300" />
          </div>
          <p class="font-medium text-slate-800 dark:text-slate-200">{{ action.name }}</p>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity & Upcoming Appointments -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Activity</h2>
        <div v-if="overallLoading" class="space-y-4">
            <div v-for="i in 3" :key="`act-skel-${i}`" class="animate-pulse flex space-x-4">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/4"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[600px]">
            <thead>
              <tr>
                <th class="table-header pb-2">Date</th>
                <th class="table-header pb-2">Description</th>
                <th class="table-header pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentActivity.length === 0">
                <td colspan="3" class="text-center py-4 text-slate-500 dark:text-slate-400">No recent activity.</td>
              </tr>
              <tr v-for="item in recentActivity" :key="item.id" class="table-row">
                <td class="table-cell">{{ formatDateDisplay(item.date) }}</td>
                <td class="table-cell">
                  <div class="font-medium text-slate-800 dark:text-slate-200">{{ item.description }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ item.subDescription }}</div>
                </td>
                <td class="table-cell text-right" :class="item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ item.type === 'income' ? '+' : '-' }}${{ item.amount.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Upcoming Appointments</h2>
        <div class="space-y-4">
          <div v-if="appointmentStore.loading" class="text-center py-4 text-slate-500 dark:text-slate-400">Loading...</div>
          <div v-else>
            <div v-if="upcomingAppointments.length > 0">
                <div v-for="appt in upcomingAppointments" :key="appt.id" class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex-shrink-0 flex flex-col items-center justify-center">
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ format(parseISO(appt.start_time), 'd') }}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400">{{ format(parseISO(appt.start_time), 'MMM') }}</span>
                </div>
                <div>
                    <p class="font-medium text-slate-800 dark:text-slate-200">{{ appt.client?.name || 'Unknown Client' }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ format(parseISO(appt.start_time), 'h:mm a') }} with {{ appt.barber?.name || 'Unknown Barber' }}
                    </p>
                </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-slate-500 dark:text-slate-400">
                No upcoming appointments.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useCollectionStore } from '@/stores/collectionStore';
import { useClientStore } from '@/stores/clientStore';
import { useBarberStore } from '@/stores/barberStore';
import { useExpenseStore } from '@/stores/expenseStore';
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline';
import { format, parseISO, startOfToday, endOfToday, isWithinInterval, isValid } from 'date-fns';
import type { AppointmentWithRelated } from '@/types'; // Assuming Appointment is AppointmentWithRelated

const todayFormatted = computed(() => format(new Date(), 'EEEE, MMMM d, yyyy'));

const appointmentStore = useAppointmentStore();
const collectionStore = useCollectionStore();
const clientStore = useClientStore();
const barberStore = useBarberStore();
const expenseStore = useExpenseStore();

const { appointments } = storeToRefs(appointmentStore);
const { allCollectionsFlat } = storeToRefs(collectionStore); // Use the flat list of all collections
const { clients } = storeToRefs(clientStore);
const { barbers } = storeToRefs(barberStore);
const { expenses } = storeToRefs(expenseStore);

const overallLoading = computed(() =>
    appointmentStore.loading ||
    collectionStore.loading ||
    clientStore.loadingList ||
    barberStore.loadingList ||
    expenseStore.loading
);

const todayStats = computed(() => {
  const todayStart = startOfToday();
  const todaysAppointments = appointments.value.filter(a => isValid(parseISO(a.start_time)) && isWithinInterval(parseISO(a.start_time), { start: todayStart, end: endOfToday() }));

  const todaysCollections = allCollectionsFlat.value.filter(c => {
    if (!c.collection_date) return false;
    try {
      return isWithinInterval(parseISO(c.collection_date), { start: todayStart, end: endOfToday() });
    } catch { return false; }
  });

  const revenue = todaysCollections.reduce((sum, c) => sum + (c.total_amount_manually_entered || 0), 0);
  
  return {
    appointments: todaysAppointments.length,
    revenue: revenue.toFixed(2),
  };
});

const summaryCards = computed(() => [
  { title: "Today's Appointments", value: todayStats.value.appointments, icon: CalendarDaysIcon, color: 'bg-sky-500' },
  { title: "Today's Revenue", value: `$${todayStats.value.revenue}`, icon: CurrencyDollarIcon, color: 'bg-green-500' },
  { title: "Total Clients", value: clients.value.length, icon: UserGroupIcon, color: 'bg-amber-500' },
  { title: "Active Barbers", value: barbers.value.filter(b => b.is_active).length, icon: UsersIcon, color: 'bg-purple-500' },
]);

const quickActions = ref([
    { name: 'New Appointment', to: '/appointments', icon: PlusIcon },
    { name: 'Add Client', to: '/clients', icon: UserGroupIcon },
    { name: 'Log Expense', to: '/expenses', icon: CurrencyDollarIcon },
    { name: 'View Services', to: '/services', icon: WrenchScrewdriverIcon },
]);

const upcomingAppointments = computed(() => {
  const today = startOfToday();
  return appointments.value
    .filter(a => {
        try {
            return isValid(parseISO(a.start_time)) && new Date(a.start_time) >= today && a.status !== 'cancelled' && a.status !== 'completed'
        } catch { return false; }
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5) as AppointmentWithRelated[]; // Cast if needed after ensuring client/barber are populated
});

const recentActivity = computed(() => {
  const collectionsAsIncome = allCollectionsFlat.value.map(c => ({
    id: `col-${c.id}`,
    date: c.collection_date,
    description: `Daily Collection`,
    // Barber name might not be directly on c if allCollectionsFlat doesn't join it.
    // If collectionStore.collectionsByBarber[barberId] has barber name, use that or fetch.
    // For simplicity, assuming barber name is accessible or can be looked up.
    subDescription: `Barber ID: ${c.barber_id}`, // Placeholder, ideally get barber name
    amount: c.total_amount_manually_entered || 0,
    type: 'income' as const
  }));
  
  const expensesAsOutcome = expenses.value.map(e => ({
    id: `exp-${e.id}`,
    date: e.expense_date,
    description: e.name, // Use expense name as description
    subDescription: e.expense_categories?.name || 'Uncategorized', // Use category name
    amount: e.amount,
    type: 'expense' as const
  }));

  return [...collectionsAsIncome, ...expensesAsOutcome]
    .filter(item => item.date && isValid(parseISO(item.date))) // Ensure date is valid
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()) // Add null check for date
    .slice(0, 5);
});


function formatDateDisplay(dateStr: string | null) {
  if (!dateStr || !isValid(parseISO(dateStr))) return 'N/A';
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

onMounted(async () => {
  // Fetch all necessary data. Stores handle their own loading state.
  Promise.all([
    appointmentStore.fetchAppointments(),
    collectionStore.fetchAllCollections(), // Use the new action
    clientStore.fetchClients(),
    barberStore.fetchBarbers(),
    expenseStore.fetchExpenses()
  ]).catch(error => {
    console.error("Error fetching dashboard data:", error);
    // Optionally show a global error toast here
  });
});
</script>