<script setup lang="ts">
import type { TiptapDocument, TiptapNode } from '@/interfaces/tiptap'
import TiptapContentRenderer from './TiptapContentRenderer.vue'
import BlueprintEditor from '@/views/builder/BlueprintEditor.vue'
import type { Blueprint } from '@/interfaces'

defineProps<{
  content: TiptapDocument | null
}>()

const componentMap = {
  blueprint: BlueprintEditor,
}

function isCustomComponentNode(node: TiptapNode): boolean {
  return node.type in componentMap
}

function getComponentProps(node: TiptapNode) {
  // If the node is a blueprint...
  if (node.type === 'blueprint' && node.attrs?.blueprintData) {
    // ...return an object with the correct prop name: `modelValue`.
    return {
      modelValue: node.attrs.blueprintData as Blueprint, // <-- The key change
      editable: false, // We always want the rendered version to be read-only
    }
  }

  // You can add other `if` blocks here for future components like JadTrainer
  // that might have different prop names.

  // Fallback for any other potential components
  return {
    ...node.attrs,
    editable: false,
  }
}
</script>

<template>
  <div v-if="content" class="prose prose-invert max-w-none">
    <template v-for="(node, index) in content.content" :key="index">
      <!--
        2. DELEGATE content rendering for all standard block nodes.
        The template is now clean, readable, and 100% type-safe. The error is gone.
      -->
      <h1 v-if="node.type === 'heading' && node.attrs?.level === 1">
        <TiptapContentRenderer :content="node.content" />
      </h1>
      <h2 v-if="node.type === 'heading' && node.attrs?.level === 2">
        <TiptapContentRenderer :content="node.content" />
      </h2>
      <h3 v-if="node.type === 'heading' && node.attrs?.level === 3">
        <TiptapContentRenderer :content="node.content" />
      </h3>
      <p v-if="node.type === 'paragraph'">
        <TiptapContentRenderer :content="node.content" />
      </p>

      <!-- Logic for custom block components remains unchanged -->
      <component
        v-if="isCustomComponentNode(node)"
        :is="componentMap[node.type as keyof typeof componentMap]"
        v-bind="getComponentProps(node)"
      />
    </template>
  </div>
</template>
