<script setup lang="ts" generic="T">
import { ref, watch, onMounted, onBeforeUpdate, nextTick } from 'vue'

// --- Props and Emits ---
type Option = {
  value: T
  label: string
}

const props = defineProps<{
  modelValue: T
  options: Option[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const selectOption = (value: T) => {
  emit('update:modelValue', value)
}

// --- Animation State & DOM Refs ---
const containerRef = ref<HTMLDivElement | null>(null)
const itemRefs = ref<HTMLButtonElement[]>([])
const gliderStyle = ref({
  width: '0px',
  transform: 'translateX(0px)',
})

// --- Core Animation Logic ---
const updateGlider = () => {
  const activeIndex = props.options.findIndex((opt) => opt.value === props.modelValue)
  if (activeIndex === -1 || !itemRefs.value[activeIndex]) {
    return
  }
  const activeItem = itemRefs.value[activeIndex]
  const { offsetWidth, offsetLeft } = activeItem
  gliderStyle.value = {
    width: `${offsetWidth}px`,
    transform: `translateX(${offsetLeft}px)`,
  }
}

// --- Lifecycle Hooks ---
onBeforeUpdate(() => {
  itemRefs.value = []
})

watch(
  () => props.modelValue,
  () => {
    nextTick(updateGlider)
  },
)

onMounted(() => {
  nextTick(updateGlider)
  if (containerRef.value) {
    new ResizeObserver(updateGlider).observe(containerRef.value)
  }
})
</script>

<template>
  <div class="rounded-lg bg-white/10 p-1">
    <div ref="containerRef" class="relative flex items-center space-x-1">
      <div
        aria-hidden="true"
        class="absolute h-full rounded-md bg-white shadow-sm transition-transform duration-300 ease-in-out"
        :style="gliderStyle"
      ></div>

      <button
        v-for="(option, index) in options"
        :key="String(option.value)"
        :ref="
          (el) => {
            if (el) itemRefs[index] = el as HTMLButtonElement
          }
        "
        @click="selectOption(option.value)"
        class="relative z-10 flex-1 rounded-md px-2.5 py-1.5 text-center text-sm font-semibold transition-colors duration-200 focus:outline-none"
        :class="[modelValue === option.value ? 'text-black' : 'text-white/50 hover:text-white']"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
