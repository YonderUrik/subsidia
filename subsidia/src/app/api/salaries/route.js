import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
   try {
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search") || "";
      const groupBy = searchParams.get("groupBy") || "day";

      // Get date range params
      const fromDate = searchParams.get("from");
      const toDate = searchParams.get("to");

      // Get distinct years
      const distinctYearsResult = await prisma.salary.findMany({
         where: {
            userId: session.user.id
         },
         select: {
            workedDay: true
         },
         distinct: ['workedDay']
      });

      const years = [...new Set([
         ...distinctYearsResult.map(s => new Date(s.workedDay).getFullYear()),
         new Date().getFullYear()
      ])].sort((a, b) => b - a);

      // Build date filter based on provided from/to dates
      let dateFilter = {};
      if (fromDate && toDate) {
         dateFilter = {
            workedDay: {
               gte: new Date(fromDate),
               lte: new Date(toDate)
            }
         };
      }

      let salaries = await prisma.salary.findMany({
         where: {
            userId: session.user.id,
            ...dateFilter,
            ...(search && {
               employee: {
                  name: {
                     contains: search,
                     mode: "insensitive"
                  }
               }
            })
         },
         include: {
            employee: true
         },
         orderBy: {
            workedDay: 'desc'
         }
      });

      if (groupBy !== 'day') {
         const groupedSalaries = salaries.reduce((acc, salary) => {
            const workedDate = new Date(salary.workedDay);
            let groupKey;
            let displayDate;

            if (groupBy === 'week') {
               // Get Monday of the week (start)
               const weekStart = new Date(workedDate);
               weekStart.setDate(workedDate.getDate() - workedDate.getDay() + 1);
               weekStart.setHours(0, 0, 0, 0);
               
               // Get Sunday of the week (end)
               const weekEnd = new Date(weekStart);
               weekEnd.setDate(weekStart.getDate() + 6);
               
               // Create unique key for the week
               groupKey = `${salary.employeeId}-${weekStart.getTime()}`;
               displayDate = `${weekStart.toLocaleDateString('it-IT')} - ${weekEnd.toLocaleDateString('it-IT')}`;
            } else if (groupBy === 'month') {
               groupKey = `${salary.employeeId}-${workedDate.getFullYear()}-${workedDate.getMonth()}`;
               displayDate = new Date(workedDate.getFullYear(), workedDate.getMonth(), 1)
                  .toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
            } else if (groupBy === 'year') {
               groupKey = `${salary.employeeId}-${workedDate.getFullYear()}`;
               displayDate = workedDate.getFullYear().toString();
            }

            if (!acc[groupKey]) {
               acc[groupKey] = {
                  id: groupKey,
                  employee: salary.employee,
                  workedDay: displayDate,
                  workType: 'aggregated',
                  salaryAmount: 0,
                  extras: 0,
                  total: 0,
                  payedAmount: 0,
                  isPaid: true,
                  daysCount: 0
               };
            }

            acc[groupKey].salaryAmount += salary.salaryAmount;
            acc[groupKey].extras += salary.extras;
            acc[groupKey].total += salary.total;
            acc[groupKey].payedAmount += salary.payedAmount;
            acc[groupKey].isPaid = acc[groupKey].isPaid && salary.isPaid;
            acc[groupKey].daysCount += 1;

            return acc;
         }, {});

         salaries = Object.values(groupedSalaries);
      }

      // Calculate totals
      const totalPayed = salaries.reduce((sum, salary) => sum + (salary.payedAmount || 0), 0);
      const totalToPay = salaries.reduce((sum, salary) => {
         const difference = salary.total - (salary.payedAmount || 0);
         return sum + (difference > 0 ? difference : 0);
      }, 0);

      return NextResponse.json({
         data: salaries,
         years,
         totalPayed,
         totalToPay,
         success: true
      });
   } catch (error) {
      console.error('Error fetching salaries:', error);
      return NextResponse.json({
         success: false,
         error: error.message
      }, { status: 500 });
   }
}

export async function POST(request) {
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
         );
      }

      const body = await request.json();

      // Extract salary data from request body
      const {
         entries = [],
         employeeId,
         workedDay,
         workType,
         salaryAmount,
         extras = 0,
         payedAmount = 0,
         isPaid = false,
         notes,
      } = body;

      // Handle batch entries if provided
      if (entries && entries.length > 0) {
         // Validate all entries have required fields
         const invalidEntries = entries.filter(entry => 
            !entry.employeeId || 
            !entry.workedDay || 
            !entry.workType || 
            entry.salaryAmount === undefined
         );

         if (invalidEntries.length > 0) {
            return NextResponse.json(
               { error: 'Alcuni campi obbligatori mancanti nelle entrate' },
               { status: 400 }
            );
         }

         // Verify all employees exist and belong to user
         const employeeIds = [...new Set(entries.map(entry => entry.employeeId))];
         const employees = await prisma.employee.findMany({
            where: {
               id: { in: employeeIds },
               userId: session.user.id
            }
         });

         if (employees.length !== employeeIds.length) {
            return NextResponse.json(
               { error: 'Uno o più operai non trovati' },
               { status: 404 }
            );
         }

         // Create all salary records in a transaction
         const result = await prisma.$transaction(async (tx) => {
            const createdSalaries = [];

            for (const entry of entries) {
               const total = parseFloat(entry.salaryAmount) + parseFloat(entry.extras || 0);
               
               const salary = await tx.salary.create({
                  data: {
                     employeeId: entry.employeeId,
                     userId: session.user.id,
                     workedDay: new Date(entry.workedDay),
                     workType: entry.workType,
                     salaryAmount: parseFloat(entry.salaryAmount),
                     extras: parseFloat(entry.extras || 0),
                     total,
                     payedAmount: parseFloat(entry.payedAmount || 0),
                     isPaid: entry.isPaid || false,
                     notes: entry.notes,
                  },
               });

               createdSalaries.push(salary);
            }

            return createdSalaries;
         });

         return NextResponse.json({
            data: result,
            message: "Entrate di salario create con successo",
            success: true
         });

      } else {
         // Handle single salary creation
         // Validate required fields
         if (!employeeId || !workedDay || !workType || salaryAmount === undefined) {
            return NextResponse.json(
               { error: 'Alcuni campi obbligatori mancanti' },
               { status: 400 }
            );
         }

         // Verify employee exists and belongs to user
         const employee = await prisma.employee.findFirst({
            where: {
               id: employeeId,
               userId: session.user.id
            },
         });

         if (!employee) {
            return NextResponse.json(
               { error: 'Operaio non trovato' },
               { status: 404 }
            );
         }

         // Calculate total
         const total = parseFloat(salaryAmount) + parseFloat(extras || 0);

         // Create the salary record
         const salary = await prisma.salary.create({
            data: {
               employeeId,
               userId: session.user.id,
               workedDay: new Date(workedDay),
               workType,
               salaryAmount: parseFloat(salaryAmount),
               extras: parseFloat(extras),
               total,
               payedAmount: parseFloat(payedAmount),
               isPaid,
               notes,
            },
         });

         return NextResponse.json({
            data: salary,
            message: "Salario creato con successo", 
            success: true
         });
      }
   } catch (error) {
      console.error('Error creating salary:', error);
      return NextResponse.json(
         { error: 'Impossibile creare il salario' },
         { status: 500 }
      );
   }
}

export async function PATCH(request) {
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();

      const { salaryId, employeeId, paymentAmount } = body;

      const salaries = await prisma.salary.findMany({
         where: {
            userId: session.user.id,
            employeeId: employeeId,
            isPaid: false,
            ...(salaryId ? { id: salaryId } : {})
         }
      })

      if (salaries.length === 0) {
         return NextResponse.json({ error: 'Nessuna giornata di lavoro trovata' }, { status: 404 });
      }

      const totalToPay = salaries.reduce((acc, salary) => acc + (salary.total - salary.payedAmount), 0);

      if (paymentAmount > totalToPay) {
         return NextResponse.json({ error: 'Importo da pagare maggiore del totale da pagare' }, { status: 400 });
      }

      // Sort salaries by workedDay ascending (oldest first)
      const sortedSalaries = salaries.sort((a, b) => a.workedDay.getTime() - b.workedDay.getTime());

      let remainingAmount = paymentAmount;

      // Start MongoDB transaction
      const result = await prisma.$transaction(async (tx) => {
         for (const salary of sortedSalaries) {
            if (remainingAmount <= 0) break;

            const unpaidAmount = salary.total - salary.payedAmount;
            const amountToPayForThis = Math.min(remainingAmount, unpaidAmount);

            await tx.salary.update({
               where: { id: salary.id },
               data: {
                  payedAmount: salary.payedAmount + amountToPayForThis,
                  isPaid: (salary.payedAmount + amountToPayForThis) >= salary.total
               }
            });

            remainingAmount -= amountToPayForThis;
         }
      });

      return NextResponse.json({
         message: "Pagamento processato con successo",
         success: true
      });

   } catch (error) {
      console.error('Error updating salary:', error);
      return NextResponse.json(
         { error: 'Failed to update salary' },
         { status: 500 }
      );
   }
}
