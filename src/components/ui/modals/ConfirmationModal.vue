<script setup lang="ts">
import BaseButton from '../BaseButton.vue'
import BaseModal from './BaseModal.vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <BaseModal :isOpen="isOpen" @close="emit('close')">
    <template #title>
      {{ title }}
    </template>

    <template #body>
      <p class="text-sm text-zinc-400">
        {{ message }}
      </p>
    </template>

    <template #footer>
      <BaseButton plain @click="emit('close')"> Close </BaseButton>

      <BaseButton color="red" @click="emit('confirm')"> Confirm </BaseButton>
    </template>
  </BaseModal>
</template>
