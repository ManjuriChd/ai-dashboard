<script setup lang="ts">
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto max-w-7xl">
      <div class="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4 md:px-6">
        <div />
        <h1 class="text-lg font-semibold text-slate-900 truncate text-center">
          AI Market Intelligence & Strategic Insights Dashboard
        </h1>
        <div class="justify-self-end flex items-center gap-2">
          <span class="hidden sm:inline rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Live
          </span>
          <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        </div>
      </div>
    </div>

    <div class="sticky top-14 z-20 border-t border-slate-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 md:px-6 py-2">
        <nav
          class="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap"
          aria-label="Dashboard sections"
        >
        <a
          href="#metrics"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >Live metrics</a>
        <a
          href="#popular"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >Popular models</a>
        <a
          href="#usage"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >Usage by team</a>
        <a
          href="#industry"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >Industry impact</a>
        <a
          href="#country-map"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >Country mapping</a>
        <a
          href="#explorer"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >Model explorer</a>
        </nav>
      </div>
    </div>
  </header>
</template>
