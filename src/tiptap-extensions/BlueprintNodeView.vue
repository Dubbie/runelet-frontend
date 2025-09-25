<script setup lang="ts">
import BlueprintEditor from '@/views/builder/BlueprintEditor.vue'
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

// The nodeViewProps give us access to the node's attributes
const props = defineProps(nodeViewProps)
const blueprintId = props.node.attrs.blueprintId

// In a real app, you would use this ID to fetch the blueprint data
// and pass it to the BlueprintEditor. For now, we can imagine it.
</script>

<template>
  <NodeViewWrapper class="blueprint-node my-4">
    <!-- You would pass the loaded blueprint data and a 'readonly' prop -->
    <BlueprintEditor :blueprint-id="blueprintId" :editable="false" />
  </NodeViewWrapper>
</template>
