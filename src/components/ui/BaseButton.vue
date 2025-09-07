<script setup lang="ts">
import { computed, useSlots } from 'vue'

// --- Type Definitions for Prop Validation ---
type ButtonVariant = 'filled' | 'outline' | 'plain'
type ButtonColor = 'dark/zinc' | 'white' | 'zinc' | 'yellow' | 'red'

const props = defineProps<{
  color?: ButtonColor
  outline?: boolean
  plain?: boolean
}>()

useSlots()

// --- Styling Dictionary ---
const variantStyles: Record<ButtonVariant, Record<ButtonColor, string>> = {
  filled: {
    'dark/zinc':
      'border-transparent bg-zinc-600 text-white hover:bg-zinc-500 focus-visible:ring-zinc-500',
    white: 'border-transparent bg-white text-black hover:bg-zinc-200 focus-visible:ring-zinc-400',
    zinc: 'border-transparent bg-zinc-800 text-white hover:bg-zinc-700 focus-visible:ring-zinc-500',
    yellow:
      'border-transparent bg-yellow-500 text-black hover:bg-yellow-400 focus-visible:ring-yellow-500',
    red: 'border-transparent bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
  },
  outline: {
    'dark/zinc': 'border-white/15 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400',
    white: 'border-white/50 text-white/90 hover:bg-white hover:text-black focus-visible:ring-white',
    zinc: 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 focus-visible:ring-zinc-400',
    yellow:
      'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black focus-visible:ring-yellow-500',
    red: 'border-red-500/80 text-red-500 hover:bg-red-500 hover:text-white focus-visible:ring-red-500',
  },
  plain: {
    'dark/zinc':
      'border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:ring-zinc-400',
    white:
      'border-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-white',
    zinc: 'border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:ring-zinc-400',
    yellow:
      'border-transparent text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 focus-visible:ring-yellow-400',
    red: 'border-transparent text-red-500 hover:bg-red-500/10 focus-visible:ring-red-500',
  },
}

// --- Computed Classes ---
const buttonClasses = computed(() => {
  // 1. Determine the variant based on prop priority (plain > outline > filled)
  const variant: ButtonVariant = props.plain ? 'plain' : props.outline ? 'outline' : 'filled'

  // 2. Determine the color, with a safe default
  const color = props.color ?? 'dark/zinc'

  // 3. Look up the classes from our dictionary
  const variantClasses = variantStyles[variant][color]

  // 4. Define base classes that apply to all buttons
  const baseClasses = [
    'border',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-x-2',
    'rounded-lg',
    'px-2.5',
    'py-1.5',
    'text-sm',
    'font-semibold',
    'transition-colors',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-zinc-950',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ]

  // 5. Combine and return
  return [...baseClasses, variantClasses]
})
</script>

<template>
  <button :class="buttonClasses" v-bind="$attrs">
    <slot name="icon" />
    <slot />
  </button>
</template>
