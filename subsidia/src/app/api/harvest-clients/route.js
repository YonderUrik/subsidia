import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

// GET /api/harvest-clients
export async function GET(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Get distinct client names from harvests where client is not null or empty
      const clientsResult = await prisma.harvest.findMany({
         where: {
            userId: session.user.id,
            client: {
               not: null,
               not: ""
            }
         },
         select: {
            client: true
         },
         distinct: ['client']
      })

      // Extract client names and sort alphabetically
      const clients = clientsResult
         .map(item => item.client)
         .filter(Boolean)
         .sort((a, b) => a.localeCompare(b))

      return NextResponse.json(clients)
   } catch (error) {
      console.error("Errore nel fetch dei clienti:", error)
      return NextResponse.json(
         { error: "Errore nel fetch dei clienti" },
         { status: 500 }
      )
   }
} 