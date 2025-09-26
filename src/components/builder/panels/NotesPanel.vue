<script setup lang="ts">
import { computed, inject } from 'vue'
import { blueprintKey } from '@/composables/keys'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

const props = defineProps<{
  editable: boolean
}>()

const blueprintApi = inject(blueprintKey)
if (!blueprintApi) {
  throw new Error('Blueprint API not provided. Is NotesPanel a child of BlueprintEditor?')
}

const { activeLoadout, updateLoadoutNotes } = blueprintApi

const activeLoadoutNotes = computed({
  get: () => activeLoadout.value?.notes ?? '',
  set: (newValue) => {
    if (props.editable) {
      updateLoadoutNotes(newValue)
    }
  },
})
</script>

<template>
  <div class="pt-2 px-1 h-64">
    <BaseTextarea
      v-if="editable"
      v-model="activeLoadoutNotes"
      placeholder="Explain the choices for this specific loadout..."
      :readonly="!editable"
      class="h-full"
    />

    <div
      v-else-if="activeLoadout"
      class="h-full prose prose-invert prose-sm max-w-none text-zinc-400 overflow-y-auto"
    >
      <p v-if="activeLoadoutNotes.length">{{ activeLoadoutNotes }}</p>
      <p v-else class="italic">No notes for this loadout.</p>
    </div>
  </div>
</template>
