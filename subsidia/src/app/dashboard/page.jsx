'use client'
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { paths } from "@/lib/paths"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Sprout, Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import axios from "axios"
import { formatNumber } from "@/lib/utils"

export default function DashboardPage() {
   const { data: session, status } = useSession()
   const currentYear = new Date().getFullYear()

   useEffect(() => {
      if (status === "loading") {
         return
      }
      if (status === "unauthenticated") {
         redirect(paths.login)
      }
   }, [status, session])

   const [selectedYear, setSelectedYear] = useState(String(currentYear))
   const [availableYears, setAvailableYears] = useState([String(currentYear)])

   const [employeesStats, setEmployeesStats] = useState({
      activeEmployees: 0,
      totalSalaries: 0,
      totalToPay: 0
   })

   const [employeesStatsLoading, setEmployeesStatsLoading] = useState(false)

   const getEmployeesStats = useCallback(async (year) => {
      try {
         setEmployeesStatsLoading(true)
         const response = await axios.get('/api/employees-stats', {
            params: { year }
         })
         const data = response.data
         setEmployeesStats(data)
         if (data.years && data.years.length > 0) {
            const merged = Array.from(new Set([...data.years.map(String), String(currentYear)]))
            setAvailableYears(merged.sort((a, b) => b - a))
         }
         setEmployeesStatsLoading(false)
      } catch (error) {
         console.error("Error fetching employees stats:", error)
         setEmployeesStatsLoading(false)
      }
   }, [currentYear])

   const [harvestStats, setHarvestStats] = useState({
      totalHectares: 0,
      totalHarvested: 0,
      totalRevenue: 0
   })

   const [harvestStatsLoading, setHarvestStatsLoading] = useState(false)

   const getHarvestStats = useCallback(async () => {
      try {
         setHarvestStatsLoading(true)
         const response = await axios.get('/api/harvest-stats')
         const data = await response.data
         setHarvestStats(data)
         setHarvestStatsLoading(false)
      } catch (error) {
         console.error("Error fetching harvest stats:", error)
         setHarvestStatsLoading(false)
      }
   }, [])


   useEffect(() => {
      if (status !== "authenticated") return
      getEmployeesStats(selectedYear)
      getHarvestStats()
   }, [getHarvestStats, status]) // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
      if (status !== "authenticated") return
      getEmployeesStats(selectedYear)
   }, [selectedYear]) // eslint-disable-line react-hooks/exhaustive-deps

   return (

      <div className="flex flex-col px-6 space-y-6">
         {/* Main Modules */}
         <h2 className="text-xl font-semibold tracking-tight mt-6 text-foreground">Moduli</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Gestione Paghe */}
            <Card className="hover:shadow-md transition-shadow">
               <CardHeader>
                  <div className="flex items-center justify-between">
                     <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Gestione Paghe
                     </CardTitle>
                     <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                           <SelectValue placeholder="Anno" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">Tutti i periodi</SelectItem>
                           {availableYears.map((y) => (
                              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Operai attivi</span>
                        {employeesStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                        ) : (
                           <span className="font-medium ">{employeesStats.activeEmployees}</span>
                        )}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Giornate totali</span>
                        {employeesStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                        ) : (
                           <span className="font-medium">{employeesStats.totalSalaries}</span>
                        )}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Totale da pagare</span>
                        {employeesStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                        ) : (
                           <span className="font-semibold text-lg text-red-600 dark:text-red-400">{formatNumber(employeesStats.totalToPay)}</span>
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

            {/* Gestione Raccolti */}
            <Card className="hover:shadow-md transition-shadow">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Sprout className="h-5 w-5 text-primary" />
                     Gestione Raccolti {currentYear}
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Terreni coltivati</span>
                        {harvestStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                        ) : (
                           <span className="font-medium ">{formatNumber(harvestStats.cultivatedArea, false)} Ha</span>
                        )}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tot. Raccolto</span>
                        {harvestStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                        ) : (
                           <span className="font-medium ">{formatNumber(harvestStats.totalHarvested, false)} Kg</span>
                        )}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tot. Guadagnato</span>
                        {harvestStatsLoading ? (
                           <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                        ) : (
                           <span className="font-semibold text-lg text-green-600 dark:text-green-400">{formatNumber(harvestStats.totalEarned)}</span>
                        )}
                     </div>
                  </div>
               </CardContent>
               <CardFooter>
                  <Link href={paths.new_harvest} className="w-full">
                     <Button className="w-full hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Aggiungi Raccolto
                     </Button>
                  </Link>
               </CardFooter>
            </Card>

         </div>
      </div>
   )
}
