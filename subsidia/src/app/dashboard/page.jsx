'use client'
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { paths } from "@/lib/paths"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import axios from "axios"
import { formatNumber } from "@/lib/utils"
export default function DashboardPage() {
   const { data: session, status } = useSession()

   useEffect(() => {
      if (status === "loading") {
         return
      }
      if (status === "unauthenticated") {
         redirect(paths.login)
      }
   }, [status, session])

   const [employeesStats, setEmployeesStats] = useState({
      activeEmployees: 0,
      totalSalaries: 0,
      totalToPay: 0
   })
   const [employeesStatsLoading, setEmployeesStatsLoading] = useState(false)

   const getEmployeesStats = useCallback(async () => {
      try{
         setEmployeesStatsLoading(true)
         const response = await axios.get('/api/employees-stats')
         const data = await response.data
         setEmployeesStats(data)
         setEmployeesStatsLoading(false)
      }catch(error){
         console.error("Error fetching employees stats:", error)
         setEmployeesStatsLoading(false)
      }
   }, [])

   useEffect(() => {
      getEmployeesStats()
   }, [getEmployeesStats])


   return (

      <div className="flex flex-col px-6 space-y-6">
         {/* Main Modules */}
         <h2 className="text-xl font-semibold tracking-tight mt-6 text-slate-900">Moduli</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Users className="h-5 w-5 text-blue-600" />
                     Gestione Paghe
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Operai attivi</span>
                        {employeesStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-slate-200" />
                        ) : (
                           <span className="font-medium text-emerald-600">{employeesStats.activeEmployees}</span>
                        )}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Giornate totali</span>
                        {employeesStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-slate-200" />
                        ) : (
                           <span className="font-medium text-blue-600">{employeesStats.totalSalaries}</span>
                        )}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Totale da pagare</span>
                        {employeesStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-slate-200" />
                        ) : (
                           <span className="font-semibold text-lg text-rose-600">{formatNumber(employeesStats.totalToPay)}</span>
                        )}
                     </div>
                  </div>
               </CardContent>
               <CardFooter>
                  <Link href={paths.salaryBatchEntry} className="w-full">
                     <Button className="w-full hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Aggiungi Giornata
                     </Button>
                  </Link>
               </CardFooter>
            </Card>


         </div>
      </div>
   )
}