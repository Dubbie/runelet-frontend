import BlueprintBuilderView from '@/views/BlueprintBuilderView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'blueprint-builder',
      component: BlueprintBuilderView, // <-- Set it as the component for the root path
    },
  ],
})

export default router
