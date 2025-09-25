<script setup lang="ts">
import { computed } from 'vue'
import { useGuideStore } from '@/stores/guide'
import GuideRenderer from '@/components/guide/GuideRenderer.vue'
import { RouterLink } from 'vue-router'

const guideStore = useGuideStore()

// Use computed properties to reactively get the data from the store
const title = computed(() => guideStore.guideTitle)
const content = computed(() => guideStore.guideContent)

console.log('GuideDetailView', title.value, content.value)
</script>

<template>
  <div class="bg-zinc-950 min-h-screen text-zinc-100 py-12">
    <div class="max-w-5xl mx-auto px-4">
      <div class="mb-4">
        <RouterLink :to="{ name: 'GuideCreate' }" class="text-yellow-500 hover:underline">
          &larr; Back to Editor
        </RouterLink>
      </div>

      <article>
        <h1 class="text-4xl font-extrabold mb-6">{{ title }}</h1>
        <GuideRenderer :content="content" />
      </article>
    </div>
  </div>
</template>
