<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMarketStore } from '@/store/marketStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import countriesGeoJsonUrl from '@/assets/geo/countries.geojson?url'

const store = useMarketStore()
const mapHostRef = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let geoLayer: L.GeoJSON | null = null
let resizeObserver: ResizeObserver | null = null

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function isoHash(iso: string) {
  // Deterministic small hash so map feels stable but still changes with metrics.
  let h = 0
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) >>> 0
  return h
}

function adoptionToBin(adoption: number) {
  // Exact bins: 0-33 (Low), 34-66 (Medium), 67-100 (High)
  if (adoption <= store.adoptionBins.lowMax) return 'Low'
  if (adoption <= store.adoptionBins.mediumMax) return 'Medium'
  return 'High'
}

function adoptionBinToColor(bin: 'Low' | 'Medium' | 'High') {
  // Red -> amber -> green
  if (bin === 'Low') return 'rgb(239 68 68)' // red-500
  if (bin === 'Medium') return 'rgb(245 158 11)' // amber-500
  return 'rgb(34 197 94)' // green-500
}

const avgPopularity = computed(() => {
  const list = store.popularModels
  if (!list.length) return 50
  return list.reduce((sum, m) => sum + m.popularityScore, 0) / list.length
})

const lowRangeLabel = computed(() => `Low (0-${store.adoptionBins.lowMax})`)
const mediumRangeLabel = computed(
  () => `Medium (${store.adoptionBins.lowMax + 1}-${store.adoptionBins.mediumMax})`,
)
const highRangeLabel = computed(() => `High (${store.adoptionBins.mediumMax + 1}-100)`)

function onLowThresholdInput(event: Event) {
  const nextLow = Number((event.target as HTMLInputElement).value)
  store.setAdoptionBins(nextLow, store.adoptionBins.mediumMax)
}

function onLowThresholdNumberInput(event: Event) {
  const nextLow = Number((event.target as HTMLInputElement).value)
  store.setAdoptionBins(nextLow, store.adoptionBins.mediumMax)
}

function onMediumThresholdInput(event: Event) {
  const nextMedium = Number((event.target as HTMLInputElement).value)
  store.setAdoptionBins(store.adoptionBins.lowMax, nextMedium)
}

function onMediumThresholdNumberInput(event: Event) {
  const nextMedium = Number((event.target as HTMLInputElement).value)
  store.setAdoptionBins(store.adoptionBins.lowMax, nextMedium)
}

function resolveAssetUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (typeof window !== 'undefined') {
    const origin = window.location?.origin || 'http://localhost'
    return new URL(url, origin).toString()
  }
  return url
}

function adoptionForIso(isoA3: string) {
  const totalUsers = store.liveMetrics.totalUsers
  const modelCount = store.liveMetrics.modelCount
  const logUsers = Math.log10(Math.max(1, totalUsers))

  // Base adoption from live metrics (normalized to roughly 0..100).
  const base = clamp((logUsers - 4) * 18 + modelCount * 0.7, 0, 90)
  const popularityBoost = clamp((avgPopularity.value - 50) * 0.25, -10, 10)
  const noise = ((isoHash(isoA3) % 101) - 50) * 0.12 // -6..+6

  return clamp(base + popularityBoost + noise, 0, 100)
}

function getIsoA3FromFeature(feature: any): string | null {
  const props = feature?.properties
  const iso = props?.['ISO3166-1-Alpha-3']
  if (typeof iso === 'string' && iso.length) return iso
  return null
}

function styleFeature(feature: any) {
  const iso = getIsoA3FromFeature(feature)
  const adoption = iso ? adoptionForIso(iso) : 0
  const bin = adoptionToBin(adoption)
  return {
    weight: 1,
    color: '#e5e7eb',
    fillColor: adoptionBinToColor(bin),
    fillOpacity: 0.78,
  }
}

function onEachFeature(feature: any, layer: L.Layer) {
  const props = feature?.properties || {}
  const iso = getIsoA3FromFeature(feature)
  const name = props?.name ?? iso ?? 'Unknown'
  const adoption = iso ? adoptionForIso(iso) : 0

  layer.on({
    mouseover: () => {
      ;(layer as any).setStyle?.({ fillOpacity: 0.95 })
    },
    mouseout: () => {
      geoLayer?.resetStyle?.(layer as any)
    },
  })

  ;(layer as any).bindTooltip?.(`${name}<br/>AI adoption: ${Math.round(adoption)}%`, {
    sticky: true,
    direction: 'top',
  })
}

async function loadGeoJsonAndRender() {
  if (!mapHostRef.value) return

  map = L.map(mapHostRef.value, {
    zoomControl: true,
    scrollWheelZoom: true,
    worldCopyJump: true,
    minZoom: 1,
    maxZoom: 6,
    maxBounds: L.latLngBounds([[-85, -180], [85, 180]]),
    maxBoundsViscosity: 1.0,
  })
  map.setView([20, 0], 2)

  // Light tiles to match your light UI.
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: ['a', 'b', 'c', 'd'],
  }).addTo(map)

  let geo: any = null
  const candidates = [
    resolveAssetUrl(countriesGeoJsonUrl),
    resolveAssetUrl('/assets/countries.geojson'),
    resolveAssetUrl('/src/assets/geo/countries.geojson'),
  ]
  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      geo = await res.json()
      break
    } catch {
      // try next candidate
    }
  }
  if (!geo) {
    // eslint-disable-next-line no-console
    console.warn('WorldMapAdoption: failed to load geojson from all candidates')
    return
  }

  geoLayer = L.geoJSON(geo, {
    style: styleFeature,
    onEachFeature,
  }).addTo(map)
}

function updateMapStyles() {
  if (!geoLayer) return
  geoLayer.eachLayer((layer: any) => {
    const feature = layer?.feature
    const iso = getIsoA3FromFeature(feature)
    const adoption = iso ? adoptionForIso(iso) : 0
    const newStyle = styleFeature(feature)
    layer.setStyle?.(newStyle)

    // Update tooltip text to reflect the latest adoption estimate.
    const tooltip = layer.getTooltip?.()
    if (tooltip) {
      const name = feature?.properties?.name ?? iso ?? 'Unknown'
      tooltip.setContent(`${name}<br/>AI adoption: ${Math.round(adoption)}%`)
    }
  })
}

function syncMapSize() {
  if (!map) return
  map.invalidateSize({ pan: false, debounceMoveend: true })
}

function attachMapResizeHandlers() {
  if (!mapHostRef.value) return
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      syncMapSize()
    })
    resizeObserver.observe(mapHostRef.value)
  }
  window.addEventListener('resize', syncMapSize)
}

onMounted(async () => {
  await loadGeoJsonAndRender()
  await nextTick()
  // Recompute after layout settles; prevents grey gaps around tile area.
  syncMapSize()
  requestAnimationFrame(() => syncMapSize())
  setTimeout(() => syncMapSize(), 120)
  attachMapResizeHandlers()
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', syncMapSize)
  if (map) map.remove()
  map = null
  geoLayer = null
})

watch(
  () => [
    store.liveMetrics.totalUsers,
    store.liveMetrics.modelCount,
    avgPopularity.value,
    store.adoptionBins.lowMax,
    store.adoptionBins.mediumMax,
  ],
  () => {
    updateMapStyles()
  },
)
</script>

<template>
  <section
    id="country-map"
    class="relative z-0 rounded-xl border border-slate-200 bg-white p-5 h-full flex flex-col"
    aria-labelledby="country-map-heading"
  >
    <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
      <div>
        <h2 id="country-map-heading" class="text-lg font-semibold text-slate-900">
          AI implemented by country
        </h2>
        <p class="text-sm text-slate-600 mt-1">
          Live, simulated adoption levels updated from your market stream.
        </p>
      </div>

      <div class="text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1">
            <span class="inline-block h-2 w-3 rounded bg-red-500" aria-hidden="true" />
            {{ lowRangeLabel }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="inline-block h-2 w-3 rounded bg-amber-500" aria-hidden="true" />
            {{ mediumRangeLabel }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="inline-block h-2 w-3 rounded bg-green-500" aria-hidden="true" />
            {{ highRangeLabel }}
          </span>
        </div>

        <div class="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Admin thresholds</p>
          <label class="block">
            <div class="flex items-center justify-between gap-3">
              <span class="text-[11px] text-slate-600">Low max</span>
              <input
                type="number"
                min="0"
                max="98"
                step="1"
                :value="store.adoptionBins.lowMax"
                class="w-20 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-accent"
                aria-label="Low max value"
                inputmode="numeric"
                @input="onLowThresholdNumberInput"
              />
            </div>
            <input
              type="range"
              min="0"
              max="98"
              :value="store.adoptionBins.lowMax"
              class="w-full accent-amber-500 mt-1"
              aria-label="Adjust low threshold maximum (slider)"
              @input="onLowThresholdInput"
            />
          </label>
          <label class="block">
            <div class="flex items-center justify-between gap-3">
              <span class="text-[11px] text-slate-600">Medium max</span>
              <input
                type="number"
                :min="store.adoptionBins.lowMax + 1"
                max="99"
                step="1"
                :value="store.adoptionBins.mediumMax"
                class="w-20 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-accent"
                aria-label="Medium max value"
                inputmode="numeric"
                @input="onMediumThresholdNumberInput"
              />
            </div>
            <input
              type="range"
              :min="store.adoptionBins.lowMax + 1"
              max="99"
              :value="store.adoptionBins.mediumMax"
              class="w-full accent-green-600 mt-1"
              aria-label="Adjust medium threshold maximum (slider)"
              @input="onMediumThresholdInput"
            />
          </label>
        </div>
      </div>
    </div>

    <div class="mt-1 flex-1 min-h-[420px] rounded-lg overflow-hidden border border-slate-200" ref="mapHostRef" />
  </section>
</template>

<style scoped>
:deep(.leaflet-pane) {
  z-index: 1;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 2;
}
</style>

