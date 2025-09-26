<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import type { Blueprint } from '@/interfaces'
import BlueprintEditor from '@/views/builder/BlueprintEditor.vue'

// `nodeViewProps` is a special object provided by Tiptap containing all the context for this node.
const props = defineProps(nodeViewProps)

/**
 * This function is the "upward" data flow.
 * When our BlueprintEditor emits an update, this function tells the main Tiptap editor
 * to update this node's `blueprintData` attribute with the new value.
 * @param newData The complete, updated blueprint object from the editor.
 */
const handleDataUpdate = (newData: Blueprint) => {
  props.updateAttributes({
    blueprintData: newData,
  })
}
</script>

<template>
  <NodeViewWrapper
    class="blueprint-node my-4 p-2 border-2 border-dashed border-zinc-700 rounded-lg"
  >
    <div class="p-1 text-xs text-zinc-500 font-bold uppercase select-none">Blueprint Loadouts</div>

    <BlueprintEditor
      :model-value="props.node.attrs.blueprintData"
      :editable="props.editor.isEditable"
      @update:model-value="handleDataUpdate"
    />
  </NodeViewWrapper>
</template>
