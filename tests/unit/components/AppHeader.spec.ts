import { mount } from '@vue/test-utils'
import AppHeader from '@/components/AppHeader.vue'
import { expect } from 'vitest'

describe('AppHeader', () => {
  it('renders combined dashboard title', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.text()).toContain(
      'AI Market Intelligence & Strategic Insights Dashboard',
    )
  })

  it('shows Live pill text', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.text()).toContain('Live')
  })

  it('renders nav items with correct labels', () => {
    const wrapper = mount(AppHeader)
    const labels = wrapper.findAll('nav a').map(a => a.text())
    expect(labels).toContain('Live metrics')
    expect(labels).toContain('Popular models')
    expect(labels).toContain('Usage by team')
    expect(labels).toContain('Industry impact')
    expect(labels).toContain('Model explorer')
  })
})

