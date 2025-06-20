import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      name: "Dashboard",
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/appointments",
      name: "Appointments",
      component: () => import('../views/Appointments.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/clients",
      name: "Clients",
      component: () => import('../views/Clients.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/services",
      name: "Services",
      component: () => import('../views/Services.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/barbers",
      name: "Barbers",
      component: () => import('../views/Barbers.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/expenses",
      name: "Expenses",
      component: () => import('../views/Expenses.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/daily-collections",
      name: "DailyCollections",
      component: () => import('../views/DailyCollections.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/reports",
      name: "Reports",
      component: () => import('../views/Reports.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/barbers/:id",
      name: "BarberProfile",
      component: () => import('../views/BarberProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: "/clients/:id",
      name: "ClientProfile",
      component: () => import('../views/ClientProfile.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
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