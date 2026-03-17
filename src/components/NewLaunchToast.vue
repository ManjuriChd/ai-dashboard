<script setup lang="ts">
defineProps<{ modelName: string }>()
defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div
    role="alert"
    aria-live="polite"
    class="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-cyber-accent/50 bg-cyber-card px-4 py-3 shadow-lg animate-fade-in"
  >
    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyber-accent/20 text-cyber-accent" aria-hidden="true">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </span>
    <div class="flex-1 min-w-0">
      <p class="font-medium text-slate-100">New launch</p>
      <p class="text-sm text-slate-400">{{ modelName }} is now available in the stream.</p>
    </div>
    <button
      type="button"
      class="shrink-0 rounded p-1 text-slate-400 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-accent"
      aria-label="Dismiss notification"
      @click="$emit('dismiss')"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
