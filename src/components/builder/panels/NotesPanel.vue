<script setup lang="ts">
import { useBlueprintStore } from '@/stores/blueprint'
import { computed } from 'vue'

const blueprintStore = useBlueprintStore()

// Use the same computed setter from the parent to two-way bind the notes
const activeLoadoutNotes = computed({
  get: () => blueprintStore.activeLoadout?.notes ?? '',
  set: (value) => {
    if (blueprintStore.activeLoadout) {
      // It's good practice to have a dedicated store action for this
      // For now, direct mutation works
      blueprintStore.activeLoadout.notes = value
    }
  },
})
</script>

<template>
  <div class="pt-2 px-1 h-64">
    <textarea
      v-model="activeLoadoutNotes"
      placeholder="Explain the choices for this specific loadout..."
      class="w-full h-full bg-white/5 px-2.5 py-1.5 text-sm rounded-md border resize-none border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
    ></textarea>
  </div>
</template>
