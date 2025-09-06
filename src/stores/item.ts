// src/stores/item.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { itemApiService } from '@/api/itemApiService'
import type { Item, ApiResponseMeta } from '@/interfaces'

export const useItemStore = defineStore('item', () => {
  // --- State ---
  const items = ref(new Map<string, Item>())
  const paginationMeta = ref<ApiResponseMeta | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchTerm = ref('')

  // --- Getters (Computed) ---
  const itemList = computed(() => Array.from(items.value.values()))
  const getItemByUuid = computed(() => (uuid: string) => items.value.get(uuid))
  const hasMorePages = computed(() => {
    if (!paginationMeta.value) return false
    return paginationMeta.value.current_page < paginationMeta.value.last_page
  })

  // --- Actions ---
  async function fetchItems(page: number = 1) {
    isLoading.value = true
    error.value = null
    try {
      const response = await itemApiService.getItems(page, searchTerm.value)
      response.data.forEach((item) => items.value.set(item.uuid, item))
      paginationMeta.value = response.meta
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSearchResults(query: string): Promise<Item[]> {
    if (!query || query.trim().length < 2) {
      return [] // Don't search for very short strings
    }
    try {
      // We only need the first page of results for a search dropdown
      const response = await itemApiService.getItems(1, query)
      return response.data
    } catch (e) {
      console.error('Failed to fetch search results:', e)
      return [] // Return empty on error
    }
  }

  async function fetchNextPage() {
    if (isLoading.value || !hasMorePages.value) return
    const nextPage = (paginationMeta.value?.current_page || 0) + 1
    await fetchItems(nextPage)
  }

  return {
    // State
    items,
    paginationMeta,
    isLoading,
    error,
    searchTerm,
    // Getters
    itemList,
    getItemByUuid,
    hasMorePages,
    // Actions
    fetchItems,
    fetchSearchResults,
    fetchNextPage,
  }
})
