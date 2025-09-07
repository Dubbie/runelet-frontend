<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TabBar from '@/components/ui/tabs/TabBar.vue'
import ItemsPanel from './panels/ItemsPanel.vue'
import PrayerPanel from './panels/PrayerPanel.vue'
import NotesPanel from './panels/NotesPanel.vue'

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

// Local state to manage which panel is active
const activePanelId = ref('items')

// The static definition for our panel tabs
const panelTabs = computed(() => {
  if (props.editable) {
    return [
      { id: 'items', label: 'Search Items' },
      { id: 'prayer', label: 'Prayer Presets' },
      { id: 'notes', label: 'Notes' },
    ]
  } else {
    return [
      { id: 'prayer', label: 'Prayer Presets' },
      { id: 'notes', label: 'Notes' },
    ]
  }
})

watch(
  () => props.editable,
  () => {
    if (!props.editable) {
      activePanelId.value = 'prayer'
    } else {
      activePanelId.value = 'items'
    }
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template>
  <div class="flex-1 bg-zinc-900 rounded-lg p-2">
    <TabBar :tabs="panelTabs" v-model:active-tab-id="activePanelId" />

    <!-- Conditionally render the active panel -->
    <div>
      <ItemsPanel v-show="activePanelId === 'items'" v-if="editable" />
      <PrayerPanel v-show="activePanelId === 'prayer'" :editable="editable" />
      <NotesPanel v-show="activePanelId === 'notes'" :editable="editable" />
    </div>
  </div>
</template>
