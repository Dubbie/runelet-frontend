<script setup lang="ts">
import LoadoutDetails from '@/components/builder/LoadoutDetails.vue'
import PlayerEquipment from '@/components/builder/PlayerEquipment.vue'
import PlayerInventory from '@/components/builder/PlayerInventory.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal.vue'
import TabBar, { type Tab } from '@/components/ui/tabs/TabBar.vue'
import { useBlueprintStore } from '@/stores/blueprint'
import { IconPlus } from '@tabler/icons-vue'
import { computed, ref } from 'vue'

// --- Pinia Store Integration ---
const blueprintStore = useBlueprintStore()

// -- Confirmation
const isConfirmationModalOpen = ref(false)
const loadoutIdToDelete = ref<string | null>(null)

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
</script>

<template>
  <div>
    <!-- The header has been removed from here -->

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
      <PlayerInventory :editable="true" />
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
  </div>
</template>
