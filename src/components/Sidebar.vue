<template>
  <div class="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
    <div class="p-6">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">VS</span>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">VASA SALOON</h1>
          <p class="text-sm text-gray-500">Management System</p>
        </div>
      </div>
    </div>
    
    <nav class="px-4 pb-4">
      <ul class="space-y-2">
        <li v-for="item in navigationItems" :key="item.name">
          <router-link
            :to="item.to"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-gray-100',
              isActive(item.to) 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                : 'text-gray-700'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon class="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Admin</p>
            <p class="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button
          @click="handleSignOut"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          title="Sign Out"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const { signOut } = useAuth()

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Appointments', to: '/appointments', icon: CalendarDaysIcon },
  { name: 'Clients', to: '/clients', icon: UserGroupIcon },
  { name: 'Services', to: '/services', icon: WrenchScrewdriverIcon },
  { name: 'Barbers', to: '/barbers', icon: UsersIcon },
  { name: 'Expenses', to: '/expenses', icon: CurrencyDollarIcon },
  { name: 'Daily Collections', to: '/daily-collections', icon: DocumentTextIcon },
  { name: 'Reports', to: '/reports', icon: ChartBarIcon },
]

const isActive = (path: string) => {
  return route.path === path
}

const handleSignOut = () => {
  signOut()
}
</script>