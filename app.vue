<template>
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>

<script setup lang="ts">
import { themeInitFromDb } from '~/src/composables/theme'

onMounted(() => {
  themeInitFromDb().catch(() => {})
})
</script>
