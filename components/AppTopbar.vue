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

      <div ref="searchRootEl" class="relative flex-1">
        <label class="sr-only" for="nav-search">Search</label>
        <form class="relative" @submit.prevent="onSubmit">
          <input
            id="nav-search"
            v-model="draft"
            type="search"
            autocomplete="off"
            placeholder="Search sets…"
            class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            @focus="openSearch"
            @click="openSearch"
          />
        </form>

        <div
          v-if="searchOpen"
          class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
          role="listbox"
          aria-label="Search results"
        >
          <div
            v-if="searchBusy"
            class="px-3 py-3 text-sm text-slate-600 dark:text-slate-300"
          >
            Loading…
          </div>
          <div
            v-else-if="searchError"
            class="px-3 py-3 text-sm text-red-700 dark:text-red-300"
          >
            {{ searchError }}
          </div>
          <ul v-else-if="searchResults.length > 0" class="max-h-80 overflow-auto py-1">
            <li v-for="item in searchResults" :key="searchItemKey(item)">
              <NuxtLink
                :to="topbarSearchItemTo(item)"
                class="flex items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500"
                role="option"
                @click="selectSearchResult"
              >
                <span class="min-w-0">
                  <span class="block truncate font-medium text-slate-900 dark:text-slate-50">
                    {{ item.title }}
                  </span>
                  <span
                    v-if="item.subtitle"
                    class="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ item.subtitle }}
                  </span>
                </span>
                <span class="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {{ item.kindLabel }}
                </span>
              </NuxtLink>
            </li>
          </ul>
          <div
            v-else
            class="px-3 py-3 text-sm text-slate-600 dark:text-slate-300"
          >
            No results.
          </div>
        </div>
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
import {
  createSetsRepo,
  createStudyGuidesRepo,
  useTracerDb,
  type FlashcardSetListItem,
  type Uuid
} from '~/src/composables/db'
import { hasTauriRuntime } from '~/src/composables/tauri'
import {
  createWebPreviewSearchItems,
  filterTopbarSearchItems,
  topbarSearchItemTo,
  type TopbarSearchItem
} from '~/src/composables/search/topbar-search'

const draft = ref('')
const searchRootEl = ref<HTMLElement | null>(null)
const searchOpen = ref(false)
const searchBusy = ref(false)
const searchError = ref<string | null>(null)
const searchItems = ref<TopbarSearchItem[]>([])
let searchLoaded = false

const searchResults = computed(() => filterTopbarSearchItems(searchItems.value, draft.value))

watch(draft, () => {
  openSearch()
})

function searchItemKey(item: TopbarSearchItem) {
  return `${item.kind}:${item.id}`
}

function toSetSearchItem(s: FlashcardSetListItem): TopbarSearchItem {
  return {
    kind: 'set',
    kindLabel: 'Set',
    id: s.id,
    title: s.title,
    description: s.description,
    subtitle: s.description
  }
}

async function loadSearchItems() {
  if (searchLoaded || searchBusy.value) return
  searchBusy.value = true
  searchError.value = null
  try {
    if (!hasTauriRuntime()) {
      searchItems.value = createWebPreviewSearchItems()
      searchLoaded = true
      return
    }

    const db = await useTracerDb()
    const setsRepo = createSetsRepo(db)
    const guidesRepo = createStudyGuidesRepo(db)
    const sets = await setsRepo.list()
    const next: TopbarSearchItem[] = []

    const setTitleById = new Map<Uuid, string>()
    for (const set of sets) setTitleById.set(set.id, set.title)

    for (const set of sets) {
      next.push(toSetSearchItem(set))
      const guide = await guidesRepo.getBySetId(set.id)
      if (guide) {
        next.push({
          kind: 'study-guide',
          kindLabel: 'Study guide',
          id: guide.id,
          setId: guide.setId,
          title: `Study guide · ${setTitleById.get(guide.setId) ?? 'Untitled set'}`,
          description: null,
          subtitle: null
        })
      }
    }

    searchItems.value = next
    searchLoaded = true
  } catch {
    searchError.value = 'Failed to load search results.'
  } finally {
    searchBusy.value = false
  }
}

function openSearch() {
  const wasOpen = searchOpen.value
  searchOpen.value = true
  if (!wasOpen) searchLoaded = false
  loadSearchItems()
}

function closeSearch() {
  searchOpen.value = false
}

function selectSearchResult() {
  closeSearch()
}

function onSubmit() {
  openSearch()
}

function onDocumentPointerDown(event: PointerEvent) {
  const root = searchRootEl.value
  if (!root) return
  const target = event.target
  if (target instanceof Node && root.contains(target)) return
  closeSearch()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>
