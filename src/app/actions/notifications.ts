'use server'

/**
 * Notification Service
 * 
 * To enable real emails:
 * 1. Install resend: npm install resend
 * 2. Add RESEND_API_KEY to .env.local
 * 3. Uncomment the Resend logic below
 */

// import { Resend } from 'resend'
// const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOnboardingEmail(recipient: {
  name: string
  email: string
  rate: string
  frequency: string
  startDate?: string
}) {
  console.log(`[Notification] Sending onboarding email to ${recipient.email}:`, recipient)

  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f97316;">Welcome to Payrail!</h2>
        <p>Hi <strong>${recipient.name}</strong>,</p>
        <p>You have been officially added to the payroll system.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #64748b;">Payroll Details</h3>
          <p style="margin: 5px 0;"><strong>Rate:</strong> $${recipient.rate} USD</p>
          <p style="margin: 5px 0;"><strong>Frequency:</strong> ${recipient.frequency}</p>
          ${recipient.startDate ? `<p style="margin: 5px 0;"><strong>Start Date:</strong> ${recipient.startDate}</p>` : ''}
        </div>

        <p>Your payments will be processed automatically via the Stacks blockchain.</p>
        <p>Excited to have you on board!</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">This is an automated notification from Payrail.</p>
      </div>
    `

    // Placeholder for actual Resend implementation
    /*
    await resend.emails.send({
      from: 'Payrail <notifications@yourdomain.com>',
      to: recipient.email,
      subject: 'Welcome to Payrail - Your Payroll is Ready',
      html: html,
    })
    */

    return { success: true }
  } catch (error) {
    console.error("Failed to send notification email:", error)
    return { error: "Failed to send email" }
  }
}
