import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Get number of active employees
    const activeEmployees = await prisma.employee.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    });

    // Get salaries data
    const salaries = await prisma.salary.findMany({
      where: {
        userId: session.user.id,
        isPaid: false
      },
      include: {
        employee: true
      }
    });

    // Calculate totals
    const totalSalaries = salaries.reduce((acc, salary) => {
      if (salary.workType === 'fullDay') {
        return acc + 1;
      } else if (salary.workType === 'halfDay') {
        return acc + 0.5;
      }
      return acc;
    }, 0);
    
    const totalToPay = salaries.reduce((acc, salary) => acc + (salary.total - salary.payedAmount), 0);

    return NextResponse.json({
      activeEmployees,
      totalSalaries,
      totalToPay
    });

  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee statistics" },
      { status: 500 }
    );
  }
}
