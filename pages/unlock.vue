<template>
  <main>
    <div class="mx-auto max-w-md p-8">
      <h1 class="text-2xl font-semibold">Unlock Tracer</h1>

      <form class="mt-6 space-y-4" @submit.prevent="onUnlock">
        <div>
          <label class="block text-sm font-medium">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

        <button
          type="submit"
          class="w-full rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          :disabled="busy"
        >
          {{ busy ? 'Unlocking…' : 'Unlock' }}
        </button>
      </form>

      <button
        class="mt-6 w-full rounded border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
        :disabled="busy"
        @click="onReset"
      >
        Reset Tracer
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ hideNavbar: true })

import { lockResetTracer, lockUnlock } from '../src/composables/lock'
import { useLockSession } from '../src/composables/lock-session'

const router = useRouter()
const { markLocked, markUnlocked } = useLockSession()

const password = ref('')
const error = ref<string | null>(null)
const busy = ref(false)

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (isRecord(err) && typeof err.message === 'string') return err.message
  return fallback
}

async function onUnlock() {
  error.value = null
  busy.value = true
  try {
    await lockUnlock(password.value)
    markUnlocked()
    await router.replace('/')
  } catch (e: unknown) {
    markLocked()
    error.value = toErrorMessage(e, 'Failed to unlock')
  } finally {
    busy.value = false
  }
}

async function onReset() {
  error.value = null
  busy.value = true
  try {
    await lockResetTracer()
    markLocked()
    await router.replace('/first-run')
  } catch (e: unknown) {
    error.value = toErrorMessage(e, 'Failed to reset')
  } finally {
    busy.value = false
  }
}
</script>
