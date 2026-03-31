<template>
  <main>
    <div class="mx-auto max-w-5xl px-6 py-8">
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          aria-labelledby="home-sets"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 id="home-sets" class="text-lg font-semibold">Sets</h1>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Your flashcard sets and study guides.
              </p>
            </div>
            <!-- <NuxtLink
              to="/settings"
              class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            >
              Settings
            </NuxtLink> -->
          </div>

          <div class="mt-5">
            <p v-if="loadError" class="text-sm text-red-700 dark:text-red-300">
              {{ loadError }}
            </p>

            <div v-else>
              <div
                v-if="!hasTauriRuntime()"
                class="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                role="status"
                aria-live="polite"
              >
                This is a web preview. Showing demo items; your full set list requires the desktop app (Tauri).
              </div>

              <div
                v-if="busy"
                class="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Loading…
              </div>

              <div
                v-else-if="items.length === 0"
                class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                No sets or study guides yet. Use Create to get started.
              </div>

              <ul v-else class="mt-3 space-y-3">
                <li v-for="item in filteredItems" :key="itemKey(item)">
                  <NuxtLink
                    :to="itemTo(item)"
                    :aria-label="itemAriaLabel(item)"
                    class="group block rounded-md border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                          {{ item.title }}
                        </p>
                        <p
                          v-if="item.subtitle"
                          class="mt-1 truncate text-sm text-slate-600 dark:text-slate-300"
                        >
                          {{ item.subtitle }}
                        </p>
                      </div>
                      <span
                        class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {{ item.kindLabel }}
                      </span>
                    </div>

                    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span v-if="item.updatedAt">Updated {{ formatDate(item.updatedAt) }}</span>
                      <span v-else>Created {{ formatDate(item.createdAt) }}</span>
                    </div>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          aria-labelledby="home-create"
        >
          <h2 id="home-create" class="text-lg font-semibold">Create</h2>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Choose a starting point.</p>

          <div class="mt-4 grid gap-3">
            <NuxtLink
              to="/create/basic"
              class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            >
              <p class="text-sm font-medium text-slate-900 dark:text-slate-50">Basic</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Start from scratch.
              </p>
            </NuxtLink>

            <NuxtLink
              to="/create/synthesize"
              class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            >
              <p class="text-sm font-medium text-slate-900 dark:text-slate-50">Synthesize</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Turn notes into a set.
              </p>
            </NuxtLink>

            <NuxtLink
              to="/create/generate"
              class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            >
              <p class="text-sm font-medium text-slate-900 dark:text-slate-50">Generate</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Create from a prompt.
              </p>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { lockGetStatus } from '../src/composables/lock'
import {
  createProfileRepo,
  createSettingsRepo,
  createSetsRepo,
  createStudyGuidesRepo,
  useTracerDb
} from '../src/composables/db'
import { useLockSession } from '../src/composables/lock-session'
import type { FlashcardSetListItem, Uuid } from '../src/composables/db/types'
import { hasTauriRuntime } from '../src/composables/tauri'
import { filterSetSearch } from '../src/composables/search/set-search'

const router = useRouter()
const route = useRoute()
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession()

type HomeListItem = {
  kind: 'set' | 'study-guide'
  kindLabel: 'Set' | 'Study guide'
  id: Uuid
  setId?: Uuid
  title: string
  subtitle: string | null
  createdAt: string
  updatedAt: string | null
}

const busy = ref(true)
const loadError = ref<string | null>(null)
const items = ref<HomeListItem[]>([])

const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

const filteredItems = computed(() => {
  return filterSetSearch(items.value, query.value)
})

function itemKey(item: HomeListItem) {
  return `${item.kind}:${item.id}`
}

function itemTo(item: HomeListItem) {
  if (item.kind === 'set') return `/set/${item.id}`
  return `/study-guide/${item.setId ?? item.id}`
}

function itemAriaLabel(item: HomeListItem) {
  return item.title
}

function initWebDemoItems() {
  const now = new Date().toISOString()
  items.value = [
    {
      kind: 'set',
      kindLabel: 'Set',
      id: 'demo' as Uuid,
      title: 'Demo set',
      subtitle: 'Web preview fallback. Full list requires desktop.',
      createdAt: now,
      updatedAt: now
    },
    {
      kind: 'study-guide',
      kindLabel: 'Study guide',
      id: 'demo-guide' as Uuid,
      setId: 'demo' as Uuid,
      title: 'Study guide · Demo set',
      subtitle: null,
      createdAt: now,
      updatedAt: null
    }
  ]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function sortIsoDesc(a: string, b: string) {
  if (a === b) return 0
  return a > b ? -1 : 1
}

async function loadHomeList() {
  busy.value = true
  loadError.value = null
  try {
    const db = await useTracerDb()
    const setsRepo = createSetsRepo(db)
    const guidesRepo = createStudyGuidesRepo(db)

    const sets = await setsRepo.list()
    const next: HomeListItem[] = []

    const setTitleById = new Map<Uuid, string>()
    for (const s of sets) {
      setTitleById.set(s.id, s.title)
    }

    for (const s of sets) {
      next.push(toSetListItem(s))
      const guide = await guidesRepo.getBySetId(s.id)
      if (guide) {
        next.push({
          kind: 'study-guide',
          kindLabel: 'Study guide',
          id: guide.id,
          setId: guide.setId,
          title: `Study guide · ${setTitleById.get(guide.setId) ?? 'Untitled set'}`,
          subtitle: null,
          createdAt: guide.createdAt,
          updatedAt: null
        })
      }
    }

    next.sort((a, b) => sortIsoDesc(a.updatedAt ?? a.createdAt, b.updatedAt ?? b.createdAt))
    items.value = next
  } catch {
    loadError.value = 'Failed to load sets and study guides.'
  } finally {
    busy.value = false
  }
}

function toSetListItem(s: FlashcardSetListItem): HomeListItem {
  return {
    kind: 'set',
    kindLabel: 'Set',
    id: s.id,
    title: s.title,
    subtitle: s.description,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  }
}

onMounted(async () => {
  if (!hasTauriRuntime()) {
    busy.value = false
    loadError.value = null
    initWebDemoItems()
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
      if (unlockedThisSession.value) {
        await loadHomeList()
        return
      }
      markLocked()
      await router.replace('/unlock')
      return
    }

    if (status.can_auto_unlock) {
      markUnlocked()
      await loadHomeList()
      return
    }

    await loadHomeList()
  } catch {
    loadError.value = 'Failed to load sets and study guides.'
    busy.value = false
  }
})
</script>
