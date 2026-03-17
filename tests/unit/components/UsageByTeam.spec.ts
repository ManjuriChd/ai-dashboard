import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UsageByTeam from '@/components/UsageByTeam.vue'
import { useMarketStore } from '@/store/marketStore'
import { expect } from 'vitest'

describe('UsageByTeam', () => {
  it('renders team names and usage values', () => {
    const pinia = createTestingPinia({ stubActions: false })
    const store = useMarketStore()
    store.teamUsage = [
      { team: 'Software Engineering', percentage: 40, models: [] },
      { team: 'Data Analytics', percentage: 30, models: [] },
    ]

    const wrapper = mount(UsageByTeam, {
      global: { plugins: [pinia] },
    })

    const text = wrapper.text()
    expect(text).toContain('Software Engineering')
    expect(text).toContain('Data Analytics')

    const vm: any = wrapper.vm
    const data = vm.chartData
    expect(data.datasets[0].data[0].x).toBe(40)
    expect(data.datasets[0].data[1].x).toBe(30)
  })
})

