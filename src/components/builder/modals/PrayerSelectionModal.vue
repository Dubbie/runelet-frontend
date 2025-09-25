<script setup lang="ts">
import { ref, watch } from 'vue'
import { PRAYERS_DATA } from '@/constants/prayers'
import BaseModal from '@/components/ui/modals/BaseModal.vue'

interface Props {
  isOpen: boolean
  initialSelection: string[]
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', newSelection: string[]): void
}>()

// Local state to manage selections within the modal
const selectedPrayers = ref<string[]>([])

// When the modal opens, sync its state with the initial selection
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      selectedPrayers.value = [...props.initialSelection]
    }
  },
)

function isSelected(prayerId: string) {
  return selectedPrayers.value.includes(prayerId)
}

function togglePrayer(prayerId: string) {
  const index = selectedPrayers.value.indexOf(prayerId)
  if (index === -1) {
    selectedPrayers.value.push(prayerId)
  } else {
    selectedPrayers.value.splice(index, 1)
  }
}

function handleSave() {
  emit('save', selectedPrayers.value)
  emit('close')
}
</script>

<template>
  <BaseModal :isOpen="isOpen" @close="emit('close')">
    <template #title> Select Prayers </template>

    <template #body>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="prayer in PRAYERS_DATA"
          :key="prayer.id"
          @click="togglePrayer(prayer.id)"
          class="p-2 rounded-lg transition-colors"
          :class="
            isSelected(prayer.id)
              ? 'bg-yellow-500/30 ring-2 ring-yellow-500'
              : 'bg-zinc-800 hover:bg-zinc-700'
          "
        >
          <img :src="prayer.imageUrl" :alt="prayer.name" class="w-8 h-8 mx-auto" />
        </button>
      </div>
    </template>

    <template #footer>
      <button
        type="button"
        @click="emit('close')"
        class="inline-flex justify-center rounded-md border border-transparent bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="handleSave"
        class="inline-flex justify-center rounded-md border border-transparent bg-yellow-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-yellow-400"
      >
        Save Changes
      </button>
    </template>
  </BaseModal>
</template>
