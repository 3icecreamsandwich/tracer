<template>
  <main>
    <AiErrorModal :open="aiErrorOpen" :error="aiError" from="/create/generate" @close="closeAiError" />
    <div class="mx-auto max-w-3xl p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Create · Generate</h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Upload PDFs or images to generate a flashcard set plus a linked study guide.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          :disabled="generateDisabled"
          @click="onGenerate"
        >
          {{ busy ? 'Generating…' : 'Generate' }}
        </button>
      </div>

      <div
        v-if="isWebPreview"
        class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        role="status"
        aria-live="polite"
      >
        Generate requires the desktop app (Tauri) for vault + database access.
      </div>

      <div class="mt-6 space-y-6">
        <section
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          aria-label="Generate inputs"
        >
          <div class="grid gap-4">
            <div>
              <label class="block text-sm font-medium" for="gen-title">Title (optional)</label>
              <input
                id="gen-title"
                v-model="title"
                type="text"
                autocomplete="off"
                placeholder="Generated set…"
                class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                :disabled="busy || isWebPreview"
              />
            </div>

            <div>
              <label class="block text-sm font-medium" for="gen-instructions">Instructions (optional)</label>
              <textarea
                id="gen-instructions"
                v-model="instructions"
                rows="3"
                placeholder="e.g. Focus on key definitions and common exam questions"
                class="mt-1 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                :disabled="busy || isWebPreview"
              />
            </div>

            <div>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-50">Sources</p>
                  <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Limits: max 10 PDF pages total, max 10 images.
                  </p>
                </div>

                <div class="shrink-0 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                    :disabled="busy || isWebPreview || ingestBusy"
                    @click="openPicker"
                  >
                    {{ ingestBusy ? 'Checking…' : 'Choose files' }}
                  </button>
                  <button
                    v-if="pickedAny"
                    type="button"
                    class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                    :disabled="busy || isWebPreview || ingestBusy"
                    @click="clearPicked"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <input
                ref="fileInputEl"
                class="sr-only"
                type="file"
                multiple
                accept="application/pdf,image/*"
                @change="onPicked"
              />

              <div class="mt-4 grid gap-3 sm:grid-cols-3">
                <div
                  class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400">PDF pages</p>
                  <p class="mt-1 font-medium">{{ totalPdfPages }}/10</p>
                </div>
                <div
                  class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Images</p>
                  <p class="mt-1 font-medium">{{ pickedImages.length }}/10</p>
                </div>
                <div
                  class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Files</p>
                  <p class="mt-1 font-medium">{{ pickedCount }}</p>
                </div>
              </div>

              <p v-if="pickedAny" class="mt-4 text-sm text-slate-700 dark:text-slate-200">
                {{ pickedSummary }}
              </p>

              <p v-if="formError" class="mt-4 text-sm text-red-700 dark:text-red-300">
                {{ formError }}
              </p>
            </div>
          </div>
        </section>

        <section
          v-if="rawOutput"
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          aria-label="AI output"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-sm font-medium text-slate-900 dark:text-slate-50">AI output</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                If parsing fails, copy the raw output and try again.
              </p>
            </div>

            <div class="shrink-0 flex flex-wrap gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                :disabled="!rawOutput"
                @click="copyRaw"
              >
                Copy
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
                :disabled="!rawOutput"
                @click="selectAllRaw"
              >
                Select all
              </button>
            </div>
          </div>

          <p v-if="rawMessage" class="mt-3 text-sm text-slate-700 dark:text-slate-200">
            {{ rawMessage }}
          </p>

          <div class="mt-4">
            <label class="sr-only" for="gen-raw-output">Raw output</label>
            <textarea
              id="gen-raw-output"
              ref="rawTextareaEl"
              readonly
              rows="10"
              class="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
              :value="rawOutput"
              @focus="selectAllRaw"
            />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { lockGetStatus } from '~/src/composables/lock'
import {
  createProfileRepo,
  createSettingsRepo,
  createSetsRepo,
  createStudyGuidesRepo,
  useTracerDb,
  type Uuid
} from '~/src/composables/db'
import { useLockSession } from '~/src/composables/lock-session'
import { resolveAiModel } from '~/src/composables/ai/registry'
import { hasTauriRuntime } from '~/src/composables/tauri'
import { parseTermsTsv, TsvParseError, normalizeTerms, TermsValidationError } from '~/src/composables/db/validators'
import { generateText } from 'ai'
import { normalizeAiError, aiErrorForMissingDefaultModel, type AiErrorUx } from '~/src/composables/ai/ux-errors'
import { parseGenerateContractOutput, GenerateContractParseError } from '~/src/composables/ai/generate-contract'

const router = useRouter()
const { unlockedThisSession, markLocked, markUnlocked } = useLockSession()

const hasTauriInternals = hasTauriRuntime()

const isWebPreview = computed(() => !hasTauriInternals)

const title = ref('')
const instructions = ref('')

type PickedPdf = { kind: 'pdf'; file: File; pages: number }
type PickedImage = { kind: 'image'; file: File }

const pickedPdfs = ref<PickedPdf[]>([])
const pickedImages = ref<PickedImage[]>([])

const ingestBusy = ref(false)
const busy = ref(false)
const formError = ref<string | null>(null)

const rawOutput = ref<string | null>(null)
const rawMessage = ref<string | null>(null)
const rawTextareaEl = ref<HTMLTextAreaElement | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)

const aiError = ref<AiErrorUx | null>(null)
const aiErrorOpen = ref(false)

function showAiError(err: unknown) {
  aiError.value = normalizeAiError(err)
  aiErrorOpen.value = true
}

function closeAiError() {
  aiErrorOpen.value = false
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (isRecord(err) && typeof err.message === 'string') return err.message
  return fallback
}

function selectAllRaw() {
  const el = rawTextareaEl.value
  if (!el) return
  el.focus()
  el.select()
}

async function copyRaw() {
  rawMessage.value = null
  const text = rawOutput.value
  if (!text) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      rawMessage.value = 'Copied to clipboard.'
      return
    }
  } catch {
  }

  selectAllRaw()
  rawMessage.value = 'Select the text and copy it manually.'
}

function countPdfPagesFromText(pdfText: string): number | null {
  const candidates: number[] = []
  const pagesRe = /\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/g
  for (;;) {
    const m = pagesRe.exec(pdfText)
    if (!m) break
    const n = Number(m[1])
    if (Number.isFinite(n) && n > 0) candidates.push(n)
  }
  if (candidates.length > 0) return Math.max(...candidates)

  const fallbackRe = /\/Count\s+(\d+)/g
  for (;;) {
    const m = fallbackRe.exec(pdfText)
    if (!m) break
    const n = Number(m[1])
    if (Number.isFinite(n) && n > 0) candidates.push(n)
  }
  if (candidates.length > 0) return Math.max(...candidates)
  return null
}

async function countPdfPages(file: File): Promise<number> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  const decoder = new TextDecoder('latin1', { fatal: false })
  const text = decoder.decode(bytes)
  const pages = countPdfPagesFromText(text)
  if (!pages) {
    throw new Error(`Could not determine page count for '${file.name}'. Try exporting pages as images or splitting the PDF.`)
  }
  return pages
}

const totalPdfPages = computed(() => pickedPdfs.value.reduce((sum, p) => sum + p.pages, 0))
const pickedCount = computed(() => pickedPdfs.value.length + pickedImages.value.length)
const pickedAny = computed(() => pickedCount.value > 0)

const pickedSummary = computed(() => {
  const pdfs = pickedPdfs.value.length
  const imgs = pickedImages.value.length
  const parts: string[] = []
  if (pdfs) parts.push(`${pdfs} PDF${pdfs === 1 ? '' : 's'}`)
  if (imgs) parts.push(`${imgs} image${imgs === 1 ? '' : 's'}`)
  return parts.length ? `Selected: ${parts.join(' · ')}` : ''
})

const generateDisabled = computed(() => {
  if (busy.value || ingestBusy.value || isWebPreview.value) return true
  if (!pickedAny.value) return true
  if (totalPdfPages.value > 10) return true
  if (pickedImages.value.length > 10) return true
  return false
})

function openPicker() {
  formError.value = null
  fileInputEl.value?.click()
}

function clearPicked() {
  pickedPdfs.value = []
  pickedImages.value = []
  formError.value = null
  if (fileInputEl.value) fileInputEl.value.value = ''
}

async function onPicked(e: Event) {
  formError.value = null
  const input = e.target
  if (!(input instanceof HTMLInputElement)) return
  const list = input.files
  if (!list) return

  const files = Array.from(list)
  input.value = ''
  if (files.length === 0) return

  ingestBusy.value = true
  try {
    const pdfFiles = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))

    if (imageFiles.length > 10) {
      throw new Error(`Too many images selected. Max is 10; you selected ${imageFiles.length}.`)
    }

    const pdfs: PickedPdf[] = []
    for (const f of pdfFiles) {
      const pages = await countPdfPages(f)
      pdfs.push({ kind: 'pdf', file: f, pages })
    }

    const total = pdfs.reduce((sum, p) => sum + p.pages, 0)
    if (total > 10) {
      throw new Error(`PDF page limit exceeded. Max is 10 pages total; selected PDFs contain ${total} pages.`)
    }

    const images: PickedImage[] = imageFiles.map((f) => ({ kind: 'image', file: f }))

    pickedPdfs.value = pdfs
    pickedImages.value = images
  } catch (err) {
    formError.value = toErrorMessage(err, 'Failed to process selected files.')
  } finally {
    ingestBusy.value = false
  }
}

async function fileToUint8Array(file: File) {
  const buf = await file.arrayBuffer()
  return new Uint8Array(buf)
}

function generateTitleFromFiles() {
  const t = title.value.trim()
  if (t) return t
  const first = pickedPdfs.value[0]?.file?.name ?? pickedImages.value[0]?.file?.name
  if (first) return `Generated · ${first}`
  return 'Generated'
}

function buildPromptText() {
  const extra = instructions.value.trim()
  const extraLine = extra ? `User instructions: ${extra}\n` : ''
  return [
    'You are creating study materials from the provided source documents (PDFs and images).',
    'Return EXACTLY two fenced code blocks and NOTHING else.',
    '',
    '1) A markdown study guide:',
    '```study_guide_md',
    '(markdown)',
    '```',
    '',
    '2) Flashcards as TSV with one card per line:',
    '```flashcards_tsv',
    'term<TAB>definition',
    '... (no header row)',
    '```',
    '',
    'Flashcards TSV rules:',
    '- Output TSV only inside the flashcards_tsv fence.',
    '- One card per line.',
    '- Each line must contain exactly ONE tab separator.',
    '- Do not include tabs inside term or definition (use spaces instead).',
    '- Do not include blank lines.',
    '- Do not include numbering or bullets.',
    '- If you need a line break inside a cell, use the literal sequence "\\n" (do not insert real newlines).',
    '- Do not include a header row.',
    '',
    extraLine.trimEnd()
  ]
    .filter((x) => x.length > 0)
    .join('\n')
}

async function onGenerate() {
  formError.value = null
  rawMessage.value = null
  rawOutput.value = null
  aiError.value = null
  aiErrorOpen.value = false
  if (busy.value) return

  if (isWebPreview.value) {
    formError.value = 'Generate is not available in web preview.'
    return
  }

  if (!pickedAny.value) {
    formError.value = 'Choose at least one PDF or image.'
    return
  }

  if (totalPdfPages.value > 10) {
    formError.value = `PDF page limit exceeded. Max is 10 pages total; selected PDFs contain ${totalPdfPages.value} pages.`
    return
  }

  if (pickedImages.value.length > 10) {
    formError.value = `Too many images selected. Max is 10; you selected ${pickedImages.value.length}.`
    return
  }

  busy.value = true
  try {
    const db = await useTracerDb()
    const settings = await createSettingsRepo(db).get()
    if (!settings.defaultModelId) {
      aiError.value = aiErrorForMissingDefaultModel()
      aiErrorOpen.value = true
      return
    }

    const model = await resolveAiModel(settings.defaultModelId)

    const content: any[] = [{ type: 'text', text: buildPromptText() }]

    for (const p of pickedPdfs.value) {
      content.push({
        type: 'file',
        data: await fileToUint8Array(p.file),
        filename: p.file.name,
        mediaType: 'application/pdf'
      })
    }
    for (const img of pickedImages.value) {
      content.push({
        type: 'image',
        image: await fileToUint8Array(img.file),
        mediaType: img.file.type || 'image/*'
      })
    }

    const res = await generateText({
      model,
      messages: [{ role: 'user', content }]
    })

    rawOutput.value = res.text ?? ''
    const text = (res.text ?? '').trim()

    const parsed = parseGenerateContractOutput(text)
    let termInputs = parseTermsTsv(parsed.flashcardsTsv)
    termInputs = termInputs.map((t) => ({
      front: t.front.split('\t').join(' ').trim(),
      back: t.back.split('\t').join(' ').trim()
    }))
    const terms = normalizeTerms(termInputs)

    const setId = crypto.randomUUID() as Uuid
    const setsRepo = createSetsRepo(db)
    await setsRepo.create({
      id: setId,
      title: generateTitleFromFiles(),
      description: null,
      terms
    })

    const guidesRepo = createStudyGuidesRepo(db)
    await guidesRepo.create({
      id: crypto.randomUUID() as Uuid,
      setId,
      markdown: parsed.studyGuideMarkdown
    })

    await router.replace(`/set/${setId}`)
  } catch (e: unknown) {
    if (e instanceof GenerateContractParseError || e instanceof TsvParseError || e instanceof TermsValidationError) {
      showAiError(e)
    } else {
      showAiError(e)
    }
  } finally {
    busy.value = false
    await nextTick()
    if (rawOutput.value) rawTextareaEl.value?.focus()
  }

  return
}

onMounted(async () => {
  try {
    if (isWebPreview.value) {
      return
    }
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
      if (!unlockedThisSession.value) {
        markLocked()
        await router.replace('/unlock')
        return
      }
    } else if (status.can_auto_unlock) {
      markUnlocked()
    }

    if (!settings.defaultModelId) {
      await router.replace({ path: '/settings', query: { reason: 'missing-default-model', from: '/create/generate' } })
      return
    }

    return
  } catch {
    markLocked()
    await router.replace('/unlock')
  }
})
</script>
