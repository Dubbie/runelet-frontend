import BlueprintView from '@/views/builder/BlueprintView.vue'
import GuideCreateView from '@/views/guide/GuideCreateView.vue'
import GuideDetailView from '@/views/guide/GuideDetailView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'blueprint',
      component: BlueprintView,
    },
    // Route for the guide editor
    {
      path: '/guides/create',
      name: 'GuideCreate',
      component: GuideCreateView,
    },
    // Route for viewing the saved guide
    {
      path: '/guides/:slug', // Using a slug for a realistic URL
      name: 'GuideDetail',
      component: GuideDetailView,
      props: true, // This allows the slug to be passed as a prop
    },
  ],
})

export default router
