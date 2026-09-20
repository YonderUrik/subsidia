// One-off reconciliation: some employees have acconti (advance payments) whose total
// exceeds the sum of payedAmount across their salaries. That gap is money already paid
// but never attributed to a specific unpaid workday (e.g. an acconto amount was edited
// after being distributed). This script sweeps that floating credit onto the oldest
// unpaid salaries, oldest workedDay first, the same way new-salary credit consumption
// already works in POST /api/salaries.
//
// Usage: node scripts/reconcile-salary-credit.mjs [--dry-run]

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

const employees = await prisma.employee.findMany({
   include: { salaries: true, acconti: true }
})

let totalReconciled = 0
let employeesAffected = 0

for (const employee of employees) {
   const totalAcconti = employee.acconti.reduce((sum, a) => sum + a.amount, 0)
   const totalPayed = employee.salaries.reduce((sum, s) => sum + (s.payedAmount || 0), 0)
   let floatingCredit = totalAcconti - totalPayed

   if (floatingCredit <= 0) continue

   const unpaidSalaries = employee.salaries
      .filter(s => !s.isPaid)
      .sort((a, b) => new Date(a.workedDay) - new Date(b.workedDay))

   if (unpaidSalaries.length === 0) continue

   employeesAffected++
   console.log(`\n${employee.name} (${employee.id}): floating credit ${floatingCredit}`)

   const updates = []
   for (const salary of unpaidSalaries) {
      if (floatingCredit <= 0) break

      const unpaidAmount = salary.total - salary.payedAmount
      const toApply = Math.min(floatingCredit, unpaidAmount)
      if (toApply <= 0) continue

      const newPayedAmount = salary.payedAmount + toApply
      const newIsPaid = newPayedAmount >= salary.total

      console.log(`  ${salary.workedDay.toISOString().slice(0, 10)}: +${toApply} -> payed ${newPayedAmount}/${salary.total} isPaid=${newIsPaid}`)

      updates.push(
         prisma.salary.update({
            where: { id: salary.id },
            data: { payedAmount: newPayedAmount, isPaid: newIsPaid }
         })
      )

      floatingCredit -= toApply
      totalReconciled += toApply
   }

   if (!dryRun && updates.length > 0) {
      await prisma.$transaction(updates)
   }

   if (floatingCredit > 0) {
      console.log(`  remaining unattributed credit after sweep: ${floatingCredit} (no more unpaid salaries to apply it to)`)
   }
}

console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done. ${employeesAffected} employees affected, ${totalReconciled} total reconciled.`)

await prisma.$disconnect()
