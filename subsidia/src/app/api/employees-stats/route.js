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
      },
      include: {
        employee: true
      }
    });

    // Get all acconti to compute true net balance
    const acconti = await prisma.acconto.findMany({
      where: { userId: session.user.id },
      select: { amount: true }
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

    // True net balance: sum of all earned salaries minus sum of all acconti paid
    const totalEarned = salaries.reduce((acc, salary) => acc + salary.total, 0);
    const totalAcconti = acconti.reduce((acc, a) => acc + a.amount, 0);
    const totalToPay = totalEarned - totalAcconti;

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
