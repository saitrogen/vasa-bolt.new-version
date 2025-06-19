<template>
  <aside :class="[
      'bg-white dark:bg-slate-900 shadow-lg border-r border-gray-200 dark:border-slate-800 flex flex-col h-full transition-all duration-300',
      props.isCollapsed ? 'w-20' : 'w-64'
    ]">
    <!-- Header section -->
    <div class="p-4 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div :class="['flex items-center', props.isCollapsed ? 'justify-center w-full' : 'space-x-3']">
          <div class="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">VS</span>
          </div>
          <div v-if="!props.isCollapsed" class="flex flex-col min-w-0">
            <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">VASA SALOON</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Management System</p>
          </div>
        </div>
        <button @click="$emit('toggle-sidebar')" class="lg:hidden p-2">
          <X class="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 relative">
      <ul class="px-3 space-y-1.5">
        <li v-for="item in navigationItems" :key="item.name">
          <router-link :to="item.to" :class="[
              'flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.to)
                ? 'bg-primary-100 text-primary-900 dark:bg-primary-500/10 dark:text-primary-200'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100',
              props.isCollapsed ? 'justify-center' : 'space-x-3'
            ]">
            <component :is="item.icon" :class="[
                'w-5 h-5 flex-shrink-0 transition-transform',
                isActive(item.to) ? 'text-primary-700 dark:text-primary-300 scale-110' : 'text-gray-500 dark:text-slate-400'
              ]" />
            <span v-if="!props.isCollapsed" class="truncate"
              :class="{ 'text-primary-900 dark:text-primary-200 font-semibold': isActive(item.to) }">
              {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>
      <div v-if="!isMobile" class="absolute bottom-4 flex justify-center w-full">
        <button @click="$emit('toggle-sidebar')"
          class="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-md"
          :title="props.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <PanelLeftClose v-if="!props.isCollapsed" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <PanelRightClose v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </nav>
    <!-- User section -->
    <div class="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4 flex-shrink-0">
      <div :class="['flex', props.isCollapsed ? 'flex-col items-center space-y-3' : 'items-center justify-between']">
        <div class="flex items-center min-w-0" :class="{ 'space-x-3': !props.isCollapsed }">
          <div class="w-9 h-9 bg-primary-100 dark:bg-primary-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon class="w-5 h-5 text-primary-600 dark:text-primary-300" />
          </div>
          <div v-if="!props.isCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Admin</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 truncate">Administrator</p>
          </div>
        </div>

        <div class="flex items-center" :class="[props.isCollapsed ? 'flex-col space-y-2' : 'space-x-2']">
          <button @click="$emit('toggle-dark-mode')"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-all"
            :class="{ 'w-full flex justify-center': props.isCollapsed }" :title="props.isDark ? 'Activate Light Mode' : 'Activate Dark Mode'">
            <SunIcon v-if="props.isDark" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
          <button @click="handleSignOut"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-all"
            :class="{ 'w-full flex justify-center': props.isCollapsed }" title="Sign Out">
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
          </button>
        </div>
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
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/vue/24/outline'
import { PanelLeftClose, PanelRightClose, X } from 'lucide-vue-next';
import { useBreakpoints } from '../composables/useBreakpoints';
import { computed } from 'vue';

const route = useRoute()
const { signOut } = useAuth()
const { width } = useBreakpoints()

const isMobile = computed(() => width.value < 1024)

const props = defineProps({
  isCollapsed: Boolean,
  isDark: Boolean,
});

defineEmits(['toggle-sidebar', 'toggle-dark-mode'])

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