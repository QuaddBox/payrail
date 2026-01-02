/**
 * Tests for Team Member and Wallet Validation
 * 
 * These tests ensure that:
 * 1. STX wallet addresses are properly validated
 * 2. BTC wallet addresses are properly validated
 * 3. Email validation works correctly
 * 4. Team member data validation is comprehensive
 */

describe('Team Member Validation', () => {

  describe('STX Wallet Address Validation', () => {
    function validateSTXAddress(address: string): { valid: boolean; error?: string } {
      if (!address) {
        return { valid: false, error: 'STX address is required' }
      }
      
      // STX addresses start with SP (mainnet) or ST (testnet)
      if (!address.startsWith('SP') && !address.startsWith('ST')) {
        return { valid: false, error: 'STX address must start with SP (mainnet) or ST (testnet)' }
      }
      
      // STX addresses are typically 38-42 characters
      if (address.length < 30 || address.length > 50) {
        return { valid: false, error: 'Invalid STX address length' }
      }
      
      return { valid: true }
    }

    it('should accept valid mainnet STX address', () => {
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MPJ43V86650KR5X4N'
      expect(validateSTXAddress(address).valid).toBe(true)
    })

    it('should accept valid testnet STX address', () => {
      const address = 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44'
      expect(validateSTXAddress(address).valid).toBe(true)
    })

    it('should reject empty address', () => {
      const result = validateSTXAddress('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should reject address not starting with SP or ST', () => {
      const result = validateSTXAddress('BC1234567890abcdefghijk')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('SP')
    })

    it('should reject address that is too short', () => {
      const result = validateSTXAddress('SP123')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('length')
    })
  })

  describe('BTC Wallet Address Validation', () => {
    function validateBTCAddress(address: string): { valid: boolean; error?: string } {
      if (!address) {
        return { valid: true } // BTC is optional
      }
      
      // Legacy addresses start with 1 or 3
      // Native SegWit (bech32) start with bc1
      // Testnet starts with tb1, m, n, or 2
      const validPrefixes = ['1', '3', 'bc1', 'tb1', 'm', 'n', '2']
      const hasValidPrefix = validPrefixes.some(p => address.toLowerCase().startsWith(p))
      
      if (!hasValidPrefix) {
        return { valid: false, error: 'Invalid BTC address prefix' }
      }
      
      // Length checks
      if (address.startsWith('bc1') || address.startsWith('tb1')) {
        // Bech32 addresses are 42-62 characters
        if (address.length < 42 || address.length > 62) {
          return { valid: false, error: 'Invalid bech32 address length' }
        }
      } else {
        // Legacy addresses are 25-34 characters
        if (address.length < 25 || address.length > 45) {
          return { valid: false, error: 'Invalid BTC address length' }
        }
      }
      
      return { valid: true }
    }

    it('should accept empty BTC address (optional field)', () => {
      expect(validateBTCAddress('').valid).toBe(true)
    })

    it('should accept valid legacy address starting with 1', () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      expect(validateBTCAddress(address).valid).toBe(true)
    })

    it('should accept valid SegWit address starting with 3', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'
      expect(validateBTCAddress(address).valid).toBe(true)
    })

    it('should accept valid Native SegWit address starting with bc1', () => {
      const address = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
      expect(validateBTCAddress(address).valid).toBe(true)
    })

    it('should accept valid testnet address starting with tb1', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      expect(validateBTCAddress(address).valid).toBe(true)
    })

    it('should reject address with invalid prefix', () => {
      const result = validateBTCAddress('SP2J6ZY48GV1EZ5V2V5RB9MPJ43V86650KR5X4N')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('prefix')
    })
  })

  describe('Email Validation', () => {
    function validateEmail(email: string): { valid: boolean; error?: string } {
      if (!email) {
        return { valid: true } // Email might be optional
      }
      
      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' }
      }
      
      // Check for common typos
      const commonDomainTypos = ['gmial.com', 'gamil.com', 'gmal.com', 'hotmal.com']
      const domain = email.split('@')[1]?.toLowerCase()
      if (commonDomainTypos.includes(domain)) {
        return { valid: false, error: `Did you mean ${domain.replace('gmial', 'gmail').replace('gamil', 'gmail').replace('gmal', 'gmail').replace('hotmal', 'hotmail')}?` }
      }
      
      return { valid: true }
    }

    it('should accept valid email', () => {
      expect(validateEmail('test@example.com').valid).toBe(true)
    })

    it('should accept empty email (optional)', () => {
      expect(validateEmail('').valid).toBe(true)
    })

    it('should accept email with subdomain', () => {
      expect(validateEmail('user@mail.company.com').valid).toBe(true)
    })

    it('should reject email without @', () => {
      const result = validateEmail('testexample.com')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid email')
    })

    it('should reject email without domain', () => {
      const result = validateEmail('test@')
      expect(result.valid).toBe(false)
    })

    it('should reject email without TLD', () => {
      const result = validateEmail('test@example')
      expect(result.valid).toBe(false)
    })

    it('should warn about common typos like gmial.com', () => {
      const result = validateEmail('user@gmial.com')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('gmail')
    })
  })

  describe('Team Member Data Validation', () => {
    interface TeamMemberData {
      name: string;
      wallet_address: string;
      btc_address?: string;
      email?: string;
      rate?: number;
      role?: string;
    }

    function validateTeamMember(data: TeamMemberData): { valid: boolean; errors: string[] } {
      const errors: string[] = []
      
      // Name validation
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Name is required')
      } else if (data.name.length < 2) {
        errors.push('Name must be at least 2 characters')
      } else if (data.name.length > 100) {
        errors.push('Name must not exceed 100 characters')
      }
      
      // Wallet validation
      if (!data.wallet_address) {
        errors.push('STX wallet address is required')
      } else if (!data.wallet_address.startsWith('SP') && !data.wallet_address.startsWith('ST')) {
        errors.push('Invalid STX wallet address')
      }
      
      // Rate validation (if provided)
      if (data.rate !== undefined) {
        if (data.rate < 0) {
          errors.push('Rate cannot be negative')
        }
        if (data.rate > 10000000) {
          errors.push('Rate exceeds maximum allowed value')
        }
      }
      
      return { valid: errors.length === 0, errors }
    }

    it('should accept valid team member data', () => {
      const data: TeamMemberData = {
        name: 'John Doe',
        wallet_address: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44',
        email: 'john@example.com',
        rate: 5000,
        role: 'Developer'
      }
      expect(validateTeamMember(data).valid).toBe(true)
    })

    it('should reject missing name', () => {
      const data: TeamMemberData = {
        name: '',
        wallet_address: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44'
      }
      const result = validateTeamMember(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })

    it('should reject missing wallet address', () => {
      const data: TeamMemberData = {
        name: 'John Doe',
        wallet_address: ''
      }
      const result = validateTeamMember(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('STX wallet address is required')
    })

    it('should reject invalid wallet address prefix', () => {
      const data: TeamMemberData = {
        name: 'John Doe',
        wallet_address: 'BC1234567890abcdefghijklmnop'
      }
      const result = validateTeamMember(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid STX'))).toBe(true)
    })

    it('should reject negative rate', () => {
      const data: TeamMemberData = {
        name: 'John Doe',
        wallet_address: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44',
        rate: -1000
      }
      const result = validateTeamMember(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Rate cannot be negative')
    })

    it('should reject name that is too short', () => {
      const data: TeamMemberData = {
        name: 'A',
        wallet_address: 'ST3S3NY06KKSR66ZB2E74S64K27QGAHCZVSB61V44'
      }
      const result = validateTeamMember(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('at least 2'))).toBe(true)
    })
  })
})
