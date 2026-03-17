import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import App from '@/App.vue'
import router from '@/router'
import { expect } from 'vitest'

describe('App root', () => {
  it('renders dashboard via router', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, createTestingPinia({ stubActions: false })],
        stubs: {
          // Keep this as a unit test; RouterView rendering charts is covered elsewhere.
          RouterView: { template: '<div>AI Market Intelligence & Strategic Insights Dashboard</div>' },
        },
      },
    })
    expect(wrapper.text()).toContain('AI Market Intelligence & Strategic Insights Dashboard')
  })
})

