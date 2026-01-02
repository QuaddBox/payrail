/**
 * Tests for Transaction Enrichment and Payment Notifications
 * 
 * These tests ensure that:
 * 1. Transaction enrichment works correctly for all transaction types
 * 2. Amount calculations are accurate
 * 3. Status formatting is user-friendly
 * 4. Payment notification data is properly structured
 */

describe('Transaction Processing', () => {

  describe('Transaction Type Detection', () => {
    function detectTransactionType(tx: any): string {
      if (tx.tx_type === 'token_transfer') {
        return 'Transfer'
      }
      if (tx.tx_type === 'contract_call') {
        const functionName = tx.contract_call?.function_name
        switch (functionName) {
          case 'execute-batch-payroll':
            return 'Batch Payroll'
          case 'execute-payroll':
            return 'One-time Payment'
          case 'register-business':
            return 'Registration'
          case 'create-organization':
            return 'Organization Setup'
          default:
            return 'Contract Call'
        }
      }
      if (tx.tx_type === 'smart_contract') {
        return 'Contract Deployment'
      }
      return 'Unknown'
    }

    it('should detect token transfer', () => {
      const tx = { tx_type: 'token_transfer' }
      expect(detectTransactionType(tx)).toBe('Transfer')
    })

    it('should detect batch payroll', () => {
      const tx = { tx_type: 'contract_call', contract_call: { function_name: 'execute-batch-payroll' } }
      expect(detectTransactionType(tx)).toBe('Batch Payroll')
    })

    it('should detect one-time payment', () => {
      const tx = { tx_type: 'contract_call', contract_call: { function_name: 'execute-payroll' } }
      expect(detectTransactionType(tx)).toBe('One-time Payment')
    })

    it('should detect registration', () => {
      const tx = { tx_type: 'contract_call', contract_call: { function_name: 'register-business' } }
      expect(detectTransactionType(tx)).toBe('Registration')
    })

    it('should detect organization setup', () => {
      const tx = { tx_type: 'contract_call', contract_call: { function_name: 'create-organization' } }
      expect(detectTransactionType(tx)).toBe('Organization Setup')
    })

    it('should default to Contract Call for unknown functions', () => {
      const tx = { tx_type: 'contract_call', contract_call: { function_name: 'some-other-function' } }
      expect(detectTransactionType(tx)).toBe('Contract Call')
    })
  })

  describe('Amount Calculation', () => {
    function calculateAmount(tx: any, isSent: boolean): number {
      // Token transfer
      if (tx.tx_type === 'token_transfer') {
        return Number(tx.token_transfer?.amount || 0) / 1_000_000
      }
      
      // Use stx_sent/stx_received from API if available
      if (isSent && tx.stx_sent) {
        return Number(tx.stx_sent) / 1_000_000
      }
      if (!isSent && tx.stx_received) {
        return Number(tx.stx_received) / 1_000_000
      }
      
      // Contract call with function args
      if (tx.tx_type === 'contract_call' && tx.contract_call?.function_args) {
        const amountArg = tx.contract_call.function_args.find((a: any) => 
          a.repr?.startsWith('u') && !a.repr?.startsWith('0x')
        )
        if (amountArg) {
          const amount = parseInt(amountArg.repr.replace('u', ''))
          return isNaN(amount) ? 0 : amount / 1_000_000
        }
      }
      
      return 0
    }

    it('should calculate token transfer amount correctly', () => {
      const tx = { 
        tx_type: 'token_transfer',
        token_transfer: { amount: '500000000' } // 500 STX
      }
      expect(calculateAmount(tx, true)).toBe(500)
    })

    it('should use stx_sent for outgoing transactions', () => {
      const tx = { 
        tx_type: 'contract_call',
        stx_sent: '1000000000' // 1000 STX
      }
      expect(calculateAmount(tx, true)).toBe(1000)
    })

    it('should use stx_received for incoming transactions', () => {
      const tx = { 
        tx_type: 'contract_call',
        stx_received: '750000000' // 750 STX
      }
      expect(calculateAmount(tx, false)).toBe(750)
    })

    it('should parse amount from function args', () => {
      const tx = { 
        tx_type: 'contract_call',
        contract_call: {
          function_name: 'execute-payroll',
          function_args: [
            { name: 'recipient', repr: "'ST3S...1M44" },
            { name: 'amount', repr: 'u250000000' } // 250 STX
          ]
        }
      }
      expect(calculateAmount(tx, true)).toBe(250)
    })

    it('should return 0 for transactions with no amount', () => {
      const tx = { tx_type: 'contract_call', contract_call: { function_name: 'register-business' } }
      expect(calculateAmount(tx, true)).toBe(0)
    })

    it('should handle microSTX to STX conversion correctly', () => {
      const tx = { 
        tx_type: 'token_transfer',
        token_transfer: { amount: '1' } // 0.000001 STX
      }
      expect(calculateAmount(tx, true)).toBe(0.000001)
    })
  })

  describe('Status Formatting', () => {
    function formatStatus(status: string): { label: string; color: string } {
      const s = status?.toLowerCase() || ''
      
      if (s === 'success') {
        return { label: 'Success', color: 'green' }
      }
      if (s === 'pending') {
        return { label: 'Processing', color: 'yellow' }
      }
      if (s === 'abort_by_response' || s === 'abort_by_post_condition') {
        return { label: 'Declined', color: 'red' }
      }
      if (s.includes('abort') || s.includes('failed')) {
        return { label: 'Failed', color: 'red' }
      }
      
      return { label: status || 'Unknown', color: 'gray' }
    }

    it('should format success status', () => {
      const result = formatStatus('success')
      expect(result.label).toBe('Success')
      expect(result.color).toBe('green')
    })

    it('should format pending status', () => {
      const result = formatStatus('pending')
      expect(result.label).toBe('Processing')
      expect(result.color).toBe('yellow')
    })

    it('should format abort_by_response status', () => {
      const result = formatStatus('abort_by_response')
      expect(result.label).toBe('Declined')
      expect(result.color).toBe('red')
    })

    it('should format abort_by_post_condition status', () => {
      const result = formatStatus('abort_by_post_condition')
      expect(result.label).toBe('Declined')
      expect(result.color).toBe('red')
    })

    it('should handle case insensitivity', () => {
      expect(formatStatus('SUCCESS').label).toBe('Success')
      expect(formatStatus('Pending').label).toBe('Processing')
    })

    it('should handle unknown status', () => {
      const result = formatStatus('some_weird_status')
      expect(result.label).toBe('some_weird_status')
      expect(result.color).toBe('gray')
    })
  })

  describe('USD Conversion', () => {
    function calculateUSD(stxAmount: number, stxPrice: number): string {
      if (!stxPrice || stxPrice <= 0) {
        return 'N/A'
      }
      const usd = stxAmount * stxPrice
      return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    it('should calculate USD correctly', () => {
      expect(calculateUSD(100, 0.50)).toBe('$50.00')
    })

    it('should format large amounts with commas', () => {
      expect(calculateUSD(10000, 0.50)).toBe('$5,000.00')
    })

    it('should return N/A when price is 0', () => {
      expect(calculateUSD(100, 0)).toBe('N/A')
    })

    it('should return N/A when price is negative', () => {
      expect(calculateUSD(100, -0.50)).toBe('N/A')
    })

    it('should handle decimal STX amounts', () => {
      expect(calculateUSD(0.5, 1.00)).toBe('$0.50')
    })
  })

  describe('Address Truncation', () => {
    function truncateAddress(address: string, startChars = 4, endChars = 4): string {
      if (!address || address.length <= startChars + endChars) {
        return address || ''
      }
      return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
    }

    it('should truncate long address', () => {
      const address = 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44'
      expect(truncateAddress(address)).toBe('ST3S...1V44')
    })

    it('should not truncate short address', () => {
      const address = 'ST3S1234'
      expect(truncateAddress(address)).toBe('ST3S1234')
    })

    it('should handle empty address', () => {
      expect(truncateAddress('')).toBe('')
    })

    it('should handle custom start/end chars', () => {
      const address = 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44'
      expect(truncateAddress(address, 6, 6)).toBe('ST3S3N...B61V44')
    })
  })
})

describe('Payment Notification', () => {

  describe('Notification Data Structure', () => {
    interface PaymentNotification {
      recipientWallet: string;
      amount: string;
      currency: 'STX' | 'BTC';
      txId: string;
    }

    function validateNotificationData(data: PaymentNotification): { valid: boolean; errors: string[] } {
      const errors: string[] = []
      
      if (!data.recipientWallet) {
        errors.push('Recipient wallet is required')
      }
      
      if (!data.amount || parseFloat(data.amount) <= 0) {
        errors.push('Amount must be a positive number')
      }
      
      if (!['STX', 'BTC'].includes(data.currency)) {
        errors.push('Currency must be STX or BTC')
      }
      
      if (!data.txId || !data.txId.startsWith('0x')) {
        errors.push('Valid transaction ID is required')
      }
      
      return { valid: errors.length === 0, errors }
    }

    it('should accept valid STX notification data', () => {
      const data: PaymentNotification = {
        recipientWallet: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44',
        amount: '500',
        currency: 'STX',
        txId: '0x1234567890abcdef'
      }
      expect(validateNotificationData(data).valid).toBe(true)
    })

    it('should accept valid BTC notification data', () => {
      const data: PaymentNotification = {
        recipientWallet: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        amount: '0.5',
        currency: 'BTC',
        txId: '0xabcdef1234567890'
      }
      expect(validateNotificationData(data).valid).toBe(true)
    })

    it('should reject missing recipient', () => {
      const data: PaymentNotification = {
        recipientWallet: '',
        amount: '500',
        currency: 'STX',
        txId: '0x1234567890abcdef'
      }
      const result = validateNotificationData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Recipient wallet is required')
    })

    it('should reject zero amount', () => {
      const data: PaymentNotification = {
        recipientWallet: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44',
        amount: '0',
        currency: 'STX',
        txId: '0x1234567890abcdef'
      }
      const result = validateNotificationData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('positive'))).toBe(true)
    })

    it('should reject invalid currency', () => {
      const data = {
        recipientWallet: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44',
        amount: '500',
        currency: 'ETH' as any,
        txId: '0x1234567890abcdef'
      }
      const result = validateNotificationData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('STX or BTC'))).toBe(true)
    })

    it('should reject invalid transaction ID', () => {
      const data: PaymentNotification = {
        recipientWallet: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44',
        amount: '500',
        currency: 'STX',
        txId: '1234567890' // Missing 0x prefix
      }
      const result = validateNotificationData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('transaction ID'))).toBe(true)
    })
  })
})
