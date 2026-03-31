<template>
  <main>
    <div class="mx-auto max-w-3xl p-8">
      <h1 class="text-2xl font-semibold">Settings</h1>

      <div
        v-if="gateMessage"
        class="mt-4 flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        role="status"
        aria-live="polite"
      >
        <div>
          <p class="font-medium">Action required</p>
          <p class="mt-1 text-amber-800 dark:text-amber-200">
            {{ gateMessage }}
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900 shadow-sm hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:border-amber-900/60 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900/40 dark:focus-visible:ring-amber-600 dark:focus-visible:ring-offset-slate-950"
          @click="dismissGateMessage"
        >
          Dismiss
        </button>
      </div>

      <section
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="Profile"
      >
        <div class="flex items-center gap-4">
          <div
            class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
            aria-hidden="true"
          >
            {{ avatarText }}
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
              {{ profile?.name ?? 'User' }}
            </p>
            <p class="truncate text-sm text-slate-600 dark:text-slate-300">
              {{ profile?.email ?? '' }}
            </p>
          </div>
        </div>
      </section>

      <section
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="Theme"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-medium">Dark mode</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Affects the whole app and persists on restart.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            :disabled="busy"
            @click="onToggleDarkMode"
          >
            {{ darkMode ? 'On' : 'Off' }}
          </button>
        </div>
      </section>

      <section
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="Default AI model"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-sm font-medium">Default AI Model</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Required for Synthesize, Generate, and Chat.
            </p>
            <p class="mt-3 text-sm text-slate-700 dark:text-slate-200">
              <span class="font-medium text-slate-900 dark:text-slate-50">Current:</span>
              <span v-if="defaultModelLabel" class="ml-1">{{ defaultModelLabel }}</span>
              <span v-else class="ml-1 text-slate-500 dark:text-slate-400">None</span>
            </p>
          </div>

          <button
            type="button"
            class="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            :disabled="busy"
            @click="openModelPicker"
          >
            {{ defaultModelId ? 'Change' : 'Set' }}
          </button>
        </div>
      </section>

      <section
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="Learn"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-sm font-medium">Learn · Hybrid (AI-augmented)</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Adds AI-generated questions in addition to the deterministic baseline.
            </p>
            <p v-if="!defaultModelId" class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Choose a Default AI Model to enable this.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            :disabled="busy || !defaultModelId"
            @click="onToggleLearnHybrid"
          >
            {{ learnHybridEnabled ? 'On' : 'Off' }}
          </button>
        </div>
      </section>

      <section
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="Providers"
      >
        <h2 class="text-sm font-medium">Providers</h2>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Provider keys and tokens are stored in the vault.
        </p>

        <div class="mt-4 grid gap-4">
          <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-medium text-slate-900 dark:text-slate-50">OpenAI (BYOK)</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">API key</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <input
                v-model="openAiKey"
                type="password"
                autocomplete="off"
                placeholder="sk-…"
                class="min-w-[240px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
            </div>
          </div>

          <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-medium text-slate-900 dark:text-slate-50">Anthropic (BYOK)</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">API key</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <input
                v-model="anthropicKey"
                type="password"
                autocomplete="off"
                placeholder="sk-ant-…"
                class="min-w-[240px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
            </div>
          </div>

          <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-medium text-slate-900 dark:text-slate-50">Gemini (BYOK)</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">API key</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <input
                v-model="geminiKey"
                type="password"
                autocomplete="off"
                placeholder="AIza…"
                class="min-w-[240px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
            </div>
          </div>

          <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-medium text-slate-900 dark:text-slate-50">OpenAI Compatible (Advanced)</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Base URL, default model, API key</p>
            <div class="mt-3 grid gap-2">
              <input
                v-model="openAiCompatBaseURL"
                type="url"
                autocomplete="off"
                placeholder="https://api.example.com/v1"
                class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
              <input
                v-model="openAiCompatModelId"
                type="text"
                autocomplete="off"
                placeholder="model-id"
                class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
              <input
                v-model="openAiCompatKey"
                type="password"
                autocomplete="off"
                placeholder="api-key"
                class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              />
            </div>
          </div>

           <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
             <p class="text-sm font-medium text-slate-900 dark:text-slate-50">GitHub Models (OAuth)</p>
             <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Authenticate to use GitHub Models.</p>
             <div class="mt-3">
               <button
                 type="button"
                 class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                 :disabled="busy"
                 @click="openGithubAuth"
               >
                 Authenticate
               </button>
             </div>

              <div class="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <span class="font-medium">Status:</span>
                <span v-if="githubModelsAuthState.status === 'authenticated'" class="ml-1">Authenticated</span>
                <span v-else-if="githubModelsAuthState.status === 'invalid'" class="ml-1">Token invalid</span>
                <span v-else-if="githubModelsAuthState.status === 'vault_locked'" class="ml-1">Vault locked</span>
                <span v-else class="ml-1">Not authenticated</span>
              </div>
            </div>

          <div class="pt-2">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :disabled="busy"
              @click="onSaveProviderSecrets"
            >
              Save provider settings
            </button>
          </div>
        </div>
      </section>

      <section
        class="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-label="Startup lock"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-medium">Require password on startup</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              When disabled, Tracer will auto-unlock using your OS keychain.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            :disabled="busy"
            @click="onToggleStartupLock"
          >
            {{ startupLockEnabled ? 'Enabled' : 'Disabled' }}
          </button>
        </div>

        <div v-if="showPasswordPrompt" class="mt-4 space-y-3">
          <label class="block text-sm font-medium" for="confirm-disable-lock">
            Confirm password to disable lock
          </label>
          <input
            id="confirm-disable-lock"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          />

          <p v-if="error" class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>

          <div class="flex gap-2">
            <button
              type="button"
              class="rounded bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              :disabled="busy"
              @click="onConfirmDisable"
            >
              Confirm
            </button>
            <button
              type="button"
              class="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :disabled="busy"
              @click="onCancelDisable"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-lg border border-red-200 bg-white p-5 shadow-sm dark:border-red-900 dark:bg-slate-950">
        <h2 class="text-sm font-medium text-red-700 dark:text-red-300">Danger zone</h2>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Reset removes your vault and local database.
        </p>

        <p v-if="error" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ error }}</p>

        <button
          type="button"
          class="mt-4 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-red-800 dark:bg-slate-950 dark:text-red-300 dark:hover:bg-red-950 dark:focus-visible:ring-red-600 dark:focus-visible:ring-offset-slate-950"
          :disabled="busy"
          @click="onReset"
        >
          Reset Tracer
        </button>
      </section>

      <div
        v-if="isModelPickerOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Choose default AI model"
        @keydown.esc="closeModelPicker"
      >
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
          aria-label="Close model picker"
          @click="closeModelPicker"
        />

        <div
          class="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
          @keydown="onModelPickerKeydown"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">Default AI Model</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Search providers first, then pick a model.
              </p>
              <p class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Tip: ↑/↓ to navigate · Enter to select · Esc to close
              </p>
            </div>

            <div class="shrink-0 flex gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                @click="closeModelPicker"
              >
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                :disabled="modelPickerEnterDisabled"
                @click="onModelPickerEnter"
              >
                Enter
              </button>
            </div>
          </div>

          <div class="mt-4">
            <label class="sr-only" for="model-picker-search">Search</label>
            <input
              id="model-picker-search"
              ref="modelPickerSearchEl"
              v-model="modelPickerQuery"
              type="search"
              autocomplete="off"
              :placeholder="modelPickerStep === 'providers' ? 'Search providers…' : 'Search models…'"
              class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            />
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                <span v-if="modelPickerStep === 'providers'">Providers</span>
                <span v-else>Models · {{ activeProviderLabel }}</span>
              </p>

              <button
                v-if="modelPickerStep === 'models'"
                type="button"
                class="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                @click="backToProviders"
              >
                ← Back to providers
              </button>
            </div>

            <ul
              class="mt-3 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
              role="listbox"
              :aria-label="modelPickerStep === 'providers' ? 'Providers' : 'Models'"
            >
              <li v-for="(item, idx) in modelPickerItems" :key="item.key">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 focus-visible:outline-none dark:hover:bg-slate-900"
                  :class="idx === modelPickerHighlightedIndex ? 'bg-slate-50 dark:bg-slate-900' : ''"
                  @click="onModelPickerClick(item)"
                  @mousemove="modelPickerHighlightedIndex = idx"
                >
                  <span class="min-w-0">
                    <span class="block truncate font-medium text-slate-900 dark:text-slate-50">
                      {{ item.label }}
                    </span>
                    <span
                      v-if="item.hint"
                      class="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400"
                    >
                      {{ item.hint }}
                    </span>
                  </span>

                  <span class="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {{ item.actionLabel }}
                  </span>
                </button>
              </li>

              <li
                v-if="modelPickerItems.length === 0"
                class="px-3 py-3 text-sm text-slate-600 dark:text-slate-300"
              >
                No results.
              </li>
            </ul>
          </div>
        </div>
      </div>

       <div
         v-if="isGithubAuthOpen"
         class="fixed inset-0 z-50 flex items-center justify-center p-6"
         role="dialog"
         aria-modal="true"
         aria-label="Authenticate GitHub Models"
         @keydown.esc="closeGithubAuth"
       >
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
          aria-label="Close auth modal"
          @click="closeGithubAuth"
        />

        <div
          class="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">GitHub Models</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Authenticate with scope <span class="font-mono">models:read</span>.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              @click="closeGithubAuth"
            >
              Close
            </button>
          </div>

          <p v-if="githubAuthError" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ githubAuthError }}</p>

          <div v-if="githubModelsAuthState.status === 'authenticated'" class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
            <p class="font-medium">Authenticated</p>
            <p class="mt-1 text-xs">Models available: {{ githubModelsAvailableModelIds.length }}</p>
            <div class="mt-3 flex gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900/40 dark:focus-visible:ring-emerald-600 dark:focus-visible:ring-offset-slate-950"
                :disabled="githubAuthBusy"
                @click="onGithubAuthSignOut"
              >
                Sign out
              </button>
            </div>
          </div>

          <div v-else class="mt-4 space-y-3">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :disabled="githubAuthBusy"
              @click="onGithubAuthStart"
            >
              {{ githubAuthBusy ? 'Working…' : 'Start authentication' }}
            </button>

            <div
              v-if="githubAuthStep === 'device_pending' && githubAuthVerificationUri && githubAuthUserCode"
              class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <p class="font-medium">Device code</p>
              <p class="mt-2">
                Go to <span class="font-mono">{{ githubAuthVerificationUri }}</span> and enter:
              </p>
              <p class="mt-2 text-lg font-semibold tracking-widest">{{ githubAuthUserCode }}</p>
              <p v-if="githubAuthNextPollIntervalSec" class="mt-2 text-xs">
                Polling every {{ githubAuthNextPollIntervalSec }}s
              </p>

              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                  @click="onGithubAuthCopyUrl"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                  @click="onGithubAuthCopyCode"
                >
                  Copy code
                </button>
              </div>
            </div>

            <div
              v-else-if="githubAuthStep === 'pkce_pending'"
              class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Complete sign-in in your browser. We will finish automatically when the callback is received.
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  lockGetStatus,
  lockResetTracer,
  lockSetStartupLockEnabled
} from '../src/composables/lock'
import {
  createProfileRepo,
  createSettingsRepo,
  type Profile,
  useTracerDb
} from '../src/composables/db'
import { useLockSession } from '../src/composables/lock-session'
import { themeSetDarkMode } from '../src/composables/theme'
import {
  aiOpenAiCompatGetConfig,
  aiOpenAiCompatSetConfig,
  aiSecretsSet
} from '../src/composables/ai/credentials'
import { aiRegistryCatalog } from '../src/composables/ai/registry'
import {
  githubDeviceCodeRequest,
  githubDeviceTokenPollOnce,
  githubOAuthClientId,
  githubPkceAuthorizeUrl,
  githubPkceExchangeToken,
  githubPkceFinish,
  githubPkceStart,
  mapDevicePollResponse,
  openExternal,
  pkceChallengeS256,
  randomPkceVerifier
} from '../src/composables/ai/github-oauth'
import {
  githubModelsInvalidateToken,
  githubModelsLoadAuthState,
  githubModelsStoreToken,
  type GithubModelsAuthState
} from '../src/composables/ai/github-state'
import { hasTauriRuntime } from '../src/composables/tauri'
import { redactSensitiveText } from '../src/composables/security/redact'

const router = useRouter()
const route = useRoute()

const hasTauriInternals = hasTauriRuntime()

const isWebPreview = computed(() => !hasTauriInternals)

const { unlockedThisSession, markLocked, markUnlocked } = useLockSession()

const profile = ref<Profile | null>(null)

const startupLockEnabled = ref(true)
const darkMode = ref(false)
const defaultModelId = ref<string | null>(null)
const learnHybridEnabled = ref(false)

const showPasswordPrompt = ref(false)
const password = ref('')
const busy = ref(false)
const error = ref<string | null>(null)

// BYOK fields are intentionally not persisted yet.
// We avoid storing plaintext secrets in SQLite/localStorage.
const openAiKey = ref('')
const anthropicKey = ref('')
const geminiKey = ref('')

const openAiCompatBaseURL = ref('')
const openAiCompatModelId = ref('')
const openAiCompatKey = ref('')

const isGithubAuthOpen = ref(false)

type GithubAuthStep =
  | 'idle'
  | 'requesting'
  | 'device_pending'
  | 'device_success'
  | 'pkce_pending'
  | 'error'

const githubAuthBusy = ref(false)
const githubAuthStep = ref<GithubAuthStep>('idle')
const githubAuthError = ref<string | null>(null)
const githubAuthVerificationUri = ref<string | null>(null)
const githubAuthUserCode = ref<string | null>(null)
const githubAuthExpiresAt = ref<number | null>(null)
const githubAuthNextPollIntervalSec = ref<number | null>(null)
const githubAuthPollAbort = ref<AbortController | null>(null)

const githubModelsAuthState = ref<GithubModelsAuthState>({ status: 'unauthenticated' })
const githubModelsAvailableModelIds = ref<string[]>([])

type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'github' | 'openai_compat'

type ProviderOption = {
  id: ProviderId
  label: string
  hint: string
}

type ModelOption = {
  id: string
  label: string
  hint?: string
}

const catalog = aiRegistryCatalog()

const providerOptions: ProviderOption[] = catalog.providers.map((p) => ({
  id: p.id,
  label: p.label,
  hint: p.hint
}))

const modelOptionsByProvider = reactive<Record<ProviderId, ModelOption[]>>({
  openai: catalog.modelsByProvider.openai,
  anthropic: catalog.modelsByProvider.anthropic,
  gemini: catalog.modelsByProvider.gemini,
  github: [],
  openai_compat: catalog.modelsByProvider.openai_compat
})

watch(
  () => githubModelsAvailableModelIds.value.slice(),
  (ids) => {
    modelOptionsByProvider.github = ids.map((id) => ({ id, label: id }))
  },
  { immediate: true }
)

const isModelPickerOpen = ref(false)
const modelPickerSearchEl = ref<HTMLInputElement | null>(null)
const modelPickerStep = ref<'providers' | 'models'>('providers')
const modelPickerQuery = ref('')
const activeProviderId = ref<ProviderId | null>(null)
const modelPickerHighlightedIndex = ref(0)

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (isRecord(err) && typeof err.message === 'string') return err.message
  return fallback
}

function toSafeErrorMessage(err: unknown, fallback: string) {
  return redactSensitiveText(toErrorMessage(err, fallback))
}

function gateMessageFromQuery(): string | null {
  const reason = typeof route.query.reason === 'string' ? route.query.reason : null
  if (reason === 'missing-default-model') return 'Choose a Default AI Model to use AI features.'
  if (reason === 'missing-credentials') return 'Add provider credentials in Settings to use AI features.'
  if (reason === 'oauth-not-authenticated') return 'Authenticate GitHub Models in Settings to use that provider.'
  return null
}

const gateMessage = computed(() => gateMessageFromQuery())

function dismissGateMessage() {
  const { reason: _reason, from: _from, ...rest } = route.query
  router.replace({ path: route.path, query: rest }).catch(() => {})
}

const avatarText = computed(() => {
  const name = profile.value?.name?.trim() ?? ''
  if (!name) return 'U'
  const first = name[0]
  return typeof first === 'string' ? first.toUpperCase() : 'U'
})

function providerLabel(providerId: string) {
  return providerOptions.find((p) => p.id === providerId)?.label ?? providerId
}

const defaultModelLabel = computed(() => {
  const raw = defaultModelId.value
  if (!raw) return null
  const [provider, model] = raw.split(':')
  if (!provider || !model) return raw
  return `${providerLabel(provider)} · ${model}`
})

const activeProviderLabel = computed(() => {
  const id = activeProviderId.value
  if (!id) return ''
  return providerLabel(id)
})

type ModelPickerItem = {
  key: string
  label: string
  hint: string | null
  actionLabel: string
  kind: 'provider' | 'model'
  providerId?: ProviderId
  modelId?: string
}

function normalizeQuery(q: string) {
  return q.trim().toLowerCase()
}

const modelPickerItems = computed<ModelPickerItem[]>(() => {
  const q = normalizeQuery(modelPickerQuery.value)

  if (modelPickerStep.value === 'providers') {
    const providers = providerOptions.filter((p) => {
      if (!q) return true
      return (
        p.label.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        p.hint.toLowerCase().includes(q)
      )
    })

    return providers.map((p) => ({
      key: `provider:${p.id}`,
      label: p.label,
      hint: p.hint,
      actionLabel: 'Choose',
      kind: 'provider',
      providerId: p.id
    }))
  }

  const providerId = activeProviderId.value
  if (!providerId) return []
  const models = modelOptionsByProvider[providerId]
  const filtered = models.filter((m) => {
    if (!q) return true
    return (
      m.label.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.hint ?? '').toLowerCase().includes(q)
    )
  })

  return filtered.map((m) => ({
    key: `model:${providerId}:${m.id}`,
    label: m.label,
    hint: m.hint ?? null,
    actionLabel: 'Select',
    kind: 'model',
    providerId,
    modelId: m.id
  }))
})

watch(
  () => modelPickerItems.value.length,
  () => {
    modelPickerHighlightedIndex.value = 0
  }
)

const modelPickerEnterDisabled = computed(() => modelPickerItems.value.length === 0)

function openModelPicker() {
  modelPickerStep.value = 'providers'
  modelPickerQuery.value = ''
  activeProviderId.value = null
  modelPickerHighlightedIndex.value = 0
  isModelPickerOpen.value = true
  nextTick(() => modelPickerSearchEl.value?.focus())
}

function closeModelPicker() {
  isModelPickerOpen.value = false
}

function backToProviders() {
  modelPickerStep.value = 'providers'
  modelPickerQuery.value = ''
  activeProviderId.value = null
  modelPickerHighlightedIndex.value = 0
  nextTick(() => modelPickerSearchEl.value?.focus())
}

async function setDefaultModelId(nextId: string | null) {
  if (isWebPreview.value) {
    defaultModelId.value = nextId
    return
  }
  busy.value = true
  error.value = null
  try {
    const db = await useTracerDb()
    const repo = createSettingsRepo(db)
    const updated = await repo.set({ defaultModelId: nextId })
    defaultModelId.value = updated.defaultModelId
  } catch (e: unknown) {
    error.value = toSafeErrorMessage(e, 'Failed to update default model')
  } finally {
    busy.value = false
  }
}

function clampIndex(next: number) {
  const total = modelPickerItems.value.length
  if (total <= 0) return 0
  return Math.min(Math.max(next, 0), total - 1)
}

function moveHighlight(delta: number) {
  modelPickerHighlightedIndex.value = clampIndex(modelPickerHighlightedIndex.value + delta)
}

function onModelPickerKeydown(e: KeyboardEvent) {
  if (!isModelPickerOpen.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveHighlight(1)
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveHighlight(-1)
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    onModelPickerEnter()
    return
  }
}

function onModelPickerClick(item: ModelPickerItem) {
  if (item.kind === 'provider' && item.providerId) {
    activeProviderId.value = item.providerId
    modelPickerStep.value = 'models'
    modelPickerQuery.value = ''
    modelPickerHighlightedIndex.value = 0
    nextTick(() => modelPickerSearchEl.value?.focus())
    return
  }

  if (item.kind === 'model' && item.providerId && item.modelId) {
    const id = `${item.providerId}:${item.modelId}`
    setDefaultModelId(id).then(() => closeModelPicker())
  }
}

function onModelPickerEnter() {
  const idx = modelPickerHighlightedIndex.value
  const item = modelPickerItems.value[idx]
  if (!item) return
  onModelPickerClick(item)
}

watch(
  () => isModelPickerOpen.value,
  (open) => {
    if (!open) return
    modelPickerHighlightedIndex.value = 0
    nextTick(() => modelPickerSearchEl.value?.focus())
  }
)

function openGithubAuth() {
  isGithubAuthOpen.value = true
  githubAuthStep.value = 'idle'
  githubAuthError.value = null
  githubAuthVerificationUri.value = null
  githubAuthUserCode.value = null
  githubAuthExpiresAt.value = null
  githubAuthNextPollIntervalSec.value = null
}

function closeGithubAuth() {
  githubAuthPollAbort.value?.abort()
  githubAuthPollAbort.value = null
  isGithubAuthOpen.value = false
}

function githubScope(): string {
  return 'models:read'
}

async function githubRefreshAuthState() {
  githubModelsAuthState.value = await githubModelsLoadAuthState()
  if (githubModelsAuthState.value.status === 'authenticated') {
    githubModelsAvailableModelIds.value = githubModelsAuthState.value.models.map((m) => m.id)
  } else {
    githubModelsAvailableModelIds.value = []
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // ignore
  }
}

async function onGithubAuthCopyCode() {
  const code = githubAuthUserCode.value
  if (!code) return
  await copyToClipboard(code)
}

async function onGithubAuthCopyUrl() {
  const url = githubAuthVerificationUri.value
  if (!url) return
  await copyToClipboard(url)
}

function githubAuthReset() {
  githubAuthBusy.value = false
  githubAuthStep.value = 'idle'
  githubAuthError.value = null
  githubAuthVerificationUri.value = null
  githubAuthUserCode.value = null
  githubAuthExpiresAt.value = null
  githubAuthNextPollIntervalSec.value = null
}

async function onGithubAuthSignOut() {
  if (isWebPreview.value) {
    githubAuthError.value = 'GitHub authentication is not available in web preview.'
    return
  }
  githubAuthBusy.value = true
  githubAuthError.value = null
  try {
    await githubModelsInvalidateToken()
    await githubRefreshAuthState()
  } catch (e: any) {
    githubAuthError.value = toSafeErrorMessage(e, 'Failed to sign out')
  } finally {
    githubAuthBusy.value = false
  }
}

function nowMs() {
  return Date.now()
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function pollDeviceToken(opts: {
  clientId: string
  deviceCode: string
  initialIntervalSec: number
  expiresAtMs: number
}) {
  const abort = new AbortController()
  githubAuthPollAbort.value = abort
  let intervalSec = Math.max(1, Math.floor(opts.initialIntervalSec))
  githubAuthNextPollIntervalSec.value = intervalSec

  while (!abort.signal.aborted) {
    const remaining = opts.expiresAtMs - nowMs()
    if (remaining <= 0) {
      githubAuthStep.value = 'error'
      githubAuthError.value = 'Device code expired. Try again.'
      return
    }

    await sleep(intervalSec * 1000)
    if (abort.signal.aborted) return

    const body = await githubDeviceTokenPollOnce({
      clientId: opts.clientId,
      deviceCode: opts.deviceCode
    })
    const ev = mapDevicePollResponse(body as any, intervalSec)
    if (ev.type === 'pending') {
      intervalSec = ev.nextIntervalSec
      githubAuthNextPollIntervalSec.value = intervalSec
      continue
    }
    if (ev.type === 'slow_down') {
      intervalSec = ev.nextIntervalSec
      githubAuthNextPollIntervalSec.value = intervalSec
      continue
    }
    if (ev.type === 'expired') {
      githubAuthStep.value = 'error'
      githubAuthError.value = 'Device code expired. Try again.'
      return
    }
    if (ev.type === 'denied') {
      githubAuthStep.value = 'error'
      githubAuthError.value = 'Access denied. You cancelled or declined authorization.'
      return
    }
    if (ev.type === 'device_flow_disabled') {
      throw new Error('device_flow_disabled')
    }
    if (ev.type === 'error') {
      githubAuthStep.value = 'error'
      githubAuthError.value = ev.message
      return
    }
    if (ev.type === 'success') {
      await githubModelsStoreToken(ev.token.access_token)
      await githubRefreshAuthState()
      githubAuthStep.value = 'device_success'
      return
    }
  }
}

async function tryDeviceFlow() {
  const clientId = githubOAuthClientId()
  const device = await githubDeviceCodeRequest({ clientId, scope: githubScope() })
  githubAuthVerificationUri.value = device.verification_uri
  githubAuthUserCode.value = device.user_code
  githubAuthExpiresAt.value = nowMs() + device.expires_in * 1000
  githubAuthStep.value = 'device_pending'

  await openExternal(device.verification_uri)
  await pollDeviceToken({
    clientId,
    deviceCode: device.device_code,
    initialIntervalSec: device.interval,
    expiresAtMs: githubAuthExpiresAt.value
  })
}

async function tryPkceFlow() {
  const clientId = githubOAuthClientId()
  const start = await githubPkceStart()
  const state = crypto.randomUUID()
  const verifier = randomPkceVerifier()
  const challenge = await pkceChallengeS256(verifier)
  const url = await githubPkceAuthorizeUrl({
    clientId,
    port: start.port,
    state,
    scope: githubScope(),
    codeChallenge: challenge
  })

  githubAuthStep.value = 'pkce_pending'
  await openExternal(url)

  const cb = await githubPkceFinish({ id: start.id, expectedState: state, timeoutMs: 120_000 })
  const token = await githubPkceExchangeToken({
    clientId,
    code: cb.code,
    port: start.port,
    codeVerifier: verifier
  })
  const ev = mapDevicePollResponse(token as any, 0)
  if (ev.type !== 'success') {
    throw new Error((token as any)?.error ?? 'pkce_failed')
  }
  await githubModelsStoreToken(ev.token.access_token)
  await githubRefreshAuthState()
  githubAuthStep.value = 'device_success'
}

async function onGithubAuthStart() {
  if (isWebPreview.value) {
    githubAuthStep.value = 'error'
    githubAuthError.value = 'GitHub authentication is not available in web preview.'
    return
  }
  githubAuthBusy.value = true
  githubAuthError.value = null
  githubAuthPollAbort.value?.abort()
  githubAuthPollAbort.value = null

  try {
    githubAuthStep.value = 'requesting'
    try {
      await tryDeviceFlow()
    } catch (e: any) {
      const msg = toErrorMessage(e, 'Device flow failed')
      if (msg.includes('device_flow_disabled') || msg.includes('Device flow')) {
        await tryPkceFlow()
      } else {
        await tryPkceFlow()
      }
    }
  } catch (e: any) {
    githubAuthStep.value = 'error'
    githubAuthError.value = toSafeErrorMessage(e, 'GitHub authentication failed')
  } finally {
    githubAuthBusy.value = false
  }
}

async function onSaveProviderSecrets() {
  if (isWebPreview.value) {
    error.value = 'Provider secrets are not available in web preview.'
    return
  }
  error.value = null
  busy.value = true
  try {
    await aiSecretsSet('openai_api_key', openAiKey.value)
    await aiSecretsSet('anthropic_api_key', anthropicKey.value)
    await aiSecretsSet('gemini_api_key', geminiKey.value)
    await aiSecretsSet('openai_compat_api_key', openAiCompatKey.value)

    await aiOpenAiCompatSetConfig({
      baseURL: openAiCompatBaseURL.value,
      modelId: openAiCompatModelId.value
    })
  } catch (e: any) {
    error.value = toSafeErrorMessage(e, 'Failed to save provider secrets')
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  ;(async () => {
    if (isWebPreview.value) {
      profile.value = { id: 'web-preview', name: 'Web Preview', email: '', createdAt: '' }
      darkMode.value = document.documentElement.classList.contains('dark')
      startupLockEnabled.value = false
      defaultModelId.value = null
      learnHybridEnabled.value = false
      return
    }
    try {
      const status = await lockGetStatus()
      const db = await useTracerDb()

      const p = await createProfileRepo(db).get()
      if (!p || !status.has_verifier) {
        markLocked()
        await router.replace('/first-run')
        return
      }
      profile.value = p

      const settings = await createSettingsRepo(db).get()
      startupLockEnabled.value = settings.startupLockEnabled
      darkMode.value = settings.darkMode
      defaultModelId.value = settings.defaultModelId
      learnHybridEnabled.value = settings.learnHybridEnabled

      try {
        const compat = await aiOpenAiCompatGetConfig()
        openAiCompatBaseURL.value = compat?.baseURL ?? ''
        openAiCompatModelId.value = compat?.modelId ?? ''
      } catch {
        // ignore
      }

      if (settings.startupLockEnabled && status.requires_unlock) {
        if (!unlockedThisSession.value) {
          markLocked()
          await router.replace('/unlock')
          return
        }
      } else if (status.can_auto_unlock) {
        markUnlocked()
      }

      await githubRefreshAuthState()
    } catch {
      markLocked()
      await router.replace('/unlock')
    }
  })()
})

async function onToggleDarkMode() {
  error.value = null
  busy.value = true
  try {
    const next = !darkMode.value
    if (isWebPreview.value) {
      document.documentElement.classList.toggle('dark', next)
    } else {
      await themeSetDarkMode(next)
    }
    darkMode.value = next
  } catch (e: unknown) {
    error.value = toSafeErrorMessage(e, 'Failed to update dark mode')
  } finally {
    busy.value = false
  }
}

async function onToggleLearnHybrid() {
  if (!defaultModelId.value) return
  if (isWebPreview.value) {
    learnHybridEnabled.value = !learnHybridEnabled.value
    return
  }
  error.value = null
  busy.value = true
  try {
    const next = !learnHybridEnabled.value
    const db = await useTracerDb()
    const repo = createSettingsRepo(db)
    const updated = await repo.set({ learnHybridEnabled: next })
    learnHybridEnabled.value = updated.learnHybridEnabled
  } catch (e: unknown) {
    error.value = toSafeErrorMessage(e, 'Failed to update Learn settings')
  } finally {
    busy.value = false
  }
}

async function onToggleStartupLock() {
  if (isWebPreview.value) {
    error.value = 'Startup lock is not available in web preview.'
    return
  }
  error.value = null
  if (startupLockEnabled.value) {
    showPasswordPrompt.value = true
    return
  }

  busy.value = true
  try {
    await lockSetStartupLockEnabled(true)
    const db = await useTracerDb()
    const repo = createSettingsRepo(db)
    await repo.set({ startupLockEnabled: true })
    startupLockEnabled.value = true
  } catch (e: unknown) {
    error.value = toSafeErrorMessage(e, 'Failed to enable lock')
  } finally {
    busy.value = false
  }
}

async function onConfirmDisable() {
  if (isWebPreview.value) {
    error.value = 'Startup lock is not available in web preview.'
    return
  }
  error.value = null
  busy.value = true
  try {
    await lockSetStartupLockEnabled(false, password.value)
    const db = await useTracerDb()
    const repo = createSettingsRepo(db)
    await repo.set({ startupLockEnabled: false })
    startupLockEnabled.value = false
    showPasswordPrompt.value = false
    password.value = ''
  } catch (e: unknown) {
    error.value = toSafeErrorMessage(e, 'Failed to disable lock')
  } finally {
    busy.value = false
  }
}

function onCancelDisable() {
  error.value = null
  showPasswordPrompt.value = false
  password.value = ''
}

async function onReset() {
  if (isWebPreview.value) {
    error.value = 'Reset is not available in web preview.'
    return
  }
  error.value = null
  busy.value = true
  try {
    await lockResetTracer()
    markLocked()
    await router.replace('/first-run')
  } catch (e: unknown) {
    error.value = toSafeErrorMessage(e, 'Failed to reset')
  } finally {
    busy.value = false
  }
}
</script>
