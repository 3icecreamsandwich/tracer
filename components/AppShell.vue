<template>
  <div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <AppTopbar v-if="!hideNavbar" />

    <div class="fixed bottom-6 left-6 z-50">
      <BackButton />
    </div>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const hideNavbar = computed(() => route.meta?.hideNavbar === true)
</script>
