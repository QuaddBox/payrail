'use server'

import { Resend } from 'resend'

// Lazy initialization of Resend to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// Email sender - using Resend's sandbox for testing
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Payrail <onboarding@resend.dev>'

/**
 * Send welcome email when recipient is added to payroll
 */
export async function sendOnboardingEmail(recipient: {
  name: string
  email: string
  rate: string
  frequency: string
  startDate?: string
}) {
  console.log(`[Email] Sending onboarding to ${recipient.email}`)

  try {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; margin: 0; font-size: 28px;">🎉 Welcome to Payrail!</h1>
        </div>
        
        <p style="color: #e5e5e5; font-size: 16px;">Hi <strong>${recipient.name}</strong>,</p>
        <p style="color: #a3a3a3; font-size: 14px;">You've been added to the payroll system. Here are your details:</p>
        
        <div style="background: #171717; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f97316;">
          <p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Rate:</strong> $${recipient.rate} USD</p>
          <p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Frequency:</strong> ${recipient.frequency}</p>
          ${recipient.startDate ? `<p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Start Date:</strong> ${recipient.startDate}</p>` : ''}
        </div>

        <p style="color: #a3a3a3; font-size: 14px;">Payments are processed via the Stacks blockchain - fast, secure, and transparent.</p>
        
        <hr style="border: 0; border-top: 1px solid #262626; margin: 30px 0;" />
        <p style="font-size: 12px; color: #525252; text-align: center;">Powered by Payrail • Decentralized Payroll</p>
      </div>
    `

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: 'Welcome to Payrail - Your Payroll is Ready 🚀',
      html: html,
    })

    if (error) {
      console.error('[Email] Failed:', error)
      return { error: error.message }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { error: error.message || 'Failed to send email' }
  }
}

/**
 * Send email when recipient is added to a schedule
 */
export async function sendScheduleAddedEmail(recipient: {
  name: string
  email: string
  scheduleName: string
  amount: number
  frequency: 'weekly' | 'monthly'
  nextPayDate: string
  organizationName: string
}) {
  console.log(`[Email] Sending schedule-added to ${recipient.email}`)

  try {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; margin: 0; font-size: 28px;">📅 Added to Payroll Schedule</h1>
        </div>
        
        <p style="color: #e5e5e5; font-size: 16px;">Hi <strong>${recipient.name}</strong>,</p>
        <p style="color: #a3a3a3; font-size: 14px;">You've been added to a recurring payroll schedule by <strong style="color: #f97316;">${recipient.organizationName}</strong>.</p>
        
        <div style="background: #171717; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Schedule:</strong> ${recipient.scheduleName}</p>
          <p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Amount:</strong> $${recipient.amount.toLocaleString()} USD</p>
          <p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Frequency:</strong> ${recipient.frequency}</p>
          <p style="margin: 8px 0; color: #e5e5e5;"><strong style="color: #a3a3a3;">Next Payment:</strong> ${recipient.nextPayDate}</p>
        </div>

        <p style="color: #a3a3a3; font-size: 14px;">You'll receive an email reminder when your payment is due.</p>
        
        <hr style="border: 0; border-top: 1px solid #262626; margin: 30px 0;" />
        <p style="font-size: 12px; color: #525252; text-align: center;">Powered by Payrail • Decentralized Payroll</p>
      </div>
    `

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: `📅 You've been added to "${recipient.scheduleName}" payroll`,
      html: html,
    })

    if (error) {
      console.error('[Email] Failed:', error)
      return { error: error.message }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { error: error.message || 'Failed to send email' }
  }
}

/**
 * Send email when payment is due (called by cron job)
 */
export async function sendPaymentDueEmail(recipient: {
  name: string
  email: string
  scheduleName: string
  amount: number
  organizationName: string
}) {
  console.log(`[Email] Sending payment-due to ${recipient.email}`)

  try {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; margin: 0; font-size: 28px;">💰 Payment Due Today!</h1>
        </div>
        
        <p style="color: #e5e5e5; font-size: 16px;">Hi <strong>${recipient.name}</strong>,</p>
        <p style="color: #a3a3a3; font-size: 14px;">Your scheduled payment from <strong style="color: #f97316;">${recipient.organizationName}</strong> is due today.</p>
        
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase;">Expected Amount</p>
          <p style="margin: 10px 0 0 0; color: #fff; font-size: 36px; font-weight: bold;">$${recipient.amount.toLocaleString()}</p>
        </div>

        <p style="color: #a3a3a3; font-size: 14px;">The organization will process this payment shortly. You'll receive a confirmation once the payment is sent to your wallet.</p>
        
        <hr style="border: 0; border-top: 1px solid #262626; margin: 30px 0;" />
        <p style="font-size: 12px; color: #525252; text-align: center;">Powered by Payrail • Decentralized Payroll</p>
      </div>
    `

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: `💰 Your $${recipient.amount} payment from ${recipient.organizationName} is due!`,
      html: html,
    })

    if (error) {
      console.error('[Email] Failed:', error)
      return { error: error.message }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { error: error.message || 'Failed to send email' }
  }
}

/**
 * Send email when payment is successfully sent
 */
export async function sendPaymentSentEmail(recipient: {
  name: string
  email: string
  amount: string
  currency: 'STX' | 'BTC'
  txId: string
  organizationName: string
}) {
  console.log(`[Email] Sending payment-sent to ${recipient.email}`)

  try {
    const explorerUrl = `https://explorer.stacks.co/txid/${recipient.txId}?chain=testnet`
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0; font-size: 28px;">✅ Payment Received!</h1>
        </div>
        
        <p style="color: #e5e5e5; font-size: 16px;">Hi <strong>${recipient.name}</strong>,</p>
        <p style="color: #a3a3a3; font-size: 14px;">Great news! <strong style="color: #f97316;">${recipient.organizationName}</strong> has sent you a payment.</p>
        
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase;">Amount Received</p>
          <p style="margin: 10px 0 0 0; color: #fff; font-size: 36px; font-weight: bold;">${recipient.amount} ${recipient.currency}</p>
        </div>

        <div style="background: #171717; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0 0 5px 0; color: #a3a3a3; font-size: 12px;">Transaction ID</p>
          <p style="margin: 0; color: #e5e5e5; font-size: 12px; font-family: monospace; word-break: break-all;">${recipient.txId}</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${explorerUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View on Explorer →</a>
        </div>

        <p style="color: #a3a3a3; font-size: 14px;">The funds should appear in your wallet within 1-2 minutes.</p>
        
        <hr style="border: 0; border-top: 1px solid #262626; margin: 30px 0;" />
        <p style="font-size: 12px; color: #525252; text-align: center;">Powered by Payrail • Decentralized Payroll</p>
      </div>
    `

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: `✅ You received ${recipient.amount} ${recipient.currency} from ${recipient.organizationName}!`,
      html: html,
    })

    if (error) {
      console.error('[Email] Failed:', error)
      return { error: error.message }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { error: error.message || 'Failed to send email' }
  }
}
