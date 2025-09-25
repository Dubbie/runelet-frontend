<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGuideStore } from '@/stores/guide'
import GuideEditor from '@/components/guide/GuideEditor.vue'

const router = useRouter()
const guideStore = useGuideStore()

const guideTitle = ref(guideStore.guideTitle)
const guideContent = ref(guideStore.guideContent)

// If the store is empty (first visit), provide a default starter document for the editor.
if (guideContent.value === null) {
  guideContent.value = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Start writing your amazing guide here!' }],
      },
    ],
  }
}

function handleSave() {
  if (!guideContent.value) {
    alert('Cannot save empty content!')
    return
  }

  // This part was already correct: it saves the local state to the store.
  guideStore.saveGuide(guideTitle.value, guideContent.value)

  const slug = guideTitle.value.toLowerCase().trim().replace(/\s+/g, '-')
  router.push({ name: 'GuideDetail', params: { slug } })
}
</script>

<template>
  <div class="bg-zinc-950 min-h-screen text-zinc-100 py-12">
    <div class="max-w-5xl mx-auto px-4">
      <h1 class="text-2xl font-bold mb-4">Guide Editor</h1>

      <div class="mb-4">
        <label for="guide-title" class="block mb-2 text-sm font-medium text-zinc-300"
          >Guide Title</label
        >
        <input
          id="guide-title"
          v-model="guideTitle"
          type="text"
          class="bg-zinc-800 border border-zinc-700 text-white rounded-lg w-full p-2.5"
          placeholder="Enter guide title"
        />
      </div>

      <!-- This v-model now correctly starts with the persisted data from the store -->
      <GuideEditor v-model:content="guideContent" />

      <div class="mt-4">
        <button
          @click="handleSave"
          class="px-4 py-2 bg-yellow-500 text-zinc-900 font-bold rounded-lg hover:bg-yellow-400"
        >
          Save and View Guide
        </button>
      </div>
    </div>
  </div>
</template>
