<script setup lang="ts">
defineProps<{ modelValue: string | number }>()
defineEmits(['update:modelValue'])
</script>

<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="w-full bg-white/5 border border-white/15 rounded-md py-1.5 px-2.5 text-sm placeholder:text-white/30 transition-all resize-none focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-yellow-500/50"
    v-bind="$attrs"
  ></textarea>
</template>
