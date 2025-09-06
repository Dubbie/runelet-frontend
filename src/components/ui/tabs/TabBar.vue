<script setup lang="ts">
import { ref } from 'vue'
import TabItem from './TabItem.vue'

export interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  activeTabId: string
  showDelete?: boolean
  showEdit?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:activeTabId', id: string): void
  (e: 'delete', id: string): void
  (e: 'rename', payload: { id: string; newName: string }): void
}>()

// THIS IS THE CRUCIAL STATE THAT WAS MISSING
const editingTabId = ref<string | null>(null)

// When a TabItem emits 'edit', we set the ID here
const handleEditRequest = (tabId: string) => {
  editingTabId.value = tabId
}

// When a TabItem emits 'save', we pass the data up and exit edit mode
const handleSaveRequest = (tabId: string, newName: string) => {
  emit('rename', { id: tabId, newName })
  editingTabId.value = null
}

// When a TabItem emits 'cancel', we just exit edit mode
const handleCancelRequest = () => {
  editingTabId.value = null
}
</script>

<template>
  <div class="flex items-center gap-x-4 p-1 bg-zinc-900 rounded-lg">
    <div class="flex gap-x-2">
      <TabItem
        v-for="tab in tabs"
        :key="tab.id"
        :label="tab.label"
        :is-active="activeTabId === tab.id"
        :is-editing="editingTabId === tab.id"
        :show-delete="showDelete"
        :show-edit="showEdit"
        @click="emit('update:activeTabId', tab.id)"
        @delete="emit('delete', tab.id)"
        @edit="handleEditRequest(tab.id)"
        @save="(newName: string) => handleSaveRequest(tab.id, newName)"
        @cancel="handleCancelRequest"
      >
        {{ tab.label }}
      </TabItem>
    </div>
    <slot name="actions" />
  </div>
</template>
