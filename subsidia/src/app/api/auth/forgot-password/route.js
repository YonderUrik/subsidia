import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { Resend } from "resend";
import { config } from "@/lib/config";
import PasswordResetEmail from "@/emails/ForgotPasswordEmail";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
   try {
      const { email } = await req.json()

      if (!email) {
         return NextResponse.json(
            { error: "Email è obbligatoria" },
            { status: 400 }
         )
      }

      // Find user
      const user = await prisma.user.findUnique({
         where: { email }
      })

      if (!user) {
         // Return success even if user not found for security
         return NextResponse.json({ success: true })
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Delete any existing reset tokens for this user
      await prisma.userAuthenticationCodes.deleteMany({
         where: {
            userId: user.id,
            type: 'password_reset'
         }
      })

      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

      // Use transaction to create new code and send email
      await prisma.$transaction(async (tx) => {
         // Save reset token to UserAuthenticationCodes
         await tx.userAuthenticationCodes.create({
            data: {
               userId: user.id,
               code: resetToken,
               type: 'password_reset',
               expiresAt
            }
         })

         // Send email
         const emailResult = await resend.emails.send({
            from: `${config.appName} <${config.authenticationEmail}>`,
            to: [user.email],
            subject: "Reimposta la tua password",
            react: PasswordResetEmail({
               resetLink: resetUrl
            })
         })

         if (!emailResult || emailResult.error) {
            throw new Error("Impossibile inviare l'email di verifica");
         }
      })

      return NextResponse.json({ success: true })

   } catch (error) {
      console.error("Password reset error:", error)
      return NextResponse.json(
         { error: "Errore interno del server" },
         { status: 500 }
      )
   }
}
