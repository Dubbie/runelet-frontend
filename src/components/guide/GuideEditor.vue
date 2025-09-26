<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import type { TiptapDocument } from '@/interfaces/tiptap'
import { watch } from 'vue'
// We still need to import the extension to register it
import BlueprintNode from '@/tiptap-extensions/BlueprintNode'

// --- Props & Emits (Unchanged) ---
const props = defineProps<{
  content: TiptapDocument | null
}>()

const emit = defineEmits<{
  (e: 'update:content', value: TiptapDocument | null): void
}>()

// --- Tiptap Editor Instance (Unchanged) ---
const editor = useEditor({
  content: props.content,
  extensions: [
    StarterKit,
    BlueprintNode, // The extension is registered here
  ],
  onUpdate: ({ editor }) => {
    const json = editor.getJSON() as TiptapDocument
    emit('update:content', json)
  },
  editorProps: {
    attributes: {
      class: 'prose prose-invert max-w-none focus:outline-none',
    },
  },
})

// --- Watcher for prop changes (Unchanged) ---
watch(
  () => props.content,
  (newContent) => {
    // This logic prevents an infinite loop of updates
    if (
      editor.value &&
      newContent &&
      JSON.stringify(editor.value.getJSON()) !== JSON.stringify(newContent)
    ) {
      // The `false` here prevents the onUpdate hook from firing unnecessarily
      editor.value.commands.setContent(newContent)
    }
  },
)
</script>

<template>
  <div class="border border-zinc-700 rounded-lg">
    <div
      v-if="editor"
      class="toolbar flex items-center gap-2 p-2 bg-zinc-800 rounded-t-lg border-b border-zinc-700"
    >
      <!-- Standard Tiptap commands -->
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      >
        H1
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      >
        H2
      </button>
      <button
        @click="editor.chain().focus().setParagraph().run()"
        :class="{ 'is-active': editor.isActive('paragraph') }"
      >
        P
      </button>

      <button @click="editor.chain().focus().addBlueprint().run()">Embed Blueprint</button>
    </div>

    <EditorContent :editor="editor" class="p-4 min-h-[500px]" />
  </div>
</template>

<!-- The <style> block is unchanged -->
<style>
.toolbar button.is-active {
  background-color: #facc15; /* yellow-400 */
  color: #18181b; /* zinc-900 */
  border-radius: 4px;
}
.toolbar button {
  padding: 4px 8px;
  font-weight: bold;
}
</style>
