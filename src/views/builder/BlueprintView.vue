<script setup lang="ts">
import { ref } from 'vue'
import BlueprintEditor from '@/views/builder/BlueprintEditor.vue'
import BlueprintPreview from '@/views/builder/BlueprintPreview.vue'
import { useBlueprintStore } from '@/stores/blueprint'

// Import the UI components needed for the header
import BaseButton from '@/components/ui/BaseButton.vue'
import InlineInput from '@/components/ui/InlineInput.vue'
import { IconLink, IconPencil } from '@tabler/icons-vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'

const mode = ref<'customize' | 'preview'>('customize')

const modeOptions = [
  { value: 'preview', label: 'Preview' },
  { value: 'customize', label: 'Customize' },
]

// The store is still the single source of truth for the STANDALONE page.
const blueprintStore = useBlueprintStore()

// The title editing logic remains the same, as it's part of this view's UI.
const isEditingTitle = ref(false)
const editingTitleValue = ref('')

const startEditingTitle = () => {
  if (mode.value !== 'customize') return
  editingTitleValue.value = blueprintStore.blueprint.title
  isEditingTitle.value = true
}

const handleTitleSave = () => {
  blueprintStore.setBlueprintTitle(editingTitleValue.value)
  isEditingTitle.value = false
}

const handleTitleCancel = () => {
  isEditingTitle.value = false
}
</script>

<template>
  <div class="bg-zinc-950 min-h-screen text-zinc-100 py-12">
    <div class="max-w-5xl mx-auto px-4">
      <div class="mb-3 flex items-center justify-between gap-x-6">
        <!-- Title Section -->
        <div class="flex-1">
          <div v-if="isEditingTitle" class="flex h-15 items-center">
            <InlineInput
              v-model="editingTitleValue"
              size="lg"
              autofocus
              @keyup.enter="handleTitleSave"
              @keyup.esc="handleTitleCancel"
              @blur="handleTitleSave"
            />
          </div>
          <div
            v-else
            class="group flex h-15 cursor-pointer items-center"
            @click="startEditingTitle"
          >
            <div
              class="border-b-3 border-transparent px-2 text-3xl font-bold"
              :class="{ 'text-white/50': !blueprintStore.blueprint.title }"
            >
              {{ blueprintStore.blueprint.title || 'Untitled Blueprint' }}
            </div>
            <!-- 3. Update the v-if for the pencil icon -->
            <div
              v-if="mode === 'customize'"
              class="rounded-lg bg-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <IconPencil class="size-6 text-zinc-400" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-x-4">
          <!-- 4. Replace the old switch with the new segmented control -->
          <SegmentedControl v-model="mode" :options="modeOptions" />

          <BaseButton color="white">
            <template #icon><IconLink class="size-4" /></template>
            Share
          </BaseButton>
        </div>
      </div>

      <!-- Transitioning Content Area -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
        mode="out-in"
      >
        <!-- 5. Update the main v-if to check the mode value -->
        <BlueprintEditor
          v-if="mode === 'customize'"
          :editable="true"
          v-model="blueprintStore.blueprint"
        />
        <BlueprintPreview v-else />
      </transition>
    </div>
  </div>
</template>
