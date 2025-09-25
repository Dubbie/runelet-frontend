<script setup lang="ts">
import { ref, watch } from 'vue'
import { PRAYERS_DATA } from '@/constants/prayers'
import BaseModal from '@/components/ui/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

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
      <div class="grid grid-cols-3 gap-2">
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
          <img :src="prayer.imageUrl" :alt="prayer.name" class="w-7 mx-auto" />
        </button>
      </div>
    </template>

    <template #footer>
      <BaseButton plain @click="emit('close')"> Cancel </BaseButton>
      <BaseButton color="white" @click="handleSave"> Save changes </BaseButton>
    </template>
  </BaseModal>
</template>
