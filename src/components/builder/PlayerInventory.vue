<script setup lang="ts">
const columns = 4
const rows = 7
</script>

<template>
  <div class="bg-zinc-900 p-3 max-w-50 rounded-lg">
    <div class="flex flex-col items-center justify-center space-y-0.5">
      <div v-for="i in rows" :key="i" class="flex gap-x-0.5">
        <div
          v-for="j in columns"
          :key="j"
          class="size-10 bg-white/5 border border-transparent rounded-md"
        ></div>
      </div>
    </div>
  </div>
</template>
