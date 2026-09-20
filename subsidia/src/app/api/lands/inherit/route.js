import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

// POST /api/lands/inherit
// Copies selected lands from a source year into a target year
export async function POST(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const data = await request.json()
      const { sourceYear, targetYear, landIds } = data

      if (!sourceYear || !targetYear) {
         return NextResponse.json(
            { error: "Anno sorgente e anno destinazione sono obbligatori" },
            { status: 400 }
         )
      }

      if (!Array.isArray(landIds) || landIds.length === 0) {
         return NextResponse.json(
            { error: "Nessun terreno selezionato" },
            { status: 400 }
         )
      }

      if (parseInt(sourceYear) === parseInt(targetYear)) {
         return NextResponse.json(
            { error: "Anno sorgente e anno destinazione devono essere diversi" },
            { status: 400 }
         )
      }

      // Only copy lands that belong to the user and the declared source year
      const sourceLands = await prisma.land.findMany({
         where: {
            id: { in: landIds },
            userId: session.user.id,
            year: parseInt(sourceYear)
         }
      })

      if (sourceLands.length === 0) {
         return NextResponse.json(
            { error: "Nessun terreno trovato per l'anno sorgente selezionato" },
            { status: 404 }
         )
      }

      const createdLands = await prisma.$transaction(
         sourceLands.map(land => prisma.land.create({
            data: {
               userId: session.user.id,
               name: land.name,
               area: land.area,
               color: land.color,
               coordinates: land.coordinates,
               soilType: land.soilType,
               variety: land.variety,
               notes: land.notes,
               isActive: true,
               lastHarvest: null,
               year: parseInt(targetYear)
            }
         }))
      )

      return NextResponse.json({ lands: createdLands, count: createdLands.length }, { status: 201 })
   } catch (error) {
      console.error("Errore nell'ereditarietà dei terreni:", error)
      return NextResponse.json(
         { error: "Errore nell'ereditarietà dei terreni" },
         { status: 500 }
      )
   }
}
