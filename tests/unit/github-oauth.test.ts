import { describe, expect, it } from 'vitest'

import { mapDevicePollResponse } from '../../src/composables/ai/github-oauth'

describe('github oauth', () => {
  it('maps authorization_pending to pending without changing interval', () => {
    const ev = mapDevicePollResponse({ error: 'authorization_pending' } as any, 5)
    expect(ev).toEqual({ type: 'pending', nextIntervalSec: 5 })
  })

  it('maps slow_down to interval + 5 seconds', () => {
    const ev = mapDevicePollResponse({ error: 'slow_down' } as any, 5)
    expect(ev).toEqual({ type: 'slow_down', nextIntervalSec: 10 })
  })

  it('maps expired_token to expired', () => {
    const ev = mapDevicePollResponse({ error: 'expired_token' } as any, 5)
    expect(ev).toEqual({ type: 'expired' })
  })

  it('maps access_denied to denied', () => {
    const ev = mapDevicePollResponse({ error: 'access_denied' } as any, 5)
    expect(ev).toEqual({ type: 'denied' })
  })

  it('maps device_flow_disabled to device_flow_disabled', () => {
    const ev = mapDevicePollResponse({ error: 'device_flow_disabled' } as any, 5)
    expect(ev).toEqual({ type: 'device_flow_disabled' })
  })

  it('maps token success to success event', () => {
    const ev = mapDevicePollResponse(
      { access_token: 'token', token_type: 'bearer', scope: 'models:read' } as any,
      5
    )
    expect(ev.type).toBe('success')
    if (ev.type === 'success') {
      expect(ev.token.access_token).toBe('token')
    }
  })
})
