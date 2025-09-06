<script setup lang="ts">
import type { EquipmentSlotName, Item } from '@/interfaces'

interface EquipmentSlotProps {
  item: Item | null
  slotName: EquipmentSlotName
}

defineProps<EquipmentSlotProps>()

defineEmits(['click'])
</script>

<template>
  <div class="size-10 bg-white/5 border border-white/10 rounded-md" @click="$emit('click')">
    <div class="flex h-full items-center justify-center">
      <template v-if="item">
        <img v-if="item.image_url" :src="item.image_url" :alt="item.name" loading="lazy" />
        <p v-else>{{ item.name }}</p>
      </template>
      <img
        v-else
        class="opacity-30 invert filter"
        :src="`/images/${slotName}.webp`"
        :alt="`Image of ${slotName}`"
      />
    </div>
  </div>
</template>
