/**
 * Tests for Payroll Schedule Logic
 * 
 * These tests ensure that:
 * 1. Next run date is calculated correctly for weekly/monthly frequencies
 * 2. Pay day validation works properly
 * 3. Schedule state transitions are correct
 */

describe('Payroll Schedule Logic', () => {

  describe('Next Run Date Calculation - Weekly', () => {
    // Simulate the calculateNextRunDate logic for testing
    function calculateNextRunDate(frequency: 'weekly' | 'monthly', payDay: number, now: Date = new Date()): Date {
      const next = new Date(now)
      
      if (frequency === 'weekly') {
        // payDay: 1=Monday, 7=Sunday
        const currentDay = now.getDay() || 7 // Convert Sunday from 0 to 7
        const daysUntil = payDay >= currentDay ? payDay - currentDay : 7 - currentDay + payDay
        next.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil))
      } else {
        // Monthly: payDay is 1-31
        next.setDate(payDay)
        if (next <= now) {
          next.setMonth(next.getMonth() + 1)
        }
      }
      
      next.setHours(9, 0, 0, 0) // Set to 9 AM
      return next
    }

    it('should calculate next Friday when today is Monday', () => {
      // Monday, January 6, 2025
      const monday = new Date(2025, 0, 6, 10, 0, 0)
      const nextRun = calculateNextRunDate('weekly', 5, monday) // 5 = Friday
      
      expect(nextRun.getDay()).toBe(5) // Friday
      expect(nextRun.getDate()).toBe(10) // January 10
    })

    it('should schedule next week when today is the pay day', () => {
      // Friday, January 10, 2025
      const friday = new Date(2025, 0, 10, 10, 0, 0)
      const nextRun = calculateNextRunDate('weekly', 5, friday) // 5 = Friday
      
      expect(nextRun.getDay()).toBe(5) // Friday
      expect(nextRun.getDate()).toBe(17) // Next Friday (Jan 17)
    })

    it('should handle Sunday payDay correctly', () => {
      // Wednesday, January 8, 2025
      const wednesday = new Date(2025, 0, 8, 10, 0, 0)
      const nextRun = calculateNextRunDate('weekly', 7, wednesday) // 7 = Sunday
      
      expect(nextRun.getDay()).toBe(0) // Sunday (JS uses 0 for Sunday)
      expect(nextRun.getDate()).toBe(12) // January 12
    })

    it('should handle Monday payDay when today is Friday', () => {
      // Friday, January 10, 2025
      const friday = new Date(2025, 0, 10, 10, 0, 0)
      const nextRun = calculateNextRunDate('weekly', 1, friday) // 1 = Monday
      
      expect(nextRun.getDay()).toBe(1) // Monday
      expect(nextRun.getDate()).toBe(13) // January 13
    })
  })

  describe('Next Run Date Calculation - Monthly', () => {
    function calculateNextRunDate(frequency: 'weekly' | 'monthly', payDay: number, now: Date = new Date()): Date {
      const next = new Date(now)
      
      if (frequency === 'weekly') {
        const currentDay = now.getDay() || 7
        const daysUntil = payDay >= currentDay ? payDay - currentDay : 7 - currentDay + payDay
        next.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil))
      } else {
        next.setDate(payDay)
        if (next <= now) {
          next.setMonth(next.getMonth() + 1)
        }
      }
      
      next.setHours(9, 0, 0, 0)
      return next
    }

    it('should calculate next 15th when today is 10th', () => {
      // January 10, 2025
      const jan10 = new Date(2025, 0, 10, 10, 0, 0)
      const nextRun = calculateNextRunDate('monthly', 15, jan10)
      
      expect(nextRun.getDate()).toBe(15)
      expect(nextRun.getMonth()).toBe(0) // Still January
    })

    it('should roll to next month when pay day has passed', () => {
      // January 20, 2025
      const jan20 = new Date(2025, 0, 20, 10, 0, 0)
      const nextRun = calculateNextRunDate('monthly', 15, jan20)
      
      expect(nextRun.getDate()).toBe(15)
      expect(nextRun.getMonth()).toBe(1) // February
    })

    it('should roll to next month on the exact pay day', () => {
      // January 15, 2025
      const jan15 = new Date(2025, 0, 15, 10, 0, 0)
      const nextRun = calculateNextRunDate('monthly', 15, jan15)
      
      expect(nextRun.getDate()).toBe(15)
      expect(nextRun.getMonth()).toBe(1) // February
    })

    it('should handle end of month pay days', () => {
      // January 25, 2025
      const jan25 = new Date(2025, 0, 25, 10, 0, 0)
      const nextRun = calculateNextRunDate('monthly', 28, jan25)
      
      expect(nextRun.getDate()).toBe(28)
      expect(nextRun.getMonth()).toBe(0) // Still January
    })

    it('should handle February with 28 days', () => {
      // February 15, 2025 (non-leap year)
      const feb15 = new Date(2025, 1, 15, 10, 0, 0)
      const nextRun = calculateNextRunDate('monthly', 28, feb15)
      
      expect(nextRun.getDate()).toBe(28)
      expect(nextRun.getMonth()).toBe(1) // February
    })
  })

  describe('Schedule Status Transitions', () => {
    type ScheduleStatus = 'draft' | 'ready' | 'processing' | 'paid';
    
    const validTransitions: Record<ScheduleStatus, ScheduleStatus[]> = {
      'draft': ['ready'],
      'ready': ['processing'],
      'processing': ['paid', 'ready'], // Can fail and go back to ready
      'paid': ['ready'], // Can reset for next cycle
    }

    function isValidTransition(from: ScheduleStatus, to: ScheduleStatus): boolean {
      return validTransitions[from]?.includes(to) ?? false
    }

    it('should allow draft -> ready transition', () => {
      expect(isValidTransition('draft', 'ready')).toBe(true)
    })

    it('should allow ready -> processing transition', () => {
      expect(isValidTransition('ready', 'processing')).toBe(true)
    })

    it('should allow processing -> paid transition', () => {
      expect(isValidTransition('processing', 'paid')).toBe(true)
    })

    it('should allow paid -> ready transition (for recurring)', () => {
      expect(isValidTransition('paid', 'ready')).toBe(true)
    })

    it('should NOT allow draft -> paid transition', () => {
      expect(isValidTransition('draft', 'paid')).toBe(false)
    })

    it('should NOT allow draft -> processing transition', () => {
      expect(isValidTransition('draft', 'processing')).toBe(false)
    })
  })

  describe('Pay Day Validation', () => {
    function validatePayDay(frequency: 'weekly' | 'monthly', payDay: number): { valid: boolean; error?: string } {
      if (frequency === 'weekly') {
        if (payDay < 1 || payDay > 7) {
          return { valid: false, error: 'Weekly pay day must be 1-7 (Monday-Sunday)' }
        }
      } else {
        if (payDay < 1 || payDay > 31) {
          return { valid: false, error: 'Monthly pay day must be 1-31' }
        }
      }
      return { valid: true }
    }

    it('should accept valid weekly pay days (1-7)', () => {
      for (let day = 1; day <= 7; day++) {
        expect(validatePayDay('weekly', day).valid).toBe(true)
      }
    })

    it('should reject weekly pay day 0', () => {
      const result = validatePayDay('weekly', 0)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('1-7')
    })

    it('should reject weekly pay day 8', () => {
      const result = validatePayDay('weekly', 8)
      expect(result.valid).toBe(false)
    })

    it('should accept valid monthly pay days (1-31)', () => {
      for (let day = 1; day <= 31; day++) {
        expect(validatePayDay('monthly', day).valid).toBe(true)
      }
    })

    it('should reject monthly pay day 0', () => {
      const result = validatePayDay('monthly', 0)
      expect(result.valid).toBe(false)
    })

    it('should reject monthly pay day 32', () => {
      const result = validatePayDay('monthly', 32)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('1-31')
    })
  })

  describe('Schedule Item Amount Validation', () => {
    interface ScheduleItem {
      team_member_id: string;
      amount: number;
    }

    function validateScheduleItems(items: ScheduleItem[]): { valid: boolean; errors: string[] } {
      const errors: string[] = []
      
      if (items.length === 0) {
        errors.push('At least one recipient is required')
      }
      
      items.forEach((item, index) => {
        if (!item.team_member_id) {
          errors.push(`Item ${index + 1}: Team member ID is required`)
        }
        if (item.amount <= 0) {
          errors.push(`Item ${index + 1}: Amount must be greater than 0`)
        }
        if (item.amount > 1000000) {
          errors.push(`Item ${index + 1}: Amount exceeds maximum limit`)
        }
      })
      
      // Check for duplicates
      const ids = items.map(i => i.team_member_id)
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
      if (duplicates.length > 0) {
        errors.push('Duplicate team members are not allowed')
      }
      
      return { valid: errors.length === 0, errors }
    }

    it('should accept valid schedule items', () => {
      const items = [
        { team_member_id: 'tm1', amount: 500 },
        { team_member_id: 'tm2', amount: 750 },
      ]
      expect(validateScheduleItems(items).valid).toBe(true)
    })

    it('should reject empty items array', () => {
      const result = validateScheduleItems([])
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('At least one recipient is required')
    })

    it('should reject zero amount', () => {
      const items = [{ team_member_id: 'tm1', amount: 0 }]
      const result = validateScheduleItems(items)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Amount must be greater than 0')
    })

    it('should reject negative amount', () => {
      const items = [{ team_member_id: 'tm1', amount: -100 }]
      const result = validateScheduleItems(items)
      expect(result.valid).toBe(false)
    })

    it('should reject duplicate team members', () => {
      const items = [
        { team_member_id: 'tm1', amount: 500 },
        { team_member_id: 'tm1', amount: 300 }, // Duplicate!
      ]
      const result = validateScheduleItems(items)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Duplicate team members are not allowed')
    })

    it('should reject amount exceeding maximum', () => {
      const items = [{ team_member_id: 'tm1', amount: 2000000 }]
      const result = validateScheduleItems(items)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('maximum limit')
    })
  })
})
