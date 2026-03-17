import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import DashboardView from '@/views/DashboardView.vue'
import { expect } from 'vitest'

describe('DashboardView', () => {
  it('renders core sections', () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
        stubs: {
          // Avoid Chart.js canvas usage in unit tests.
          MetricCards: { template: '<div>Live metrics</div>' },
          PopularModels: { template: '<div>Popular models of 2026</div>' },
          UsageByTeam: { template: '<div>Usage by team</div>' },
          IndustryImpact: { template: '<div>Industry impact</div>' },
          ModelExplorer: { template: '<div>Model explorer</div>' },
        },
      },
    })
    const text = wrapper.text()
    expect(text).toContain('Usage by team')
    expect(text).toContain('Popular models of 2026')
    expect(text).toContain('Model explorer')
  })
})

