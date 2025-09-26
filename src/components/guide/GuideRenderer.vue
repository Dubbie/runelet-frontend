<script setup lang="ts">
import type { TiptapDocument } from '@/interfaces/tiptap'
import TiptapNodeRenderer from './TiptapNodeRenderer.vue'
defineProps<{
  content: TiptapDocument | null
}>()
</script>

<template>
  <div v-if="content?.content" class="prose prose-invert max-w-none">
    <TiptapNodeRenderer v-for="(node, index) in content.content" :key="index" :node="node" />
  </div>
</template>
