<template>
  <main>
    <div class="mx-auto max-w-3xl p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Study guide</h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Linked to set {{ setIdLabel }}.
          </p>
        </div>

        <NuxtLink
          :to="setId ? `/set/${setId}` : '/'"
          class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
        >
          Back
        </NuxtLink>
      </div>

      <div
        v-if="isWebPreview"
        class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        role="status"
        aria-live="polite"
      >
        Study guides require the desktop app (Tauri) for database access.
      </div>

      <div class="mt-6">
        <p v-if="loadError" class="text-sm text-red-700 dark:text-red-300">
          {{ loadError }}
        </p>

        <div
          v-else-if="busy"
          class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          Loading…
        </div>

        <div
          v-else
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <MarkdownRenderer :markdown="markdown" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { lockGetStatus } from '~/src/composables/lock'
import { useLockSession } from '~/src/composables/lock-session'
import { createProfileRepo, createSettingsRepo, createStudyGuidesRepo, useTracerDb } from '~/src/composables/db'
import type { Uuid } from '~/src/composables/db/types'
import { hasTauriRuntime } from '~/src/composables/tauri'
import MarkdownRenderer from '~/components/MarkdownRenderer.vue'

const router = useRouter()
const route = useRoute()
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession()

const hasTauriInternals = hasTauriRuntime()

const isWebPreview = computed(() => !hasTauriInternals)

const busy = ref(true)
const loadError = ref<string | null>(null)
const markdown = ref('')

const setId = computed(() => {
  const id = route.params.setId
  if (typeof id === 'string' && id.trim()) return id as Uuid
  return null
})

const setIdLabel = computed(() => setId.value ?? '(missing)')

async function loadGuide(setId: Uuid) {
  busy.value = true
  loadError.value = null
  try {
    const db = await useTracerDb()
    const repo = createStudyGuidesRepo(db)
    const guide = await repo.getBySetId(setId)
    if (!guide) {
      markdown.value = ''
      loadError.value = 'Study guide not found.'
      return
    }
    markdown.value = guide.markdown
  } catch {
    loadError.value = 'Failed to load study guide.'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (isWebPreview.value) {
    busy.value = false
    markdown.value = [
      '# Demo study guide',
      '',
      '- Lists render in the study guide view.',
      '- Code blocks render without executing HTML.',
      '',
      '```ts',
      'const demo = true',
      '```'
    ].join('\n')
    return
  }

  try {
    const status = await lockGetStatus()
    const db = await useTracerDb()

    const profile = await createProfileRepo(db).get()
    if (!profile || !status.has_verifier) {
      markLocked()
      await router.replace('/first-run')
      return
    }

    const settings = await createSettingsRepo(db).get()
    if (settings.startupLockEnabled && status.requires_unlock) {
      if (!unlockedThisSession.value) {
        markLocked()
        await router.replace('/unlock')
        return
      }
    } else if (status.can_auto_unlock) {
      markUnlocked()
    }

    if (!setId.value) {
      busy.value = false
      loadError.value = 'Missing set id.'
      return
    }

    await loadGuide(setId.value)
  } catch {
    markLocked()
    await router.replace('/unlock')
  }
})
</script>
