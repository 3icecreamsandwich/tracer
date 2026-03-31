<template>
  <main>
    <div class="mx-auto max-w-md p-8">
      <h1 class="text-2xl font-semibold">Welcome to Tracer</h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Create your profile and set an app password.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium">Name</label>
          <input
            v-model="name"
            type="text"
            autocomplete="name"
            class="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label class="block text-sm font-medium">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label class="block text-sm font-medium">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            class="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label class="block text-sm font-medium">Confirm password</label>
          <input
            v-model="confirm"
            type="password"
            autocomplete="new-password"
            class="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

        <button
          type="submit"
          class="w-full rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          :disabled="busy"
        >
          {{ busy ? 'Saving…' : 'Continue' }}
        </button>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ hideNavbar: true })

import { lockFirstRunSetPassword } from '../src/composables/lock'
import { createProfileRepo, useTracerDb } from '../src/composables/db'
import { useLockSession } from '../src/composables/lock-session'

const router = useRouter()
const { markUnlocked } = useLockSession()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
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

function isValidEmail(input: string) {
  const v = input.trim()
  if (!v.includes('@')) return false
  if (v.startsWith('@') || v.endsWith('@')) return false
  if (v.includes(' ')) return false
  return true
}

async function onSubmit() {
  error.value = null
  if (name.value.trim().length === 0) {
    error.value = 'Name is required'
    return
  }

  if (!isValidEmail(email.value)) {
    error.value = 'Enter a valid email address'
    return
  }

  if (password.value.trim().length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return
  }

  busy.value = true
  try {
    const db = await useTracerDb()
    await createProfileRepo(db).set({ name: name.value.trim(), email: email.value.trim() })
    await lockFirstRunSetPassword(password.value)
    markUnlocked()
    await router.replace('/')
  } catch (e: unknown) {
    error.value = toErrorMessage(e, 'Failed to set up Tracer')
  } finally {
    busy.value = false
  }
}
</script>
