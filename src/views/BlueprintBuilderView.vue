<script setup lang="ts">
import LoadoutDetails from '@/components/builder/LoadoutDetails.vue'
import PlayerEquipment from '@/components/builder/PlayerEquipment.vue'
import PlayerInventory from '@/components/builder/PlayerInventory.vue'
import TabBar, { type Tab } from '@/components/ui/tabs/TabBar.vue'
import { useBlueprintStore } from '@/stores/blueprint'
import { IconEdit, IconEye, IconLink, IconPencil, IconPlus } from '@tabler/icons-vue'
import { computed, nextTick, ref } from 'vue'

// --- Pinia Store Integration ---
const blueprintStore = useBlueprintStore()

const isCustomizingLoadout = ref(true)

// --- Blueprint Title Editing Logic ---
const isEditingTitle = ref(false)
const editingTitleValue = ref('') // Temporary state for the input field
const titleInputRef = ref<HTMLInputElement | null>(null)

const startEditingTitle = () => {
  // Load the current title from the store into the editing state
  editingTitleValue.value = blueprintStore.blueprint.title
  isEditingTitle.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

const handleTitleSave = () => {
  // Commit the change to the store
  blueprintStore.setBlueprintTitle(editingTitleValue.value)
  isEditingTitle.value = false
}

const handleTitleCancel = () => {
  isEditingTitle.value = false
}

// --- TabBar Data Transformation ---
// We use a computed property to create the array the TabBar component expects.
// This will automatically update whenever the loadouts in the store change.
const loadoutTabs = computed<Tab[]>(() => {
  return blueprintStore.blueprint.loadouts.map((loadout) => ({
    id: loadout.id,
    label: loadout.name,
  }))
})

const handleRemoveLoadout = (id: string) => {
  if (window.confirm('Are you sure you want to delete this loadout?')) {
    blueprintStore.removeLoadout(id)
  }
}

const handleRenameLoadout = (payload: { id: string; newName: string }) => {
  blueprintStore.renameLoadout(payload.id, payload.newName)
}
</script>

<template>
  <div class="bg-zinc-950 min-h-screen text-zinc-100 py-12">
    <div class="max-w-5xl mx-auto px-4">
      <div v-if="isCustomizingLoadout">
        <!-- ================================== -->
        <!-- === BLUEPRINT DETAILS (GLOBAL) === -->
        <!-- ================================== -->
        <div class="mb-3">
          <!-- Blueprint Title Display/Edit -->
          <div class="flex mb-3 items-center justify-between gap-x-6">
            <div class="flex-1">
              <!-- EDITING STATE: Just the input field -->
              <div v-if="isEditingTitle" class="flex items-center h-15">
                <input
                  type="text"
                  ref="titleInputRef"
                  v-model="editingTitleValue"
                  @keyup.enter="handleTitleSave"
                  @keyup.esc="handleTitleCancel"
                  @blur="handleTitleSave"
                  class="w-full text-3xl font-bold text-white p-2 rounded-md bg-white/10 border-2 border-transparent focus:outline-none focus:border-yellow-500"
                />
              </div>

              <!-- NORMAL STATE: Title and a single edit button -->
              <div v-else class="flex items-center h-15 group">
                <div
                  class="text-3xl font-bold border-b-3 px-2 border-transparent"
                  :class="{ 'text-white/50': !blueprintStore.blueprint.title }"
                >
                  {{ blueprintStore.blueprint.title || 'Untitled Blueprint' }}
                </div>
                <button
                  class="rounded-lg p-2 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="startEditingTitle"
                >
                  <IconPencil class="size-6 text-zinc-400 hover:text-white" />
                </button>
              </div>
            </div>

            <div class="flex items-center gap-x-3">
              <button
                class="inline-flex gap-x-2 items-center rounded-lg px-2.5 py-1.5 bg-white text-black text-sm font-semibold"
                @click="isCustomizingLoadout = false"
              >
                <IconEye class="size-4" />
                <span>Preview</span>
              </button>
              <button
                class="inline-flex gap-x-2 items-center rounded-lg px-2.5 py-1.5 bg-white text-black text-sm font-semibold"
              >
                <IconLink class="size-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <!-- Blueprint Description (Two-way bound to the store) -->
          <textarea
            v-model="blueprintStore.blueprint.description"
            placeholder="Write an overview of the strategies, requirements, and tips..."
            class="w-full h-24 bg-white/5 px-2.5 py-1.5 text-sm rounded-md ring-0 border resize-none ring-white/15 border-white/15 focus:border-white/30 focus:outline-none focus:ring-2 transition-all"
          ></textarea>
        </div>

        <!-- ======================================== -->
        <!-- === LOADOUTS (TABS & LOCAL DETAILS) === -->
        <!-- ======================================== -->

        <!-- 1. Tab Bar for switching/adding/removing loadouts -->
        <TabBar
          v-if="blueprintStore.activeLoadoutId"
          class="mb-3"
          :tabs="loadoutTabs"
          :active-tab-id="blueprintStore.activeLoadoutId"
          :show-edit="true"
          :show-delete="blueprintStore.blueprint.loadouts.length > 1"
          @update:active-tab-id="blueprintStore.setActiveLoadout"
          @delete="handleRemoveLoadout"
          @rename="handleRenameLoadout"
        >
          <template #actions>
            <button
              @click="blueprintStore.addLoadout('New Loadout')"
              class="inline-flex items-center text-sm gap-x-2 px-2 py-1 text-zinc-400 font-semibold rounded-md hover:text-white"
            >
              <IconPlus class="size-4" stroke-width="3" />
              <span>New Loadout</span>
            </button>
          </template>
        </TabBar>

        <!-- 2. Loadout-specific details (only renders if a loadout is active) -->
        <div v-if="blueprintStore.activeLoadout" class="flex gap-x-3">
          <PlayerEquipment />
          <PlayerInventory />
          <LoadoutDetails />
        </div>
        <div v-else class="text-center py-10 text-zinc-500">
          <p>No loadouts exist. Click "New Loadout" to get started.</p>
        </div>
      </div>

      <!-- Preview -->
      <div v-else>
        <div class="mb-3">
          <div class="h-15 flex justify-between items-center">
            <p class="text-3xl font-bold border-b-3 px-2 border-transparent">
              {{ blueprintStore.blueprint.title }}
            </p>

            <div class="flex items-center gap-x-3">
              <button
                class="inline-flex gap-x-2 items-center rounded-lg px-2.5 py-1.5 bg-white text-black text-sm font-semibold"
                @click="isCustomizingLoadout = true"
              >
                <IconEdit class="size-4" />
                <span>Customize</span>
              </button>
              <button
                class="inline-flex gap-x-2 items-center rounded-lg px-2.5 py-1.5 bg-white text-black text-sm font-semibold"
              >
                <IconLink class="size-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div v-if="blueprintStore.blueprint.description" class="flex gap-x-3">
            <p>{{ blueprintStore.blueprint.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
