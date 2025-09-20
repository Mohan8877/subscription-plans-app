import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

function emailHTML(invoiceData: InvoiceData) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${invoiceData.planName}</title>
        <style>
          body { font-family: Arial, sans-serif; background:#f8fafc; padding:20px; }
          .container { max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px; }
          .header { background:#4f46e5; color:white; padding:20px; text-align:center; border-radius:8px 8px 0 0; }
          .details { margin:20px 0; }
          .details p { margin:6px 0; }
          .total { font-size:18px; font-weight:bold; color:#4f46e5; margin-top:15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice Receipt</h1>
            <p>Thank you for your subscription!</p>
          </div>
          <div class="details">
            <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoiceData.invoiceDate}</p>
            <p><strong>Name:</strong> ${invoiceData.userName}</p>
            <p><strong>Email:</strong> ${invoiceData.userEmail}</p>
            <p><strong>Plan:</strong> ${invoiceData.planName}</p>
            <p><strong>Amount:</strong> ₹${invoiceData.planPrice.toFixed(2)}</p>
            <div class="total">Total: ₹${invoiceData.planPrice.toFixed(2)}</div>
          </div>
        </div>
      </body>
    </html>
  `
}

interface InvoiceData {
  userName: string
  userEmail: string
  planName: string
  planPrice: number
  invoiceNumber: string
  invoiceDate: string
}

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT) || 587, // 465 for SSL, 587 for TLS
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // your SMTP username
    pass: process.env.SMTP_PASS, // your SMTP password or app password
  },
})

export async function POST(request: NextRequest) {
  try {
    const invoiceData: InvoiceData = await request.json()

    const invoiceHtmlString = `... your same invoice HTML here ...`

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[SMTP] Config not set. Simulating email send to: ${invoiceData.userEmail}`)
      console.log(`[SMTP] Invoice details:`, invoiceData)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: "Invoice email simulated successfully (SMTP not configured)",
      })
    }

    try {
      const info = await transporter.sendMail({
  from: `"Subscription Plans" <${process.env.SMTP_USER}>`,
  to: invoiceData.userEmail,
  subject: `Invoice #${invoiceData.invoiceNumber} - ${invoiceData.planName} Plan`,
  html: emailHTML(invoiceData), // ✅ your invoice HTML template goes here
})


      console.log(`[SMTP] Email sent successfully to: ${invoiceData.userEmail}`)
      console.log(`[SMTP] Nodemailer response:`, info.messageId)

      return NextResponse.json({
        success: true,
        message: "Invoice email sent successfully",
        emailId: info.messageId,
      })
    } catch (emailError) {
      console.error("[SMTP] Email sending error:", emailError)

      return NextResponse.json(
        {
          success: false,
          message: `Email service error: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[SMTP] Error processing invoice email:", error)
    return NextResponse.json({ success: false, message: "Failed to process invoice email" }, { status: 500 })
  }
}
