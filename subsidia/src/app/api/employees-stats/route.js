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

    // Build date filter
    let dateFilter = {}
    if (year && year !== 'all') {
      const yearNum = parseInt(year)
      dateFilter = {
        workedDay: {
          gte: new Date(`${yearNum}-01-01`),
          lt: new Date(`${yearNum + 1}-01-01`)
        }
      }
    }

    // Get number of active employees (not filtered by year)
    const activeEmployees = await prisma.employee.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    });

    // Get salaries data (filtered by year if provided)
    const salaries = await prisma.salary.findMany({
      where: {
        userId: session.user.id,
        ...dateFilter
      },
      include: {
        employee: true
      }
    });

    // Get available years from all salary records
    const allSalaryDates = await prisma.salary.findMany({
      where: { userId: session.user.id },
      select: { workedDay: true }
    });
    const yearsSet = new Set(allSalaryDates.map(s => new Date(s.workedDay).getFullYear()))
    const years = Array.from(yearsSet).sort((a, b) => b - a)

    // Get acconti (filtered by year if provided)
    let accontiFilter = { userId: session.user.id }
    if (year && year !== 'all') {
      const yearNum = parseInt(year)
      accontiFilter.date = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`)
      }
    }
    const acconti = await prisma.acconto.findMany({
      where: accontiFilter,
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

    const totalEarned = salaries.reduce((acc, salary) => acc + salary.total, 0);
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
