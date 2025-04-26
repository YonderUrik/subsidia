import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

export async function GET(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const year = searchParams.get("year")

      const distinctSoilTypes = await prisma.land.findMany({
         where: {
            userId: session.user.id,
            ...(year && { year: parseInt(year) })
         },
         select: {
            soilType: true,
         },
         distinct: ['soilType'],
      })

      const soilTypes = distinctSoilTypes.map(item => item.soilType).filter(Boolean)
      
      return NextResponse.json(soilTypes)
   } catch (error) {
      console.error("Errore nel fetch dei tipi di suolo:", error)
      return NextResponse.json(
         { error: "Errore nel fetch dei tipi di suolo" },
         { status: 500 }
      )
   }
} 