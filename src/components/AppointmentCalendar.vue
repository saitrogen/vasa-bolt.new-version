<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div class="flex items-center space-x-6">
          <h2 class="text-lg font-semibold text-gray-900">Appointments</h2>
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <button
              v-for="view in views"
              :key="view.value"
              @click="currentView = view.value as 'day' | 'week' | 'month'"
              :class="[
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                currentView === view.value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ view.label }}
            </button>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <button
            @click="previousPeriod"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          
          <div class="text-lg font-medium text-gray-900 min-w-[200px] text-center">
            {{ currentPeriodLabel }}
          </div>
          
          <button
            @click="nextPeriod"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
          
          <button
            @click="goToToday"
            class="ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          
          <button
            @click="$emit('new-appointment')"
            class="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            New Appointment
          </button>
        </div>
      </div>
    </div>
    
    <div class="p-6">
      <!-- Week View -->
      <div v-if="currentView === 'week'" class="space-y-6">
        <!-- Time slots header -->
        <div class="grid grid-cols-8 gap-6">
          <div class="text-sm font-medium text-gray-500">Time</div>
          <div
            v-for="day in weekDays"
            :key="day.date.toISOString()"
            class="text-center"
          >
            <div class="text-sm font-medium text-gray-700">
              {{ format(day.date, 'EEE') }}
            </div>
            <div class="text-2xl font-bold text-gray-900 mt-1">
              {{ format(day.date, 'd') }}
            </div>
          </div>
        </div>
        
        <!-- Time slots grid -->
        <div class="grid grid-cols-8 gap-6 overflow-y-auto max-h-[calc(100vh-24rem)]">
          <div class="space-y-6">
            <div
              v-for="hour in businessHours"
              :key="hour"
              class="h-20 flex items-center text-sm text-gray-600 border-r border-gray-100 pr-3 font-medium"
            >
              {{ formatTime(hour) }}
            </div>
          </div>
          
          <div
            v-for="day in weekDays"
            :key="day.date.toISOString()"
            class="space-y-1"
          >
            <div
              v-for="hour in businessHours"
              :key="`${day.date}-${hour}`"
              class="h-20 border border-gray-100 rounded-md p-1 hover:bg-gray-50 cursor-pointer relative"
              @click="createAppointment(day.date, hour)"
            >
              <!-- Appointments for this time slot -->
              <div
                v-for="appointment in getAppointmentsForSlot(day.date, hour)"
                :key="appointment.id"
                :class="[
                  'absolute inset-x-1 rounded-md p-1 text-xs cursor-pointer',
                  'hover:shadow-md transition-shadow',
                  getAppointmentColor(appointment.status)
                ]"
                :style="getAppointmentPosition(appointment)"
                @click.stop="$emit('edit-appointment', appointment)"
              >
                <div class="font-medium truncate">{{ appointment.client?.name }}</div>
                <div class="text-xs opacity-75 truncate">{{ appointment.barber?.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Day View -->
      <div v-else-if="currentView === 'day'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ format(currentDate, 'EEEE, MMMM d, yyyy') }}
          </h3>
          <select
            v-model="selectedBarberId"
            class="select"
          >
            <option value="">All Barbers</option>
            <option
              v-for="barber in barbers"
              :key="barber.id"
              :value="barber.id"
            >
              {{ barber.name }}
            </option>
          </select>
        </div>
        
        <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          <div
            v-for="hour in businessHours"
            :key="hour"
            class="flex items-center space-x-4 p-2 border border-gray-100 rounded-md hover:bg-gray-50"
          >
            <div class="w-16 text-sm text-gray-500">
              {{ formatTime(hour) }}
            </div>
            <div class="flex-1 grid grid-cols-3 gap-2">
              <div
                v-for="appointment in getAppointmentsForSlot(currentDate, hour)"
                :key="appointment.id"
                :class="[
                  'p-2 rounded-md cursor-pointer hover:shadow-md transition-shadow',
                  getAppointmentColor(appointment.status)
                ]"
                @click="$emit('edit-appointment', appointment)"
              >
                <div class="font-medium">{{ appointment.client?.name }}</div>
                <div class="text-sm opacity-75">{{ appointment.barber?.name }}</div>
                <div class="text-xs opacity-75">
                  {{ appointment.services?.map(s => s.service?.name).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Month View -->
      <div v-else class="grid grid-cols-7 gap-1">
        <!-- Day headers -->
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="p-2 text-center text-sm font-medium text-gray-500 border-b border-gray-200"
        >
          {{ day }}
        </div>
        
        <!-- Calendar days -->
        <div
          v-for="day in monthDays"
          :key="day.date.toISOString()"
          :class="[
            'min-h-[100px] p-1 border border-gray-100 hover:bg-gray-50 cursor-pointer',
            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
            day.isToday ? 'bg-primary-50 border-primary-200' : ''
          ]"
          @click="selectDay(day.date)"
        >
          <div class="flex items-center justify-between">
            <span
              :class="[
                'text-sm font-medium',
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                day.isToday ? 'text-primary-600' : ''
              ]"
            >
              {{ format(day.date, 'd') }}
            </span>
            <span class="text-xs text-gray-400">
              {{ getAppointmentsForDay(day.date).length }}
            </span>
          </div>
          
          <div class="mt-1 space-y-1">
            <div
              v-for="appointment in getAppointmentsForDay(day.date).slice(0, 3)"
              :key="appointment.id"
              :class="[
                'text-xs p-1 rounded truncate cursor-pointer',
                getAppointmentColor(appointment.status)
              ]"
              @click.stop="$emit('edit-appointment', appointment)"
            >
              {{ appointment.client?.name }}
            </div>
            <div
              v-if="getAppointmentsForDay(day.date).length > 3"
              class="text-xs text-gray-500"
            >
              +{{ getAppointmentsForDay(day.date).length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isToday, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, parseISO } from 'date-fns'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import type { Appointment, Barber } from '../types'

interface Props {
  appointments: Appointment[]
  barbers: Barber[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'new-appointment': [date?: Date, hour?: number]
  'edit-appointment': [appointment: Appointment]
  'date-change': [date: Date]
}>()

const currentDate = ref(new Date())
const currentView = ref<'day' | 'week' | 'month'>('week')
const selectedBarberId = ref('')

const views = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
]

const businessHours = Array.from({ length: 12 }, (_, i) => i + 9) // 9 AM to 8 PM

const currentPeriodLabel = computed(() => {
  switch (currentView.value) {
    case 'day':
      return format(currentDate.value, 'EEEE, MMMM d, yyyy')
    case 'week':
      const weekStart = startOfWeek(currentDate.value)
      const weekEnd = endOfWeek(currentDate.value)
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    case 'month':
      return format(currentDate.value, 'MMMM yyyy')
    default:
      return ''
  }
})

const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  return eachDayOfInterval({ start, end: addDays(start, 6) }).map(date => ({ date }))
})

const monthDays = computed(() => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)
  const calendarStart = startOfWeek(start)
  const calendarEnd = endOfWeek(end)
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(date => ({
    date,
    isCurrentMonth: isSameMonth(date, currentDate.value),
    isToday: isToday(date)
  }))
})

const filteredAppointments = computed(() => {
  let filtered = props.appointments
  
  if (selectedBarberId.value) {
    filtered = filtered.filter(apt => apt.barber_id === selectedBarberId.value)
  }
  
  return filtered
})

const getAppointmentsForSlot = (date: Date, hour: number) => {
  return filteredAppointments.value.filter(appointment => {
    const appointmentDate = parseISO(appointment.start_time)
    return isSameDay(appointmentDate, date) && appointmentDate.getHours() === hour
  })
}

const getAppointmentsForDay = (date: Date) => {
  return filteredAppointments.value.filter(appointment => {
    const appointmentDate = parseISO(appointment.start_time)
    return isSameDay(appointmentDate, date)
  })
}

const getAppointmentColor = (status: string) => {
  const colors = {
    'booked': 'bg-blue-100 text-blue-800 border-blue-200',
    'confirmed': 'bg-green-100 text-green-800 border-green-200',
    'completed': 'bg-gray-100 text-gray-800 border-gray-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'no-show': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  return colors[status as keyof typeof colors] || colors.booked
}

const getAppointmentPosition = (appointment: Appointment) => {
  const startTime = parseISO(appointment.start_time)
  const endTime = parseISO(appointment.end_time)
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
  const heightPercentage = Math.min((duration / 60) * 100, 100) // max 100%
  
  return {
    height: `${heightPercentage}%`,
    top: '0%'
  }
}

const formatTime = (hour: number) => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return format(date, 'h:mm a')
}

const previousPeriod = () => {
  switch (currentView.value) {
    case 'day':
      currentDate.value = subDays(currentDate.value, 1)
      break
    case 'week':
      currentDate.value = subWeeks(currentDate.value, 1)
      break
    case 'month':
      currentDate.value = subMonths(currentDate.value, 1)
      break
  }
  emit('date-change', currentDate.value)
}

const nextPeriod = () => {
  switch (currentView.value) {
    case 'day':
      currentDate.value = addDays(currentDate.value, 1)
      break
    case 'week':
      currentDate.value = addWeeks(currentDate.value, 1)
      break
    case 'month':
      currentDate.value = addMonths(currentDate.value, 1)
      break
  }
  emit('date-change', currentDate.value)
}

const goToToday = () => {
  currentDate.value = new Date()
  emit('date-change', currentDate.value)
}

const selectDay = (date: Date) => {
  currentDate.value = date
  currentView.value = 'day'
  emit('date-change', date)
}

const createAppointment = (date: Date, hour: number) => {
  emit('new-appointment', date, hour)
}
</script>