import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current year
      const currentYear = new Date().getFullYear();

      // Get all lands for current user and year
      const lands = await prisma.land.findMany({
         where: {
            userId: session.user.id,
            year: currentYear
         },
         select: {
            area: true,
            soilType: true,
            harvests: {
               select: {
                  quantity: true,
                  price: true,
                  discount: true,
                  total: true,
                  paidAmount: true,
               }
            }
         }
      });

      // Calculate statistics
      const stats = {
         cultivatedArea: lands.reduce((sum, land) => sum + land.area, 0),
         totalHarvested: lands.reduce((sum, land) =>
            sum + land.harvests.reduce((harvestSum, harvest) => harvestSum + harvest.quantity, 0), 0),
         totalEarned: lands.reduce((sum, land) =>
            sum + land.harvests.reduce((harvestSum, harvest) => harvestSum + harvest.total, 0), 0)
      };

      return NextResponse.json(stats);

   } catch (error) {
      console.error('Error fetching harvest stats:', error);
      return NextResponse.json(
         { error: 'Failed to fetch harvest statistics' },
         { status: 500 }
      );
   }
}
