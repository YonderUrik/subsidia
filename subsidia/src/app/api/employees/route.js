import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Validation schema for creating/updating an employee
const employeeSchema = z.object({
   name: z.string().min(1, { message: "Nome è obbligatorio" }),
   dailyRate: z.number().positive({ message: "Tariffa giornaliera deve essere positiva" }),
   halfDayRate: z.number().positive({ message: "Tariffa mezza giornata deve essere positiva" }),
});

// GET - Get all employees with optional search
export async function GET(request) {
   // TODO : Paginazione per i singoli impiegati e per la lista degli impiegati
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search") || "";
      const isActive = searchParams.get("isActive");
      const id = searchParams.get("id");
      const page = parseInt(searchParams.get("page")) || 1;
      const pageSize = parseInt(searchParams.get("pageSize")) || 20;
      const historyPage = parseInt(searchParams.get("historyPage")) || 1;
      const historyPageSize = parseInt(searchParams.get("historyPageSize")) || 10;
      const accontiPage = parseInt(searchParams.get("accontiPage")) || 1;
      const accontiPageSize = parseInt(searchParams.get("accontiPageSize")) || 10;

      if (id) {
         // If ID is provided, fetch single employee
         const employee = await prisma.employee.findUnique({
            where: { id, userId: session.user.id },
            include: { 
               salaries: true,
               acconti: true
            }
         });

         if (!employee) {
            return NextResponse.json({
               success: false,
               message: "Impiegato non trovato"
            }, { status: 404 });
         }

         // Calculate stats for single employee
         const salaryStats = employee.salaries.reduce((acc, salary) => {
            if (salary.workType === 'fullDay') {
               acc.fullDays++;
            } else if (salary.workType === 'halfDay') {
               acc.halfDays++;
            }
            if (!salary.isPaid) {
               if (salary.payedAmount > 0) {
                  acc.toPay += (salary.total - salary.payedAmount)
               } else {
                  acc.toPay += salary.total;
               }
            }
            acc.totalExtras += salary.extras;
            return acc;
         }, { fullDays: 0, halfDays: 0, toPay: 0, totalExtras: 0 });

         // Find the most recent worked day
         let lastWorkedDay = null;
         let lastWorkType = null;
         if (employee.salaries.length > 0) {
            const lastSalary = employee.salaries.reduce((latest, salary) => {
               const currentDate = new Date(salary.workedDay);
               const latestDate = new Date(latest.workedDay);
               return currentDate > latestDate ? salary : latest;
            }, employee.salaries[0]);
            
            lastWorkedDay = new Date(lastSalary.workedDay);
            lastWorkType = lastSalary.workType;
         }

         // Map all salaries to sortedWorkHistory array
         const sortedWorkHistory = employee.salaries
            .map(salary => ({
               id: salary.id,
               workedDay: salary.workedDay,
               type: salary.workType,
               extras: salary.extras,
               total: salary.total,
               payedAmount: salary.payedAmount,
               salaryAmount: salary.salaryAmount,
               notes: salary.notes,
               isPaid: salary.isPaid
            }))
            .sort((a, b) => new Date(b.workedDay) - new Date(a.workedDay));

         // Calculate total pages for work history
         const totalItems = sortedWorkHistory.length;
         const totalPages = Math.ceil(totalItems / historyPageSize);

         // Apply pagination to workHistory
         const startIndex = (historyPage - 1) * historyPageSize;
         const workHistory = sortedWorkHistory.slice(startIndex, startIndex + historyPageSize);

         // Handle acconti with pagination
         const sortedAcconti = employee.acconti
            .map(acconto => ({
               id: acconto.id,
               date: acconto.date,
               amount: acconto.amount,
               notes: acconto.notes
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
         // Calculate total pages for acconti
         const totalAccontiItems = sortedAcconti.length;
         const totalAccontiPages = Math.ceil(totalAccontiItems / accontiPageSize);
         
         // Apply pagination to acconti
         const accontiStartIndex = (accontiPage - 1) * accontiPageSize;
         const acconti = sortedAcconti.slice(accontiStartIndex, accontiStartIndex + accontiPageSize);
         
         // Calculate total amount of acconti
         const totalAcconti = employee.acconti.reduce((sum, acconto) => sum + acconto.amount, 0);

         const { salaries, acconti: accontiRaw, ...employeeData } = employee;
         return NextResponse.json({
            success: true,
            data: { 
               ...employeeData, 
               ...salaryStats, 
               workHistory,
               acconti,
               totalAcconti,
               lastWorkedDay: lastWorkedDay ? lastWorkedDay.toISOString() : null,
               lastWorkType,
               workHistoryPagination: {
                  currentPage: historyPage,
                  totalPages,
                  totalItems,
                  pageSize: historyPageSize
               },
               accontiPagination: {
                  currentPage: accontiPage,
                  totalPages: totalAccontiPages,
                  totalItems: totalAccontiItems,
                  pageSize: accontiPageSize
               }
            }
         });
      }

      // Query employees with search filter and salary aggregations
      const employees = await prisma.employee.findMany({
         where: {
            userId: session.user.id,
            name: {
               contains: search,
               mode: "insensitive"
            },
            ...(isActive === "true" && { isActive: true })
         },
         include: {
            salaries: true,
            acconti: true
         },
         orderBy: {
            name: "asc"
         },
         skip: (page - 1) * pageSize,
         take: pageSize
      });

      // Calculate salary stats for each employee
      const employeesWithStats = employees.map(employee => {
         const salaryStats = employee.salaries.reduce((acc, salary) => {
            if (salary.workType === 'fullDay') {
               acc.fullDays++;
            } else if (salary.workType === 'halfDay') {
               acc.halfDays++;
            }
            if (!salary.isPaid) {
               if (salary.payedAmount > 0) {
                  acc.toPay += (salary.total - salary.payedAmount)
               } else {
                  acc.toPay += salary.total;
               }
            }
            acc.totalExtras += salary.extras;
            return acc;
         }, { fullDays: 0, halfDays: 0, toPay: 0, totalExtras: 0 });

         // Remove salaries array and add stats
         const { salaries, acconti, ...employeeData } = employee;
         
         // Calculate total amount of acconti
         const totalAcconti = acconti.reduce((sum, acconto) => sum + acconto.amount, 0);
         
         return {
            ...employeeData,
            ...salaryStats,
            totalAcconti
         };
      });

      // Get total count for pagination
      const totalCount = await prisma.employee.count({
         where: {
            userId: session.user.id,
            name: {
               contains: search,
               mode: "insensitive"
            },
            ...(isActive === "true" && { isActive: true })
         }
      });

      return NextResponse.json({
         success: true,
         data: employeesWithStats,
         pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page,
            pageSize: pageSize
         }
      });
   } catch (error) {
      console.error("Error fetching employees:", error);
      return NextResponse.json({
         success: false,
         message: "Errore durante il recupero degli impiegati"
      }, { status: 500 });
   }
}

// POST - Create a new employee
export async function POST(request) {
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const body = await request.json();

      // Validate input data
      const result = employeeSchema.safeParse(body);
      if (!result.success) {
         const errors = result.error.flatten();
         return NextResponse.json({
            success: false,
            message: errors.formErrors[0] || Object.values(errors.fieldErrors)[0][0] || "Validazione fallita"
         }, { status: 400 });
      }

      const { name, dailyRate, halfDayRate } = result.data;

      // Check if employee with same name already exists
      const existingEmployee = await prisma.employee.findFirst({
         where: {
            name: {
               equals: name,
               mode: 'insensitive'
            },
            userId: session.user.id
         }
      });

      if (existingEmployee) {
         return NextResponse.json({
            success: false,
            message: "Un operaio con questo nome esiste già"
         }, { status: 400 });
      }

      // Create the employee
      const employee = await prisma.employee.create({
         data: {
            name,
            dailyRate,
            halfDayRate,
            isActive: true,
            userId: session.user.id
         }
      });

      return NextResponse.json({
         success: true,
         message: "Impiegato creato con successo",
         data: employee
      });
   } catch (error) {
      console.error("Error creating employee:", error);
      return NextResponse.json({
         success: false,
         message: "Errore durante la creazione dell'impiegato"
      }, { status: 500 });
   }
}

// PUT - Update an employee
export async function PUT(request) {
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const body = await request.json();

      // Check if employee ID is provided
      if (!body.id) {
         return NextResponse.json({
            success: false,
            message: "ID impiegato richiesto"
         }, { status: 400 });
      }

      // Validate input data
      const result = employeeSchema.safeParse(body);
      if (!result.success) {
         const errors = result.error.flatten();
         return NextResponse.json({
            success: false,
            message: errors.formErrors[0] || Object.values(errors.fieldErrors)[0][0] || "Validazione fallita"
         }, { status: 400 });
      }

      const { id, name, dailyRate, halfDayRate } = body;

      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
         where: { id, userId: session.user.id }
      });

      if (!existingEmployee) {
         return NextResponse.json({
            success: false,
            message: "Impiegato non trovato"
         }, { status: 404 });
      }

      // Update the employee
      const updatedEmployee = await prisma.employee.update({
         where: { id, userId: session.user.id },
         data: {
            name,
            dailyRate : parseFloat(dailyRate),
            halfDayRate : parseFloat(halfDayRate),
            updatedAt: new Date()
         }
      });

      return NextResponse.json({
         success: true,
         message: "Impiegato aggiornato con successo",
         data: updatedEmployee
      });
   } catch (error) {
      console.error("Error updating employee:", error);
      return NextResponse.json({
         success: false,
         message: "Errore durante l'aggiornamento dell'impiegato"
      }, { status: 500 });
   }
}

// PATCH - Disable/Enable an employee
export async function PATCH(request) {
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();


      // Check if employee ID is provided
      if (!body.id) {
         return NextResponse.json({
            success: false,
            message: "ID impiegato richiesto"
         }, { status: 400 });
      }

      const { id, isActive } = body;

      // Check if the isActive field is provided
      if (isActive === undefined) {
         return NextResponse.json({
            success: false,
            message: "Campo isActive richiesto"
         }, { status: 400 });
      }

      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
         where: { id, userId: session.user.id }
      });

      if (!existingEmployee) {
         return NextResponse.json({
            success: false,
            message: "Impiegato non trovato"
         }, { status: 404 });
      }

      // Update the employee's active status
      const updatedEmployee = await prisma.employee.update({
         where: { id, userId: session.user.id },
         data: {
            isActive: !existingEmployee.isActive,
            updatedAt: new Date()
         }
      });

      const action = isActive ? "abilitato" : "disabilitato";
      
      return NextResponse.json({
         success: true,
         message: `Impiegato ${action} con successo`,
         data: updatedEmployee
      });
   } catch (error) {
      console.error("Error disabling/enabling employee:", error);
      return NextResponse.json({
         success: false,
         message: "Errore durante la modifica dello stato dell'impiegato"
      }, { status: 500 });
   }
}

// DELETE - Delete an employee
export async function DELETE(request) {
   // TODO : Testare che questa funzioni elimini correttamente anche le giornate di lavoro associate all'impiegato
   try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const body = await request.json();

      if (!body.id) {
         return NextResponse.json({
            success: false,
            message: "ID impiegato richiesto"
         }, { status: 400 });
      }

      const { id } = body;

      const existingEmployee = await prisma.employee.findUnique({
         where: { id, userId: session.user.id }
      });

      if (!existingEmployee) {
         return NextResponse.json({
            success: false,
            message: "Impiegato non trovato"
         }, { status: 404 });
      }

      await prisma.employee.delete({
         where: { id, userId: session.user.id }
      });

      return NextResponse.json({
         success: true,
         message: "Impiegato eliminato con successo"
      });
   } catch (error) {
      console.error("Error deleting employee:", error);
      return NextResponse.json({
         success: false,
         message: "Errore durante l'eliminazione dell'impiegato"
      }, { status: 500 });
   }
}
