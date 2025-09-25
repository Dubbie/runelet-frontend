<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import type { TiptapDocument } from '@/interfaces/tiptap'
import { watch } from 'vue'
import BlueprintNode from '@/tiptap-extensions/BlueprintNode'

// 1. DEFINE PROPS & EMITS for v-model
const props = defineProps<{
  content: TiptapDocument | null
}>()

const emit = defineEmits<{
  (e: 'update:content', value: TiptapDocument | null): void
}>()

const editor = useEditor({
  content: props.content,
  extensions: [StarterKit, BlueprintNode],
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

function addBlueprint() {
  // In a real application, this would open a modal to search for a blueprint.
  // For now, we will hardcode an ID to demonstrate the functionality.
  // Let's assume the user picks a blueprint with ID 'bp_12345'.
  const blueprintId = prompt('Enter a Blueprint ID to embed:', 'bp_12345')

  if (blueprintId) {
    // This is the Tiptap command to insert our custom node
    editor.value
      ?.chain()
      .focus()
      .insertContent({
        type: 'blueprint', // The name we defined in BlueprintNode.ts
        attrs: {
          blueprintId: blueprintId, // The data for our attribute
        },
      })
      .run()
  }
}

watch(
  () => props.content,
  (newContent) => {
    if (
      editor.value &&
      newContent &&
      JSON.stringify(editor.value.getJSON()) !== JSON.stringify(newContent)
    ) {
      editor.value.commands.setContent(newContent)
    }
  },
)
</script>

<!-- The template remains the same -->
<template>
  <div class="border border-zinc-700 rounded-lg">
    <!-- 2. ADD DYNAMIC CLASSES to the toolbar buttons -->
    <div
      v-if="editor"
      class="toolbar flex items-center gap-2 p-2 bg-zinc-800 rounded-t-lg border-b border-zinc-700"
    >
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
      <button @click="addBlueprint">Embed Blueprint</button>
    </div>

    <!-- 3. The EditorContent component will now use the classes from `editorProps` -->
    <EditorContent :editor="editor" class="p-4 min-h-[500px]" />
  </div>
</template>

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
