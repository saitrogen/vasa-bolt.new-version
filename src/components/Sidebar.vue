<template>
  <aside :class="[
      'bg-white shadow-lg border-r border-gray-200 flex flex-col h-full transition-all duration-300',
      props.isCollapsed ? 'w-20' : 'w-64'
    ]">
    <!-- Header section -->
    <div class="p-4 border-b border-gray-200 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div :class="['flex items-center', props.isCollapsed ? 'justify-center w-full' : 'space-x-3']">
          <div class="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">VS</span>
          </div>
          <div v-if="!props.isCollapsed" class="flex flex-col min-w-0">
            <h1 class="text-lg font-bold text-gray-900 truncate">VASA SALOON</h1>
            <p class="text-xs text-gray-500">Management System</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="px-3 space-y-1.5">
        <li v-for="item in navigationItems" :key="item.name">
          <router-link :to="item.to" :class="[
              'flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.to)
                ? 'bg-primary-100 text-primary-900 ring-2 ring-primary-200'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
              props.isCollapsed ? 'justify-center' : 'space-x-3'
            ]">
            <component :is="item.icon" :class="[
                'w-5 h-5 flex-shrink-0 transition-transform',
                isActive(item.to) ? 'text-primary-700 scale-110' : 'text-gray-500'
              ]" />
            <span v-if="!props.isCollapsed" class="truncate"
              :class="{ 'text-primary-900 font-semibold': isActive(item.to) }">
              {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>

    </nav>
    <div class="flex w-auto h-auto justify-end">
      <button @click="$emit('toggle-sidebar')"
        class="flex-shrink-0 p-1 hover:bg-gray-200  transition-colors bg-gray-800 rounded-l-lg"
        :title="props.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <PanelLeftClose v-if="!props.isCollapsed" class="w-5 h-5 text-white hover:text-gray-800" />
        <PanelRightClose v-else class="w-5 h-5 text-white hover:text-gray-800" />
      </button>
    </div>
    <!-- User section -->
    <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
      <div :class="['flex', props.isCollapsed ? 'flex-col items-center space-y-3' : 'items-center justify-between']">
        <div class="flex items-center min-w-0" :class="{ 'space-x-3': !props.isCollapsed }">
          <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon class="w-5 h-5 text-primary-600" />
          </div>
          <div v-if="!props.isCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">Admin</p>
            <p class="text-xs text-gray-600 truncate">Administrator</p>
          </div>
        </div>

        <button @click="handleSignOut"
          class="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-all"
          :class="{ 'w-full flex justify-center': props.isCollapsed }" title="Sign Out">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </aside>
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