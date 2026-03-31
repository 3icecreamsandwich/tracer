<template>
  <main>
    <AiErrorModal :open="aiErrorOpen" :error="aiError" from="/create/synthesize" @close="closeAiError" />
    <div class="mx-auto max-w-3xl p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Create · Synthesize</h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Combine existing sets into a new, consolidated set.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          :disabled="createDisabled"
          @click="onCreate"
        >
          {{ busy ? 'Creating…' : 'Create' }}
        </button>
      </div>

      <div
        v-if="isWebPreview"
        class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        role="status"
        aria-live="polite"
      >
        Synthesize requires the desktop app (Tauri) for vault + database access.
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          aria-label="Choose source sets"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium text-slate-900 dark:text-slate-50">Source sets</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Search and select one or more sets to merge.
              </p>
            </div>

            <span
              class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {{ filteredSets.length }}
            </span>
          </div>

          <div class="mt-4">
            <label class="sr-only" for="synth-search">Search sets</label>
            <input
              id="synth-search"
              v-model="query"
              type="search"
              autocomplete="off"
              placeholder="Search sets…"
              class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            />
          </div>

          <div class="mt-4">
            <p v-if="loadError" class="text-sm text-red-700 dark:text-red-300">
              {{ loadError }}
            </p>

            <div
              v-else-if="loading"
              class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Loading…
            </div>

            <div
              v-else-if="sets.length === 0"
              class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              No sets yet. Create one first.
              <NuxtLink class="ml-1 font-medium underline" to="/create/basic">Create · Basic</NuxtLink>
            </div>

            <div
              v-else-if="filteredSets.length === 0"
              class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              No results.
            </div>

            <ul v-else class="mt-3 space-y-3">
              <li v-for="s in filteredSets" :key="s.id">
                <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                        {{ s.title }}
                      </p>
                      <p v-if="s.description" class="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
                        {{ s.description }}
                      </p>
                    </div>

                    <button
                      type="button"
                      class="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                      :disabled="busy || isWebPreview"
                      @click="toggleSelected(s.id)"
                    >
                      {{ isSelected(s.id) ? 'Remove' : 'Add' }}
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <aside class="space-y-6">
          <section
            class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            aria-label="Theme"
          >
            <h2 class="text-sm font-medium text-slate-900 dark:text-slate-50">Theme (optional)</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              A hint for the synthesis focus (e.g. “exam 2”, “core concepts”, “definitions only”).
            </p>

            <div class="mt-3">
              <label class="sr-only" for="synth-theme">Theme</label>
              <input
                id="synth-theme"
                v-model="theme"
                type="text"
                autocomplete="off"
                placeholder="Theme…"
                class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
            </div>
          </section>

          <section
            class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            aria-label="Selected sets"
          >
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-sm font-medium text-slate-900 dark:text-slate-50">Selected</h2>
              <span
                class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {{ selectedSets.length }}
              </span>
            </div>

            <p v-if="selectedSets.length === 0" class="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Choose at least one set.
            </p>

            <ul v-else class="mt-3 space-y-2">
              <li v-for="s in selectedSets" :key="s.id">
                <div class="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p class="min-w-0 truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                    {{ s.title }}
                  </p>
                  <button
                    type="button"
                    class="shrink-0 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                    :disabled="busy || isWebPreview"
                    @click="removeSelected(s.id)"
                  >
                    Remove
                  </button>
                </div>
              </li>
            </ul>

            <p v-if="formError" class="mt-4 text-sm text-red-700 dark:text-red-300">
              {{ formError }}
            </p>
          </section>
        </aside>
      </div>

      <section
        v-if="rawOutput"
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="AI output"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-sm font-medium text-slate-900 dark:text-slate-50">AI output</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              If parsing fails, copy the raw output and try again.
            </p>
          </div>

          <div class="shrink-0 flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :disabled="!rawOutput"
              @click="copyRaw"
            >
              Copy
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :disabled="!rawOutput"
              @click="selectAllRaw"
            >
              Select all
            </button>
          </div>
        </div>

        <p v-if="rawMessage" class="mt-3 text-sm text-slate-700 dark:text-slate-200">
          {{ rawMessage }}
        </p>

        <div class="mt-4">
          <label class="sr-only" for="ai-raw-output">Raw output</label>
          <textarea
            id="ai-raw-output"
            ref="rawTextareaEl"
            readonly
            rows="10"
            class="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            :value="rawOutput"
            @focus="selectAllRaw"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { lockGetStatus } from '~/src/composables/lock'
import {
  createProfileRepo,
  createSettingsRepo,
  createSetsRepo,
  useTracerDb,
  type FlashcardSet,
  type FlashcardSetListItem,
  type Uuid
} from '~/src/composables/db'
import { useLockSession } from '~/src/composables/lock-session'
import { parseTermsTsv, TsvParseError, normalizeTerms, TermsValidationError } from '~/src/composables/db/validators'
import { resolveAiModel } from '~/src/composables/ai/registry'
import { normalizeAiError, aiErrorForMissingDefaultModel, type AiErrorUx } from '~/src/composables/ai/ux-errors'
import { hasTauriRuntime } from '~/src/composables/tauri'
import { generateText } from 'ai'
import { filterSetSearch } from '~/src/composables/search/set-search'

const router = useRouter()
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession()

const hasTauriInternals = hasTauriRuntime()

const isWebPreview = computed(() => !hasTauriInternals)

const loading = ref(false)
const loadError = ref<string | null>(null)
const sets = ref<FlashcardSetListItem[]>([])

const query = ref('')
const theme = ref('')
const selectedIds = ref<Uuid[]>([])

const busy = ref(false)
const formError = ref<string | null>(null)

const rawOutput = ref<string | null>(null)
const rawMessage = ref<string | null>(null)
const rawTextareaEl = ref<HTMLTextAreaElement | null>(null)

const aiError = ref<AiErrorUx | null>(null)
const aiErrorOpen = ref(false)

function showAiError(err: unknown) {
  aiError.value = normalizeAiError(err)
  aiErrorOpen.value = true
}

function closeAiError() {
  aiErrorOpen.value = false
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (isRecord(err) && typeof err.message === 'string') return err.message
  return fallback
}

const filteredSets = computed(() => {
  return filterSetSearch(sets.value, query.value)
})

function isSelected(id: Uuid) {
  return selectedIds.value.includes(id)
}

function toggleSelected(id: Uuid) {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function removeSelected(id: Uuid) {
  selectedIds.value = selectedIds.value.filter((x) => x !== id)
}

const selectedSets = computed(() => {
  const byId = new Map(sets.value.map((s) => [s.id, s] as const))
  return selectedIds.value.map((id) => byId.get(id)).filter((v): v is FlashcardSetListItem => !!v)
})

const createDisabled = computed(() => busy.value || isWebPreview.value || selectedIds.value.length === 0)

async function loadSets() {
  loading.value = true
  loadError.value = null
  try {
    const db = await useTracerDb()
    const repo = createSetsRepo(db)
    sets.value = await repo.list()
  } catch {
    loadError.value = 'Failed to load sets.'
  } finally {
    loading.value = false
  }
}

function tsvCell(s: string) {
  return s.split('\r').join('').split('\n').join('\\n').split('\t').join(' ').trim()
}

function buildInputTsv(sourceSets: FlashcardSet[]) {
  const header = ['source', 'term', 'definition'].join('\t')
  const rows: string[] = []
  for (const s of sourceSets) {
    for (const t of s.terms) {
      rows.push([tsvCell(s.title), tsvCell(t.front), tsvCell(t.back)].join('\t'))
    }
  }
  return [header, ...rows].join('\n')
}

function synthesisTitle() {
  const t = theme.value.trim()
  if (t) return `Synthesis · ${t}`
  return 'Synthesis'
}

function synthesisDescription(sourceSets: FlashcardSetListItem[]) {
  const titles = sourceSets.map((s) => s.title).filter(Boolean)
  if (titles.length === 0) return null
  const list = titles.slice(0, 8).join(', ')
  const suffix = titles.length > 8 ? ` (+${titles.length - 8} more)` : ''
  return `Synthesized from: ${list}${suffix}`
}

function buildPrompt(args: { theme: string | null; inputTsv: string }) {
  const themeLine = args.theme ? `Theme: ${args.theme}\n` : ''
  return [
    'You are synthesizing flashcards from existing cards.',
    'Return ONLY TSV lines in the form: term<TAB>definition',
    'Rules:',
    '- Output TSV only. No prose, no markdown, no code fences.',
    '- One card per line.',
    '- Each line must contain exactly one tab separator.',
    '- Do not include a header row.',
    '- Do not include numbering or bullets.',
    '- Do not include tabs inside term or definition (use spaces instead).',
    themeLine.trimEnd(),
    'Input TSV (source<TAB>term<TAB>definition):',
    args.inputTsv
  ]
    .filter((x) => x.length > 0)
    .join('\n')
}

function selectAllRaw() {
  const el = rawTextareaEl.value
  if (!el) return
  el.focus()
  el.select()
}

async function copyRaw() {
  rawMessage.value = null
  const text = rawOutput.value
  if (!text) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      rawMessage.value = 'Copied to clipboard.'
      return
    }
  } catch {
  }

  selectAllRaw()
  rawMessage.value = 'Select the text and copy it manually.'
}

async function onCreate() {
  formError.value = null
  rawMessage.value = null
  rawOutput.value = null
  aiError.value = null
  aiErrorOpen.value = false
  if (busy.value) return

  if (isWebPreview.value) {
    formError.value = 'Synthesize is not available in web preview.'
    return
  }

  if (selectedIds.value.length === 0) {
    formError.value = 'Select at least one set.'
    return
  }

  busy.value = true
  try {
    const db = await useTracerDb()
    const settings = await createSettingsRepo(db).get()
    if (!settings.defaultModelId) {
      aiError.value = aiErrorForMissingDefaultModel()
      aiErrorOpen.value = true
      return
    }

    const setsRepo = createSetsRepo(db)
    const sourceSets: FlashcardSet[] = []
    for (const id of selectedIds.value) {
      const s = await setsRepo.get(id)
      if (s) sourceSets.push(s)
    }
    if (sourceSets.length === 0) {
      throw new Error('Selected sets could not be loaded.')
    }

    const inputTsv = buildInputTsv(sourceSets)
    const prompt = buildPrompt({ theme: theme.value.trim() ? theme.value.trim() : null, inputTsv })

    const model = await resolveAiModel(settings.defaultModelId)
    const res = await generateText({ model, prompt })
    const text = (res.text ?? '').trim()

    rawOutput.value = res.text ?? ''

    let termInputs = parseTermsTsv(text)
    termInputs = termInputs.map((t) => ({
      front: t.front.split('\t').join(' ').trim(),
      back: t.back.split('\t').join(' ').trim()
    }))
    const terms = normalizeTerms(termInputs)

    const id = crypto.randomUUID() as Uuid
    await setsRepo.create({
      id,
      title: synthesisTitle(),
      description: synthesisDescription(selectedSets.value),
      terms
    })

    await router.replace(`/set/${id}`)
  } catch (e: unknown) {
    if (e instanceof TsvParseError || e instanceof TermsValidationError) {
      showAiError(e)
    } else {
      showAiError(e)
    }
  } finally {
    busy.value = false
    await nextTick()
    if (rawOutput.value) rawTextareaEl.value?.focus()
  }
}

onMounted(async () => {
  if (isWebPreview.value) {
    sets.value = []
    loading.value = false
    loadError.value = null
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

    if (!settings.defaultModelId) {
      await router.replace({ path: '/settings', query: { reason: 'missing-default-model', from: '/create/synthesize' } })
      return
    }

    await loadSets()
    return
  } catch {
    markLocked()
    await router.replace('/unlock')
  }
})
</script>
