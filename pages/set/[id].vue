<template>
    <main>
        <AiErrorModal
            :open="aiErrorOpen"
            :error="aiError"
            :from="route.fullPath"
            :show-retry="true"
            @close="closeAiError"
            @retry="retryChat"
        />
        <div class="mx-auto max-w-3xl p-8">
            <div
                class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
                <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                        <h1 class="truncate text-2xl font-semibold">
                            {{ set?.title ?? "Set" }}
                        </h1>
                        <p
                            v-if="set?.description"
                            class="mt-2 text-sm text-slate-600 dark:text-slate-300"
                        >
                            {{ set.description }}
                        </p>
                    </div>

                    <div class="shrink-0">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                            :disabled="busy || !set"
                            @click="openExport"
                        >
                            Export
                        </button>
                    </div>
                </div>

                <div class="mt-5">
                    <p
                        v-if="loadError"
                        class="text-sm text-red-700 dark:text-red-300"
                    >
                        {{ loadError }}
                    </p>

                    <div
                        v-else-if="busy"
                        class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                        Loading…
                    </div>

                    <div
                        v-else-if="!set"
                        class="text-sm text-slate-700 dark:text-slate-200"
                    >
                        Set not found.
                    </div>

                    <div v-else class="space-y-6">
                        <section aria-label="Study modes">
                            <div class="grid gap-3 sm:grid-cols-2">
                                <NuxtLink
                                    :to="`/set/${set.id}?mode=flashcards`"
                                    class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Flashcards
                                    </p>
                                    <p
                                        class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        Quick review
                                    </p>
                                </NuxtLink>

                                <NuxtLink
                                    v-if="studyGuideSetId"
                                    :to="`/study-guide/${studyGuideSetId}`"
                                    class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Study guide
                                    </p>
                                    <p
                                        class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        Markdown
                                    </p>
                                </NuxtLink>
                                <NuxtLink
                                    :to="`/set/${set.id}?mode=learn`"
                                    class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Learn
                                    </p>
                                    <p
                                        class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        Quiz yourself
                                    </p>
                                </NuxtLink>
                                <NuxtLink
                                    :to="`/set/${set.id}?mode=match`"
                                    class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Match
                                    </p>
                                    <p
                                        class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        Find pairs under pressure
                                    </p>
                                </NuxtLink>
                                <NuxtLink
                                    :to="`/set/${set.id}?mode=chat`"
                                    class="group rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Chat
                                    </p>
                                    <p
                                        class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        Grounded to this set
                                    </p>
                                </NuxtLink>
                            </div>
                        </section>

                        <section
                            v-if="mode === 'flashcards'"
                            aria-label="Flashcards"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div
                                class="flex flex-wrap items-center justify-between gap-3"
                            >
                                <div>
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Flashcards
                                    </p>
                                    <p
                                        class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        Space to flip · ←/→ to browse · Mark
                                        correct/incorrect to progress
                                    </p>
                                </div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <p
                                        class="text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        {{ ratioText }}
                                    </p>
                                    <button
                                        type="button"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="set.terms.length <= 1"
                                        @click="shuffleRun"
                                    >
                                        Shuffle
                                    </button>
                                    <button
                                        type="button"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="set.terms.length === 0"
                                        @click="restartRun"
                                    >
                                        Restart
                                    </button>
                                </div>
                            </div>

                            <div v-if="isFinished" class="mt-4">
                                <h2
                                    class="text-lg font-semibold text-slate-900 dark:text-slate-50"
                                >
                                    Results
                                </h2>
                                <p
                                    class="mt-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    Accuracy:
                                    <span class="font-medium">{{
                                        accuracyText
                                    }}</span>
                                </p>
                                <p
                                    class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    Correct: {{ correctCount }} · Attempted:
                                    {{ attemptedCount }}
                                </p>

                                <div class="mt-4 flex flex-wrap gap-2">
                                    <!-- <NuxtLink
                    :to="`/set/${set.id}/results?mode=flashcards&correct=${correctCount}&attempted=${attemptedCount}`"
                    class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                  >
                    Open results page
                  </NuxtLink>  -->
                                    <button
                                        type="button"
                                        class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="set.terms.length === 0"
                                        @click="restartRun"
                                    >
                                        Restart
                                    </button>
                                    <NuxtLink
                                        :to="`/set/${set.id}?mode=chat`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Chat
                                    </NuxtLink>
                                    <NuxtLink
                                        :to="`/set/${set.id}?mode=learn`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Learn
                                    </NuxtLink>
                                    <NuxtLink
                                        :to="`/set/${set.id}?mode=match`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Match
                                    </NuxtLink>
                                </div>
                            </div>

                            <div v-else>
                                <button
                                    ref="viewerButtonEl"
                                    type="button"
                                    class="mt-3 w-full rounded-md border border-slate-200 bg-slate-50 p-6 text-left shadow-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    :disabled="set.terms.length === 0"
                                    @click="toggleFlip"
                                >
                                    <p
                                        class="text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        {{ isFlipped ? "Definition" : "Term" }}
                                    </p>
                                    <p
                                        class="mt-3 whitespace-pre-wrap text-base font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        {{ viewerText }}
                                    </p>
                                </button>

                                <div
                                    class="mt-4 flex flex-wrap items-center justify-between gap-3"
                                >
                                    <div
                                        class="flex flex-wrap items-center gap-2"
                                    >
                                        <button
                                            type="button"
                                            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                            :disabled="
                                                set.terms.length === 0 ||
                                                cursorIndex === 0
                                            "
                                            @click="goPrev"
                                        >
                                            ← Prev
                                        </button>

                                        <button
                                            type="button"
                                            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                            :disabled="
                                                set.terms.length === 0 ||
                                                cursorIndex >=
                                                    set.terms.length - 1
                                            "
                                            @click="goNext"
                                        >
                                            Next →
                                        </button>
                                    </div>

                                    <div
                                        class="flex flex-wrap items-center gap-2"
                                    >
                                        <button
                                            type="button"
                                            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                            :disabled="!currentTerm || starBusy"
                                            :aria-pressed="isCurrentStarred"
                                            @click="toggleStar"
                                        >
                                            {{
                                                isCurrentStarred
                                                    ? "Unstar"
                                                    : "Star"
                                            }}
                                        </button>
                                        <button
                                            type="button"
                                            class="inline-flex items-center rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-red-900/40 dark:bg-slate-950 dark:text-red-200 dark:hover:bg-red-950/40 dark:focus-visible:ring-red-500 dark:focus-visible:ring-offset-slate-950"
                                            :disabled="!currentTerm"
                                            @click="markIncorrect"
                                        >
                                            Missed it
                                        </button>
                                        <button
                                            type="button"
                                            class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                            :disabled="!currentTerm"
                                            @click="markCorrect"
                                        >
                                            Got it
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            v-else-if="mode === 'learn'"
                            aria-label="Learn"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div
                                class="flex flex-wrap items-center justify-between gap-3"
                            >
                                <div>
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Learn
                                    </p>
                                    <p
                                        class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        Answer questions · Results tracked per
                                        run
                                    </p>
                                </div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <p
                                        class="text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        {{ learnRatioText }}
                                    </p>
                                    <button
                                        type="button"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="
                                            learnBusy ||
                                            !set ||
                                            learnQuestions.length === 0
                                        "
                                        @click="restartLearnRun"
                                    >
                                        Restart
                                    </button>
                                </div>
                            </div>

                            <p
                                v-if="learnError"
                                class="mt-3 text-sm text-red-700 dark:text-red-300"
                            >
                                {{ learnError }}
                            </p>

                            <div
                                v-if="learnBusy"
                                class="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                                Preparing questions…
                            </div>

                            <div v-else-if="learnIsFinished" class="mt-4">
                                <h2
                                    class="text-lg font-semibold text-slate-900 dark:text-slate-50"
                                >
                                    Results
                                </h2>
                                <p
                                    class="mt-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    Accuracy:
                                    <span class="font-medium">{{
                                        learnAccuracyText
                                    }}</span>
                                </p>
                                <p
                                    class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    Correct: {{ learnCorrectCount }} ·
                                    Attempted: {{ learnAttemptedCount }}
                                </p>

                                <div class="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="
                                            !set || learnQuestions.length === 0
                                        "
                                        @click="restartLearnRun"
                                    >
                                        Restart
                                    </button>
                                    <NuxtLink
                                        v-if="set"
                                        :to="`/set/${set.id}?mode=flashcards`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Flashcards
                                    </NuxtLink>
                                    <NuxtLink
                                        v-if="set"
                                        :to="`/set/${set.id}?mode=chat`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Chat
                                    </NuxtLink>
                                    <NuxtLink
                                        v-if="set"
                                        :to="`/set/${set.id}?mode=match`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Match
                                    </NuxtLink>
                                </div>
                            </div>

                            <div v-else class="mt-4">
                                <div
                                    v-if="!learnCurrentQuestion"
                                    class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    No questions available.
                                </div>

                                <div
                                    v-else
                                    class="rounded-md border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <p
                                        class="text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        Question
                                    </p>
                                    <p
                                        class="mt-3 whitespace-pre-wrap text-base font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        {{ learnCurrentQuestion.prompt }}
                                    </p>

                                    <div class="mt-4 grid gap-2">
                                        <template
                                            v-if="
                                                learnCurrentQuestion.kind ===
                                                'true_false'
                                            "
                                        >
                                            <button
                                                type="button"
                                                class="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                                :disabled="learnBusy"
                                                @click="
                                                    answerLearnTrueFalse(true)
                                                "
                                            >
                                                True
                                            </button>
                                            <button
                                                type="button"
                                                class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                                :disabled="learnBusy"
                                                @click="
                                                    answerLearnTrueFalse(false)
                                                "
                                            >
                                                False
                                            </button>
                                        </template>

                                        <template v-else>
                                            <button
                                                v-for="(
                                                    opt, idx
                                                ) in learnCurrentQuestion.options"
                                                :key="`${learnCurrentQuestion.id}:${idx}`"
                                                type="button"
                                                class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                                :disabled="learnBusy"
                                                @click="
                                                    answerLearnMultipleChoice(
                                                        idx,
                                                    )
                                                "
                                            >
                                                {{ opt }}
                                            </button>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            v-else-if="mode === 'chat'"
                            aria-label="Chat"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div
                                class="flex flex-wrap items-center justify-between gap-3"
                            >
                                <div>
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Chat
                                    </p>
                                    <p
                                        class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        Prefer grounded answers from this set
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    :disabled="
                                        chatBusy || chatMessages.length === 0
                                    "
                                    @click="resetChat"
                                >
                                    Clear
                                </button>
                            </div>

                            <div
                                ref="chatLogEl"
                                class="mt-4 max-h-[420px] space-y-3 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                                role="log"
                                aria-live="polite"
                            >
                                <p
                                    v-if="chatError"
                                    class="text-sm text-red-700 dark:text-red-300"
                                >
                                    {{ chatError }}
                                </p>
                                <p
                                    v-if="chatMessages.length === 0"
                                    class="text-sm text-slate-600 dark:text-slate-300"
                                >
                                    Ask a question about the terms in this set.
                                </p>

                                <div
                                    v-for="m in chatMessages"
                                    :key="m.id"
                                    class="flex"
                                    :class="
                                        m.role === 'user'
                                            ? 'justify-end'
                                            : 'justify-start'
                                    "
                                >
                                    <div
                                        class="max-w-[85%] whitespace-pre-wrap rounded-lg border px-3 py-2 shadow-sm"
                                        :class="
                                            m.role === 'user'
                                                ? 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'
                                                : 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'
                                        "
                                    >
                                        {{ m.content }}
                                    </div>
                                </div>
                            </div>

                            <div class="mt-3 flex gap-2">
                                <label class="sr-only" for="chat-input"
                                    >Chat message</label
                                >
                                <textarea
                                    id="chat-input"
                                    ref="chatTextareaEl"
                                    v-model="chatInput"
                                    rows="2"
                                    autocomplete="off"
                                    placeholder="Ask about this set…"
                                    class="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    :disabled="chatBusy || !set"
                                    @keydown="onChatInputKeydown"
                                />
                                <button
                                    type="button"
                                    class="inline-flex shrink-0 items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    :disabled="
                                        chatBusy || !set || !chatInput.trim()
                                    "
                                    @click="sendChat"
                                >
                                    {{ chatBusy ? "Sending…" : "Send" }}
                                </button>
                            </div>

                            <p
                                class="mt-2 text-xs text-slate-500 dark:text-slate-400"
                            >
                                Enter to send · Shift+Enter for newline
                            </p>
                        </section>

                        <section
                            v-else-if="mode === 'match'"
                            aria-label="Match"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div
                                class="flex flex-wrap items-start justify-between gap-3"
                            >
                                <div>
                                    <p
                                        class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                    >
                                        Match
                                    </p>
                                    <p
                                        class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        4×4 · 60 seconds · 8 pairs
                                    </p>
                                </div>

                                <div class="flex flex-wrap items-center gap-2">
                                    <p
                                        class="text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        {{ matchTopline }}
                                    </p>

                                    <button
                                        v-if="
                                            !matchIsRunning && !matchIsFinished
                                        "
                                        type="button"
                                        class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="
                                            !set || set.terms.length === 0
                                        "
                                        @click="startMatch"
                                    >
                                        Start
                                    </button>

                                    <button
                                        v-else
                                        type="button"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="
                                            !set || set.terms.length === 0
                                        "
                                        @click="restartMatchRun"
                                    >
                                        Restart
                                    </button>
                                </div>
                            </div>

                            <p
                                v-if="matchError"
                                class="mt-3 text-sm text-red-700 dark:text-red-300"
                            >
                                {{ matchError }}
                            </p>

                            <div v-if="matchIsFinished" class="mt-4">
                                <h2
                                    class="text-lg font-semibold text-slate-900 dark:text-slate-50"
                                >
                                    Results
                                </h2>
                                <p
                                    class="mt-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    Accuracy:
                                    <span class="font-medium">{{
                                        matchAccuracyText
                                    }}</span>
                                </p>
                                <p
                                    class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    Matched: {{ matchMatchedPairsCount }}/{{
                                        matchPairsTarget
                                    }}
                                    · Attempts: {{ matchAttemptsCount }}
                                </p>
                                <p
                                    class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    Time: {{ matchTimeText }}
                                </p>

                                <div class="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :disabled="
                                            !set || set.terms.length === 0
                                        "
                                        @click="restartMatchRun"
                                    >
                                        Play again
                                    </button>
                                    <NuxtLink
                                        v-if="set"
                                        :to="`/set/${set.id}?mode=flashcards`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Flashcards
                                    </NuxtLink>
                                    <NuxtLink
                                        v-if="set"
                                        :to="`/set/${set.id}?mode=learn`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Learn
                                    </NuxtLink>
                                    <NuxtLink
                                        v-if="set"
                                        :to="`/set/${set.id}?mode=chat`"
                                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                    >
                                        Chat
                                    </NuxtLink>
                                </div>
                            </div>

                            <div v-else class="mt-4">
                                <div
                                    v-if="!matchIsRunning"
                                    class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    Press Start to begin. Select a term tile and
                                    its matching definition tile.
                                </div>

                                <div v-else class="grid grid-cols-4 gap-2">
                                    <button
                                        v-for="tile in matchTiles"
                                        :key="tile.id"
                                        type="button"
                                        class="relative aspect-square rounded-md border p-2 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                        :class="matchTileClass(tile)"
                                        :disabled="
                                            matchTileDisabled(tile) || matchBusy
                                        "
                                        @click="onMatchTileClick(tile)"
                                    >
                                        <span class="sr-only">Tile</span>
                                        <span
                                            v-if="matchIsTileRevealed(tile)"
                                            class="block h-full overflow-hidden text-xs font-medium leading-snug"
                                        >
                                            {{ tile.text }}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section
                            v-else
                            aria-label="Mode"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <p
                                class="text-sm font-medium text-slate-900 dark:text-slate-50"
                            >
                                Coming soon
                            </p>
                            <p
                                class="mt-2 text-sm text-slate-600 dark:text-slate-300"
                            >
                                This mode is not implemented yet.
                            </p>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <NuxtLink
                                    :to="`/set/${set.id}?mode=flashcards`"
                                    class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                >
                                    Go to Flashcards
                                </NuxtLink>
                            </div>
                        </section>

                        <section
                            aria-label="Terms"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div
                                class="flex items-center justify-between gap-3"
                            >
                                <h2
                                    class="text-sm font-medium text-slate-900 dark:text-slate-50"
                                >
                                    Terms
                                </h2>
                                <span
                                    class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    {{ set.terms.length }}
                                </span>
                            </div>

                            <div
                                v-if="set.terms.length === 0"
                                class="mt-3 text-sm text-slate-700 dark:text-slate-200"
                            >
                                No cards.
                            </div>

                            <ul v-else class="mt-3 space-y-3">
                                <li v-for="(t, idx) in set.terms" :key="t.id">
                                    <div
                                        class="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <p
                                            class="text-xs font-medium text-slate-500 dark:text-slate-400"
                                        >
                                            {{ idx + 1 }}
                                        </p>
                                        <p
                                            class="mt-2 text-sm text-slate-700 dark:text-slate-200"
                                        >
                                            <span
                                                class="font-medium text-slate-900 dark:text-slate-50"
                                                >Term: </span
                                            >
                                            <span class="whitespace-pre-wrap">{{
                                                t.front
                                            }}</span>
                                        </p>
                                        <p
                                            class="mt-2 text-sm text-slate-700 dark:text-slate-200"
                                        >
                                            <span
                                                class="font-medium text-slate-900 dark:text-slate-50"
                                                >Definition: </span
                                            >
                                            <span class="whitespace-pre-wrap">{{
                                                t.back
                                            }}</span>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-if="isExportOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Export set"
            @keydown.esc="closeExport"
        >
            <button
                type="button"
                class="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
                aria-label="Close export modal"
                @click="closeExport"
            />

            <div
                class="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
            >
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            class="text-lg font-semibold text-slate-900 dark:text-slate-50"
                        >
                            Export
                        </h2>
                        <p
                            class="mt-1 text-sm text-slate-600 dark:text-slate-300"
                        >
                            Copy TSV (term ↹ definition) for import elsewhere.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        @click="closeExport"
                    >
                        Close
                    </button>
                </div>

                <div class="mt-4">
                    <label class="sr-only" for="export-tsv">TSV export</label>
                    <textarea
                        id="export-tsv"
                        ref="exportTextareaEl"
                        readonly
                        rows="10"
                        class="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :value="exportTsv"
                        @focus="selectAllExport"
                    />
                </div>

                <p
                    v-if="exportMessage"
                    class="mt-3 text-sm text-slate-700 dark:text-slate-200"
                >
                    {{ exportMessage }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="!exportTsv"
                        @click="copyExport"
                    >
                        Copy
                    </button>
                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="!exportTsv"
                        @click="selectAllExport"
                    >
                        Select all
                    </button>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { lockGetStatus } from "~/src/composables/lock";
import { useLockSession } from "~/src/composables/lock-session";
import {
    createProfileRepo,
    createSettingsRepo,
    createSetsRepo,
    createStarsRepo,
    createStudyGuidesRepo,
    useTracerDb,
} from "~/src/composables/db";
import type { FlashcardSet, Uuid } from "~/src/composables/db/types";
import { resolveAiModel } from "~/src/composables/ai/registry";
import { hasTauriRuntime } from "~/src/composables/tauri";
import {
    generateLearnQuestions,
    type LearnQuestion,
} from "~/src/composables/learn/generator";
import {
    buildGroundedChatSystemPrompt,
    streamGroundedChatText,
    streamWebPreviewMockChatAnswer,
    type ChatMessage,
} from "~/src/composables/ai/chat";
import { generateText } from "ai";
import {
    generateMatchTiles,
    type MatchTile,
} from "~/src/composables/match/generator";
import {
    normalizeAiError,
    aiErrorForMissingDefaultModel,
    isAiErrorCandidate,
    type AiErrorUx,
} from "~/src/composables/ai/ux-errors";

const route = useRoute();
const router = useRouter();
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession();

const isWebPreview = computed(() => !hasTauriRuntime());

type SetMode = "flashcards" | "learn" | "match" | "chat";

const mode = computed<SetMode>(() => {
    const m =
        typeof route.query.mode === "string" ? route.query.mode : "flashcards";
    if (m === "flashcards" || m === "learn" || m === "match" || m === "chat")
        return m;
    return "flashcards";
});

const busy = ref(true);
const loadError = ref<string | null>(null);
const set = ref<FlashcardSet | null>(null);
const studyGuideSetId = ref<Uuid | null>(null);

const defaultModelId = ref<string | null>(null);
const learnHybridEnabled = ref(false);

const isFlipped = ref(false);

type FlashcardsAnswer = "correct" | "incorrect";

const runCounter = ref(0);
const cursorIndex = ref(0);
const order = ref<Uuid[]>([]);
const lastOrder = ref<Uuid[]>([]);
const answersByTermId = ref<Record<Uuid, FlashcardsAnswer>>({});

const starredTermIds = ref<Set<Uuid>>(new Set());
const starBusy = ref(false);

const baseSeed = computed(() => {
    const raw = route.query.seed;
    if (typeof raw !== "string") return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
});

const viewerButtonEl = ref<HTMLButtonElement | null>(null);

type UiChatMessage = ChatMessage & { id: string };

const chatMessages = ref<UiChatMessage[]>([]);
const chatInput = ref("");
const chatBusy = ref(false);
const chatError = ref<string | null>(null);
const chatAbort = shallowRef<AbortController | null>(null);
const chatLogEl = ref<HTMLDivElement | null>(null);
const chatTextareaEl = ref<HTMLTextAreaElement | null>(null);

const aiError = ref<AiErrorUx | null>(null);
const aiErrorOpen = ref(false);
const lastChatText = ref<string | null>(null);

function showAiError(err: unknown) {
    aiError.value = normalizeAiError(err);
    aiErrorOpen.value = true;
}

function closeAiError() {
    aiErrorOpen.value = false;
}

async function retryChat() {
    closeAiError();
    const text = lastChatText.value;
    if (!text) return;
    chatInput.value = text;
    await sendChat();
}

const learnBusy = ref(false);
const learnError = ref<string | null>(null);

const learnRunCounter = ref(0);
const learnCursorIndex = ref(0);
const learnQuestions = ref<LearnQuestion[]>([]);
const learnAnswersByQuestionId = ref<Record<string, boolean>>({});

const matchPairsRequested = 8;
const matchDurationSeconds = 60;

const matchBusy = ref(false);
const matchError = ref<string | null>(null);
const matchRunCounter = ref(0);
const matchTiles = ref<MatchTile[]>([]);
const matchStartedAtMs = ref<number | null>(null);
const matchEndedAtMs = ref<number | null>(null);
const matchTimeLeftMs = ref(matchDurationSeconds * 1000);
const matchTimerHandle = shallowRef<number | null>(null);
const matchSelectedTileIds = ref<string[]>([]);
const matchMatchedPairIds = ref<Set<Uuid>>(new Set());
const matchAttemptsCount = ref(0);
const matchCorrectAttemptsCount = ref(0);

const matchPairsTarget = computed(() => {
    const s = set.value;
    const available = s?.terms?.length ?? 0;
    return Math.min(matchPairsRequested, available);
});

const isExportOpen = ref(false);
const exportMessage = ref<string | null>(null);
const exportTextareaEl = ref<HTMLTextAreaElement | null>(null);

async function loadSet(setId: Uuid) {
    busy.value = true;
    loadError.value = null;
    try {
        const db = await useTracerDb();
        set.value = await createSetsRepo(db).get(setId);

        if (set.value) {
            const guide = await createStudyGuidesRepo(db).getBySetId(setId);
            studyGuideSetId.value = guide ? setId : null;
        } else {
            studyGuideSetId.value = null;
        }
    } catch {
        loadError.value = "Failed to load set.";
    } finally {
        busy.value = false;
    }
}

async function initWebDemoSet() {
    const now = new Date().toISOString();
    const demoId =
        typeof route.params.id === "string" && route.params.id.trim()
            ? route.params.id
            : "demo";
    set.value = {
        id: demoId as Uuid,
        title: "Demo set",
        description:
            "This is a web fallback to validate viewer keyboard behavior.",
        terms: [
            { id: "t-1", front: "Term 1", back: "Definition 1" },
            { id: "t-2", front: "Term 2", back: "Definition 2" },
        ],
        createdAt: now,
        updatedAt: now,
    };
    // Web preview fallback: allow E2E validation of study guide navigation.
    studyGuideSetId.value = set.value.id;
    busy.value = false;
    isFlipped.value = false;
    await loadStars(set.value.id);
    startRun({ resetCounter: true });
    await startLearnRun({ resetCounter: true });
    resetMatchStateForRun();
    matchPrepareTiles(set.value);
    await nextTick();
    if (mode.value === "chat") {
        chatTextareaEl.value?.focus();
    } else {
        viewerButtonEl.value?.focus();
    }
    window.addEventListener("keydown", onKeydown);
}

const totalCount = computed(() => set.value?.terms?.length ?? 0);

const termById = computed(() => {
    const m = new Map<Uuid, FlashcardSet["terms"][number] & { id: Uuid }>();
    const s = set.value;
    if (!s) return m;
    for (const t of s.terms) m.set(t.id as Uuid, t as any);
    return m;
});

const attemptedCount = computed(
    () => Object.keys(answersByTermId.value).length,
);
const correctCount = computed(
    () =>
        Object.values(answersByTermId.value).filter((v) => v === "correct")
            .length,
);
const isFinished = computed(() => {
    const total = totalCount.value;
    return total > 0 && attemptedCount.value >= total;
});

const ratioText = computed(() => {
    const total = totalCount.value;
    if (total === 0) return "0/0";
    return `${Math.min(attemptedCount.value, total)}/${total}`;
});

const currentTerm = computed(() => {
    if (isFinished.value) return null;
    const id = order.value[cursorIndex.value];
    if (!id) return null;
    return termById.value.get(id) ?? null;
});

const viewerText = computed(() => {
    const t = currentTerm.value;
    if (!t) return "No cards.";
    return isFlipped.value ? t.back : t.front;
});

const isCurrentStarred = computed(() => {
    const t = currentTerm.value;
    if (!t) return false;
    return starredTermIds.value.has(t.id as Uuid);
});

const accuracyText = computed(() => {
    const attempted = attemptedCount.value;
    if (attempted <= 0) return "0%";
    const pct = Math.round((correctCount.value / attempted) * 100);
    return `${pct}% (${correctCount.value}/${attempted})`;
});

const exportTsv = computed(() => {
    const s = set.value;
    if (!s) return "";
    return s.terms.map((t) => `${t.front}\t${t.back}`).join("\n");
});

function toggleFlip() {
    if (totalCount.value === 0) return;
    isFlipped.value = !isFlipped.value;
}

function goPrev() {
    if (totalCount.value === 0) return;
    const next = Math.min(
        Math.max(cursorIndex.value - 1, 0),
        totalCount.value - 1,
    );
    if (next !== cursorIndex.value) {
        cursorIndex.value = next;
        isFlipped.value = false;
    }
}

function goNext() {
    if (totalCount.value === 0) return;
    const next = Math.min(
        Math.max(cursorIndex.value + 1, 0),
        totalCount.value - 1,
    );
    if (next !== cursorIndex.value) {
        cursorIndex.value = next;
        isFlipped.value = false;
    }
}

function getRandomSeed() {
    try {
        const buf = new Uint32Array(1);
        (globalThis.crypto as Crypto | undefined)?.getRandomValues?.(buf);
        const v = Number(buf[0] ?? 0);
        if (Number.isFinite(v) && v !== 0) return v;
    } catch {}
    return Date.now() ^ Math.floor(Math.random() * 0xffffffff);
}

function makePrng(seed: number) {
    let x = seed | 0 || 1;
    return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return (x >>> 0) / 4294967296;
    };
}

function matchSeed() {
    const s = baseSeed.value;
    if (s !== null) return s + matchRunCounter.value;
    return getRandomSeed() ^ (matchRunCounter.value * 2654435761);
}

function clearMatchTimer() {
    const handle = matchTimerHandle.value;
    if (handle !== null) {
        window.clearInterval(handle);
        matchTimerHandle.value = null;
    }
}

function matchComputeTimeLeftMs(nowMs: number) {
    const start = matchStartedAtMs.value;
    if (start === null) return matchDurationSeconds * 1000;
    const elapsed = Math.max(0, nowMs - start);
    return Math.max(0, matchDurationSeconds * 1000 - elapsed);
}

function matchStop(reason: "completed" | "timeout") {
    if (matchEndedAtMs.value !== null) return;
    const now = Date.now();
    matchEndedAtMs.value = now;
    matchTimeLeftMs.value = matchComputeTimeLeftMs(now);
    clearMatchTimer();

    matchSelectedTileIds.value = [];
    matchBusy.value = false;
    if (reason === "timeout") {
        // Results should still show in a calm state.
    }

    const s = set.value;
    if (!s) return;
    const correct = matchCorrectAttemptsCount.value;
    const attempted = matchAttemptsCount.value;
    router.replace(
        `/set/${s.id}/results?mode=match&correct=${correct}&attempted=${attempted}`,
    );
}

function startMatchTimer() {
    clearMatchTimer();
    matchTimerHandle.value = window.setInterval(() => {
        const now = Date.now();
        matchTimeLeftMs.value = matchComputeTimeLeftMs(now);
        if (matchTimeLeftMs.value <= 0) {
            matchTimeLeftMs.value = 0;
            matchStop("timeout");
        }
    }, 125);
}

function resetMatchStateForRun() {
    matchError.value = null;
    matchBusy.value = false;
    matchSelectedTileIds.value = [];
    matchMatchedPairIds.value = new Set();
    matchAttemptsCount.value = 0;
    matchCorrectAttemptsCount.value = 0;
    matchStartedAtMs.value = null;
    matchEndedAtMs.value = null;
    matchTimeLeftMs.value = matchDurationSeconds * 1000;
    clearMatchTimer();
}

function matchPrepareTiles(s: FlashcardSet) {
    const seed = matchSeed();
    matchTiles.value = generateMatchTiles(s.terms, {
        seed,
        pairCount: matchPairsTarget.value,
    });
}

function startMatch() {
    const s = set.value;
    if (!s) return;
    resetMatchStateForRun();
    matchPrepareTiles(s);
    if (matchTiles.value.length === 0) {
        matchError.value = "No cards available.";
        return;
    }
    matchStartedAtMs.value = Date.now();
    matchTimeLeftMs.value = matchDurationSeconds * 1000;
    startMatchTimer();
}

function restartMatchRun() {
    matchRunCounter.value += 1;
    startMatch();
}

function matchIsTileRevealed(tile: MatchTile) {
    if (matchMatchedPairIds.value.has(tile.pairId)) return true;
    if (matchSelectedTileIds.value.includes(tile.id)) return true;
    return false;
}

function matchTileDisabled(tile: MatchTile) {
    if (!matchIsRunning.value) return true;
    if (matchEndedAtMs.value !== null) return true;
    if (matchMatchedPairIds.value.has(tile.pairId)) return true;
    if (
        matchSelectedTileIds.value.length >= 2 &&
        !matchSelectedTileIds.value.includes(tile.id)
    )
        return true;
    return false;
}

function matchTileClass(tile: MatchTile) {
    const matched = matchMatchedPairIds.value.has(tile.pairId);
    const selected = matchSelectedTileIds.value.includes(tile.id);
    const revealed = matchIsTileRevealed(tile);
    if (matched) {
        return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100";
    }
    if (selected) {
        return "border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50";
    }
    if (revealed) {
        return "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50";
    }
    return "border-slate-200 bg-slate-100 text-transparent hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-800";
}

function matchFindTile(id: string) {
    return matchTiles.value.find((t) => t.id === id) ?? null;
}

async function onMatchTileClick(tile: MatchTile) {
    if (!matchIsRunning.value) return;
    if (matchEndedAtMs.value !== null) return;
    if (matchMatchedPairIds.value.has(tile.pairId)) return;
    if (matchSelectedTileIds.value.includes(tile.id)) return;
    if (matchSelectedTileIds.value.length >= 2) return;

    matchSelectedTileIds.value = [...matchSelectedTileIds.value, tile.id];
    if (matchSelectedTileIds.value.length < 2) return;

    const [aId, bId] = matchSelectedTileIds.value;
    const a = aId ? matchFindTile(aId) : null;
    const b = bId ? matchFindTile(bId) : null;
    if (!a || !b) {
        matchSelectedTileIds.value = [];
        return;
    }

    matchAttemptsCount.value += 1;
    const isMatch = a.pairId === b.pairId && a.kind !== b.kind;
    if (isMatch) {
        matchCorrectAttemptsCount.value += 1;
        matchMatchedPairIds.value = new Set([
            ...matchMatchedPairIds.value,
            a.pairId,
        ]);
        matchSelectedTileIds.value = [];
        if (
            matchMatchedPairIds.value.size >=
            Math.min(
                matchPairsTarget.value,
                Math.floor(matchTiles.value.length / 2),
            )
        ) {
            matchStop("completed");
        }
        return;
    }

    matchBusy.value = true;
    await new Promise((r) => window.setTimeout(r, 550));
    matchBusy.value = false;
    matchSelectedTileIds.value = [];
}

function learnSeed() {
    const s = baseSeed.value;
    if (s !== null) return s + learnRunCounter.value;
    return getRandomSeed() ^ (learnRunCounter.value * 2654435761);
}

const learnAttemptedCount = computed(
    () => Object.keys(learnAnswersByQuestionId.value).length,
);
const learnCorrectCount = computed(
    () => Object.values(learnAnswersByQuestionId.value).filter((v) => v).length,
);
const learnIsFinished = computed(() => {
    const total = learnQuestions.value.length;
    return total > 0 && learnAttemptedCount.value >= total;
});

const learnRatioText = computed(() => {
    const total = learnQuestions.value.length;
    if (total === 0) return "0/0";
    return `${Math.min(learnAttemptedCount.value, total)}/${total}`;
});

const learnAccuracyText = computed(() => {
    const attempted = learnAttemptedCount.value;
    if (attempted <= 0) return "0%";
    const pct = Math.round((learnCorrectCount.value / attempted) * 100);
    return `${pct}% (${learnCorrectCount.value}/${attempted})`;
});

const learnCurrentQuestion = computed(() => {
    if (learnIsFinished.value) return null;
    return learnQuestions.value[learnCursorIndex.value] ?? null;
});

function learnFindNextUnattempted(fromIndex: number) {
    const list = learnQuestions.value;
    if (list.length === 0) return null;
    const answered = learnAnswersByQuestionId.value;
    for (let step = 0; step < list.length; step += 1) {
        const idx = (fromIndex + step) % list.length;
        const q = list[idx];
        if (!q) continue;
        if (answered[q.id] === undefined) return idx;
    }
    return null;
}

function learnMarkAnswered(questionId: string, isCorrect: boolean) {
    learnAnswersByQuestionId.value = {
        ...learnAnswersByQuestionId.value,
        [questionId]: isCorrect,
    };
    const next = learnFindNextUnattempted(learnCursorIndex.value + 1);
    if (next === null) {
        const s = set.value;
        if (!s) return;
        const correct = learnCorrectCount.value;
        const attempted = learnAttemptedCount.value;
        router.replace(
            `/set/${s.id}/results?mode=learn&correct=${correct}&attempted=${attempted}`,
        );
        return;
    }
    learnCursorIndex.value = next;
}

function answerLearnTrueFalse(value: boolean) {
    const q = learnCurrentQuestion.value;
    if (!q || q.kind !== "true_false") return;
    learnMarkAnswered(q.id, value === q.answer);
}

function answerLearnMultipleChoice(selectedIndex: number) {
    const q = learnCurrentQuestion.value;
    if (!q || q.kind !== "multiple_choice") return;
    learnMarkAnswered(q.id, selectedIndex === q.answerIndex);
}

function buildLearnAugmentPrompt(args: {
    title: string;
    description: string | null;
    terms: { front: string; back: string }[];
    count: number;
}) {
    const descLine = args.description?.trim()
        ? `Description: ${args.description.trim()}\n`
        : "";
    const tsvLines = args.terms
        .map(
            (t) =>
                `${String(t.front).replace(/\t/g, " ").replace(/\r?\n/g, " ").trim()}\t${String(t.back).replace(/\t/g, " ").replace(/\r?\n/g, " ").trim()}`,
        )
        .join("\n");

    return [
        "You are generating extra study questions for a flashcard deck.",
        "Return ONLY JSON (no markdown, no prose).",
        "",
        "Schema:",
        '{"questions":[{"kind":"true_false","term":"...","definition":"...","answer":true}|{"kind":"multiple_choice","term":"...","choices":["...","...","...","..."],"answerIndex":0}]}',
        "",
        `Count: ${args.count}`,
        "",
        `Set title: ${args.title}`,
        descLine.trimEnd(),
        "",
        "Deck (TSV: term<TAB>definition):",
        tsvLines,
    ]
        .filter((x) => x.length > 0)
        .join("\n");
}

function parseLearnAugmentJson(raw: string): LearnQuestion[] {
    if (typeof raw !== "string") return [];
    const text = raw.trim();
    if (!text) return [];
    let data: any;
    try {
        data = JSON.parse(text);
    } catch {
        return [];
    }
    const list = Array.isArray(data?.questions) ? data.questions : [];
    const out: LearnQuestion[] = [];
    for (let i = 0; i < list.length; i += 1) {
        const q = list[i];
        if (!q || typeof q !== "object") continue;
        if (q.kind === "true_false") {
            const term = typeof q.term === "string" ? q.term.trim() : "";
            const def =
                typeof q.definition === "string" ? q.definition.trim() : "";
            const ans = typeof q.answer === "boolean" ? q.answer : null;
            if (!term || !def || ans === null) continue;
            out.push({
                id: `ai:tf:${i}:${term}`,
                kind: "true_false",
                prompt: `True or False: "${term}" means "${def}".`,
                answer: ans,
                termId: "ai" as Uuid,
            });
            continue;
        }
        if (q.kind === "multiple_choice") {
            const term = typeof q.term === "string" ? q.term.trim() : "";
            const choices = Array.isArray(q.choices)
                ? q.choices
                      .filter((c: any) => typeof c === "string")
                      .map((c: string) => c.trim())
                : [];
            const answerIndex = Number.isFinite(q.answerIndex)
                ? Math.floor(q.answerIndex)
                : -1;
            const unique = new Set(choices);
            if (!term || choices.length !== 4) continue;
            if (unique.size !== 4) continue;
            if (answerIndex < 0 || answerIndex >= 4) continue;

            out.push({
                id: `ai:mc:${i}:${term}`,
                kind: "multiple_choice",
                prompt: `What is the definition of "${term}"?`,
                options: choices,
                answerIndex,
                termId: "ai" as Uuid,
            });
        }
    }
    return out;
}

async function buildLearnQuestionsForSet(s: FlashcardSet) {
    const seed = learnSeed();
    const baseline = generateLearnQuestions(s.terms, {
        seed,
        maxQuestions: 40,
    });
    if (!learnHybridEnabled.value) return baseline;
    if (!defaultModelId.value) return baseline;
    if (isWebPreview.value) return baseline;

    learnBusy.value = true;
    try {
        const model = await resolveAiModel(defaultModelId.value);
        const prompt = buildLearnAugmentPrompt({
            title: s.title,
            description: s.description,
            terms: s.terms.map((t) => ({ front: t.front, back: t.back })),
            count: 10,
        });
        const res = await generateText({ model, prompt });
        const extra = parseLearnAugmentJson(res.text ?? "");
        return [...baseline, ...extra].slice(0, 60);
    } catch {
        return baseline;
    } finally {
        learnBusy.value = false;
    }
}

async function startLearnRun(options?: { resetCounter?: boolean }) {
    const s = set.value;
    if (!s) return;
    if (options?.resetCounter) learnRunCounter.value = 0;
    learnError.value = null;
    learnBusy.value = true;
    try {
        const list = await buildLearnQuestionsForSet(s);
        learnQuestions.value = list;
        learnCursorIndex.value = 0;
        learnAnswersByQuestionId.value = {};
    } catch {
        learnError.value = "Failed to generate questions.";
        learnQuestions.value = [];
        learnCursorIndex.value = 0;
        learnAnswersByQuestionId.value = {};
    } finally {
        learnBusy.value = false;
    }
}

function restartLearnRun() {
    learnRunCounter.value += 1;
    void startLearnRun();
}

function shuffle<T>(items: T[], rand: () => number) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = a[i];
        a[i] = a[j]!;
        a[j] = tmp!;
    }
    return a;
}

function shuffleRun() {
    const s = set.value;
    if (!s) return;
    const ids = s.terms.map((t) => t.id as Uuid);
    if (ids.length <= 1) {
        order.value = ids;
        cursorIndex.value = 0;
        answersByTermId.value = {};
        isFlipped.value = false;
        return;
    }

    const seed =
        baseSeed.value !== null
            ? baseSeed.value + runCounter.value + 1
            : getRandomSeed();
    let nextOrder = shuffle(ids, makePrng(seed));
    if (baseSeed.value === null) {
        const prev = lastOrder.value;
        const same =
            prev.length === nextOrder.length &&
            prev.every((v, i) => v === nextOrder[i]);
        if (same) {
            nextOrder = [...nextOrder.slice(1), nextOrder[0]!];
        }
    }
    lastOrder.value = nextOrder;
    order.value = nextOrder;
    cursorIndex.value = 0;
    answersByTermId.value = {};
    isFlipped.value = false;
    nextTick(() => viewerButtonEl.value?.focus());
}

function startRun(options?: { resetCounter?: boolean }) {
    const s = set.value;
    if (!s) return;
    if (options?.resetCounter) runCounter.value = 0;

    const ids = s.terms.map((t) => t.id as Uuid);
    // Default run order matches the saved set order; shuffle is an explicit action.
    lastOrder.value = ids;
    order.value = ids;
    cursorIndex.value = 0;
    answersByTermId.value = {};
    isFlipped.value = false;
}

function restartRun() {
    runCounter.value += 1;
    startRun();
    nextTick(() => viewerButtonEl.value?.focus());
}

function findNextUnattempted(fromIndex: number) {
    const ids = order.value;
    if (ids.length === 0) return null;
    const answered = answersByTermId.value;
    for (let step = 0; step < ids.length; step += 1) {
        const idx = (fromIndex + step) % ids.length;
        const id = ids[idx];
        if (!id) continue;
        if (!answered[id]) return idx;
    }
    return null;
}

function markAnswer(answer: FlashcardsAnswer) {
    const t = currentTerm.value;
    if (!t) return;
    answersByTermId.value = {
        ...answersByTermId.value,
        [t.id as Uuid]: answer,
    };
    isFlipped.value = false;
    const next = findNextUnattempted(cursorIndex.value + 1);
    if (next === null) {
        const s = set.value;
        if (!s) return;
        const correct = correctCount.value;
        const attempted = attemptedCount.value;
        router.replace(
            `/set/${s.id}/results?mode=flashcards&correct=${correct}&attempted=${attempted}`,
        );
        return;
    }
    cursorIndex.value = next;
}

function markCorrect() {
    markAnswer("correct");
}

function markIncorrect() {
    markAnswer("incorrect");
}

async function loadStars(setId: Uuid) {
    if (isWebPreview.value) {
        starredTermIds.value = new Set();
        return;
    }
    try {
        const db = await useTracerDb();
        const ids = await createStarsRepo(db).listTermIds(setId);
        starredTermIds.value = new Set(ids);
    } catch {
        starredTermIds.value = new Set();
    }
}

async function toggleStar() {
    const s = set.value;
    const t = currentTerm.value;
    if (!s || !t) return;
    if (starBusy.value) return;

    const next = !starredTermIds.value.has(t.id as Uuid);
    starBusy.value = true;
    try {
        if (!isWebPreview.value) {
            const db = await useTracerDb();
            await createStarsRepo(db).setStarred(
                s.id as Uuid,
                t.id as Uuid,
                next,
            );
        }
        const updated = new Set(starredTermIds.value);
        if (next) updated.add(t.id as Uuid);
        else updated.delete(t.id as Uuid);
        starredTermIds.value = updated;
    } finally {
        starBusy.value = false;
    }
}

function shouldIgnoreKey(e: KeyboardEvent) {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
}

function onKeydown(e: KeyboardEvent) {
    if (shouldIgnoreKey(e)) return;
    if (isExportOpen.value) return;
    if (mode.value !== "flashcards") return;

    if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        toggleFlip();
        return;
    }
    if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
    }
    if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
    }
}

const matchIsRunning = computed(
    () => matchStartedAtMs.value !== null && matchEndedAtMs.value === null,
);
const matchIsFinished = computed(
    () => matchStartedAtMs.value !== null && matchEndedAtMs.value !== null,
);
const matchMatchedPairsCount = computed(() => matchMatchedPairIds.value.size);

function formatSecondsCeil(ms: number) {
    return Math.ceil(Math.max(0, ms) / 1000);
}

const matchTopline = computed(() => {
    if (!matchIsRunning.value && !matchIsFinished.value) return "Ready";
    const seconds = formatSecondsCeil(matchTimeLeftMs.value);
    const pairs = `${matchMatchedPairsCount.value}/${matchPairsTarget.value}`;
    if (matchIsRunning.value) return `Time: ${seconds}s · Matched: ${pairs}`;
    return `Done · Matched: ${pairs}`;
});

const matchAccuracyText = computed(() => {
    const attempts = matchAttemptsCount.value;
    if (attempts <= 0) return "0% (0/0)";
    const pct = Math.round((matchCorrectAttemptsCount.value / attempts) * 100);
    return `${pct}% (${matchCorrectAttemptsCount.value}/${attempts})`;
});

const matchTimeText = computed(() => {
    const left = Math.max(0, matchTimeLeftMs.value);
    const elapsed = matchDurationSeconds * 1000 - left;
    const elapsedS = Math.round(elapsed / 1000);
    const leftS = Math.round(left / 1000);
    return `${elapsedS}s elapsed · ${leftS}s remaining`;
});

function newMsgId() {
    const fn = (globalThis as any)?.crypto?.randomUUID;
    if (typeof fn === "function") return fn.call((globalThis as any).crypto);
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function scrollChatToBottom() {
    const el = chatLogEl.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
}

function resetChat() {
    chatAbort.value?.abort();
    chatAbort.value = null;
    chatMessages.value = [];
    chatInput.value = "";
    chatBusy.value = false;
    chatError.value = null;
}

function onChatInputKeydown(e: KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    void sendChat();
}

function toErrorMessage(err: unknown, fallback: string) {
    if (typeof err === "string") return err;
    if (err instanceof Error && typeof err.message === "string")
        return err.message;
    const maybe = err as any;
    if (maybe && typeof maybe.message === "string") return maybe.message;
    return fallback;
}

async function sendChat() {
    const s = set.value;
    if (!s) return;
    if (chatBusy.value) return;

    const text = chatInput.value.trim();
    if (!text) return;

    if (
        typeof navigator !== "undefined" &&
        typeof navigator.onLine === "boolean" &&
        navigator.onLine === false
    ) {
        lastChatText.value = text;
        showAiError(new Error("Failed to fetch"));
        return;
    }

    lastChatText.value = text;
    chatInput.value = "";
    chatError.value = null;
    aiError.value = null;
    aiErrorOpen.value = false;

    chatAbort.value?.abort();
    const controller = new AbortController();
    chatAbort.value = controller;

    const userMsg: UiChatMessage = {
        id: newMsgId(),
        role: "user",
        content: text,
    };
    chatMessages.value = [...chatMessages.value, userMsg];

    const assistantMsg: UiChatMessage = {
        id: newMsgId(),
        role: "assistant",
        content: "",
    };
    chatMessages.value = [...chatMessages.value, assistantMsg];
    await nextTick();
    scrollChatToBottom();

    chatBusy.value = true;
    try {
        const prior: ChatMessage[] = chatMessages.value
            .slice(0, -1)
            .map((m) => ({ role: m.role, content: m.content }));
        const system = buildGroundedChatSystemPrompt(s);

        if (isWebPreview.value) {
            for await (const chunk of streamWebPreviewMockChatAnswer({
                set: s,
                userMessage: text,
                abortSignal: controller.signal,
            })) {
                assistantMsg.content += chunk;
                await nextTick();
                scrollChatToBottom();
            }
            return;
        }

        if (!defaultModelId.value) {
            aiError.value = aiErrorForMissingDefaultModel();
            aiErrorOpen.value = true;
            return;
        }

        const model = await resolveAiModel(defaultModelId.value);
        const result = streamGroundedChatText({
            model,
            system,
            messages: prior,
            abortSignal: controller.signal,
        });

        for await (const chunk of result.textStream) {
            assistantMsg.content += chunk;
            await nextTick();
            scrollChatToBottom();
        }
    } catch (err) {
        if (controller.signal.aborted) return;
        if (isAiErrorCandidate(err)) {
            showAiError(err);
            chatError.value = null;
        } else {
            chatError.value = toErrorMessage(err, "Failed to send message.");
        }
    } finally {
        if (!controller.signal.aborted) {
            chatBusy.value = false;
            await nextTick();
            scrollChatToBottom();
        }
    }
}

function openExport() {
    exportMessage.value = null;
    isExportOpen.value = true;
    nextTick(() => {
        exportTextareaEl.value?.focus();
        selectAllExport();
    });
}

function closeExport() {
    isExportOpen.value = false;
    exportMessage.value = null;
    nextTick(() => {
        viewerButtonEl.value?.focus();
    });
}

function selectAllExport() {
    const el = exportTextareaEl.value;
    if (!el) return;
    el.focus();
    el.select();
}

async function copyExport() {
    exportMessage.value = null;
    const text = exportTsv.value;
    if (!text) return;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            exportMessage.value = "Copied to clipboard.";
            return;
        }
    } catch {}

    selectAllExport();
    exportMessage.value = "Select the text and copy it manually.";
}

onMounted(async () => {
    let lockGateEvaluated = false;
    let lockGateRequiresUnlock = false;
    let lockGateStartupLockEnabled = false;
    let lockGateUnlockedThisSession = false;
    try {
        if (isWebPreview.value) {
            await initWebDemoSet();
            return;
        }

        const status = await lockGetStatus();
        const db = await useTracerDb();

        const profile = await createProfileRepo(db).get();
        if (!profile || !status.has_verifier) {
            markLocked();
            await router.replace("/first-run");
            return;
        }

        const settings = await createSettingsRepo(db).get();
        defaultModelId.value = settings.defaultModelId;
        learnHybridEnabled.value = settings.learnHybridEnabled;

        lockGateEvaluated = true;
        lockGateRequiresUnlock = status.requires_unlock;
        lockGateStartupLockEnabled = settings.startupLockEnabled;
        lockGateUnlockedThisSession = unlockedThisSession.value;
        if (settings.startupLockEnabled && status.requires_unlock) {
            if (!unlockedThisSession.value) {
                markLocked();
                await router.replace("/unlock");
                return;
            }
        } else if (status.can_auto_unlock) {
            markUnlocked();
        }

        if (mode.value === "chat" && !settings.defaultModelId) {
            await router.replace({
                path: "/settings",
                query: {
                    reason: "missing-default-model",
                    from: route.fullPath,
                },
            });
            return;
        }

        const idParam = route.params.id;
        if (typeof idParam !== "string" || !idParam.trim()) {
            busy.value = false;
            loadError.value = "Missing set id.";
            return;
        }

        await loadSet(idParam as Uuid);

        if (set.value) {
            await loadStars(set.value.id);
            startRun({ resetCounter: true });
            await startLearnRun({ resetCounter: true });
            resetMatchStateForRun();
            matchPrepareTiles(set.value);
        }
        await nextTick();
        if (mode.value === "chat") {
            chatTextareaEl.value?.focus();
        } else {
            viewerButtonEl.value?.focus();
        }

        window.addEventListener("keydown", onKeydown);
    } catch {
        const tauriInvoke = typeof (globalThis as any)?.__TAURI_INTERNALS__
            ?.invoke;
        if (tauriInvoke !== "function") {
            await initWebDemoSet();
            return;
        }

        if (
            lockGateEvaluated &&
            lockGateStartupLockEnabled &&
            lockGateRequiresUnlock &&
            !lockGateUnlockedThisSession
        ) {
            markLocked();
            await router.replace("/unlock");
            return;
        }

        busy.value = false;
        if (!loadError.value) loadError.value = "Failed to open set.";
    }
});

watch(
    mode,
    async (next, prev) => {
        if (prev === "chat" && next !== "chat") resetChat();

        if (next === "flashcards" && prev !== "flashcards") {
            startRun({ resetCounter: true });
        }
        if (next === "learn" && prev !== "learn") {
            await startLearnRun({ resetCounter: true });
        }
        if (next === "match" && prev !== "match") {
            resetMatchStateForRun();
            if (set.value) matchPrepareTiles(set.value);
        }
        await nextTick();
        if (next === "chat") {
            chatTextareaEl.value?.focus();
            scrollChatToBottom();
        } else {
            viewerButtonEl.value?.focus();
        }
    },
    { flush: "post" },
);

onBeforeUnmount(() => {
    resetChat();
    clearMatchTimer();
    window.removeEventListener("keydown", onKeydown);
});
</script>
