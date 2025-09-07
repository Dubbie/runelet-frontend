<script setup lang="ts">
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import { useBlueprintStore } from '@/stores/blueprint'
import { computed } from 'vue'

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

const blueprintStore = useBlueprintStore()

const activeLoadoutNotes = computed({
  get: () => blueprintStore.activeLoadout?.notes ?? '',
  set: (value) => {
    // Only allow setting the value if the component is editable
    if (props.editable && blueprintStore.activeLoadout) {
      blueprintStore.activeLoadout.notes = value
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
      :class="{
        'cursor-default': !editable,
      }"
    />

    <div v-else class="h-full flex flex-col items-center justify-center text-xs text-zinc-500">
      <p>{{ activeLoadoutNotes.length ? activeLoadoutNotes : 'No notes given.' }}</p>
    </div>
  </div>
</template>
