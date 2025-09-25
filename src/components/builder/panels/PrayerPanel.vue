<script setup lang="ts">
import { ref } from 'vue'
import { useBlueprintStore } from '@/stores/blueprint'
import type { PrayerPreset } from '@/stores/blueprint'
import { PRAYERS_MAP } from '@/constants/prayers'
import PrayerSelectionModal from '@/components/builder/modals/PrayerSelectionModal.vue'
import { IconPencil, IconPlus, IconX } from '@tabler/icons-vue'
import InlineInput from '@/components/ui/InlineInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal.vue'

defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

const blueprintStore = useBlueprintStore()

// --- Prayer Selection Modal State ---
const isSelectionModalOpen = ref(false)
const presetToEdit = ref<PrayerPreset | null>(null)

// --- 2. ADD STATE for the Deletion Confirmation Modal ---
const isDeleteModalOpen = ref(false)
const presetIdToDelete = ref<string | null>(null)

// --- Prayer Selection Modal Handlers ---
function openSelectionModal(preset: PrayerPreset) {
  presetToEdit.value = preset
  isSelectionModalOpen.value = true
}

function closeSelectionModal() {
  isSelectionModalOpen.value = false
  presetToEdit.value = null // Cleanup can be simple here if no animation jump is noticed
}

function handleSaveChanges(newSelection: string[]) {
  if (presetToEdit.value) {
    blueprintStore.updatePrayerPreset(presetToEdit.value.id, {
      prayers: newSelection,
    })
  }
}

// --- Preset Actions ---
function handleAddPreset() {
  blueprintStore.addPrayerPreset('New Preset')
}

// 3. REFACTOR the delete handler to open the modal instead of showing an alert
function handleDeletePreset(id: string) {
  presetIdToDelete.value = id // Store the ID of the preset we want to delete
  isDeleteModalOpen.value = true // Open the confirmation modal
}

function handleRenamePreset(preset: PrayerPreset, event: Event) {
  const newName = (event.target as HTMLInputElement).value
  if (newName.trim()) {
    blueprintStore.updatePrayerPreset(preset.id, { name: newName })
  }
}

// 4. ADD HANDLERS for the Deletion Modal's lifecycle
function confirmDeletePreset() {
  if (presetIdToDelete.value) {
    blueprintStore.removePrayerPreset(presetIdToDelete.value)
  }
  requestDeleteModalClose() // Request to close the modal after action is performed
}

function requestDeleteModalClose() {
  isDeleteModalOpen.value = false
}

function cleanupDeleteModalState() {
  presetIdToDelete.value = null
}
</script>

<template>
  <div class="pt-2 px-1 flex flex-col h-64">
    <!-- List of Presets -->
    <div class="flex-1 overflow-y-auto pr-1 space-y-2">
      <!-- Empty State -->
      <div
        v-if="!blueprintStore.activePrayerPresets?.length"
        class="h-full flex flex-col items-center justify-center text-xs text-zinc-500"
      >
        <template v-if="editable">
          <p>No prayer presets created.</p>
          <p>Click "Add New Preset" to start.</p>
        </template>
        <template v-else>
          <p>No prayer presets set up.</p>
        </template>
      </div>

      <!-- Preset Items -->
      <div
        v-for="preset in blueprintStore.activePrayerPresets"
        :key="preset.id"
        class="bg-white/5 p-2 rounded-lg"
      >
        <div class="flex items-center justify-between gap-x-2">
          <InlineInput
            :model-value="preset.name"
            size="sm"
            variant="ghost"
            :readonly="!editable"
            @change="editable ? handleRenamePreset(preset, $event) : null"
            :class="{ 'cursor-default': !editable }"
          />
          <div v-if="editable" class="flex items-center gap-x-1">
            <button
              @click="openSelectionModal(preset)"
              class="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
            >
              <IconPencil class="size-4" />
            </button>
            <button
              @click="handleDeletePreset(preset.id)"
              class="p-1 text-red-400 hover:text-white rounded hover:bg-red-500/50"
            >
              <IconX class="size-4" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-x-3 mt-2 pl-1">
          <div v-if="!preset.prayers.length" class="text-xs text-zinc-500 italic">
            No prayers selected
          </div>
          <img
            v-for="prayerId in preset.prayers"
            :key="prayerId"
            :src="PRAYERS_MAP.get(prayerId)?.imageUrl"
            :alt="PRAYERS_MAP.get(prayerId)?.name"
          />
        </div>
      </div>
    </div>

    <!-- Hide the "Add" button when not editable -->
    <div v-if="editable" class="pt-2">
      <BaseButton class="w-full" @click="handleAddPreset">
        <template #icon><IconPlus class="size-4" stroke-width="3" /></template>
        Add New Preset
      </BaseButton>
    </div>

    <PrayerSelectionModal
      :is-open="isSelectionModalOpen"
      :initial-selection="presetToEdit?.prayers ?? []"
      @close="closeSelectionModal"
      @save="handleSaveChanges"
    />

    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete Preset"
      message="Are you sure you want to delete this prayer preset? This action cannot be undone."
      @close="requestDeleteModalClose"
      @confirm="confirmDeletePreset"
      @after-leave="cleanupDeleteModalState"
    />
  </div>
</template>
