<template>
  <main>
    <div class="mx-auto max-w-3xl p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Create · Basic</h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Add cards manually. Use Tab to move between fields; Ctrl/⌘ + Enter adds a new card.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          :disabled="busy"
          @click="onCreate"
        >
          {{ busy ? 'Creating…' : 'Create' }}
        </button>
      </div>

      <div class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium" for="set-title">Title</label>
          <input
            id="set-title"
            ref="titleEl"
            v-model="title"
            type="text"
            autocomplete="off"
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          />
        </div>

        <div>
          <label class="block text-sm font-medium" for="set-description">Description</label>
          <textarea
            id="set-description"
            v-model="description"
            rows="2"
            class="mt-1 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          />
        </div>
      </div>

      <div class="mt-8 space-y-4">
        <h2 class="text-sm font-medium text-slate-700 dark:text-slate-200">Cards</h2>

        <p v-if="formError" class="text-sm text-red-700 dark:text-red-300">
          {{ formError }}
        </p>

        <div
          v-for="(card, idx) in cards"
          :key="card.key"
          class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Card {{ idx + 1 }}</p>

            <button
              v-if="cards.length > 1"
              type="button"
              class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :disabled="busy"
              @click="removeCard(idx)"
            >
              Remove
            </button>
          </div>

          <div class="mt-3 space-y-3">
            <div>
              <label class="block text-sm font-medium" :for="`term-${card.key}`">Term</label>
              <input
                :id="`term-${card.key}`"
                v-model="card.front"
                type="text"
                autocomplete="off"
                class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                @keydown="onCardKeydown($event, idx)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium" :for="`definition-${card.key}`">Definition</label>
              <textarea
                :id="`definition-${card.key}`"
                v-model="card.back"
                rows="2"
                class="mt-1 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                @keydown="onCardKeydown($event, idx)"
              />
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            :disabled="busy"
            @click="appendCardAndFocus(cards.length)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { lockGetStatus } from '~/src/composables/lock'
import { useLockSession } from '~/src/composables/lock-session'
import { createProfileRepo, createSettingsRepo, createSetsRepo, useTracerDb } from '~/src/composables/db'
import { normalizeTerms, type TermInput, TermsValidationError } from '~/src/composables/db/validators'

type DraftCardRow = {
  key: string
  front: string
  back: string
}

const router = useRouter()
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession()

const title = ref('')
const description = ref('')
const cards = ref<DraftCardRow[]>([{ key: crypto.randomUUID(), front: '', back: '' }])

const busy = ref(false)
const formError = ref<string | null>(null)

const titleEl = ref<HTMLInputElement | null>(null)

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (isRecord(err) && typeof err.message === 'string') return err.message
  return fallback
}

function appendBlankCard() {
  cards.value = [...cards.value, { key: crypto.randomUUID(), front: '', back: '' }]
}

async function appendCardAndFocus(nextIndex: number) {
  appendBlankCard()
  await nextTick()
  const next = cards.value[nextIndex]
  const el = document.getElementById(`term-${next.key}`)
  if (el instanceof HTMLInputElement) el.focus()
}

function removeCard(index: number) {
  const next = cards.value.slice()
  next.splice(index, 1)
  cards.value = next.length ? next : [{ key: crypto.randomUUID(), front: '', back: '' }]
}

function isCtrlOrMetaEnter(e: KeyboardEvent) {
  return e.key === 'Enter' && (e.metaKey || e.ctrlKey)
}

async function onCardKeydown(e: KeyboardEvent, index: number) {
  if (!isCtrlOrMetaEnter(e)) return
  e.preventDefault()
  await appendCardAndFocus(index + 1)
}

function validateInputs(): { title: string; description: string | null; termInputs: TermInput[] } {
  const t = title.value.trim()
  if (!t) {
    throw new Error('Title is required.')
  }

  const d = description.value.trim()
  const desc = d ? d : null

  if (cards.value.length === 0) {
    throw new Error('Add at least one card.')
  }

  const termInputs: TermInput[] = cards.value.map((c) => ({ front: c.front, back: c.back }))

  // Normalize trims + validates non-empty + assigns ids.
  // We still keep the original drafts; normalized terms are for persistence.
  normalizeTerms(termInputs)

  return { title: t, description: desc, termInputs }
}

async function onCreate() {
  formError.value = null
  if (busy.value) return
  busy.value = true
  try {
    const { title: t, description: desc, termInputs } = validateInputs()
    const terms = normalizeTerms(termInputs)
    const db = await useTracerDb()
    const repo = createSetsRepo(db)
    const id = crypto.randomUUID()
    await repo.create({ id, title: t, description: desc, terms })
    await router.replace(`/set/${id}`)
  } catch (e: unknown) {
    if (e instanceof TermsValidationError) {
      formError.value = e.message
    } else {
      formError.value = toErrorMessage(e, 'Failed to create set.')
    }
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  // Preserve the startup lock gate pattern used by other pages.
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
      await nextTick()
      titleEl.value?.focus()
      return
    }

    if (status.can_auto_unlock) {
      markUnlocked()
    }

    await nextTick()
    titleEl.value?.focus()
  } catch {
    markLocked()
    await router.replace('/unlock')
  }
})
</script>
