<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUpdate } from 'vue'
import { useBlueprintStore } from '@/stores/blueprint'
import type { Item } from '@/interfaces'
import { itemApiService } from '@/api/itemApiService'
import { IconSearch, IconX } from '@tabler/icons-vue'

const blueprintStore = useBlueprintStore()

const searchTerm = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchResults = ref<Item[]>([])
const isLoading = ref(false)
const highlightedIndex = ref(-1)
let debounceTimer: number | undefined

const resultRefs = ref<HTMLLIElement[]>([])
const isKeyboardNavigating = ref(false)

onBeforeUpdate(() => {
  resultRefs.value = []
})

// --- API & Debouncing ---
async function searchItems(term: string) {
  try {
    const apiResponse = await itemApiService.getItems(1, term)
    searchResults.value = apiResponse.data

    if (searchResults.value.length > 0) {
      highlightedIndex.value = 0
    }
  } catch (error) {
    console.error('Failed to search for items:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

watch(searchTerm, (newTerm) => {
  clearTimeout(debounceTimer)
  highlightedIndex.value = -1

  if (newTerm.length < 2) {
    searchResults.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true
  debounceTimer = setTimeout(() => {
    searchItems(newTerm)
  }, 300)
})

function handleItemSelection(item: Item) {
  if (!item) return

  const currentSearch = searchTerm.value

  if (item.equipment_stats) {
    blueprintStore.equipItem(item)
    searchTerm.value = ''
    searchResults.value = []
  } else {
    const success = blueprintStore.addItemToInventory(item)
    if (!success) {
      alert('Your inventory is full.')
    }
    searchTerm.value = currentSearch
  }

  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function handleResetSearch() {
  searchTerm.value = ''
  searchResults.value = []
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function handleDragStart(event: DragEvent, item: Item) {
  blueprintStore.startDrag('item-search', item)
  if (!event.dataTransfer) return
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({ source: 'item-search', item: item }),
  )
  event.dataTransfer.effectAllowed = 'copy'
}

function handleMouseover(index: number) {
  if (isKeyboardNavigating.value) {
    return
  }
  highlightedIndex.value = index
}

function handleMousemove() {
  isKeyboardNavigating.value = false
}

// --- Keyboard Navigation ---
function handleKeydown(event: KeyboardEvent) {
  const resultsCount = searchResults.value.length
  if (resultsCount === 0) return

  isKeyboardNavigating.value = true

  let newIndex = highlightedIndex.value

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      newIndex = (highlightedIndex.value + 1) % resultsCount
      break
    case 'ArrowUp':
      event.preventDefault()
      newIndex = (highlightedIndex.value - 1 + resultsCount) % resultsCount
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value !== -1) {
        handleItemSelection(searchResults.value[highlightedIndex.value])
      }
      return
    case 'Escape':
      searchTerm.value = ''
      searchResults.value = []
      return
    default:
      isKeyboardNavigating.value = false
      return
  }

  highlightedIndex.value = newIndex
  nextTick(() => {
    resultRefs.value[highlightedIndex.value]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  })
}
</script>

<template>
  <div class="pt-2 px-1 flex flex-col h-65">
    <div class="relative">
      <input
        ref="searchInputRef"
        v-model="searchTerm"
        @keydown="handleKeydown"
        placeholder="Search for an item..."
        class="w-full text-sm bg-white/5 border border-white/10 rounded-md pl-10 pr-10 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-white/30"
        autocomplete="off"
      />

      <!-- Icons and other elements are unchanged -->
      <div class="absolute pointer-events-none inset-y-0 left-0 flex items-center pl-3">
        <IconSearch class="size-5 text-zinc-600" />
      </div>

      <div
        class="absolute inset-y-0 right-0 flex items-center pr-1.5 transition-all"
        :class="{ 'opacity-0': searchTerm.length === 0, 'opacity-100': searchTerm.length >= 2 }"
      >
        <div class="group p-1 rounded-lg hover:bg-white/10" @click="handleResetSearch">
          <IconX class="size-4 text-zinc-400 group-hover:text-white" />
        </div>
      </div>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="searchTerm.length >= 2"
          class="absolute z-20 mt-1 w-full h-52 overflow-y-auto focus:outline-none"
        >
          <!-- Loading/No Results states are unchanged -->
          <div v-if="isLoading" class="text-center text-zinc-400 p-4">Searching...</div>
          <div
            v-else-if="!isLoading && searchResults.length === 0"
            class="text-center text-zinc-400 p-4"
          >
            No results for "{{ searchTerm }}"
          </div>

          <!-- 4. ADD @mousemove to the list container -->
          <ul v-else class="space-y-1" @mousemove="handleMousemove">
            <li
              v-for="(item, index) in searchResults"
              :key="item.item_id"
              :draggable="true"
              :class="[
                'w-full flex items-center gap-x-3 p-1.5 rounded-md text-left transition-colors cursor-pointer',
                index === highlightedIndex ? 'bg-yellow-400/10' : 'bg-transparent',
              ]"
              @dragstart="handleDragStart($event, item)"
              @dragend="blueprintStore.endDrag"
              @click="handleItemSelection(item)"
              @mouseover="handleMouseover(index)"
              :ref="
                (el) => {
                  if (el) resultRefs[index] = el as HTMLLIElement
                }
              "
            >
              <div v-if="item.image_url" class="size-8 flex items-center justify-center shrink-0">
                <img :src="item.image_url" :alt="item.name" class="max-w-full max-h-full" />
              </div>
              <span class="text-white text-sm">{{ item.name }}</span>
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>
