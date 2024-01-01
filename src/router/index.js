import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import { getCurrentUser } from 'vuefire'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'task/:id',
          name: 'task',
          component: () => import('../components/Task.vue')
        }
      ]
    },
    {
      path: '/sign-up',
      name: 'signUp',
      component: () => import('../views/auth/SignUp.vue')
    },
    {
      path: '/sign-in',
      name: 'signIn',
      component: () => import('../views/auth/SignIn.vue')
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        name: 'signIn'
      }
    }
  }
})

export default router
