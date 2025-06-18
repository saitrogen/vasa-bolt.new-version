<template>
  <div
    :class="[
      'bg-white min-h-screen shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300',
      props.isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="p-6">
      <div
        :class="[
          'flex items-center w-full',
          props.isCollapsed ? 'justify-center space-x-2' : 'justify-between'
        ]"
      >
        <!-- Logo/Title group (adjust its own spacing if needed when collapsed) -->
        <div :class="['flex items-center', props.isCollapsed ? '' : 'space-x-3']">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">VS</span>
          </div>
          <div v-if="!props.isCollapsed"> <!-- Changed to v-if -->
            <h1 class="text-xl font-bold text-gray-900">VASA SALOON</h1>
            <p class="text-sm text-gray-500">Management System</p>
          </div>
        </div>
        <!-- New Toggle Button (already added in Task 1) -->
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose v-if="!props.isCollapsed" class="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <PanelRightClose v-else class="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
    
    <nav class="px-4 pb-4 flex-grow">
      <ul class="space-y-2">
        <li v-for="item in navigationItems" :key="item.name">
          <router-link
            :to="item.to"
            :class="[
              'flex items-center py-3 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-gray-100',
              isActive(item.to) 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                : 'text-gray-700',
              props.isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span v-if="!props.isCollapsed">{{ item.name }}</span> <!-- Also changed this to v-if for consistency, though not explicitly requested for nav items -->
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div :class="['p-4 bg-gray-50 border-t border-gray-200', props.isCollapsed ? 'py-2' : '']">
      <!-- Expanded Layout -->
      <div v-if="!props.isCollapsed" class="flex items-center justify-between">
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
      <!-- Collapsed Layout -->
      <div v-else class="flex items-center justify-center space-x-2">
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <UserIcon class="w-5 h-5 text-gray-600" />
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
import { PanelLeftClose, PanelRightClose } from 'lucide-vue-next';

const route = useRoute()
const { signOut } = useAuth()

const props = defineProps({
  isCollapsed: Boolean
});

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