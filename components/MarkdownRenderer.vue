<template>
  <div class="space-y-4" data-testid="markdown-renderer">
    <template v-for="(b, idx) in blocks" :key="idx">
      <component
        :is="headingTag(b)"
        v-if="b.type === 'heading'"
        :class="headingClass(b.level)"
      >
        {{ b.text }}
      </component>

      <p v-else-if="b.type === 'paragraph'" class="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
        {{ b.text }}
      </p>

      <component
        :is="b.ordered ? 'ol' : 'ul'"
        v-else-if="b.type === 'list'"
        class="space-y-1 pl-6 text-sm text-slate-700 dark:text-slate-200"
        :class="b.ordered ? 'list-decimal' : 'list-disc'"
      >
        <li v-for="(item, itemIdx) in b.items" :key="itemIdx" class="pl-1">
          {{ item }}
        </li>
      </component>

      <div v-else-if="b.type === 'code'" class="rounded-md border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div
          v-if="b.lang"
          class="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400"
        >
          {{ b.lang }}
        </div>
        <pre class="overflow-x-auto p-3"><code class="block whitespace-pre text-xs text-slate-900 dark:text-slate-50">{{ b.code }}</code></pre>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { parseMarkdownBlocks, type MarkdownBlock } from '~/src/composables/markdown/parse'

const props = defineProps<{ markdown: string }>()

const blocks = computed<MarkdownBlock[]>(() => parseMarkdownBlocks(props.markdown ?? ''))

function headingTag(block: MarkdownBlock) {
  if (block.type !== 'heading') return 'div'
  return `h${block.level}`
}

function headingClass(level: 1 | 2 | 3 | 4 | 5 | 6) {
  if (level === 1) return 'text-xl font-semibold text-slate-900 dark:text-slate-50'
  if (level === 2) return 'text-lg font-semibold text-slate-900 dark:text-slate-50'
  if (level === 3) return 'text-base font-semibold text-slate-900 dark:text-slate-50'
  return 'text-sm font-semibold text-slate-900 dark:text-slate-50'
}
</script>
