<script setup lang="ts">
import { ref } from 'vue'
import { useBlueprintStore } from '@/stores/blueprint'
import type { PrayerPreset } from '@/stores/blueprint'
import { PRAYERS_MAP } from '@/constants/prayers'
import PrayerSelectionModal from '@/components/builder/modals/PrayerSelectionModal.vue'
import { IconPencil, IconPlus, IconX } from '@tabler/icons-vue'
import InlineInput from '@/components/ui/InlineInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

const blueprintStore = useBlueprintStore()

// --- Modal State ---
const isModalOpen = ref(false)
const presetToEdit = ref<PrayerPreset | null>(null)

function openModal(preset: PrayerPreset) {
  presetToEdit.value = preset
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  presetToEdit.value = null
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

function handleDeletePreset(id: string) {
  if (window.confirm('Are you sure you want to delete this preset?')) {
    blueprintStore.removePrayerPreset(id)
  }
}

function handleRenamePreset(preset: PrayerPreset, event: Event) {
  const newName = (event.target as HTMLInputElement).value
  if (newName.trim()) {
    blueprintStore.updatePrayerPreset(preset.id, { name: newName })
  }
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
        <div class="flex items-center justify-between">
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
              @click="openModal(preset)"
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
      :is-open="isModalOpen"
      :initial-selection="presetToEdit?.prayers ?? []"
      @close="closeModal"
      @save="handleSaveChanges"
    />
  </div>
</template>
