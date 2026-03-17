import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ModelExplorer from '@/components/ModelExplorer.vue'
import { useMarketStore } from '@/store/marketStore'
import { expect } from 'vitest'

describe('ModelExplorer', () => {
  function setup() {
    const pinia = createTestingPinia({ stubActions: false })
    const store = useMarketStore()
    store.models = [
      {
        id: 'gpt5',
        name: 'GPT-5',
        company: 'OpenAI',
        launchedDate: '2025-01-01',
        capabilities: ['Coding'],
        limitations: { contextWindow: 100000 },
        popularityScore: 98,
      },
      {
        id: 'gemini3',
        name: 'Gemini 3',
        company: 'Google',
        launchedDate: '2026-01-01',
        capabilities: ['Multimodal'],
        limitations: {},
        popularityScore: 95,
      },
    ]
    return mount(ModelExplorer, { global: { plugins: [pinia] } })
  }

  it('renders rows for each model', () => {
    const wrapper = setup()
    const text = wrapper.text()
    expect(text).toContain('GPT-5')
    expect(text).toContain('Gemini 3')
  })

  it('filters by company', async () => {
    const wrapper = setup()
    const select = wrapper.get('#filter-company')
    await select.setValue('OpenAI')

    const text = wrapper.text()
    expect(text).toContain('GPT-5')
    expect(text).not.toContain('Gemini 3')
  })

  it('expands a row to show limitations', async () => {
    const wrapper = setup()
    const firstRow = wrapper.findAll('tbody tr').at(0)
    if (!firstRow) throw new Error('Expected at least one row')
    await firstRow.trigger('click')
    expect(wrapper.text()).toContain('Limitations')
  })
})

