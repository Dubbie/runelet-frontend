<script setup lang="ts">
import { ref, inject } from 'vue'
import { blueprintKey } from '@/composables/keys'
import type { PrayerPreset } from '@/interfaces'
import { PRAYERS_MAP } from '@/constants/prayers'

// --- Child Components ---
import PrayerSelectionModal from '@/components/builder/modals/PrayerSelectionModal.vue'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal.vue'
import InlineInput from '@/components/ui/InlineInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { IconPencil, IconPlus, IconX } from '@tabler/icons-vue'

// --- Component API ---
defineProps<{
  editable: boolean
}>()

const blueprintApi = inject(blueprintKey)
if (!blueprintApi) {
  throw new Error('Blueprint API not provided. Is PrayerPanel a child of BlueprintEditor?')
}

const { activePrayerPresets, addPrayerPreset, removePrayerPreset, updatePrayerPreset } =
  blueprintApi

// --- Local UI State for Modals ---
const isSelectionModalOpen = ref(false)
const presetToEdit = ref<PrayerPreset | null>(null)
const isDeleteModalOpen = ref(false)
const presetIdToDelete = ref<string | null>(null)

// --- Modal Handlers ---
function openSelectionModal(preset: PrayerPreset) {
  presetToEdit.value = preset
  isSelectionModalOpen.value = true
}

function closeSelectionModal() {
  isSelectionModalOpen.value = false
  presetToEdit.value = null
}

function handleRequestDelete(id: string) {
  presetIdToDelete.value = id
  isDeleteModalOpen.value = true
}

function handleSaveChanges(newSelection: string[]) {
  if (presetToEdit.value) {
    updatePrayerPreset(presetToEdit.value.id, { prayers: newSelection })
  }
}

function handleRenamePreset(presetId: string, event: Event) {
  const newName = (event.target as HTMLInputElement).value
  if (newName.trim()) {
    updatePrayerPreset(presetId, { name: newName })
  }
}

function confirmDeletePreset() {
  if (presetIdToDelete.value) {
    removePrayerPreset(presetIdToDelete.value)
  }
  isDeleteModalOpen.value = false // Close and clean up
  presetIdToDelete.value = null
}
</script>

<template>
  <div class="pt-2 px-1 flex flex-col h-64">
    <div class="flex-1 overflow-y-auto pr-1 space-y-2">
      <div
        v-if="!activePrayerPresets?.length"
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

      <div v-for="preset in activePrayerPresets" :key="preset.id" class="bg-white/5 p-2 rounded-lg">
        <div class="flex items-center justify-between gap-x-2">
          <InlineInput
            :model-value="preset.name"
            size="sm"
            variant="ghost"
            :readonly="!editable"
            @change="editable ? handleRenamePreset(preset.id, $event) : null"
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
              @click="handleRequestDelete(preset.id)"
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

    <div v-if="editable" class="pt-2">
      <BaseButton class="w-full" @click="addPrayerPreset()">
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
      message="Are you sure you want to delete this prayer preset?"
      @close="isDeleteModalOpen = false"
      @confirm="confirmDeletePreset"
    />
  </div>
</template>
