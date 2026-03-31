<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-950/85 dark:text-slate-50 dark:shadow-black/25 dark:hover:bg-slate-950"
    @click="onBack"
  >
    <span class="text-base">←</span>
    <span>Back</span>
  </button>
</template>

<script setup lang="ts">
const router = useRouter()

function onBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}
</script>
