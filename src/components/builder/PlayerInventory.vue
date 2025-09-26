<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { blueprintKey } from '@/composables/keys' // 1. Import the Injection Key
import type { EquipmentSlotName, Item } from '@/interfaces'
import { IconX } from '@tabler/icons-vue'

// --- Component API ---
defineProps<{
  editable: boolean
}>()

const emit = defineEmits<{
  // The rune pouch event is a UI concern, so it rightfully stays here
  (e: 'open-rune-pouch', payload: { item: Item; index: number }): void
}>()

// 2. INJECT the Blueprint API
const blueprintApi = inject(blueprintKey)
if (!blueprintApi) {
  throw new Error('Blueprint API not provided. Is PlayerInventory a child of BlueprintEditor?')
}

// 3. DESTRUCTURE only the state and actions this component needs
const {
  activeInventoryItems,
  dragPayload,
  startDrag,
  endDrag,
  moveInventoryItem,
  setInventoryItem,
  equipFromInventory,
  swapEquipmentAndInventoryItem,
} = blueprintApi

// --- Local UI State ---
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const isDraggingAnyItem = computed(() => dragPayload.value !== null)

// 4. EVENT HANDLERS now call the injected actions directly
function handleDragStart(event: DragEvent, item: Item, index: number) {
  if (!event.dataTransfer) return

  // Find the actual <img> element that the user is dragging.
  const imgElement = (event.target as HTMLElement).querySelector('img')
  if (imgElement) {
    // Tell the browser to use this specific image as the drag preview,
    // and center it on the cursor.
    event.dataTransfer.setDragImage(
      imgElement,
      imgElement.clientWidth / 2,
      imgElement.clientHeight / 2,
    )
  }

  startDrag('inventory', item)
  draggingIndex.value = index

  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({ source: 'inventory', fromIndex: index, item: item }),
  )
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  dragOverIndex.value = index
}

function handleDrop(event: DragEvent, toIndex: number) {
  event.preventDefault()
  if (!event.dataTransfer) return

  try {
    const payload = JSON.parse(event.dataTransfer.getData('application/json'))

    if (payload.source === 'inventory') {
      moveInventoryItem(payload.fromIndex, toIndex)
    } else if (payload.source === 'item-search') {
      setInventoryItem(toIndex, payload.item)
    } else if (payload.source === 'equipment') {
      const fromSlot = payload.fromSlot as EquipmentSlotName
      swapEquipmentAndInventoryItem(fromSlot, toIndex)
    }
  } catch (e) {
    console.error('Failed to handle drop:', e)
  }

  cleanupDragState()
}

function cleanupDragState() {
  draggingIndex.value = null
  dragOverIndex.value = null
  endDrag()
}

function handleSlotClick(item: Item | null, index: number) {
  if (!item) return

  if (item.rune_pouch_slots && item.rune_pouch_slots > 0) {
    emit('open-rune-pouch', { item, index })
    return
  }

  if (item.equipment_stats) {
    equipFromInventory(item, index)
  }
}

function handleRemoveItem(index: number) {
  setInventoryItem(index, null)
}
</script>

<template>
  <div class="bg-zinc-900 p-3 max-w-50 rounded-lg">
    <div v-if="activeInventoryItems" class="grid grid-cols-4 gap-0.5">
      <div
        v-for="(item, index) in activeInventoryItems"
        :key="index"
        class="group relative size-10 rounded-md transition-colors"
        :class="{
          'bg-yellow-500/25': editable && dragOverIndex === index,
          'bg-white/5': editable && isDraggingAnyItem && !item && dragOverIndex !== index,
        }"
        @dragover="editable ? handleDragOver($event, index) : null"
        @dragleave="dragOverIndex = null"
        @drop="editable ? handleDrop($event, index) : null"
      >
        <div
          v-if="item"
          class="w-full h-full p-1 flex items-center justify-center"
          :class="{
            'cursor-pointer active:cursor-grabbing': editable,
            'opacity-30': editable && draggingIndex === index,
          }"
          :draggable="editable"
          @dragstart="editable ? handleDragStart($event, item, index) : null"
          @dragend="editable ? cleanupDragState() : null"
          @click="editable ? handleSlotClick(item, index) : null"
        >
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="max-w-full max-h-full pointer-events-none"
          />
          <p v-else>{{ item.name }}</p>

          <div
            v-if="item.rune_pouch_slots && item.stored_runes?.some((r) => r !== null)"
            class="absolute inset-0 flex items-center justify-center p-0.5 pointer-events-none"
            :class="{
              'flex-wrap gap-px': item.rune_pouch_slots === 4, // 2x2 Grid for 4 slots
              'flex-col gap-y-px': item.rune_pouch_slots === 3, // Vertical list for 3 slots
            }"
          >
            <!-- We loop through the stored runes to display them -->
            <template v-for="(rune, runeIndex) in item.stored_runes">
              <img
                v-if="rune && rune.image_url"
                :key="`${rune.item_id}-${runeIndex}`"
                :src="rune.image_url"
                :alt="rune.name"
                class="size-3 drop-shadow-lg"
                :class="{
                  'size-4': item.rune_pouch_slots === 4,
                }"
              />
            </template>
          </div>
        </div>

        <!-- Only show the remove button if editable -->
        <button
          v-if="editable && item"
          @click.stop="handleRemoveItem(index)"
          class="absolute -right-1 -top-1 z-10 flex items-center justify-center rounded-full bg-zinc-700 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
        >
          <IconX class="size-3" stroke-width="3" />
        </button>
      </div>
    </div>
  </div>
</template>
