<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import type { TiptapDocument } from '@/interfaces/tiptap'
import { watch } from 'vue'

// We still need to import the extensions to register them
import BlueprintNode from '@/tiptap-extensions/BlueprintNode'
import Image from '@tiptap/extension-image'
import YouTube from '@tiptap/extension-youtube'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'

import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconBox,
  IconBrandYoutube,
  IconCode,
  IconH1,
  IconH2,
  IconHighlight,
  IconItalic,
  IconLetterCase,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconPilcrow,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons-vue'

// --- Props & Emits (Unchanged) ---
const props = defineProps<{
  content: TiptapDocument | null
}>()

const emit = defineEmits<{
  (e: 'update:content', value: TiptapDocument | null): void
}>()

// --- Tiptap Editor Instance (Upgraded) ---
const editor = useEditor({
  content: props.content,
  extensions: [
    StarterKit,
    BlueprintNode,
    Image,
    YouTube.configure({
      controls: false,
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontFamily,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
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
    if (
      editor.value &&
      newContent &&
      JSON.stringify(editor.value.getJSON()) !== JSON.stringify(newContent)
    ) {
      editor.value.commands.setContent(newContent)
    }
  },
)

// --- Toolbar Methods ---

const addImage = () => {
  const url = window.prompt('Enter image URL:')
  if (url && editor.value) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

const addYoutubeVideo = () => {
  const url = prompt('Enter YouTube URL')
  if (url && editor.value) {
    editor.value.commands.setYoutubeVideo({
      src: url,
    })
  }
}

const setTextColor = (event: Event) => {
  const color = (event.target as HTMLInputElement).value
  if (editor.value) {
    editor.value.chain().focus().setColor(color).run()
  }
}

const setHighlightColor = (event: Event) => {
  const color = (event.target as HTMLInputElement).value
  if (editor.value) {
    editor.value.chain().focus().toggleHighlight({ color }).run()
  }
}
</script>

<template>
  <div class="border border-zinc-700 rounded-lg">
    <div
      v-if="editor"
      class="toolbar flex items-center flex-wrap gap-1 p-2 bg-zinc-800 rounded-t-lg border-b border-zinc-700"
    >
      <!-- History -->
      <div class="toolbar-group">
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()">
          <IconArrowBackUp :stroke-width="2" />
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()">
          <IconArrowForwardUp :stroke-width="2" />
        </button>
      </div>

      <div class="separator"></div>

      <!-- Headings -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          <IconH1 :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        >
          <IconH2 :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }"
        >
          <IconPilcrow :stroke-width="2" />
        </button>
      </div>

      <div class="separator"></div>

      <!-- Formatting -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          <IconBold :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          <IconItalic :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
        >
          <IconUnderline :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          <IconStrikethrough :stroke-width="2" />
        </button>
      </div>

      <div class="separator"></div>

      <!-- Font & Highlight Color -->
      <div class="toolbar-group">
        <div class="color-picker-wrapper">
          <IconLetterCase class="icon-label" />
          <input
            type="color"
            @input="setTextColor"
            :value="editor.getAttributes('textStyle').color"
          />
        </div>
        <div class="color-picker-wrapper">
          <IconHighlight class="icon-label" />
          <input
            type="color"
            @input="setHighlightColor"
            :value="editor.getAttributes('highlight').color"
          />
        </div>
      </div>

      <div class="separator"></div>

      <!-- Alignment -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().setTextAlign('left').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        >
          <IconAlignLeft :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        >
          <IconAlignCenter :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        >
          <IconAlignRight :stroke-width="2" />
        </button>
      </div>

      <div class="separator"></div>

      <!-- Lists & Blocks -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
        >
          <IconList :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
        >
          <IconListNumbers :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
        >
          <IconCode :stroke-width="2" />
        </button>
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
        >
          <IconBlockquote :stroke-width="2" />
        </button>
      </div>

      <div class="separator"></div>

      <!-- Embeds -->
      <div class="toolbar-group">
        <button @click="addImage">
          <IconPhoto :stroke-width="2" />
        </button>
        <button @click="addYoutubeVideo">
          <IconBrandYoutube :stroke-width="2" />
        </button>
        <button @click="editor.chain().focus().addBlueprint().run()">
          <IconBox :stroke-width="2" />
        </button>
      </div>
    </div>

    <EditorContent :editor="editor" class="p-4 min-h-[500px]" />
  </div>
</template>

<style>
/* Toolbar general styling */
.toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toolbar button:hover {
  background-color: #3f3f46; /* zinc-700 */
}

.toolbar button.is-active {
  background-color: #facc15; /* yellow-400 */
  color: #18181b; /* zinc-900 */
}
.toolbar button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Groups and Separators */
.toolbar-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: #52525b; /* zinc-600 */
  margin: 0 8px;
}

/* Color Picker specific styles */
.color-picker-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}
.color-picker-wrapper .icon-label {
  position: absolute;
  pointer-events: none; /* Allows clicks to go through to the input */
}

.color-picker-wrapper input[type='color'] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
