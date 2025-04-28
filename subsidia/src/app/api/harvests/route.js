import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

// GET /api/harvests
export async function GET(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const landId = searchParams.get("landId")
      const landName = searchParams.get("landName")
      const from = searchParams.get("from") 
      const to = searchParams.get("to")
      const search = searchParams.get("search")
      const client = searchParams.get("client")
      const soilType = searchParams.get("soilType")
      const notesKeyword = searchParams.get("notesKeyword")
      const isPaid = searchParams.get("isPaid")
      const page = parseInt(searchParams.get("page") || "1")
      const pageSize = parseInt(searchParams.get("pageSize") || "10")
      const skip = (page - 1) * pageSize

      // Build filter object
      const whereClause = {
         userId: session.user.id,
      }

      // Date range filter - use OR condition to check both harvestDay and createdAt for backward compatibility
      if (from && to) {
         whereClause.OR = [
            {
               harvestDay: {
                  gte: new Date(from),
                  lt: new Date(to)
               }
            },
            // For harvests without harvestDay, fallback to createdAt
            {
               AND: [
                  { harvestDay: null },
                  {
                     createdAt: {
                        gte: new Date(from),
                        lt: new Date(to)
                     }
                  }
               ]
            }
         ]
      }

      // Land filter by ID
      if (landId) {
         whereClause.landId = landId
      }
      
      // Land filter by name
      if (landName) {
         whereClause.land = {
            name: landName
         }
      }

      // Client search
      if (search) {
         whereClause.client = {
            contains: search,
            mode: 'insensitive'
         }
      }

      // Client exact match
      if (client) {
         whereClause.client = client
      }

      // Soil type filter through land relation
      if (soilType) {
         whereClause.land = {
            ...(whereClause.land || {}),
            soilType
         }
      }

      // Notes keyword search
      if (notesKeyword) {
         whereClause.notes = {
            contains: notesKeyword,
            mode: 'insensitive'
         }
      }

      // Payment status filter
      if (isPaid === 'true') {
         whereClause.isPaid = true
      } else if (isPaid === 'false') {
         whereClause.isPaid = false
      }

      // Get total count for pagination
      const totalCount = await prisma.harvest.count({
         where: whereClause
      })

      // Execute main query with pagination
      const harvests = await prisma.harvest.findMany({
         where: whereClause,
         include: {
            land: {
               select: {
                  name: true,
                  soilType: true,
                  area: true
               }
            }
         },
         orderBy: {
            // Order by harvestDay first, then createdAt for backward compatibility
            harvestDay: "desc",
         },
         take: pageSize,
         skip: skip
      })

      // Fetch available years for the filter - include both harvestDay and createdAt
      const yearsResult = await prisma.harvest.findMany({
         where: {
            userId: session.user.id,
         },
         select: {
            harvestDay: true,
            createdAt: true
         }
      })

      const years = [...new Set(yearsResult.map(h => {
         // Use harvestDay if available, otherwise fall back to createdAt
         const date = h.harvestDay || h.createdAt
         return new Date(date).getFullYear()
      }))].sort((a, b) => b - a)

      // Fetch unique clients for dropdown
      const clientsResult = await prisma.harvest.findMany({
         where: {
            userId: session.user.id,
         },
         select: {
            client: true
         },
         distinct: ['client']
      })

      const clients = clientsResult.map(c => c.client).filter(Boolean)

      // Fetch unique lands for dropdown
      const lands = await prisma.land.findMany({
         where: {
            userId: session.user.id,
         },
         select: {
            id: true,
            name: true
         }
      })

      // Fetch unique soil types for dropdown
      const soilTypesResult = await prisma.land.findMany({
         where: {
            userId: session.user.id,
         },
         select: {
            soilType: true
         },
         distinct: ['soilType']
      })

      const soilTypes = soilTypesResult.map(s => s.soilType).filter(Boolean)

      // Calculate totals with ALL active filters
      // Apply the same filters used for the main query
      const paidHarvests = await prisma.harvest.aggregate({
         where: {
            ...whereClause,
            isPaid: true,
         },
         _sum: {
            total: true,
            quantity: true
         }
      })

      const unpaidHarvests = await prisma.harvest.aggregate({
         where: {
            ...whereClause,
            isPaid: false,
         },
         _sum: {
            total: true,
            quantity: true
         }
      })

      // Calculate total quantity for the filtered period
      const totalQuantity = (paidHarvests._sum.quantity || 0) + (unpaidHarvests._sum.quantity || 0)
      const totalPaid = paidHarvests._sum.total || 0
      const totalToPay = unpaidHarvests._sum.total || 0
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize)

      return NextResponse.json({
         data: harvests,
         totalCount,
         totalPages,
         currentPage: page,
         pageSize,
         years,
         clients,
         lands,
         soilTypes,
         totalPaid,
         totalToPay,
         totalQuantity
      })
   } catch (error) {
      console.error("Errore nel fetch dei raccolti:", error)
      return NextResponse.json(
         { error: "Errore nel fetch dei raccolti" },
         { status: 500 }
      )
   }
}

// POST /api/harvests
export async function POST(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const data = await request.json()

      // Validate required fields
      const requiredFields = ["landId", "quantity", "price", "client"]
      for (const field of requiredFields) {
         if (!data[field]) {
            return NextResponse.json(
               { error: `Campo mancante: ${field}` },
               { status: 400 }
            )
         }
      }

      // Calculate total
      const total = parseFloat(data.quantity) * parseFloat(data.price)

      // Create the harvest record
      const harvest = await prisma.harvest.create({
         data: {
            userId: session.user.id,
            landId: data.landId,
            quantity: parseFloat(data.quantity),
            price: parseFloat(data.price),
            total,
            isPaid: data.isPaid || false,
            paidAmount: data.paidAmount ? parseFloat(data.paidAmount) : 0,
            client: data.client,
            notes: data.notes || "",
            harvestDay: data.harvestDay ? new Date(data.harvestDay) : new Date()
         }
      })

      // Update the land's lastHarvest date
      await prisma.land.update({
         where: {
            id: data.landId
         },
         data: {
            lastHarvest: new Date()
         }
      })

      return NextResponse.json(harvest, { status: 201 })
   } catch (error) {
      console.error("Errore nella creazione del raccolto:", error)
      return NextResponse.json(
         { error: "Errore nella creazione del raccolto" },
         { status: 500 }
      )
   }
}

// DELETE /api/harvests?id=123
export async function DELETE(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")

      if (!id) {
         return NextResponse.json(
            { error: "ID mancante" },
            { status: 400 }
         )
      }

      // Check if harvest exists and belongs to user
      const existingHarvest = await prisma.harvest.findFirst({
         where: {
            id,
            userId: session.user.id
         }
      })

      if (!existingHarvest) {
         return NextResponse.json(
            { error: "Raccolto non trovato" },
            { status: 404 }
         )
      }

      // Delete the harvest
      await prisma.harvest.delete({
         where: {
            id
         }
      })

      return NextResponse.json({ success: true })
   } catch (error) {
      console.error("Errore nell'eliminazione del raccolto:", error)
      return NextResponse.json(
         { error: "Errore nell'eliminazione del raccolto" },
         { status: 500 }
      )
   }
} 