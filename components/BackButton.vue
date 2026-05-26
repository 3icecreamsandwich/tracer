<template>
  <button
    type="button"
    :disabled="isDisabled"
    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-950/85 dark:text-slate-50 dark:shadow-black/25 dark:hover:bg-slate-950"
    @click="onBack"
  >
    <span class="text-base">←</span>
    <span>Back</span>
  </button>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const isDisabled = computed(() => {
  const path = route.path
  // Disable back button on homepage
  return path === '/'
})

function onBack() {
  const path = route.path
  
  // When in fullscreen mode (/{set|study-guide}/[id]-{flashcards|learn|match}), go back to the parent page.
  // Note: IDs may contain hyphens (e.g. UUIDs), so capture greedily up to the mode suffix.
  const fullscreenMatch = path.match(/^\/(set|study-guide)\/(.+)-(flashcards|learn|match)\/?$/)
  if (fullscreenMatch) {
    const parentKind = fullscreenMatch[1]
    const parentId = fullscreenMatch[2]
    router.push(`/${parentKind}/${parentId}`)
    return
  }
  
  // When in a flashcard set, go back to homepage
  if (path.startsWith('/set/')) {
    router.push('/')
    return
  }
  
  // When in settings or other pages, go to previous page
  if (window.history.length > 1) {
    router.back()
    return
  }
  
  // Fallback to homepage
  router.push('/')
}
</script>
