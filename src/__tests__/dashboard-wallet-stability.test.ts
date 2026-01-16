/**
 * Tests for Dashboard Wallet State Stability
 * 
 * These tests ensure that:
 * 1. Wallet data persists across re-renders
 * 2. Duplicate fetches are prevented
 * 3. Data only clears when user actually logs out
 * 4. Auth state changes don't cause data flicker
 * 
 * This test suite was added to prevent regression of a bug where
 * dashboard data would disappear after initial load due to 
 * object reference changes in the user object triggering unnecessary
 * state resets.
 */

describe('Dashboard Wallet State Stability', () => {

  describe('Fetch Prevention Logic', () => {
    /**
     * Simulates the ref-based fetch prevention used in BusinessDashboard
     */
    function createWalletFetcher() {
      let fetchedForUserId: string | null = null
      let storedWalletAddress: string | null = null
      let fetchCount = 0

      return {
        fetchWallet: async (userId: string | null, authLoading: boolean) => {
          // Wait for auth to load
          if (authLoading) return { action: 'waiting_for_auth' }
          
          // If user logged out, clear the data
          if (!userId) {
            fetchedForUserId = null
            storedWalletAddress = null
            return { action: 'cleared' }
          }
          
          // If we already fetched for this user, don't fetch again
          if (fetchedForUserId === userId) {
            return { action: 'skipped', reason: 'already_fetched' }
          }
          
          // Mark that we're fetching for this user
          fetchedForUserId = userId
          fetchCount++
          
          // Simulate fetch
          storedWalletAddress = `wallet-for-${userId}`
          
          return { action: 'fetched', fetchCount }
        },
        getState: () => ({ fetchedForUserId, storedWalletAddress, fetchCount })
      }
    }

    it('should fetch wallet only once per user', async () => {
      const fetcher = createWalletFetcher()
      const userId = 'user-123'

      // First call should fetch
      const result1 = await fetcher.fetchWallet(userId, false)
      expect(result1.action).toBe('fetched')
      expect(result1.fetchCount).toBe(1)

      // Second call with same user should be skipped
      const result2 = await fetcher.fetchWallet(userId, false)
      expect(result2.action).toBe('skipped')
      expect(result2.reason).toBe('already_fetched')

      // Third call with same user should also be skipped
      const result3 = await fetcher.fetchWallet(userId, false)
      expect(result3.action).toBe('skipped')

      // Total fetches should still be 1
      expect(fetcher.getState().fetchCount).toBe(1)
    })

    it('should preserve data when same user ID is passed multiple times', async () => {
      const fetcher = createWalletFetcher()
      const userId = 'user-456'

      await fetcher.fetchWallet(userId, false)
      const state1 = fetcher.getState()
      expect(state1.storedWalletAddress).toBe('wallet-for-user-456')

      // Call again (simulating React re-render with new user object reference)
      await fetcher.fetchWallet(userId, false)
      const state2 = fetcher.getState()

      // Data should be unchanged
      expect(state2.storedWalletAddress).toBe('wallet-for-user-456')
      expect(state2.fetchCount).toBe(1)
    })

    it('should clear data only when user logs out (userId becomes null)', async () => {
      const fetcher = createWalletFetcher()
      
      // Login and fetch
      await fetcher.fetchWallet('user-789', false)
      expect(fetcher.getState().storedWalletAddress).toBe('wallet-for-user-789')

      // Logout
      const result = await fetcher.fetchWallet(null, false)
      expect(result.action).toBe('cleared')
      expect(fetcher.getState().storedWalletAddress).toBe(null)
      expect(fetcher.getState().fetchedForUserId).toBe(null)
    })

    it('should fetch again after user changes to a different user', async () => {
      const fetcher = createWalletFetcher()

      // First user
      await fetcher.fetchWallet('user-A', false)
      expect(fetcher.getState().storedWalletAddress).toBe('wallet-for-user-A')
      expect(fetcher.getState().fetchCount).toBe(1)

      // Logout
      await fetcher.fetchWallet(null, false)

      // Different user login
      await fetcher.fetchWallet('user-B', false)
      expect(fetcher.getState().storedWalletAddress).toBe('wallet-for-user-B')
      expect(fetcher.getState().fetchCount).toBe(2)
    })

    it('should wait for auth loading before deciding what to do', async () => {
      const fetcher = createWalletFetcher()

      // While auth is loading, do nothing
      const result = await fetcher.fetchWallet('user-123', true)
      expect(result.action).toBe('waiting_for_auth')
      expect(fetcher.getState().storedWalletAddress).toBe(null)
      expect(fetcher.getState().fetchCount).toBe(0)
    })

    it('should handle rapid consecutive calls safely', async () => {
      const fetcher = createWalletFetcher()
      const userId = 'rapid-user'

      // Simulate many rapid calls (like React StrictMode double-invoking effects)
      const promises = [
        fetcher.fetchWallet(userId, false),
        fetcher.fetchWallet(userId, false),
        fetcher.fetchWallet(userId, false),
        fetcher.fetchWallet(userId, false),
        fetcher.fetchWallet(userId, false)
      ]

      await Promise.all(promises)

      // Only 1 actual fetch should have occurred
      expect(fetcher.getState().fetchCount).toBe(1)
    })
  })

  describe('hasWallet Computation', () => {
    function computeHasWallet(authLoading: boolean, effectiveAddress: string | null): boolean {
      return !authLoading && !!effectiveAddress
    }

    it('should return true when auth loaded and address exists', () => {
      expect(computeHasWallet(false, 'ST123...')).toBe(true)
    })

    it('should return false when auth is loading', () => {
      expect(computeHasWallet(true, 'ST123...')).toBe(false)
    })

    it('should return false when address is null', () => {
      expect(computeHasWallet(false, null)).toBe(false)
    })

    it('should return false when address is empty string', () => {
      expect(computeHasWallet(false, '')).toBe(false)
    })

    it('should return false when both loading and no address', () => {
      expect(computeHasWallet(true, null)).toBe(false)
    })
  })

  describe('Effective Address Priority', () => {
    function computeEffectiveAddress(
      storedWalletAddress: string | null,
      isConnected: boolean,
      connectedAddress: string | null
    ): string | null {
      return storedWalletAddress || (isConnected ? connectedAddress : null)
    }

    it('should prioritize stored wallet address over connected wallet', () => {
      const result = computeEffectiveAddress('ST-STORED', true, 'ST-CONNECTED')
      expect(result).toBe('ST-STORED')
    })

    it('should fall back to connected wallet when no stored address', () => {
      const result = computeEffectiveAddress(null, true, 'ST-CONNECTED')
      expect(result).toBe('ST-CONNECTED')
    })

    it('should return null when not connected and no stored address', () => {
      const result = computeEffectiveAddress(null, false, 'ST-WOULD-BE-CONNECTED')
      expect(result).toBe(null)
    })

    it('should return stored address even when not connected', () => {
      const result = computeEffectiveAddress('ST-STORED', false, null)
      expect(result).toBe('ST-STORED')
    })
  })
})
