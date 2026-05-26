<template>
    <main class="flex flex-col h-8/9 bg-white dark:bg-slate-950">
        <!-- Header with Back button and progress -->
        <div class="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div class="flex items-center justify-between gap-4">
                <BackButton />
                <div class="flex items-center gap-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {{ ratioText }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <!-- Title -->
            <div class="mb-6 text-center">
                <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Flashcards</h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Space to flip · ←/→ to browse · Mark correct/incorrect to progress</p>
            </div>

            <!-- Results -->
            <div v-if="isFinished" class="w-full max-w-2xl">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Results</h2>
                    <p class="mt-4 text-lg text-slate-700 dark:text-slate-200">
                        Accuracy:
                        <span class="font-medium">{{ accuracyText }}</span>
                    </p>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Correct: {{ correctCount }} · Attempted: {{ attemptedCount }}
                    </p>

                    <div class="mt-6 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                            :disabled="set?.terms.length === 0"
                            @click="restartRun"
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

            <!-- Card -->
            <div v-else class="w-full flex flex-col items-center">
                <button
                    ref="viewerButtonEl"
                    type="button"
                    class="flex flex-col items-center justify-center w-[70vw] h-[50vh] rounded-lg border border-slate-200 bg-slate-50 px-8 py-12 text-center shadow-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                    :class="{ 'animate-flip': isFlipping, 'animate-slide-left': isNavigating === 'next', 'animate-slide-right': isNavigating === 'prev' }"
                    :disabled="set?.terms.length === 0"
                    @click="toggleFlip"
                >
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {{ isFlipped ? "Definition" : "Term" }}
                    </p>
                    <p class="mt-4 whitespace-pre-wrap text-4xl font-medium text-slate-900 dark:text-slate-50 overflow-y-auto">
                        {{ viewerText }}
                    </p>
                </button>

                <!-- Controls -->
                <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="set?.terms.length === 0 || cursorIndex === 0"
                        @click="goPrev"
                    >
                        ← Prev
                    </button>

                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="set?.terms.length === 0 || cursorIndex >= (set?.terms.length ?? 0) - 1"
                        @click="goNext"
                    >
                        Next →
                    </button>

                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="set?.terms.length === 0"
                        @click="shuffleRun"
                    >
                        Shuffle
                    </button>

                    <button
                        type="button"
                        class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="!currentTerm || starBusy"
                        :aria-pressed="isCurrentStarred"
                        @click="toggleStar"
                    >
                        {{ isCurrentStarred ? "Unstar" : "Star" }}
                    </button>

                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-red-900/40 dark:bg-slate-950 dark:text-red-200 dark:hover:bg-red-950/40 dark:focus-visible:ring-red-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="!currentTerm"
                        @click="markIncorrect"
                    >
                        Missed it
                    </button>

                    <button
                        type="button"
                        class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="!currentTerm"
                        @click="markCorrect"
                    >
                        Got it
                    </button>
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
    createStarsRepo,
    useTracerDb,
} from "~/src/composables/db";
import { lockGetStatus } from "~/src/composables/lock";
import { useLockSession } from "~/src/composables/lock-session";
import { hasTauriRuntime } from "~/src/composables/tauri";

const route = useRoute();
const router = useRouter();
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession();

const isWebPreview = computed(() => !hasTauriRuntime());

const busy = ref(true);
const loadError = ref<string | null>(null);
const set = ref<FlashcardSet | null>(null);

const isFlipped = ref(false);
const isFlipping = ref(false);
const isNavigating = ref<'prev' | 'next' | null>(null);

const runCounter = ref(0);
const cursorIndex = ref(0);
const order = ref<Uuid[]>([]);
const lastOrder = ref<Uuid[]>([]);
const answersByTermId = ref<Record<Uuid, "correct" | "incorrect">>({});

const starredTermIds = ref<Set<Uuid>>(new Set());
const starBusy = ref(false);

const baseSeed = computed(() => {
    const raw = route.query.seed;
    if (typeof raw !== "string") return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
});

const viewerButtonEl = ref<HTMLButtonElement | null>(null);

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

function toggleFlip() {
    if (totalCount.value === 0) return;
    isFlipping.value = true;
    setTimeout(() => {
        isFlipped.value = !isFlipped.value;
        isFlipping.value = false;
    }, 250);
}

function goPrev() {
    if (totalCount.value === 0) return;
    const next = Math.min(
        Math.max(cursorIndex.value - 1, 0),
        totalCount.value - 1,
    );
    if (next !== cursorIndex.value) {
        isNavigating.value = 'prev';
        setTimeout(() => {
            cursorIndex.value = next;
            isFlipped.value = false;
            isNavigating.value = null;
        }, 250);
    }
}

function goNext() {
    if (totalCount.value === 0) return;
    const next = Math.min(
        Math.max(cursorIndex.value + 1, 0),
        totalCount.value - 1,
    );
    if (next !== cursorIndex.value) {
        isNavigating.value = 'next';
        setTimeout(() => {
            cursorIndex.value = next;
            isFlipped.value = false;
            isNavigating.value = null;
        }, 250);
    }
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

function markAnswer(answer: "correct" | "incorrect") {
    const t = currentTerm.value;
    if (!t) return;
    answersByTermId.value = {
        ...answersByTermId.value,
        [t.id as Uuid]: answer,
    };
    isFlipped.value = false;
    const next = findNextUnattempted(cursorIndex.value + 1);
    if (next === null) {
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
    if (isFinished.value) return;

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
            await loadStars(set.value.id);
            startRun({ resetCounter: true });
            await nextTick();
            viewerButtonEl.value?.focus();
            window.addEventListener("keydown", onKeydown);
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
            await loadStars(set.value.id);
            startRun({ resetCounter: true });
        }
        await nextTick();
        viewerButtonEl.value?.focus();

        window.addEventListener("keydown", onKeydown);
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
            await loadStars(set.value.id);
            startRun({ resetCounter: true });
            await nextTick();
            viewerButtonEl.value?.focus();
            window.addEventListener("keydown", onKeydown);
            return;
        }

        busy.value = false;
        if (!loadError.value) loadError.value = "Failed to open set.";
    }
});

onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
@keyframes flip {
    0% {
        transform: scaleY(1);
        opacity: 1;
    }
    50% {
        transform: scaleY(0);
        opacity: 0;
    }
    100% {
        transform: scaleY(1);
        opacity: 1;
    }
}

@keyframes slideLeft {
    0% {
        transform: translateX(0);
        opacity: 1;
    }
    100% {
        transform: translateX(-10%);
        opacity: 0;
    }
}

@keyframes slideRight {
    0% {
        transform: translateX(0);
        opacity: 1;
    }
    100% {
        transform: translateX(10%);
        opacity: 0;
    }
}

.animate-flip {
    animation: flip 0.25s ease-in-out;
}

.animate-slide-left {
    animation: slideLeft 0.25s ease-in-out;
}

.animate-slide-right {
    animation: slideRight 0.25s ease-in-out;
}
</style>
