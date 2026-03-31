<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/70 dark:bg-slate-950/75 dark:supports-[backdrop-filter]:bg-slate-950/60"
  >
    <div class="mx-auto flex h-14 max-w-5xl items-center gap-3 px-6">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
      >
        <span class="text-base">⌂</span>
      </NuxtLink>

      <div class="flex-1">
        <label class="sr-only" for="nav-search">Search</label>
        <form class="relative" @submit.prevent="onSubmit">
          <input
            id="nav-search"
            v-model="draft"
            type="search"
            autocomplete="off"
            placeholder="Search sets…"
            class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          />
        </form>
      </div>

      <NuxtLink
        to="/settings"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
      >
        <span
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
        >
          U
        </span>
        <span class="hidden sm:block">Settings</span>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const draft = ref('')

function getRouteQuery() {
  return typeof route.query.q === 'string' ? route.query.q : ''
}

watch(
  () => route.fullPath,
  () => {
    draft.value = getRouteQuery()
  },
  { immediate: true }
)

async function onSubmit() {
  const q = draft.value.trim()
  await router.push({
    path: '/',
    query: {
      ...(q ? { q } : {})
    }
  })
}
</script>
