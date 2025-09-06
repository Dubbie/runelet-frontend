<script setup lang="ts">
import { ref } from 'vue'
import TabBar from '@/components/ui/tabs/TabBar.vue'
import ItemsPanel from './panels/ItemsPanel.vue'
import PrayerPanel from './panels/PrayerPanel.vue'
import NotesPanel from './panels/NotesPanel.vue'

// Local state to manage which panel is active
const activePanelId = ref('items')

// The static definition for our panel tabs
const panelTabs = [
  { id: 'items', label: 'Items' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'notes', label: 'Notes' },
]
</script>

<template>
  <div class="flex-1 bg-zinc-900 rounded-lg p-2">
    <TabBar :tabs="panelTabs" v-model:active-tab-id="activePanelId" />

    <!-- Conditionally render the active panel -->
    <div>
      <ItemsPanel v-show="activePanelId === 'items'" />
      <PrayerPanel v-show="activePanelId === 'prayer'" />
      <NotesPanel v-show="activePanelId === 'notes'" />
    </div>
  </div>
</template>
