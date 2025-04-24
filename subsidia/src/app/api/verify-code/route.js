import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
   try {
      const { type, id, code } = await request.json();

      if (!type || !id || !code) {
         return NextResponse.json({
            success: false,
            message: "Token non valido"
         }, { status: 400 });
      }

      // Find the code and check if it's valid
      const authCode = await prisma.userAuthenticationCodes.findFirst({
         where: {
            userId: id,
            type: type,
            code: code,
            expiresAt: {
               gt: new Date() // Check if not expired
            }
         }
      });

      if (!authCode) {
         return NextResponse.json({
            success: false,
            message: "Codice non valido"
         }, { status: 400 });
      }

      // Use transaction to ensure both operations complete or neither does
      await prisma.$transaction([
         prisma.userAuthenticationCodes.deleteMany({
            where: {
               userId: id,
               type: type
            }
         }),
         prisma.user.update({
            where: {
               id: id
            },
            data: {
               isActive: true
            }
         })
      ]);

      return NextResponse.json({
         success: true,
         message: "Codice di verifica validato con successo"
      });

   } catch (error) {
      console.error("Code verification error:", error);
      return NextResponse.json({
         success: false,
         message: "Errore nella verifica del codice di verifica"
      }, { status: 500 });
   }
}