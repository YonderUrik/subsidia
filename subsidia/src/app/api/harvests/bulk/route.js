import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

// DELETE /api/harvests/bulk
export async function DELETE(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const data = await request.json()
      const { ids } = data

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
         return NextResponse.json(
            { error: "IDs mancanti o formato non valido" },
            { status: 400 }
         )
      }

      // Verify all harvests belong to the user
      const harvestCount = await prisma.harvest.count({
         where: {
            id: { in: ids },
            userId: session.user.id
         }
      })

      if (harvestCount !== ids.length) {
         return NextResponse.json(
            { error: "Alcuni raccolti non esistono o non appartengono all'utente" },
            { status: 403 }
         )
      }

      // Delete all harvests
      await prisma.harvest.deleteMany({
         where: {
            id: { in: ids },
            userId: session.user.id
         }
      })

      return NextResponse.json({ 
         success: true,
         message: `${harvestCount} raccolti eliminati con successo` 
      })
   } catch (error) {
      console.error("Errore nell'eliminazione dei raccolti:", error)
      return NextResponse.json(
         { error: "Errore nell'eliminazione dei raccolti" },
         { status: 500 }
      )
   }
} 