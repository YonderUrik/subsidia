import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";
import { Resend } from "resend";
import { config } from "@/lib/config";
import VerificationEmail from "@/emails/RegistrationVerifyEmail";

// Registration data validation schema
const registerSchema = z.object({
  name: z.string().min(1, { message: "Nome è obbligatorio" }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }),
  password: z
    .string()
    .min(8, { message: "La password deve essere almeno di 8 caratteri" })
    .regex(/[a-z]/, { message: "La password deve contenere almeno una lettera minuscola" })
    .regex(/[A-Z]/, { message: "La password deve contenere almeno una lettera maiuscola" })
    .regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
      message: "La password deve contenere almeno un numero o un carattere speciale"
    }),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten();
      return NextResponse.json({
        success: false,
        message: errors.formErrors[0] || Object.values(errors.fieldErrors)[0][0] || "Validazione fallita"
      }, { status: 400 });
    }

    const { name, email, password } = result.data;

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Email già in uso"
      }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiryTime = new Date();
    codeExpiryTime.setHours(codeExpiryTime.getHours() + 1); // Code expires in 1 hour

    // Use transaction to create user and verification code
    const resultTransaction = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          isActive: false
        }
      });

      // Create verification code
      const authCode = await tx.userAuthenticationCodes.create({
        data: {
          userId: user.id,
          code: verificationCode,
          type: "registration",
          expiresAt: codeExpiryTime
        }
      });

      const emailResult = await resend.emails.send({
        from: `${config.appName} <${config.authenticationEmail}>`,
        to: [email],
        subject: `Il tuo codice di verifica è: ${verificationCode}`,
        react: VerificationEmail({
          verificationCode
        })
      })

      if (!emailResult || emailResult.error) {
        throw new Error("Impossibile inviare l'email di verifica");
      }

      return authCode;
    });

    // Return success without sensitive data
    return NextResponse.json({
      success: true,
      message: "Utente registrato con successo",
      type: resultTransaction?.type,
      userId: resultTransaction?.userId

    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({
      success: false,
      message: "Errore durante la registrazione"
    }, { status: 500 });
  }
} 