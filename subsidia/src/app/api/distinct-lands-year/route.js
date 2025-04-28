import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
   try {
      const session = await getServerSession(authOptions)
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const years = await prisma.land.findMany({
         where: {
            userId: session.user.id
         },
         select: {
            year: true
         },
         distinct: ["year"]
      });

      // Get unique years and add current year if not present
      const currentYear = new Date().getFullYear()
      const uniqueYears = [...new Set([...years.map(y => y.year), currentYear])]
         .filter(year => year != null) // Remove null values
         .sort((a, b) => b - a) // Sort descending

      return NextResponse.json(uniqueYears);
   } catch (error) {
      console.error("Errore nel fetch dei distretti:", error);
      return NextResponse.json(
         { error: "Errore nel fetch dei distretti" },
         { status: 500 }
      );
   }
}