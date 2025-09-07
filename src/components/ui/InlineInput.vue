<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// --- Type Definitions for Prop Validation ---
type InputSize = 'sm' | 'md' | 'lg'
type InputVariant = 'default' | 'ghost'

const props = defineProps<{
  modelValue: string | number
  size?: InputSize
  variant?: InputVariant
  autofocus?: boolean
}>()

defineEmits(['update:modelValue'])

const inputRef = ref<HTMLInputElement | null>(null)

// --- Styling Dictionary ---
const styles = {
  size: {
    sm: 'text-sm font-semibold px-2 py-1',
    md: 'text-base font-semibold px-2 py-1.5',
    lg: 'text-3xl font-bold p-2',
  } as Record<InputSize, string>,
  variant: {
    default: 'bg-white/10',
    ghost: 'bg-transparent hover:bg-white/10',
  } as Record<InputVariant, string>,
}

// --- Computed Classes ---
const inputClasses = computed(() => {
  const base = 'w-full text-white rounded-md transition-colors outline-none'
  const focus = 'focus:ring-2 focus:ring-yellow-500'
  const sizeClass = styles.size[props.size ?? 'md']
  const variantClass = styles.variant[props.variant ?? 'default']

  return [base, focus, sizeClass, variantClass]
})

// --- Autofocus Logic ---
onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus()
  }
})
</script>

<template>
  <input
    ref="inputRef"
    type="text"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :class="inputClasses"
    v-bind="$attrs"
  />
</template>
