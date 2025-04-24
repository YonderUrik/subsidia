import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
   try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get("isActive") || true;
      

      const employees = await prisma.employee.findMany({
         where: {
            userId: session.user.id,
            ...(isActive === "true" ? { isActive: true } : {})
         },
         distinct: ['id', 'name'],
         select: {
            id: true,
            name: true,
            dailyRate: true,
            halfDayRate: true
         }
      });

      return NextResponse.json(employees);
   } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
}