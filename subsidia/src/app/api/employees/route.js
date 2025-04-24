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

      if (id) {
         // If ID is provided, fetch single employee
         const employee = await prisma.employee.findUnique({
            where: { id, userId: session.user.id },
            include: { salaries: true }
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
            return acc;
         }, { fullDays: 0, halfDays: 0, toPay: 0 });

         // Map salaries to workHistory array and sort by workedDay descending
         const workHistory = employee.salaries
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

         const { salaries, ...employeeData } = employee;
         return NextResponse.json({
            success: true,
            data: { ...employeeData, ...salaryStats, workHistory }
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
            salaries: true
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
            return acc;
         }, { fullDays: 0, halfDays: 0, toPay: 0 });

         // Remove salaries array and add stats
         const { salaries, ...employeeData } = employee;
         return {
            ...employeeData,
            ...salaryStats
         };
      });

      return NextResponse.json({
         success: true,
         data: employeesWithStats
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
