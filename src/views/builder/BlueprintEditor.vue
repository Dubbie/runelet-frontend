<script setup lang="ts">
import LoadoutDetails from '@/components/builder/LoadoutDetails.vue'
import RunePouchModal from '@/components/builder/modals/RunePouchModal.vue'
import PlayerEquipment from '@/components/builder/PlayerEquipment.vue'
import PlayerInventory from '@/components/builder/PlayerInventory.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal.vue'
import TabBar, { type Tab } from '@/components/ui/tabs/TabBar.vue'
import type { Item } from '@/interfaces'
import { useBlueprintStore } from '@/stores/blueprint'
import { IconPlus } from '@tabler/icons-vue'
import { computed, ref } from 'vue'

// --- Pinia Store Integration ---
const blueprintStore = useBlueprintStore()

// -- Confirmation
const isConfirmationModalOpen = ref(false)
const loadoutIdToDelete = ref<string | null>(null)

// -- Rune Pouch
const isRunePouchModalOpen = ref(false)
const editingPouch = ref<Item | null>(null) // To store the pouch being edited
const editingPouchIndex = ref<number | null>(null) // To store its inventory index

// --- TabBar Data Transformation ---
const loadoutTabs = computed<Tab[]>(() => {
  return blueprintStore.blueprint.loadouts.map((loadout) => ({
    id: loadout.id,
    label: loadout.name,
  }))
})

const handleRemoveLoadout = (id: string) => {
  loadoutIdToDelete.value = id
  isConfirmationModalOpen.value = true
}

const confirmDelete = () => {
  if (loadoutIdToDelete.value) {
    blueprintStore.removeLoadout(loadoutIdToDelete.value)
  }
  closeModal()
}

const closeModal = () => {
  isConfirmationModalOpen.value = false
  loadoutIdToDelete.value = null
}

const handleRenameLoadout = (payload: { id: string; newName: string }) => {
  blueprintStore.renameLoadout(payload.id, payload.newName)
}

// --- Rune Pouch Modal handlers ---
function handleOpenRunePouchModal(payload: { item: Item; index: number }) {
  editingPouch.value = payload.item
  editingPouchIndex.value = payload.index
  isRunePouchModalOpen.value = true
}

function handleSaveRunePouch(payload: { runes: (Item | null)[]; index: number }) {
  blueprintStore.updateRunePouch(payload.index, payload.runes)
  requestRunePouchModalClose()
}

function requestRunePouchModalClose() {
  isRunePouchModalOpen.value = false
}

function cleanupRunePouchModalState() {
  editingPouch.value = null
  editingPouchIndex.value = null
}
</script>

<template>
  <div>
    <!-- Blueprint Description (Two-way bound to the store) -->
    <div class="mb-3">
      <BaseTextarea
        v-model="blueprintStore.blueprint.description"
        placeholder="Write an overview of the strategies, requirements, and tips..."
        class="h-24"
      />
    </div>

    <!-- ======================================== -->
    <!-- === LOADOUTS (TABS & LOCAL DETAILS) === -->
    <!-- ======================================== -->
    <TabBar
      v-if="blueprintStore.activeLoadoutId"
      class="mb-3"
      :tabs="loadoutTabs"
      :active-tab-id="blueprintStore.activeLoadoutId"
      :editable="true"
      :show-delete="blueprintStore.blueprint.loadouts.length > 1"
      @update:active-tab-id="blueprintStore.setActiveLoadout"
      @delete="handleRemoveLoadout"
      @rename="handleRenameLoadout"
    >
      <template #actions>
        <BaseButton color="zinc" plain @click="blueprintStore.addLoadout('New Loadout')">
          <template #icon><IconPlus class="size-4" stroke-width="3" /></template>
          New Loadout
        </BaseButton>
      </template>
    </TabBar>

    <div v-if="blueprintStore.activeLoadout" class="flex gap-x-3">
      <PlayerEquipment :editable="true" />
      <PlayerInventory :editable="true" @open-rune-pouch="handleOpenRunePouchModal" />
      <LoadoutDetails :editable="true" />
    </div>
    <div v-else class="text-center py-10 text-zinc-500">
      <p>No loadouts exist. Click "New Loadout" to get started.</p>
    </div>

    <ConfirmationModal
      :isOpen="isConfirmationModalOpen"
      title="Delete Loadout"
      message="Are you sure you want to delete this loadout? This action cannot be undone."
      @close="closeModal"
      @confirm="confirmDelete"
    />

    <RunePouchModal
      :is-open="isRunePouchModalOpen"
      :pouch="editingPouch"
      :inventory-index="editingPouchIndex"
      @close="requestRunePouchModalClose"
      @save="handleSaveRunePouch"
      @after-leave="cleanupRunePouchModalState"
    />
  </div>
</template>
