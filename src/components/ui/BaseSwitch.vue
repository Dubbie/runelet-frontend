<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  onLabel: string
  offLabel: string
}>()

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}

// --- Dynamic Classes for Active/Inactive Labels ---
const offLabelClasses = computed(() => [
  'transition-colors',
  props.modelValue ? 'text-zinc-500' : 'text-zinc-200 font-semibold',
])

const onLabelClasses = computed(() => [
  'transition-colors',
  props.modelValue ? 'text-zinc-200 font-semibold' : 'text-zinc-500',
])
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click="toggle"
    class="flex items-center gap-x-2.5 rounded-lg bg-zinc-900 p-1 text-sm"
  >
    <!-- Off Label -->
    <span :class="offLabelClasses">{{ offLabel }}</span>

    <!-- The Switch Track and Thumb -->
    <div
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      :class="modelValue ? 'bg-yellow-500' : 'bg-zinc-700'"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      />
    </div>

    <!-- On Label -->
    <span :class="onLabelClasses">{{ onLabel }}</span>
  </button>
</template>
