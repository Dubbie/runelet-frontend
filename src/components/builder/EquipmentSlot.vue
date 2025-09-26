<script setup lang="ts">
import { inject } from 'vue'
import { blueprintKey } from '@/composables/keys'
import type { EquipmentSlotName, Item } from '@/interfaces'

const props = defineProps<{
  item: Item | null
  slotName: EquipmentSlotName
  draggable: boolean // We need to receive the draggable state as a prop
}>()

const emit = defineEmits(['click', 'dragend']) // It should also emit dragend

// Inject the API to get the `startDrag` action
const blueprintApi = inject(blueprintKey)

function handleDragStart(event: DragEvent) {
  // Guard against errors if the API isn't injected or there's no item
  if (!blueprintApi || !props.item || !event.dataTransfer) return

  const { startDrag } = blueprintApi

  // --- THE FIX ---
  // `event.currentTarget` reliably refers to the div this listener is on.
  const selfElement = event.currentTarget as HTMLElement
  // We find the specific <img> tag of the item inside this slot.
  const imgElement = selfElement.querySelector(`img[src="${props.item.image_url}"]`)

  if (imgElement) {
    // We tell the browser to use ONLY this image for the drag preview.
    event.dataTransfer.setDragImage(
      imgElement,
      imgElement.clientWidth / 2,
      imgElement.clientHeight / 2,
    )
  }
  // --- END FIX ---

  // Call the composable's action to update the global drag state
  startDrag('equipment', props.item)
  // Set the data for the drop event
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({ source: 'equipment', fromSlot: props.slotName }),
  )
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div
    class="size-10 bg-white/5 rounded-md"
    :class="{ 'cursor-pointer active:cursor-grabbing': draggable }"
    :draggable="draggable"
    @click="emit('click')"
    @dragstart="handleDragStart"
    @dragend="emit('dragend')"
  >
    <div class="flex h-full items-center justify-center p-1">
      <template v-if="item">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name"
          class="max-w-full max-h-full"
          loading="lazy"
        />
        <p v-else>{{ item.name }}</p>
      </template>
      <img
        v-else
        class="opacity-30 invert filter"
        :src="`/images/${slotName}.webp`"
        :alt="`Image of ${slotName}`"
      />
    </div>
  </div>
</template>
