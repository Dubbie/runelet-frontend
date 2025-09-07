import BlueprintView from '@/views/builder/BlueprintView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'blueprint',
      component: BlueprintView,
    },
  ],
})

export default router
