import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Appointments from '../views/Appointments.vue'
import Clients from '../views/Clients.vue'
import Services from '../views/Services.vue'
import Barbers from '../views/Barbers.vue'
import Expenses from '../views/Expenses.vue'
import DailyCollections from '../views/DailyCollections.vue'
import Reports from '../views/Reports.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments',
      name: 'Appointments',
      component: Appointments,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients',
      name: 'Clients',
      component: Clients,
      meta: { requiresAuth: true }
    },
    {
      path: '/services',
      name: 'Services',
      component: Services,
      meta: { requiresAuth: true }
    },
    {
      path: '/barbers',
      name: 'Barbers',
      component: Barbers,
      meta: { requiresAuth: true }
    },
    {
      path: '/expenses',
      name: 'Expenses',
      component: Expenses,
      meta: { requiresAuth: true }
    },
    {
      path: '/daily-collections',
      name: 'DailyCollections',
      component: DailyCollections,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'Reports',
      component: Reports,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.meta.requiresAuth && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/')
  } else {
    next()
  }
})

export default router