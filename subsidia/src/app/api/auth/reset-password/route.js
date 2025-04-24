import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";

const resetPasswordSchema = z.object({
   token: z.string().min(1, { message: "Token obbligatorio" }),
   password: z
      .string()
      .min(8, { message: "La password deve essere almeno di 8 caratteri" })
      .regex(/[a-z]/, { message: "La password deve contenere almeno una lettera minuscola" })
      .regex(/[A-Z]/, { message: "La password deve contenere almeno una lettera maiuscola" })
      .regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
         message: "La password deve contenere almeno un numero o un carattere speciale"
      }),
})

export async function POST(request) {
   try {
      const body = await request.json()

      const result = resetPasswordSchema.safeParse(body)

      if (!result.success) {
         const errors = result.error.flatten();
         return NextResponse.json({
            success: false,
            message: errors.formErrors[0] || Object.values(errors.fieldErrors)[0][0] || "Validazione fallita"
         }, { status: 400 });
      }

      const { token, password } = result.data;

      const resultTransaction = await prisma.$transaction(async (tx) => {
         // Find the code and check it's not expired
         const userCode = await tx.userAuthenticationCodes.findFirst({
            where: {
               code: token,
               type: "password_reset",
               expiresAt: {
                  gt: new Date() // Check code hasn't expired
               }
            }
         });

         if (!userCode) {
            throw new Error("Codice di reset non valido o scaduto");
         }

         // Hash the new password
         const hashedPassword = await hash(password, 12);

         // Update the user's password
         const updatedUser = await tx.user.update({
            where: {
               id: userCode.userId
            },
            data: {
               password: hashedPassword
            }
         });

         // Delete all reset password codes for this user
         await tx.userAuthenticationCodes.deleteMany({
            where: {
               userId: userCode.userId,
               type: "password_reset"
            }
         });

         return { success: true };
      });

      return NextResponse.json({
         success: resultTransaction?.success
      })
   } catch (error) {
      console.error("Reset Password error:", error);
      return NextResponse.json({
         success: false,
         message: "Errore interno del server"
      }, { status: 500 });
   }
}