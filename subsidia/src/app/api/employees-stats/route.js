import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') // "all" or a year number string

    // Get number of active employees (never year-filtered)
    const activeEmployees = await prisma.employee.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    });

    // Fetch all salary records — filter in JS so we can reuse for both display and balance
    const allSalaries = await prisma.salary.findMany({
      where: { userId: session.user.id },
      include: { employee: true }
    });

    // Get all acconti (never year-filtered — they are a running balance)
    const acconti = await prisma.acconto.findMany({
      where: { userId: session.user.id },
      select: { amount: true }
    });

    // Extract available years
    const yearsSet = new Set(allSalaries.map(s => new Date(s.workedDay).getFullYear()))
    const years = Array.from(yearsSet).sort((a, b) => b - a)

    // Year-filtered salaries for the day count display only
    const displaySalaries = (year && year !== 'all')
      ? allSalaries.filter(s => new Date(s.workedDay).getFullYear() === parseInt(year))
      : allSalaries;

    const totalSalaries = displaySalaries.reduce((acc, salary) => {
      if (salary.workType === 'fullDay') return acc + 1;
      if (salary.workType === 'halfDay') return acc + 0.5;
      return acc;
    }, 0);

    // Balance is always global: ALL earned - ALL acconti
    const totalEarned = allSalaries.reduce((acc, salary) => acc + salary.total, 0);
    const totalAcconti = acconti.reduce((acc, a) => acc + a.amount, 0);
    const totalToPay = totalEarned - totalAcconti;

    return NextResponse.json({
      activeEmployees,
      totalSalaries,
      totalToPay,
      years
    });

  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee statistics" },
      { status: 500 }
    );
  }
}
