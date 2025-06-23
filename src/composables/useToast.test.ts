import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from './useToast'
import { nextTick } from 'vue'

describe('useToast', () => {
  const { toasts, addToast, removeToast } = useToast()

  beforeEach(() => {
    // Reset the toasts array before each test
    toasts.length = 0
    vi.useRealTimers()
  })

  it('should add a toast to the list', () => {
    expect(toasts.length).toBe(0)
    addToast({ type: 'success', title: 'Test' })
    expect(toasts.length).toBe(1)
    expect(toasts[0].title).toBe('Test')
    expect(toasts[0].type).toBe('success')
  })

  it('should remove a toast from the list', () => {
    addToast({ type: 'success', title: 'Test to remove' })
    const toastId = toasts[0].id
    
    expect(toasts.length).toBe(1)
    removeToast(toastId)
    expect(toasts.length).toBe(0)
  })

  it('should not fail when trying to remove a non-existent toast', () => {
    addToast({ type: 'success', title: 'Test' })
    expect(toasts.length).toBe(1)
    removeToast('non-existent-id')
    expect(toasts.length).toBe(1)
  })
  
  it('should automatically remove a toast after its duration', async () => {
    vi.useFakeTimers()
    
    addToast({ type: 'info', title: 'Auto Remove', duration: 1000 })
    expect(toasts.length).toBe(1)
    
    // Fast-forward time
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(toasts.length).toBe(0)
  })
}) 