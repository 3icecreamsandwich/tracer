<template>
  <main>
    <div class="mx-auto max-w-2xl p-8">
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Results</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {{ modeLabel }} · Accuracy: <span class="font-medium">{{ accuracyText }}</span>
        </p>

        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Correct: {{ correct }} · Attempted: {{ attempted }}
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <NuxtLink
            :to="restartHref"
            class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          >
            Restart {{ modeLabel }}
          </NuxtLink>

          <NuxtLink
            :to="`/set/${setId}?mode=flashcards`"
            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          >
            Flashcards
          </NuxtLink>
          <NuxtLink
            :to="`/set/${setId}?mode=learn`"
            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          >
            Learn
          </NuxtLink>
          <NuxtLink
            :to="`/set/${setId}?mode=match`"
            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          >
            Match
          </NuxtLink>
          <NuxtLink
            :to="`/set/${setId}?mode=chat`"
            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          >
            Chat
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
type ResultsMode = 'flashcards' | 'learn' | 'match'

const route = useRoute()

const setId = computed(() => {
  const id = route.params.id
  if (typeof id === 'string' && id.trim()) return id.trim()
  return 'unknown'
})

const mode = computed<ResultsMode>(() => {
  const raw = typeof route.query.mode === 'string' ? route.query.mode : 'flashcards'
  if (raw === 'flashcards' || raw === 'learn' || raw === 'match') return raw
  return 'flashcards'
})

function toInt(value: unknown) {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : NaN
  return Number.isFinite(n) && n >= 0 ? n : 0
}

const correct = computed(() => toInt(route.query.correct))
const attempted = computed(() => toInt(route.query.attempted))

const accuracyText = computed(() => {
  const a = attempted.value
  if (a <= 0) return '0%'
  const pct = Math.round((correct.value / a) * 100)
  return `${pct}% (${correct.value}/${a})`
})

const modeLabel = computed(() => {
  if (mode.value === 'flashcards') return 'Flashcards'
  if (mode.value === 'learn') return 'Learn'
  return 'Match'
})

const restartHref = computed(() => {
  return `/set/${setId.value}?mode=${mode.value}`
})
</script>
