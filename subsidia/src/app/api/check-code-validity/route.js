import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const token = searchParams.get('token')
    const userId = searchParams.get("id");

    // Validate required parameters
    if (!type || (!userId && !token)) {
      return NextResponse.json({
        success: false,
        message: "Token non valido",
        isValid: false
      }, { status: 400 });
    }

    // Find first non-expired verification code
    let verificationCode;
    if (userId) {
      verificationCode = await prisma.userAuthenticationCodes.findFirst({
        where: {
          userId: userId,
          type: type,
        }
      });
    } else {
      verificationCode = await prisma.userAuthenticationCodes.findFirst({
        where: {
          code: token,
          type: type,
        }
      });

    }

    // If no code found
    if (!verificationCode) {
      return NextResponse.json({
        success: true,
        isValid: false,
        message: "Codice non trovato"
      });
    }

    // Code is valid
    return NextResponse.json({
      success: true,
      isValid: true,
    });

  } catch (error) {
    console.error("Verification check error:", error);
    return NextResponse.json({
      success: false,
      isValid: false,
      message: "Errore nella verifica del codice di verifica"
    }, { status: 500 });
  }
}
