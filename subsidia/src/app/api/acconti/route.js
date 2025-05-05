import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET handler - Fetch acconti for an employee
export async function GET(request) {
   try {
      // Get the authenticated session
      const session = await getServerSession(authOptions)

      // Check if the user is authenticated
      if (!session || !session.user) {
         return NextResponse.json({ success: false, error: "Non autenticato" }, { status: 401 })
      }

      // Get the query parameters
      const { searchParams } = new URL(request.url)
      const employeeId = searchParams.get("employeeId")
      const page = parseInt(searchParams.get("page") || "1")
      const pageSize = parseInt(searchParams.get("pageSize") || "10")

      // Calculate pagination
      const skip = (page - 1) * pageSize

      // If employeeId is not provided, return an error
      if (!employeeId) {
         return NextResponse.json({ success: false, error: "ID dell'operaio non fornito" }, { status: 400 })
      }

      // Get acconti for the employee with pagination
      const acconti = await prisma.acconto.findMany({
         where: {
            employeeId: employeeId,
            userId: session.user.id
         },
         orderBy: {
            date: 'desc'
         },
         skip: skip,
         take: pageSize
      })

      // Get the total count for pagination
      const totalCount = await prisma.acconto.count({
         where: {
            employeeId: employeeId,
            userId: session.user.id
         }
      })

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize)

      return NextResponse.json({
         success: true,
         data: acconti,
         pagination: {
            page,
            pageSize,
            totalPages,
            totalItems: totalCount
         }
      })

   } catch (error) {
      console.error("Error fetching acconti:", error)
      return NextResponse.json({ success: false, error: "Errore durante il recupero degli acconti" }, { status: 500 })
   }
}

// PATCH handler - Update an existing acconto
export async function PATCH(request) {
   try {
      // Get the authenticated session
      const session = await getServerSession(authOptions)

      // Check if the user is authenticated
      if (!session || !session.user) {
         return NextResponse.json({ success: false, error: "Non autenticato" }, { status: 401 })
      }

      // Get the request body
      const data = await request.json()

      // Validate required fields
      if (!data.id) {
         return NextResponse.json({ success: false, error: "ID dell'acconto mancante" }, { status: 400 })
      }

      // Check if the acconto exists and belongs to the user
      const existingAcconto = await prisma.acconto.findFirst({
         where: {
            id: data.id,
            userId: session.user.id
         },
         include: {
            employee: true
         }
      })

      if (!existingAcconto) {
         return NextResponse.json({ success: false, error: "Acconto non trovato o non autorizzato" }, { status: 404 })
      }

      // Calculate the difference in amount
      const newAmount = data.amount !== undefined ? parseFloat(data.amount) : existingAcconto.amount
      const amountDifference = newAmount - existingAcconto.amount

      // Start building transaction operations
      const updateOperations = []

      // If amount is changed, update unpaid salaries
      if (amountDifference !== 0) {
         // If amount is decreased, reduce payments from most recent salaries
         if (amountDifference < 0) {
            // Get paid salaries ordered by newest first
            const paidSalaries = await prisma.salary.findMany({
               where: {
                  employeeId: existingAcconto.employeeId,
                  userId: session.user.id,
                  payedAmount: { gt: 0 }
               },
               orderBy: {
                  workedDay: 'desc'
               }
            })

            let remainingReduction = Math.abs(amountDifference)

            for (const salary of paidSalaries) {
               if (remainingReduction <= 0) break

               const currentPaid = salary.payedAmount
               const reductionAmount = Math.min(remainingReduction, currentPaid)

               if (reductionAmount > 0) {
                  updateOperations.push(
                     prisma.salary.update({
                        where: { id: salary.id },
                        data: {
                           payedAmount: currentPaid - reductionAmount,
                           isPaid: false
                        }
                     })
                  )

                  remainingReduction -= reductionAmount
               }
            }
         }
         // If amount is increased, add payments to oldest unpaid salaries
         else {
            // Get unpaid salaries ordered by oldest first
            const unpaidSalaries = await prisma.salary.findMany({
               where: {
                  employeeId: existingAcconto.employeeId,
                  userId: session.user.id,
                  isPaid: false
               },
               orderBy: {
                  workedDay: 'asc'
               }
            })

            let remainingAddition = amountDifference

            for (const salary of unpaidSalaries) {
               if (remainingAddition <= 0) break

               const unpaidAmount = salary.total - salary.payedAmount
               const additionAmount = Math.min(remainingAddition, unpaidAmount)

               if (additionAmount > 0) {
                  const newPayedAmount = salary.payedAmount + additionAmount
                  updateOperations.push(
                     prisma.salary.update({
                        where: { id: salary.id },
                        data: {
                           payedAmount: newPayedAmount,
                           isPaid: newPayedAmount >= salary.total
                        }
                     })
                  )

                  remainingAddition -= additionAmount
               }
            }
         }
      }

      // Add acconto update to operations
      updateOperations.push(
         prisma.acconto.update({
            where: {
               id: data.id
            },
            data: {
               amount: newAmount,
               date: data.date ? new Date(data.date) : undefined,
               notes: data.notes !== undefined ? data.notes : undefined
            }
         })
      )

      // Execute all updates in a transaction
      const results = await prisma.$transaction(updateOperations, {
         timeout: 10000 // Increase timeout to 10 seconds
      })

      // The last result will be the updated acconto
      const updatedAcconto = results[results.length - 1]

      return NextResponse.json({
         success: true,
         data: updatedAcconto,
         message: "Acconto aggiornato con successo"
      })

   } catch (error) {
      console.error("Error updating acconto:", error)
      return NextResponse.json({ success: false, error: "Errore durante l'aggiornamento dell'acconto" }, { status: 500 })
   }
}

// DELETE handler - Delete an acconto
export async function DELETE(request) {
   try {
      // Get the authenticated session
      const session = await getServerSession(authOptions)

      // Check if the user is authenticated
      if (!session || !session.user) {
         return NextResponse.json({ success: false, error: "Non autenticato" }, { status: 401 })
      }

      // Get the request body
      const data = await request.json()

      // Validate required fields
      if (!data.id) {
         return NextResponse.json({ success: false, error: "ID dell'acconto mancante" }, { status: 400 })
      }

      // Check if the acconto exists and belongs to the user
      const existingAcconto = await prisma.acconto.findFirst({
         where: {
            id: data.id,
            userId: session.user.id
         }
      })

      if (!existingAcconto) {
         return NextResponse.json({ success: false, error: "Acconto non trovato o non autorizzato" }, { status: 404 })
      }

      // Start building transaction operations
      const updateOperations = []

      // Get unpaid salaries for the employee in descending order by date (newest first)
      const paidSalaries = await prisma.salary.findMany({
         where: {
            employeeId: existingAcconto.employeeId,
            userId: session.user.id,
            payedAmount: { gte: 0 }
         },
         orderBy: {
            workedDay: 'desc'
         }
      })

      // When deleting, reduce payments from most recent salaries
      let remainingReduction = existingAcconto.amount

      for (const salary of paidSalaries) {
         if (remainingReduction <= 0) break

         const currentPaid = salary.payedAmount
         const reductionAmount = Math.min(remainingReduction, currentPaid)

         if (reductionAmount > 0) {
            updateOperations.push(
               prisma.salary.update({
                  where: { id: salary.id },
                  data: {
                     payedAmount: currentPaid - reductionAmount,
                     isPaid: false
                  }
               })
            )

            remainingReduction -= reductionAmount
         }
      }

      // Add acconto deletion to operations
      updateOperations.push(
         prisma.acconto.delete({
            where: {
               id: data.id
            }
         })
      )

      // Execute all updates in a transaction
      await prisma.$transaction(updateOperations, {
         timeout: 10000 // Increase timeout to 10 seconds
      })

      return NextResponse.json({
         success: true,
         message: "Acconto eliminato con successo e pagamenti aggiornati"
      })

   } catch (error) {
      console.error("Error deleting acconto:", error)
      return NextResponse.json({ success: false, error: "Errore durante l'eliminazione dell'acconto" }, { status: 500 })
   }
}
