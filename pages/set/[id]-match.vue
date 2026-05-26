<template>
    <main class="flex flex-col h-screen bg-white dark:bg-slate-950">
        <!-- Header with Back button and progress -->
        <div class="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div class="flex items-center justify-between gap-4">
                <BackButton />
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {{ matchTopline }}
                </p>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <!-- Title -->
            <div class="mb-6 text-center">
                <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Match</h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Match the pairs · Click "Memory" to toggle memory mode</p>
            </div>

            <p v-if="matchError" class="text-sm text-red-700 dark:text-red-300">
                {{ matchError }}
            </p>

            <!-- Results -->
            <div v-if="matchIsFinished" class="w-full max-w-2xl">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Results</h2>
                    <p class="mt-4 text-lg text-slate-700 dark:text-slate-200">
                        Accuracy:
                        <span class="font-medium">{{ matchAccuracyText }}</span>
                    </p>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Matched: {{ matchMatchedPairsCount }}/{{ matchPairsTarget }} · Attempts: {{ matchAttemptsCount }}
                    </p>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Time: {{ matchTimeText }}
                    </p>

                    <div class="mt-6 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                            :disabled="!set || set.terms.length === 0"
                            @click="restartMatchRun"
                        >
                            Play again
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

            <!-- Not started yet -->
            <div v-else-if="!matchIsRunning" class="w-full max-w-2xl text-center">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
                    <p class="text-sm text-slate-700 dark:text-slate-200 mb-4">
                        Press Start to begin. Select a term tile and its matching definition tile.
                    </p>

                    <div class="flex flex-wrap justify-center gap-2 mb-4">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                            :disabled="!set || set.terms.length === 0"
                            @click="startMatch"
                        >
                            Start
                        </button>
                    </div>

                    <div class="flex items-center justify-center">
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                            :class="{ 'bg-slate-100 dark:bg-slate-900': matchMemoryMode }"
                            @click="matchMemoryMode = !matchMemoryMode"
                        >
                            {{ matchMemoryMode ? '✓' : '' }} Memory
                        </button>
                    </div>
                </div>
            </div>

            <!-- Game grid -->
            <div v-else class="w-full max-w-3xl">
                <div class="grid grid-cols-4 gap-3 mb-6">
                    <button
                        v-for="tile in matchTiles"
                        :key="tile.id"
                        type="button"
                        class="h-24 sm:h-28 w-full rounded-md border p-2 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950 transition-colors"
                        :class="matchTileClass(tile)"
                        :disabled="matchTileDisabled(tile) || matchBusy"
                        @click="onMatchTileClick(tile)"
                    >
                        <span class="sr-only">Tile</span>
                        <span
                            v-if="matchIsTileRevealed(tile)"
                            class="block h-full overflow-hidden text-xs font-medium leading-snug flex items-center justify-center"
                        >
                            {{ tile.text }}
                        </span>
                    </button>
                </div>

                <div class="flex justify-center">
                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                        :disabled="!set || set.terms.length === 0"
                        @click="restartMatchRun"
                    >
                        Restart
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
    useTracerDb,
} from "~/src/composables/db";
import { lockGetStatus } from "~/src/composables/lock";
import { useLockSession } from "~/src/composables/lock-session";
import { hasTauriRuntime } from "~/src/composables/tauri";
import {
    generateMatchTiles,
    type MatchTile,
} from "~/src/composables/match/generator";

const route = useRoute();
const router = useRouter();
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession();

const isWebPreview = computed(() => !hasTauriRuntime());

const busy = ref(true);
const loadError = ref<string | null>(null);
const set = ref<FlashcardSet | null>(null);

const matchPairsRequested = 8;
const matchDurationSeconds = 600; // 10 minutes max

const matchBusy = ref(false);
const matchError = ref<string | null>(null);
const matchRunCounter = ref(0);
const matchTiles = ref<MatchTile[]>([]);
const matchStartedAtMs = ref<number | null>(null);
const matchEndedAtMs = ref<number | null>(null);
const matchElapsedTimeMs = ref(0);
const matchTimerHandle = shallowRef<number | null>(null);
const matchSelectedTileIds = ref<string[]>([]);
const matchMatchedPairIds = ref<Set<Uuid>>(new Set());
const matchAttemptsCount = ref(0);
const matchCorrectAttemptsCount = ref(0);
const matchMemoryMode = ref(false);

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

function matchComputeElapsedMs(nowMs: number) {
    const start = matchStartedAtMs.value;
    if (start === null) return 0;
    return Math.max(0, nowMs - start);
}

function matchStop(reason: "completed" | "timeout") {
    if (matchEndedAtMs.value !== null) return;
    const now = Date.now();
    matchEndedAtMs.value = now;
    matchElapsedTimeMs.value = matchComputeElapsedMs(now);
    clearMatchTimer();

    matchSelectedTileIds.value = [];
    matchBusy.value = false;
}

function startMatchTimer() {
    clearMatchTimer();
    matchTimerHandle.value = window.setInterval(() => {
        const now = Date.now();
        matchElapsedTimeMs.value = matchComputeElapsedMs(now);
        if (matchElapsedTimeMs.value >= matchDurationSeconds * 1000) {
            matchElapsedTimeMs.value = matchDurationSeconds * 1000;
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
    matchElapsedTimeMs.value = 0;
    clearMatchTimer();
}

const matchPairsTarget = computed(() => {
    const s = set.value;
    const available = s?.terms?.length ?? 0;
    return Math.min(matchPairsRequested, available);
});

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
    matchElapsedTimeMs.value = 0;
    startMatchTimer();
}

function restartMatchRun() {
    matchRunCounter.value += 1;
    startMatch();
}

function matchIsTileRevealed(tile: MatchTile) {
    if (!matchMemoryMode.value) {
        return true;
    }
    if (matchMatchedPairIds.value.has(tile.pairId)) return true;
    if (matchSelectedTileIds.value.includes(tile.id)) return true;
    return false;
}

function matchTileDisabled(tile: MatchTile) {
    const matchIsRunning = matchStartedAtMs.value !== null && matchEndedAtMs.value === null;
    if (!matchIsRunning) return true;
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
    if (selected && !matchMemoryMode.value) {
        // When selected in non-memory mode, show light gray
        return "border-slate-300 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50";
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
    const matchIsRunning = matchStartedAtMs.value !== null && matchEndedAtMs.value === null;
    if (!matchIsRunning) return;
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

const matchIsRunning = computed(
    () => matchStartedAtMs.value !== null && matchEndedAtMs.value === null,
);
const matchIsFinished = computed(
    () => matchStartedAtMs.value !== null && matchEndedAtMs.value !== null,
);
const matchMatchedPairsCount = computed(() => matchMatchedPairIds.value.size);

const matchTopline = computed(() => {
    if (!matchIsRunning.value && !matchIsFinished.value) return "Ready";
    const seconds = Math.floor(matchElapsedTimeMs.value / 1000);
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
    const elapsedMs = matchElapsedTimeMs.value;
    const elapsedS = Math.round(elapsedMs / 1000);
    return `${elapsedS}s`;
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
                    { id: "t-3", front: "Term 3", back: "Definition 3" },
                    { id: "t-4", front: "Term 4", back: "Definition 4" },
                ],
                createdAt: now,
                updatedAt: now,
            };
            busy.value = false;
            resetMatchStateForRun();
            if (set.value) matchPrepareTiles(set.value);
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
            resetMatchStateForRun();
            matchPrepareTiles(set.value);
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
                    { id: "t-3", front: "Term 3", back: "Definition 3" },
                    { id: "t-4", front: "Term 4", back: "Definition 4" },
                ],
                createdAt: now,
                updatedAt: now,
            };
            busy.value = false;
            resetMatchStateForRun();
            if (set.value) matchPrepareTiles(set.value);
            return;
        }

        busy.value = false;
        if (!loadError.value) loadError.value = "Failed to open set.";
    }
});

onBeforeUnmount(() => {
    resetMatchStateForRun();
    matchMemoryMode.value = false;
});
</script>
