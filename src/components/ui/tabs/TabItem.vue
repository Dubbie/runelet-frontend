<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { IconDotsVertical, IconPencil, IconX } from '@tabler/icons-vue'
import { nextTick, ref, watch } from 'vue'

interface Props {
  isActive?: boolean
  showDelete?: boolean
  showEdit?: boolean
  label: string
  isEditing?: boolean // This prop is essential to trigger edit mode
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'delete'): void
  (e: 'edit'): void // Emitted to START the edit process
  (e: 'save', newName: string): void // Emitted to SAVE the new name
  (e: 'cancel'): void // Emitted to CANCEL the edit
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const editingValue = ref('')

// When isEditing becomes true, focus the input
watch(
  () => props.isEditing,
  (isEditing) => {
    if (isEditing) {
      editingValue.value = props.label // Pre-fill with the current name
      nextTick(() => {
        inputRef.value?.focus()
        inputRef.value?.select()
      })
    }
  },
)

const handleSave = () => {
  if (editingValue.value.trim() && editingValue.value.trim() !== props.label) {
    emit('save', editingValue.value.trim())
  } else {
    emit('cancel')
  }
}
</script>

<template>
  <div class="relative group">
    <!-- EDITING STATE: Show the input field -->
    <input
      v-if="isEditing"
      ref="inputRef"
      type="text"
      v-model="editingValue"
      @keyup.enter="handleSave"
      @keyup.esc="emit('cancel')"
      @blur="handleSave"
      class="px-2 py-1 text-sm font-semibold rounded-md bg-white/5 outline-none ring-2 ring-yellow-500"
    />

    <!-- NORMAL STATE: Show the button and the menu -->
    <div v-else class="relative">
      <button
        @dblclick="emit('edit')"
        :class="[
          'w-full border flex gap-x-2 pl-2  py-1 text-sm font-semibold rounded-md transition-colors duration-200',
          isActive
            ? 'border-white/30 text-white'
            : 'border-transparent text-zinc-400 hover:text-white',
          showDelete || showEdit ? 'pr-1' : 'pr-2',
        ]"
      >
        <slot />

        <Menu v-if="showDelete || showEdit" as="div">
          <MenuButton
            @click.stop
            class="flex items-center justify-center text-zinc-500 p-0.5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
          >
            <IconDotsVertical class="size-4" stroke-width="3" />
          </MenuButton>
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute top-full right-0 mt-1 w-36 origin-top-right bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10 p-1 focus:outline-none"
            >
              <MenuItem v-slot="{ active }">
                <button
                  @click="emit('edit')"
                  :class="[
                    'w-full flex items-center gap-x-2 px-2 py-1.5 text-left text-sm rounded-sm',
                    active ? 'bg-zinc-700 text-white' : 'text-zinc-300',
                  ]"
                >
                  <IconPencil class="size-4" />
                  <span>Rename</span>
                </button>
              </MenuItem>
              <MenuItem v-if="showDelete" v-slot="{ active }">
                <button
                  @click="emit('delete')"
                  :class="[
                    'w-full flex items-center gap-x-2 px-2 py-1.5 text-left text-sm rounded-sm',
                    active ? 'bg-red-500/80 text-white' : 'text-red-400',
                  ]"
                >
                  <IconX class="size-4" />
                  <span>Delete</span>
                </button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </button>
    </div>
  </div>
</template>
