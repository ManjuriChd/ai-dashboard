import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import MetricCards from '@/components/MetricCards.vue'
import { useMarketStore } from '@/store/marketStore'
import { expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { nextTick } from 'vue'

describe('MetricCards', () => {
  it('renders live model count and total users from store', async () => {
    vi.useFakeTimers()
    const pinia = createTestingPinia({ stubActions: false })
    setActivePinia(pinia)
    const store = useMarketStore()
    store.liveMetrics.modelCount = 99
    store.liveMetrics.totalUsers = 123456

    const wrapper = mount(MetricCards, {
      global: { plugins: [pinia] },
    })
    vi.runAllTimers()
    await nextTick()

    const text = wrapper.text()
    expect(text).toContain('99')
    expect(text.replace(/[^0-9]/g, '')).toContain('123456')
    vi.useRealTimers()
  })
})

