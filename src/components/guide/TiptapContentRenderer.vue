<script setup lang="ts">
import type { TiptapNode, TextNode } from '@/interfaces/tiptap'

defineProps<{
  content: (TiptapNode | TextNode)[] | undefined
}>()

function isTextNode(node: TiptapNode | TextNode): node is TextNode {
  return node.type === 'text'
}

function getTagForMarks(node: TextNode): string {
  if (node.marks?.some((mark) => mark.type === 'bold')) {
    return 'strong'
  }
  if (node.marks?.some((mark) => mark.type === 'italic')) {
    return 'em'
  }
  return 'span'
}
</script>

<template>
  <template v-for="(node, index) in content" :key="index">
    <template v-if="isTextNode(node)">
      <component :is="getTagForMarks(node)">
        {{ node.text }}
      </component>
    </template>
    <br v-else-if="node.type === 'hardBreak'" />
  </template>
</template>
