<script setup lang="ts">
import { provide, ref, toRef } from 'vue'
import { useBlueprint } from '@/composables/useBlueprint'
import { blueprintKey } from '@/composables/keys'
import type { Blueprint, Item } from '@/interfaces'

// --- Child Components ---
import LoadoutDetails from '@/components/builder/LoadoutDetails.vue'
import PlayerInventory from '@/components/builder/PlayerInventory.vue'
import PlayerEquipment from '@/components/builder/PlayerEquipment.vue'
import TabBar from '@/components/ui/tabs/TabBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal.vue'
import RunePouchModal from '@/components/builder/modals/RunePouchModal.vue'
import { IconPlus } from '@tabler/icons-vue'

// --- Component API ---
const props = defineProps<{
  modelValue: Blueprint
  editable?: boolean
}>()

// --- Instantiate the Composable "Engine" ---
const blueprintProp = toRef(props, 'modelValue')
const blueprintApi = useBlueprint(blueprintProp)
provide(blueprintKey, blueprintApi)

const {
  blueprint,
  activeLoadoutId,
  loadoutTabs,
  addLoadout,
  removeLoadout,
  renameLoadout,
  updateRunePouch,
  setActiveLoadout,
} = blueprintApi

// --- Local UI State for Modals ---
const isConfirmationModalOpen = ref(false)
const loadoutIdToDelete = ref<string | null>(null)
const isRunePouchModalOpen = ref(false)
const editingPouch = ref<Item | null>(null)
const editingPouchIndex = ref<number | null>(null)

// --- Modal Handlers ---
const handleRequestDelete = (id: string) => {
  loadoutIdToDelete.value = id
  isConfirmationModalOpen.value = true
}

const handleConfirmDelete = () => {
  if (loadoutIdToDelete.value) {
    removeLoadout(loadoutIdToDelete.value)
  }
  isConfirmationModalOpen.value = false
  loadoutIdToDelete.value = null
}

const handleOpenRunePouchModal = (payload: { item: Item; index: number }) => {
  editingPouch.value = payload.item
  editingPouchIndex.value = payload.index
  isRunePouchModalOpen.value = true
}

const handleSaveRunePouch = (payload: { runes: (Item | null)[]; index: number }) => {
  updateRunePouch(payload.index, payload.runes) // Call the composable's action
  isRunePouchModalOpen.value = false // Close the modal
}
</script>

<template>
  <div>
    <TabBar
      v-if="activeLoadoutId"
      class="mb-3"
      :tabs="loadoutTabs"
      :active-tab-id="activeLoadoutId"
      :editable="props.editable"
      :show-delete="blueprint.loadouts.length > 1 && props.editable"
      @update:active-tab-id="setActiveLoadout"
      @delete="handleRequestDelete"
      @rename="({ id, newName }) => renameLoadout(id, newName)"
    >
      <template #actions>
        <BaseButton v-if="props.editable" color="zinc" plain @click="() => addLoadout()">
          <template #icon><IconPlus class="size-4" stroke-width="3" /></template>
          New Loadout
        </BaseButton>
      </template>
    </TabBar>

    <div v-if="activeLoadoutId" class="flex gap-x-3">
      <PlayerEquipment :editable="props.editable" />
      <PlayerInventory :editable="props.editable" @open-rune-pouch="handleOpenRunePouchModal" />
      <LoadoutDetails :editable="props.editable" />
    </div>
    <div v-else class="text-center py-10 text-zinc-500">
      <p>No loadouts exist. Click "New Loadout" to get started.</p>
    </div>

    <!-- Modals -->
    <ConfirmationModal
      :isOpen="isConfirmationModalOpen"
      title="Delete Loadout"
      message="Are you sure you want to delete this loadout? This action cannot be undone."
      @close="isConfirmationModalOpen = false"
      @confirm="handleConfirmDelete"
    />

    <RunePouchModal
      :is-open="isRunePouchModalOpen"
      :pouch="editingPouch"
      :inventory-index="editingPouchIndex"
      @close="isRunePouchModalOpen = false"
      @save="handleSaveRunePouch"
    />
  </div>
</template>
