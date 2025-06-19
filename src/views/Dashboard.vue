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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div class="overflow-x-auto">
          <table class="w-full min-w-[600px]">
            <thead>
              <tr>
                <th class="table-header pb-2">Date</th>
                <th class="table-header pb-2">Description</th>
                <th class="table-header pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recentActivity" :key="item.id" class="table-row">
                <td class="table-cell">{{ formatDate(item.date) }}</td>
                <td class="table-cell">
                  <div class="font-medium text-slate-800 dark:text-slate-200">{{ item.description }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ item.subDescription }}</div>
                </td>
                <td class="table-cell text-right" :class="item.type === 'income' ? 'text-green-600' : 'text-red-600'">
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
          <div v-if="loading" class="text-center py-4 text-slate-500 dark:text-slate-400">Loading...</div>
          <div v-else>
            <div v-if="upcomingAppointments.length > 0">
                <div v-for="appt in upcomingAppointments" :key="appt.id" class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex-shrink-0 flex flex-col items-center justify-center">
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ format(parseISO(appt.start_time), 'd') }}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400">{{ format(parseISO(appt.start_time), 'MMM') }}</span>
                </div>
                <div>
                    <p class="font-medium text-slate-800 dark:text-slate-200">{{ appt.client?.name }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ format(parseISO(appt.start_time), 'h:mm a') }} with {{ appt.barber?.name }}
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
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabase';
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline';
import { format, parseISO, startOfToday, endOfToday, isWithinInterval } from 'date-fns';
import type { Appointment, DailyCollection, Client, Barber, Expense } from '../types';

const todayFormatted = computed(() => format(new Date(), 'EEEE, MMMM d, yyyy'));

const loading = ref(true);
const appointments = ref<Appointment[]>([]);
const collections = ref<DailyCollection[]>([]);
const clients = ref<Client[]>([]);
const barbers = ref<Barber[]>([]);
const expenses = ref<Expense[]>([]);

const todayStats = computed(() => {
  const todaysAppointments = appointments.value.filter(a => isToday(parseISO(a.start_time)));
  const todaysCollections = collections.value.filter(c => isToday(parseISO(c.collection_date)));
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
  { title: "Active Barbers", value: barbers.value.length, icon: UsersIcon, color: 'bg-purple-500' },
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
    .filter(a => new Date(a.start_time) >= today && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);
});

const recentActivity = computed(() => {
  const collectionsAsIncome = collections.value.map(c => ({
    id: `col-${c.id}`,
    date: c.collection_date,
    description: `Daily Collection`,
    subDescription: `From ${c.barber?.name || 'Unknown'}`,
    amount: c.total_amount_manually_entered || 0,
    type: 'income' as const
  }));
  
  const expensesAsOutcome = expenses.value.map(e => ({
    id: `exp-${e.id}`,
    date: e.expense_date,
    description: e.description,
    subDescription: e.category,
    amount: e.amount,
    type: 'expense' as const
  }));

  return [...collectionsAsIncome, ...expensesAsOutcome]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

function isToday(date: Date) {
  return isWithinInterval(date, { start: startOfToday(), end: endOfToday() });
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A';
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

onMounted(async () => {
  loading.value = true;
  try {
    const [
      { data: appointmentsData },
      { data: collectionsData },
      { data: clientsData },
      { data: barbersData },
      { data: expensesData },
    ] = await Promise.all([
      supabase.from('appointments').select('*, client:clients(*), barber:barbers(*)'),
      supabase.from('daily_collections').select('*, barber:barbers(*)'),
      supabase.from('clients').select('*', { count: 'exact' }),
      supabase.from('barbers').select('*', { count: 'exact' }),
      supabase.from('expenses').select('*')
    ]);

    appointments.value = appointmentsData || [];
    collections.value = collectionsData || [];
    clients.value = clientsData || [];
    barbers.value = barbersData || [];
    expenses.value = expensesData || [];

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loading.value = false;
  }
});
</script>