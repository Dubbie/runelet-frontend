<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Item } from '@/interfaces' // Adjust path if needed
import { IconX } from '@tabler/icons-vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/modals/BaseModal.vue'
import { itemApiService } from '@/api/itemApiService'

// --- Component Interface ---
interface Props {
  isOpen: boolean
  pouch: Item | null // The pouch item being edited
  inventoryIndex: number | null // Its location in the inventory
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { runes: (Item | null)[]; index: number }): void
}>()

// --- State ---
const localRunes = ref<(Item | null)[]>([])
const availableRunes = ref<Item[]>([])
const isLoadingRunes = ref(false)
const fetchError = ref<string | null>(null)

async function fetchAvailableRunes() {
  if (availableRunes.value.length > 0) {
    return
  }

  isLoadingRunes.value = true
  fetchError.value = null
  try {
    const runes = await itemApiService.getRunes()
    availableRunes.value = runes
  } catch (error) {
    console.error('Error fetching runes:', error)
    fetchError.value = 'Could not load available runes. Please try again.'
  } finally {
    isLoadingRunes.value = false
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Fetch the rune list from the backend
      fetchAvailableRunes()

      // The rest of the logic for setting up the local state remains the same
      if (props.pouch && props.pouch.rune_pouch_slots) {
        const initialRunes = JSON.parse(JSON.stringify(props.pouch.stored_runes || []))
        localRunes.value = Array(props.pouch.rune_pouch_slots)
          .fill(null)
          .map((_, i) => initialRunes[i] || null)
      }
    }
  },
)

function addRune(rune: Item) {
  // Don't add a rune if it's already in the pouch
  if (localRunes.value.some((r) => r?.item_id === rune.item_id)) {
    return
  }
  const emptySlotIndex = localRunes.value.findIndex((r) => r === null)
  if (emptySlotIndex !== -1) {
    localRunes.value[emptySlotIndex] = rune
  }
}

function removeRune(index: number) {
  localRunes.value[index] = null
}

function handleSave() {
  if (props.inventoryIndex === null) return
  emit('save', { runes: localRunes.value, index: props.inventoryIndex })
  emit('close')
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <template #title>
      {{ pouch?.name || 'Rune Pouch' }}
    </template>

    <template #body>
      <div class="grid grid-cols-2 gap-4">
        <!-- Left Side: Pouch Contents -->
        <div>
          <h4 class="mb-2 text-sm font-medium text-zinc-300">Pouch Contents</h4>
          <div class="grid grid-cols-2 gap-1 bg-zinc-800 p-2 rounded-lg">
            <div
              v-for="(_, index) in pouch?.rune_pouch_slots"
              :key="index"
              class="group relative size-12 rounded-md bg-white/5 flex items-center justify-center"
            >
              <img
                v-if="localRunes[index]"
                :src="localRunes[index]?.image_url!"
                :alt="localRunes[index]?.name"
                class="size-8"
              />
              <button
                v-if="localRunes[index]"
                @click="removeRune(index)"
                class="absolute -right-1 -top-1 z-10 flex items-center justify-center rounded-full bg-zinc-700 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
              >
                <IconX class="size-3" stroke-width="3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Available Runes -->
        <div>
          <h4 class="mb-2 text-sm font-medium text-zinc-300">Available Runes</h4>
          <div class="grid grid-cols-4 gap-1 bg-zinc-800 p-2 rounded-lg max-h-48 overflow-y-auto">
            <button
              v-for="rune in availableRunes"
              :key="rune.item_id"
              @click="addRune(rune)"
              class="p-1 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              :disabled="localRunes.some((r) => r?.item_id === rune.item_id)"
            >
              <img :src="rune.image_url!" :alt="rune.name" class="size-8 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton plain @click="emit('close')"> Cancel </BaseButton>
      <BaseButton @click="handleSave"> Save </BaseButton>
    </template>
  </BaseModal>
</template>
