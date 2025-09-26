<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { blueprintKey } from '@/composables/keys'
import type { EquipmentSlotName } from '@/interfaces'
import EquipmentSlot from './EquipmentSlot.vue'
import { SPELLBOOKS_DATA, SPELLBOOKS_MAP } from '@/constants/spellbooks'

defineProps<{
  editable: boolean
}>()

const blueprintApi = inject(blueprintKey)
if (!blueprintApi) {
  throw new Error('Blueprint API not provided.')
}

// We only need a few actions from the API now
const {
  activeEquippedItems,
  activeSpellbook,
  dragPayload,
  endDrag, // For dragend
  equipItem, // For the drop logic
  unequipItem, // For the click logic
  setSpellbook,
} = blueprintApi

const dragOverSlot = ref<EquipmentSlotName | null>(null)

const validDropSlot = computed<EquipmentSlotName | null>(() => {
  if (!dragPayload.value || dragPayload.value.source === 'equipment') {
    return null
  }
  return dragPayload.value.item.equipment_stats?.slot ?? null
})

const equipmentLayout: EquipmentSlotName[][] = [
  ['head'],
  ['cape', 'neck', 'ammo'],
  ['weapon', 'body', 'shield'],
  ['legs'],
  ['hands', 'feet', 'ring'],
]

// The handleDragStart function has been REMOVED from this component.

function handleDragOver(event: DragEvent, toSlot: EquipmentSlotName) {
  event.preventDefault()
  dragOverSlot.value = toSlot
}

function handleDrop(event: DragEvent, toSlot: EquipmentSlotName) {
  event.preventDefault()
  if (!event.dataTransfer) return

  try {
    const payload = JSON.parse(event.dataTransfer.getData('application/json'))
    if (payload.source === 'item-search' || payload.source === 'inventory') {
      const droppedItem = payload.item
      if (droppedItem.equipment_stats?.slot === toSlot) {
        equipItem(droppedItem, payload.fromIndex)
      }
    } else if (payload.source === 'equipment') {
      // Logic for swapping between equipment slots
      const fromSlot: EquipmentSlotName = payload.fromSlot
      if (fromSlot === toSlot) return

      const itemToMove = activeEquippedItems.value?.[fromSlot]
      if (itemToMove?.equipment_stats?.slot === toSlot) {
        equipItem(itemToMove)
      }
    }
  } catch (e) {
    console.error('Drop failed in Equipment Panel:', e)
  }
  dragOverSlot.value = null
  endDrag()
}
</script>

<template>
  <div
    class="bg-zinc-900 p-3 max-w-sm rounded-lg relative flex flex-col items-center justify-center"
  >
    <div v-if="activeEquippedItems" class="space-y-1.5">
      <div
        v-for="(row, rowIndex) in equipmentLayout"
        :key="rowIndex"
        class="flex justify-center items-center"
        :class="{
          'gap-x-1.5': rowIndex === 1,
          'gap-x-5': rowIndex === 2 || rowIndex === 4,
        }"
      >
        <div
          v-for="slotName in row"
          :key="slotName"
          class="rounded-md transition-colors"
          :class="{
            'bg-yellow-500/20': editable && dragOverSlot === slotName,
            'bg-white/5 ': editable && validDropSlot === slotName && dragOverSlot !== slotName,
          }"
          @dragover="editable ? handleDragOver($event, slotName) : null"
          @dragleave="dragOverSlot = null"
          @drop="editable ? handleDrop($event, slotName) : null"
        >
          <EquipmentSlot
            :slot-name="slotName"
            :item="activeEquippedItems[slotName]"
            :draggable="editable && !!activeEquippedItems[slotName]"
            @dragend="editable ? endDrag() : null"
            @click="editable ? unequipItem(slotName) : null"
          />
        </div>
      </div>
    </div>

    <!-- Spellbook Section -->
    <div class="mt-1 w-full">
      <p class="text-zinc-400 text-xs text-center mb-1">Spellbook</p>
      <div v-if="editable" class="flex items-center justify-center gap-x-1">
        <button
          v-for="spellbook in SPELLBOOKS_DATA"
          :key="spellbook.id"
          @click="setSpellbook(spellbook.id)"
          class="p-1 rounded-full"
          :class="{
            'bg-amber-400/30': activeSpellbook === spellbook.id,
            'hover:bg-amber-400/10': activeSpellbook !== spellbook.id,
          }"
        >
          <img :src="spellbook.imageUrl" alt="" />
        </button>
      </div>

      <div v-else>
        <div v-if="activeSpellbook" class="flex items-center justify-center gap-x-2">
          <img :src="SPELLBOOKS_MAP.get(activeSpellbook)?.imageUrl" />
          <p class="text-sm">{{ SPELLBOOKS_MAP.get(activeSpellbook)?.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
