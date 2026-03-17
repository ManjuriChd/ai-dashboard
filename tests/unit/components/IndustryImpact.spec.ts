import { mount } from '@vue/test-utils'
import IndustryImpact from '@/components/IndustryImpact.vue'
import { expect } from 'vitest'

describe('IndustryImpact', () => {
  it('renders all industry cards', () => {
    const wrapper = mount(IndustryImpact)
    const text = wrapper.text()
    expect(text).toContain('Healthcare')
    expect(text).toContain('Financial Services')
    expect(text).toContain('Telecommunications')
  })

  it('shows summary counts for scaled vs early adoption', () => {
    const wrapper = mount(IndustryImpact)
    const text = wrapper.text()
    expect(text).toMatch(/industries have \*\*scaled\*\* AI/i)
    expect(text).toMatch(/industries are still \*\*speeding up\*\* adoption/i)
  })
})

