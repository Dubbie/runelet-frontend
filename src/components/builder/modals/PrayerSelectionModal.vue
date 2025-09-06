<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PRAYERS_DATA } from '@/constants/prayers'

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
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-white">
                Select Prayers
              </DialogTitle>
              <div class="mt-4 grid grid-cols-5 gap-2">
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

              <div class="mt-6 flex justify-end gap-x-2">
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
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
