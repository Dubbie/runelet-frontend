<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBlueprintStore } from '@/stores/blueprint'
import type { Item } from '@/interfaces'
import { itemApiService } from '@/api/itemApiService'

const blueprintStore = useBlueprintStore()

// --- State Management ---
const searchTerm = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchResults = ref<Item[]>([])
const isLoading = ref(false)
let debounceTimer: number | undefined

// --- API Interaction & Debouncing ---

// 2. THIS FUNCTION NOW USES YOUR SERVICE
async function searchItems(term: string) {
  try {
    // Call the getItems method from your service
    const apiResponse = await itemApiService.getItems(1, term)
    // Assuming your ApiResponse is { data: Item[], ... }
    // If it's different (e.g., { items: [...] }), adjust this line
    searchResults.value = apiResponse.data
  } catch (error) {
    console.error('Failed to search for items:', error)
    searchResults.value = [] // Clear results on error
  } finally {
    isLoading.value = false
  }
}

// 3. THE WATCHER LOGIC REMAINS IDENTICAL
watch(searchTerm, (newTerm) => {
  clearTimeout(debounceTimer)
  if (newTerm.length < 2) {
    searchResults.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true
  debounceTimer = setTimeout(() => {
    searchItems(newTerm)
  }, 300) // Wait 300ms after the user stops typing
})

// --- User Actions ---

// 4. THE ITEM SELECTION LOGIC REMAINS IDENTICAL
function handleItemSelect(item: Item) {
  // If the item is equipable, call equipItem (our "Smart Click")
  if (item.equipment_stats) {
    blueprintStore.equipItem(item)
  } else {
    // If NOT equipable, try to add it to the inventory
    const success = blueprintStore.addItemToInventory(item)
    if (!success) {
      alert('Your inventory is full.')
    }
  }

  // Focus the search input again
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

function handleDragStart(event: DragEvent, item: Item) {
  blueprintStore.startDrag('item-search', item)

  if (!event.dataTransfer) return
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({
      source: 'item-search',
      item: item,
    }),
  )
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <div class="pt-2 px-1 flex flex-col h-64">
    <!-- Search Input -->
    <div class="mb-3">
      <input
        type="text"
        ref="searchInputRef"
        v-model="searchTerm"
        placeholder="Search for an item..."
        class="w-full text-sm bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>

    <!-- Search Results / State Display -->
    <div class="flex-1 overflow-y-auto pr-1">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center text-zinc-400 p-4">Searching...</div>

      <!-- No Results State -->
      <div
        v-else-if="searchResults.length === 0 && searchTerm.length >= 2"
        class="text-center text-zinc-400 p-4"
      >
        No results for "{{ searchTerm }}"
      </div>

      <!-- Initial Empty State -->
      <div
        v-else-if="searchResults.length === 0 && searchTerm.length < 2"
        class="text-center text-zinc-500 text-xs p-4"
      >
        Type 2 or more characters to search.
      </div>

      <!-- Results List -->
      <ul v-else class="space-y-1">
        <li v-for="item in searchResults" :key="item.item_id">
          <div
            :draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragend="blueprintStore.endDrag"
            @click="handleItemSelect(item)"
            class="w-full flex items-center gap-x-3 p-1.5 rounded-md text-left transition-colors cursor-grab hover:bg-white/10"
          >
            <div v-if="item.image_url" class="size-8 flex items-center justify-center shrink-0">
              <img :src="item.image_url" :alt="item.name" class="max-w-full max-h-full" />
            </div>
            <span class="text-white text-sm truncate">{{ item.name }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
