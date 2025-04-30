import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

// GET /api/lands?year=2023&name=campo&soilType=argilloso
export async function GET(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const year = searchParams.get("year")
      const name = searchParams.get("name")
      const soilType = searchParams.get("soilType")

      const lands = await prisma.land.findMany({
         where: {
            userId: session.user.id,
            ...(year && { year: parseInt(year) }),
            ...(name && { name: { contains: name, mode: 'insensitive' } }),
            ...(soilType && { soilType })
         },
         orderBy: {
            createdAt: "desc"
         }
      })

      return NextResponse.json(lands)
   } catch (error) {
      console.error("Errore nel fetch dei campi:", error)
      return NextResponse.json(
         { error: "Errore nel fetch dei campi" },
         { status: 500 }
      )
   }
}

// POST /api/lands
export async function POST(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const data = await request.json()

      // Validate required fields
      const requiredFields = ["name", "area", "coordinates", "soilType"]
      for (const field of requiredFields) {
         if (!data[field]) {
            return NextResponse.json(
               { error: `Campo mancante: ${field}` },
               { status: 400 }
            )
         }
      }

      // Generate a random pleasant color
      const colors = [
         "#4CAF50", // Green
         "#8BC34A", // Light Green
         "#CDDC39", // Lime
         "#FFC107", // Amber
         "#FF9800", // Orange
         "#2196F3", // Blue
         "#03A9F4", // Light Blue
         "#00BCD4", // Cyan
         "#009688", // Teal
      ]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const land = await prisma.land.create({
         data: {
            userId: session.user.id,
            name: data.name,
            area: data.area,
            color: data.color || randomColor,
            coordinates: data.coordinates,
            soilType: data.soilType,
            notes: data.notes,
            lastHarvest: data.lastHarvest ? new Date(data.lastHarvest) : null,
            year: data.year
         }
      })

      return NextResponse.json(land, { status: 201 })
   } catch (error) {
      console.error("Errore nella creazione del campo:", error)
      return NextResponse.json(
         { error: "Errore nella creazione del campo" },
         { status: 500 }
      )
   }
}

export async function PATCH(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { id } = await request.json()

      // Get current land to toggle isActive
      const land = await prisma.land.findFirst({
         where: { id, userId: session.user.id }
      })

      await prisma.land.update({
         where: { id, userId: session.user.id },
         data: { isActive: !land?.isActive }
      })

      const message = land.isActive ? "Campo disattivato con successo" : "Campo attivato con successo"
      return NextResponse.json({ message }, { status: 200 })
   } catch (error) {
      console.error("Errore nella modifica del campo:", error)
      return NextResponse.json({ error: "Errore nella modifica del campo" }, { status: 500 })
   }
}

export async function DELETE(request) {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { id } = await request.json()

      await prisma.land.delete({
         where: { id, userId: session.user.id }
      })

      return NextResponse.json({ message: "Campo eliminato con successo" }, { status: 200 })
   } catch (error) {
      console.error("Errore nell'eliminazione del campo:", error)
      return NextResponse.json({ error: "Errore nell'eliminazione del campo" }, { status: 500 })
   }
}
