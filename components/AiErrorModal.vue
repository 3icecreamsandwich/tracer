<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-6"
    role="dialog"
    aria-modal="true"
    aria-label="AI error"
    @keydown.esc="$emit('close')"
  >
    <button
      type="button"
      class="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
      aria-label="Close AI error modal"
      @click="$emit('close')"
    />

    <div
      class="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {{ error?.title ?? 'Something went wrong' }}
          </h2>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {{ error?.message ?? '' }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink
          v-if="settingsHref"
          :to="settingsHref"
          class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          @click="$emit('close')"
        >
          Go to Settings
        </NuxtLink>

        <button
          v-if="showRetry"
          type="button"
          class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          @click="$emit('retry')"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AiErrorUx } from '~/src/composables/ai/ux-errors'
import { aiErrorSettingsReason } from '~/src/composables/ai/ux-errors'

const props = defineProps<{ open: boolean; error: AiErrorUx | null; from?: string; showRetry?: boolean }>()

defineEmits<{ (e: 'close'): void; (e: 'retry'): void }>()

const settingsHref = computed(() => {
  const err = props.error
  if (!props.open || !err) return null
  if (!err.showGoToSettings) return null
  const reason = aiErrorSettingsReason(err.key)
  if (!reason) return '/settings'
  const from = props.from?.trim() ? props.from!.trim() : undefined
  return { path: '/settings', query: { reason, ...(from ? { from } : {}) } }
})

const showRetry = computed(() => {
  if (!props.open) return false
  if (!props.showRetry) return false
  const key = props.error?.key
  if (!key) return false
  return key !== 'missing_default_model' && key !== 'missing_credentials' && key !== 'oauth_not_authenticated'
})
</script>
