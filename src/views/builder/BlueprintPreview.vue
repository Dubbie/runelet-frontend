<script setup lang="ts">
import { useBlueprintStore } from '@/stores/blueprint'
import { computed } from 'vue'
import PlayerEquipment from '@/components/builder/PlayerEquipment.vue'
import PlayerInventory from '@/components/builder/PlayerInventory.vue'
import LoadoutDetails from '@/components/builder/LoadoutDetails.vue'
import TabBar, { type Tab } from '@/components/ui/tabs/TabBar.vue'

const blueprintStore = useBlueprintStore()

const loadoutTabs = computed<Tab[]>(() => {
  return blueprintStore.blueprint.loadouts.map((loadout) => ({
    id: loadout.id,
    label: loadout.name,
  }))
})
</script>

<template>
  <div>
    <!-- The header has been removed from here -->

    <div class="mb-3">
      <div
        v-if="blueprintStore.blueprint.description"
        class="prose prose-zinc prose-invert text-sm max-w-none bg-white/5 px-3 py-2.5 rounded-md"
      >
        <p>{{ blueprintStore.blueprint.description }}</p>
      </div>
    </div>

    <!-- ==================== -->
    <!-- === LOADOUT VIEW === -->
    <!-- ==================== -->
    <div v-if="blueprintStore.activeLoadoutId">
      <TabBar
        class="mb-3"
        :tabs="loadoutTabs"
        :show-edit="false"
        :active-tab-id="blueprintStore.activeLoadoutId"
        @update:active-tab-id="blueprintStore.setActiveLoadout"
      />

      <div v-if="blueprintStore.activeLoadout" class="flex gap-x-3">
        <PlayerEquipment :editable="false" />
        <PlayerInventory :editable="false" />
        <LoadoutDetails :editable="false" />
      </div>
    </div>

    <div v-else class="text-center py-10 text-zinc-500">
      <p>There are no loadouts in this blueprint yet.</p>
      <p>Switch to "Customize" mode to create one.</p>
    </div>
  </div>
</template>
