<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBlueprintStore } from '@/stores/blueprint'
import type { EquipmentSlotName, Item } from '@/interfaces'
import EquipmentSlot from './EquipmentSlot.vue'
import { SPELLBOOKS_DATA, SPELLBOOKS_MAP } from '@/constants/spellbooks'

defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

const blueprintStore = useBlueprintStore()

// --- Data-Driven Layout ---
const equipmentLayout: EquipmentSlotName[][] = [
  ['head'],
  ['cape', 'neck', 'ammo'],
  ['weapon', 'body', 'shield'],
  ['legs'],
  ['hands', 'feet', 'ring'],
]

// --- Drag & Drop State ---
const dragOverSlot = ref<EquipmentSlotName | null>(null)

const validDropSlot = computed<EquipmentSlotName | null>(() => {
  const payload = blueprintStore.dragPayload
  if (!payload || payload.source === 'equipment') {
    // Don't highlight if dragging from equipment itself
    return null
  }
  return payload.item.equipment_stats?.slot ?? null
})

// --- Generic Event Handlers ---
// These handlers are now written once and used by all slots in the loop.

function handleDragStart(event: DragEvent, fromSlot: EquipmentSlotName) {
  if (!event.dataTransfer) return
  const item = blueprintStore.activeEquippedItems?.[fromSlot]
  if (!item) return

  blueprintStore.startDrag('equipment', item)
  event.dataTransfer.setData('application/json', JSON.stringify({ source: 'equipment', fromSlot }))
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(event: DragEvent, toSlot: EquipmentSlotName) {
  event.preventDefault()
  dragOverSlot.value = toSlot
}

function handleDrop(event: DragEvent, toSlot: EquipmentSlotName) {
  event.preventDefault()
  if (!event.dataTransfer) return

  try {
    const payload = JSON.parse(event.dataTransfer.getData('application/json'))
    const targetItem = blueprintStore.activeEquippedItems?.[toSlot]

    // Case 1: Drop from Item Search
    if (payload.source === 'item-search') {
      const droppedItem: Item = payload.item
      // Validation: Ensure the dropped item belongs in the target slot.
      if (droppedItem.equipment_stats?.slot === toSlot) {
        blueprintStore.equipItem(droppedItem)
      }
    }
    // Case 2: Drop from Inventory
    else if (payload.source === 'inventory') {
      const { item: droppedItem, fromIndex } = payload
      if (droppedItem.equipment_stats?.slot === toSlot) {
        // Swap the items between equipment and inventory
        blueprintStore.equipItem(droppedItem)
        blueprintStore.setInventoryItem(fromIndex, targetItem ?? null)
      }
    }
    // Case 3: Drop from another Equipment Slot (swapping)
    else if (payload.source === 'equipment') {
      const fromSlot: EquipmentSlotName = payload.fromSlot

      // If the item is dropped back onto its original slot, do nothing.
      if (fromSlot === toSlot) {
        dragOverSlot.value = null // Clean up the hover state
        return // Exit the function immediately
      }

      const itemToMove = blueprintStore.activeEquippedItems?.[fromSlot]

      // The rest of your swapping logic can now safely assume fromSlot !== toSlot
      if (itemToMove?.equipment_stats?.slot === toSlot) {
        blueprintStore.equipItem(itemToMove)
        if (targetItem && targetItem.equipment_stats?.slot === fromSlot) {
          blueprintStore.equipItem(targetItem)
        }
      }
    }
  } catch (e) {
    console.error('Drop failed in Equipment Panel:', e)
  }
  dragOverSlot.value = null // Always clean up the hover state
}

function handleUnequip(slot: EquipmentSlotName) {
  if (blueprintStore.activeEquippedItems?.[slot]) {
    blueprintStore.unequipItem(slot)
  }
}
</script>

<template>
  <div
    class="bg-zinc-900 p-3 max-w-sm rounded-lg relative flex flex-col items-center justify-center"
  >
    <!-- The Player's Equipment Grid -->
    <div v-if="blueprintStore.activeEquippedItems" class="space-y-1.5">
      <!-- Outer loop renders the rows -->
      <div
        v-for="(row, rowIndex) in equipmentLayout"
        :key="rowIndex"
        class="flex justify-center items-center"
        :class="{
          'gap-x-1.5': rowIndex === 1, // Cape/neck/ammo row
          'gap-x-5': rowIndex === 2 || rowIndex === 4, // Weapon and Gloves rows
        }"
      >
        <!-- Inner loop renders the slots in each row -->
        <div
          v-for="slotName in row"
          :key="slotName"
          class="rounded-md transition-colors"
          :class="{
            'bg-yellow-500/20': editable && dragOverSlot === slotName,
            'bg-white/5 ': editable && validDropSlot === slotName && dragOverSlot !== slotName,
          }"
          @dragover="editable ? handleDragOver($event, slotName) : null"
          @dragleave="editable ? (dragOverSlot = null) : null"
          @drop="editable ? handleDrop($event, slotName) : null"
        >
          <EquipmentSlot
            :slot-name="slotName"
            :item="blueprintStore.activeEquippedItems[slotName]"
            :draggable="editable && !!blueprintStore.activeEquippedItems[slotName]"
            @dragstart="editable ? handleDragStart($event, slotName) : null"
            @dragend="editable ? blueprintStore.endDrag() : null"
            @click="editable ? handleUnequip(slotName) : null"
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
          :disabled="!editable"
          @click="editable ? blueprintStore.setSpellbook(spellbook.id) : null"
          class="p-1 rounded-full"
          :class="{
            'bg-amber-400/30': blueprintStore.activeSpellbook === spellbook.id,
            'hover:bg-amber-400/10': editable && blueprintStore.activeSpellbook !== spellbook.id,
            'cursor-not-allowed opacity-60': !editable,
          }"
        >
          <img :src="spellbook.imageUrl" alt="" />
        </button>
      </div>

      <div v-else>
        <div v-if="blueprintStore.activeSpellbook" class="flex items-center justify-center gap-x-2">
          <img
            v-if="SPELLBOOKS_MAP.get(blueprintStore.activeSpellbook)?.imageUrl"
            :src="SPELLBOOKS_MAP.get(blueprintStore.activeSpellbook)?.imageUrl"
          />
          <p class="text-sm">
            {{ SPELLBOOKS_MAP.get(blueprintStore.activeSpellbook)?.name ?? 'Unknown Spellbook' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
