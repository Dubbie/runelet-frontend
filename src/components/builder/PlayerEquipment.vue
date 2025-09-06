<script setup lang="ts">
import { useBlueprintStore } from '@/stores/blueprint'
import type { EquipmentSlotName } from '@/interfaces'
import EquipmentSlot from './EquipmentSlot.vue'
import { SPELLBOOKS_DATA } from '@/constants/spellbooks'

const blueprintStore = useBlueprintStore()

function handleUnequip(slot: EquipmentSlotName) {
  blueprintStore.unequipItem(slot)
}
</script>

<template>
  <div
    class="bg-zinc-900 p-3 max-w-sm rounded-lg relative flex flex-col items-center justify-center"
  >
    <!-- The Player's Equipment Grid -->
    <div v-if="blueprintStore.activeEquippedItems" class="space-y-1.5">
      <!-- Head -->
      <div class="flex justify-center items-center">
        <!-- 5. BIND TO THE STORE'S COMPUTED PROPERTY -->
        <EquipmentSlot
          slot-name="head"
          :item="blueprintStore.activeEquippedItems.head"
          @click="handleUnequip('head')"
        />
      </div>
      <!-- Cape, Amulet, Ammunition -->
      <div class="flex justify-center items-center gap-x-1.5">
        <EquipmentSlot
          slot-name="cape"
          :item="blueprintStore.activeEquippedItems.cape"
          @click="handleUnequip('cape')"
        />
        <EquipmentSlot
          slot-name="neck"
          :item="blueprintStore.activeEquippedItems.neck"
          @click="handleUnequip('neck')"
        />
        <EquipmentSlot
          slot-name="ammo"
          :item="blueprintStore.activeEquippedItems.ammo"
          @click="handleUnequip('ammo')"
        />
      </div>
      <!-- Weapon, Chest, Offhand -->
      <div class="flex justify-center items-center gap-x-5">
        <EquipmentSlot
          slot-name="weapon"
          :item="blueprintStore.activeEquippedItems.weapon"
          @click="handleUnequip('weapon')"
        />
        <EquipmentSlot
          slot-name="body"
          :item="blueprintStore.activeEquippedItems.body"
          @click="handleUnequip('body')"
        />
        <EquipmentSlot
          slot-name="shield"
          :item="blueprintStore.activeEquippedItems.shield"
          @click="handleUnequip('shield')"
        />
      </div>
      <!-- Legs -->
      <div class="flex justify-center items-center gap-x-1.5">
        <EquipmentSlot
          slot-name="legs"
          :item="blueprintStore.activeEquippedItems.legs"
          @click="handleUnequip('legs')"
        />
      </div>
      <!-- Gloves, Boots, Ring -->
      <div class="flex justify-center items-center gap-x-5">
        <EquipmentSlot
          slot-name="hands"
          :item="blueprintStore.activeEquippedItems.hands"
          @click="handleUnequip('hands')"
        />
        <EquipmentSlot
          slot-name="feet"
          :item="blueprintStore.activeEquippedItems.feet"
          @click="handleUnequip('feet')"
        />
        <EquipmentSlot
          slot-name="ring"
          :item="blueprintStore.activeEquippedItems.ring"
          @click="handleUnequip('ring')"
        />
      </div>
    </div>

    <!-- NOTE: The spellbook section can also be driven by the store later -->
    <div class="mt-3 w-full">
      <p class="text-zinc-400 text-xs text-center mb-1">Spellbook</p>
      <div class="flex items-center justify-center gap-x-1">
        <button
          v-for="spellbook in SPELLBOOKS_DATA"
          :key="spellbook.id"
          class="p-1 rounded-full"
          :class="{
            'bg-amber-400/30': blueprintStore.activeSpellbook === spellbook.id,
            'hover:bg-amber-400/10': blueprintStore.activeSpellbook !== spellbook.id,
          }"
          @click="blueprintStore.setSpellbook(spellbook.id)"
        >
          <img :src="spellbook.imageUrl" alt="" />
        </button>
      </div>
    </div>
  </div>
</template>
