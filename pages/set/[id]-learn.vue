<template>
    <main class="flex flex-col h-8/9 bg-white dark:bg-slate-950">
        <!-- Header with Back button and progress -->
        <div class="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div class="flex items-center justify-between gap-4">
                <BackButton />
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {{ learnRatioText }}
                </p>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <!-- Title -->
            <div class="mb-6 text-center">
                <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Learn</h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Answer questions · Results tracked per run</p>
            </div>

            <p
                v-if="learnError"
                class="text-sm text-red-700 dark:text-red-300"
            >
                {{ learnError }}
            </p>

            <div
                v-if="learnBusy"
                class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
                Preparing questions…
            </div>

            <!-- Results -->
            <div v-else-if="learnIsFinished" class="w-full max-w-2xl">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Results</h2>
                    <p class="mt-4 text-lg text-slate-700 dark:text-slate-200">
                        Accuracy:
                        <span class="font-medium">{{ learnAccuracyText }}</span>
                    </p>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Correct: {{ learnCorrectCount }} · Attempted: {{ learnAttemptedCount }}
                    </p>

                    <div class="mt-6 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                            :disabled="!set || learnQuestions.length === 0"
                            @click="restartLearnRun"
                        >
                            Restart
                        </button>
                        <NuxtLink
                            v-if="set"
                            :to="`/set/${set.id}`"
                            class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        >
                            Back to set
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Question -->
            <div v-else-if="!learnCurrentQuestion" class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                No questions available.
            </div>

            <div v-else class="w-full max-w-2xl">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Question
                    </p>
                    <p class="mt-4 whitespace-pre-wrap text-2xl font-medium text-slate-900 dark:text-slate-50">
                        {{ learnCurrentQuestion.prompt }}
                    </p>

                    <div class="mt-8 grid gap-3">
                        <template v-if="learnCurrentQuestion.kind === 'true_false'">
                            <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                :disabled="learnBusy"
                                @click="answerLearnTrueFalse(true)"
                            >
                                True
                            </button>
                            <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                :disabled="learnBusy"
                                @click="answerLearnTrueFalse(false)"
                            >
                                False
                            </button>
                        </template>

                        <template v-else>
                            <button
                                v-for="(opt, idx) in learnCurrentQuestion.options"
                                :key="`${learnCurrentQuestion.id}:${idx}`"
                                type="button"
                                class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                                :disabled="learnBusy"
                                @click="answerLearnMultipleChoice(idx)"
                            >
                                {{ opt }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { FlashcardSet, Uuid } from "~/src/composables/db/types";
import {
    createProfileRepo,
    createSettingsRepo,
    createSetsRepo,
    useTracerDb,
} from "~/src/composables/db";
import { lockGetStatus } from "~/src/composables/lock";
import { useLockSession } from "~/src/composables/lock-session";
import { hasTauriRuntime } from "~/src/composables/tauri";
import {
    generateLearnQuestions,
    type LearnQuestion,
} from "~/src/composables/learn/generator";
import { resolveAiModel } from "~/src/composables/ai/registry";
import { generateText } from "ai";

const route = useRoute();
const router = useRouter();
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession();

const isWebPreview = computed(() => !hasTauriRuntime());

const busy = ref(true);
const loadError = ref<string | null>(null);
const set = ref<FlashcardSet | null>(null);
const defaultModelId = ref<string | null>(null);
const learnHybridEnabled = ref(false);

const learnBusy = ref(false);
const learnError = ref<string | null>(null);

const learnRunCounter = ref(0);
const learnCursorIndex = ref(0);
const learnQuestions = ref<LearnQuestion[]>([]);
const learnAnswersByQuestionId = ref<Record<string, boolean>>({});

const baseSeed = computed(() => {
    const raw = route.query.seed;
    if (typeof raw !== "string") return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
});

function getRandomSeed() {
    try {
        const buf = new Uint32Array(1);
        (globalThis.crypto as Crypto | undefined)?.getRandomValues?.(buf);
        const v = Number(buf[0] ?? 0);
        if (Number.isFinite(v) && v !== 0) return v;
    } catch {}
    return Date.now() ^ Math.floor(Math.random() * 0xffffffff);
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
    () =>
        Object.values(learnAnswersByQuestionId.value).filter((v) => v).length,
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

async function loadSet(setId: Uuid) {
    busy.value = true;
    loadError.value = null;
    try {
        const db = await useTracerDb();
        set.value = await createSetsRepo(db).get(setId);
    } catch {
        loadError.value = "Failed to load set.";
    } finally {
        busy.value = false;
    }
}

onMounted(async () => {
    try {
        if (isWebPreview.value) {
            const now = new Date().toISOString();
            set.value = {
                id: "demo" as Uuid,
                title: "Demo set",
                description: "Demo",
                terms: [
                    { id: "t-1", front: "Term 1", back: "Definition 1" },
                    { id: "t-2", front: "Term 2", back: "Definition 2" },
                ],
                createdAt: now,
                updatedAt: now,
            };
            busy.value = false;
            await startLearnRun({ resetCounter: true });
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

        if (settings.startupLockEnabled && status.requires_unlock) {
            if (!unlockedThisSession.value) {
                markLocked();
                await router.replace("/unlock");
                return;
            }
        } else if (status.can_auto_unlock) {
            markUnlocked();
        }

        const idParam = route.params.id;
        if (typeof idParam !== "string" || !idParam.trim()) {
            busy.value = false;
            loadError.value = "Missing set id.";
            return;
        }

        await loadSet(idParam as Uuid);

        if (set.value) {
            await startLearnRun({ resetCounter: true });
        }
    } catch {
        const tauriInvoke = typeof (globalThis as any)?.__TAURI_INTERNALS__
            ?.invoke;
        if (tauriInvoke !== "function") {
            const now = new Date().toISOString();
            set.value = {
                id: "demo" as Uuid,
                title: "Demo set",
                description: "Demo",
                terms: [
                    { id: "t-1", front: "Term 1", back: "Definition 1" },
                    { id: "t-2", front: "Term 2", back: "Definition 2" },
                ],
                createdAt: now,
                updatedAt: now,
            };
            busy.value = false;
            await startLearnRun({ resetCounter: true });
            return;
        }

        busy.value = false;
        if (!loadError.value) loadError.value = "Failed to open set.";
    }
});
</script>
