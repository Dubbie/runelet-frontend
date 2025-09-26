<script setup lang="ts">
// --- Import Vue and type definitions ---
import { computed, h } from 'vue'
// VNode and Slots are types and must be imported with `import type`
import type { VNode, Slots } from 'vue'
import type { TiptapNode, TiptapMark, TiptapTextNode } from '@/interfaces/tiptap'
import BlueprintEditor from '@/views/builder/BlueprintEditor.vue'

// --- Props ---
const props = defineProps<{
  node: TiptapNode
}>()

// --- Dynamic Styling ---
const blockStyles = computed(() => {
  const styles: Record<string, string> = {}
  if (props.node.attrs?.textAlign) {
    // We must cast here because attrs can have `unknown` values
    styles.textAlign = props.node.attrs.textAlign as string
  }
  return styles
})

// --- Text Wrapper for Marks (Bold, Italic, Color, etc.) ---
const TextWrapper = (_: unknown, { slots }: { slots: Slots }) => {
  const textNode = props.node as TiptapTextNode
  if (!textNode.marks) {
    return slots.default ? slots.default() : []
  }

  // Sequentially wrap the text content with the appropriate tag for each mark
  return textNode.marks.reduce(
    (child: VNode | VNode[], mark: TiptapMark): VNode => {
      const childNodes = Array.isArray(child) ? child : [child]
      switch (mark.type) {
        case 'bold':
          return h('strong', childNodes)
        case 'italic':
          return h('em', childNodes)
        case 'underline':
          return h('u', childNodes)
        case 'strike':
          return h('s', childNodes)
        case 'highlight':
          return h('mark', { style: `background-color: ${mark.attrs?.color}` }, childNodes)
        case 'textStyle': {
          const style: Record<string, string> = {}
          if (mark.attrs?.color) style.color = mark.attrs.color as string
          if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily as string
          return h('span', { style }, childNodes)
        }
        default:
          return h('span', childNodes) // Default wrapper if mark is unknown
      }
    },
    slots.default ? slots.default() : [],
  ) // Start with the default slot content
}
</script>

<template>
  <!-- CUSTOM NODES: Render custom components directly for type safety -->
  <BlueprintEditor
    v-if="node.type === 'blueprint' && node.attrs?.blueprintData"
    :model-value="node.attrs.blueprintData"
    :editable="false"
  />

  <!-- BLOCK NODES (with content) -->
  <p v-else-if="node.type === 'paragraph'" :style="blockStyles">
    <TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" />
  </p>
  <component :is="`h${node.attrs?.level}`" v-else-if="node.type === 'heading'" :style="blockStyles">
    <TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" />
  </component>
  <ul v-else-if="node.type === 'bulletList'">
    <TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" />
  </ul>
  <ol v-else-if="node.type === 'orderedList'">
    <TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" />
  </ol>
  <li v-else-if="node.type === 'listItem'">
    <TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" />
  </li>
  <blockquote v-else-if="node.type === 'blockquote'">
    <TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" />
  </blockquote>
  <pre
    v-else-if="node.type === 'codeBlock'"
  ><code v-if="node.content"><TiptapNodeRenderer v-for="(child, index) in node.content" :key="index" :node="child" /></code></pre>

  <!-- SELF-CLOSING / EMBED NODES -->
  <img
    v-else-if="node.type === 'image'"
    :src="node.attrs?.src"
    :alt="node.attrs?.alt"
    :title="node.attrs?.title"
  />
  <div v-else-if="node.type === 'youtube'" class="youtube-embed">
    <iframe
      :src="node.attrs?.src"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>

  <!-- INLINE NODES -->
  <TextWrapper v-else-if="node.type === 'text'">{{ (node as TiptapTextNode).text }}</TextWrapper>
  <br v-else-if="node.type === 'hardBreak'" />
</template>

<style scoped>
/* Styles remain unchanged */
.youtube-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  max-width: 100%;
}

.youtube-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
