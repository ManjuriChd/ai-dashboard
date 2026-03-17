import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PopularModels from '@/components/PopularModels.vue'
import { useMarketStore } from '@/store/marketStore'
import { expect } from 'vitest'

describe('PopularModels', () => {
  function setup() {
    const pinia = createTestingPinia({ stubActions: false })
    const store = useMarketStore()
    store.models = [
      {
        id: 'm1',
        name: 'Model A',
        company: 'OpenAI',
        launchedDate: '2025-01-01',
        capabilities: ['Coding'],
        limitations: {},
        popularityScore: 80,
      },
      {
        id: 'm2',
        name: 'Model B',
        company: 'Google',
        launchedDate: '2025-06-01',
        capabilities: ['Reasoning'],
        limitations: {},
        popularityScore: 90,
      },
    ]
    return mount(PopularModels, {
      global: { plugins: [pinia] },
    })
  }

  it('renders chips with model name and company', () => {
    const wrapper = setup()
    const text = wrapper.text()
    expect(text).toContain('Model A')
    expect(text).toContain('OpenAI')
    expect(text).toContain('Model B')
    expect(text).toContain('Google')
  })

  it('exposes scatter data matching popularity scores', () => {
    const wrapper = setup()
    const vm: any = wrapper.vm
    const data = vm.chartData
    const xs = data.datasets[0].data.map((p: any) => p.x).sort((a: number, b: number) => a - b)
    expect(xs).toEqual([80, 90])
  })
})

