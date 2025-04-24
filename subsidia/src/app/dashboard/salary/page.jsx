"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Plus, Search } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { paths } from "@/lib/paths"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { toast } from "sonner"
import { debounce } from "lodash"

const months = [
   "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
   "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
]

export default function SalaryPage() {
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
   const [periodType, setPeriodType] = useState("month") // month, year, all
   const [year, setYear] = useState(new Date().getFullYear())
   const [searchTerm, setSearchTerm] = useState("")
   const [salaries, setSalaries] = useState([])
   const [totalPayed, setTotalPayed] = useState(0)
   const [totalToPay, setTotalToPay] = useState(0)
   const [years, setYears] = useState([])
   const [groupBy, setGroupBy] = useState("day") // employee, month, year
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)

   const getSalaries = useCallback(async (search) => {
      setIsLoading(true)
      setError(null)
      try {
         const response = await axios.get('/api/salaries', {
            params: {
               periodRange: periodType,
               year: parseInt(year),
               month: parseInt(selectedMonth) + 1,
               search: search,
               groupBy: groupBy
            }
         })

         setSalaries(response.data.data)
         setTotalPayed(response.data.totalPayed)
         setTotalToPay(response.data.totalToPay)
         setYears(response.data.years)
         setYear(response.data.years[0])
      } catch (error) {
         setError(error.response?.data?.error || "Errore nel caricamento delle giornate")
         toast.error(error.response?.data?.error || "Errore nel caricamento delle giornate")
      } finally {
         setIsLoading(false)
      }
   }, [periodType, year, selectedMonth, groupBy])

   const debouncedSearch = useMemo(
      () => debounce((search) => getSalaries(search), 500),
      [getSalaries]
   )

   useEffect(() => {
      debouncedSearch(searchTerm)
      return () => {
         debouncedSearch.cancel()
      }
   }, [debouncedSearch, searchTerm])

   return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
         {/* ACTIONS */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Giornate</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
               <Link href={paths.calendar} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     Calendario
                  </Button>
               </Link>
               <Link href={paths.salaryBatchEntry} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                     <Plus className="mr-2 h-4 w-4" />
                     Aggiungi Giornate
                  </Button>
               </Link>
            </div>
         </div>

         {/* TOTALS */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-white/40">
               <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-slate-500">Totale pagato</p>
                     <p className="text-lg font-semibold">€{totalPayed.toLocaleString()}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-white/40">
               <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-slate-500">Da pagare</p>
                     <p className="text-lg font-semibold">€{totalToPay.toLocaleString()}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="sm:col-span-2 bg-white/40">
               <CardContent className="py-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                     <Select value={periodType} onValueChange={setPeriodType}>
                        <SelectTrigger className="h-8 w-full sm:w-auto">
                           <SelectValue placeholder="Tipo periodo" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="month">Mese specifico</SelectItem>
                           <SelectItem value="year">Anno intero</SelectItem>
                           <SelectItem value="all">Tutti i periodi</SelectItem>
                        </SelectContent>
                     </Select>

                     {periodType !== "all" && (
                        <Select value={year} onValueChange={setYear}>
                           <SelectTrigger className="h-8 w-full sm:w-auto">
                              <SelectValue placeholder="Anno" />
                           </SelectTrigger>
                           <SelectContent>
                              {years.map((y) => (
                                 <SelectItem key={y} value={y}>{y}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}

                     {periodType === "month" && (
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                           <SelectTrigger className="h-8 w-full sm:w-auto">
                              <SelectValue placeholder="Mese" />
                           </SelectTrigger>
                           <SelectContent>
                              {months.map((month, index) => (
                                 <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
               <Tabs value={groupBy} onValueChange={setGroupBy} defaultValue="day" className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
                     <TabsTrigger value="day">Giorno</TabsTrigger>
                     <TabsTrigger value="week">Settimana</TabsTrigger>
                     <TabsTrigger value="month">Mese</TabsTrigger>
                     <TabsTrigger value="year">Anno</TabsTrigger>
                  </TabsList>
               </Tabs>
               <div className="relative flex-1 max-w-sm w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                     type="search"
                     placeholder="Cerca operai..."
                     className="pl-8 w-full"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <Card className="shadow-sm overflow-hidden">
               <CardContent className="p-0 overflow-x-auto">
                  {isLoading ? (
                     <div className="flex items-center justify-center p-8 text-slate-500">
                        Caricamento in corso...
                     </div>
                  ) : error ? (
                     <div className="flex items-center justify-center p-8 text-red-500">
                        {error}
                     </div>
                  ) : salaries.length === 0 ? (
                     <div className="flex items-center justify-center p-8 text-slate-500">
                        Nessuna giornata trovata per il periodo selezionato
                     </div>
                  ) : (
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Operaio</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Base</TableHead>
                              <TableHead>Extra</TableHead>
                              <TableHead>Stato</TableHead>
                              <TableHead className="text-right">Totale</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {salaries.map((salary) => (
                              <TableRow key={salary.id}>
                                 <TableCell className="whitespace-nowrap">{salary.employee.name}</TableCell>
                                 <TableCell className="whitespace-nowrap">
                                    {groupBy === 'day' ? 
                                       (() => {
                                          try {
                                             return format(new Date(salary.workedDay), "dd/MM/yyyy")
                                          } catch (e) {
                                             return "Data Non Valida"
                                          }
                                       })() 
                                       : String(salary.workedDay)}
                                 </TableCell>
                                 <TableCell>{groupBy === 'day' ? (salary.workType === 'fullDay' ? 'Giornata' : 'Mezza') : '-'}</TableCell>
                                 <TableCell>€{salary.salaryAmount}</TableCell>
                                 <TableCell>€{salary.extras}</TableCell>
                                 <TableCell>
                                    <Badge
                                       variant="outline"
                                       className={salary.payedAmount >= salary.total ?
                                          "bg-green-50 text-green-700 border-green-200" :
                                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                                       }
                                    >
                                       {salary.payedAmount >= salary.total ?
                                          `€${salary.payedAmount}` :
                                          `€${(salary.total - salary.payedAmount).toFixed(2)}`
                                       }
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-right font-medium">€{salary.total}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
   )
}
