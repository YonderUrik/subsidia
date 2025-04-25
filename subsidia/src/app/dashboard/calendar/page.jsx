"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"
import {
   format,
   startOfMonth,
   endOfMonth,
   eachDayOfInterval,
   getDay,
   addMonths,
   subMonths,
   isSameMonth,
   isToday,
   isSameDay,
   parseISO,
} from "date-fns"
import { paths } from "@/lib/paths"
import { toast } from "sonner"
import axios from "axios"

export default function CalendarPage() {
   const [currentDate, setCurrentDate] = useState(new Date())
   const [selectedEmployee, setSelectedEmployee] = useState(null)
   const [selectedDay, setSelectedDay] = useState(null)
   const [viewMode, setViewMode] = useState("month") // month or list
   const [isLoading, setIsLoading] = useState(true)
   const [employees, setEmployees] = useState([])
   const [workEntries, setWorkEntries] = useState([])

   const getWorkEntries = useCallback(async () => {
      try {
         setIsLoading(true)
         const response = await axios.get('/api/salaries', {
            params: {
               periodRange: "month",
               year: currentDate.getFullYear(),
               month: currentDate.getMonth() + 1
            }
         })
         const data = response.data

         setWorkEntries(data.data)
      } catch (error) {
         toast.error(error.response?.data?.message || error.response?.data?.error || "Errore nel caricamento delle giornate")
      } finally {
         setIsLoading(false)
      }
   }, [currentDate])

   useEffect(() => {
      getWorkEntries()
   }, [getWorkEntries])

   useEffect(() => {
      const fetchEmployees = async () => {
         try {
            const response = await axios.get('/api/distinct-employees')
            const data = response.data

            setEmployees(data)
         } catch (error) {
            toast.error("Errore nel caricamento dei operai")
         }
      }
      fetchEmployees()
   }, [])

   // Filter entries based on selected employee
   const filteredEntries = selectedEmployee
      ? workEntries.filter((entry) => entry.employeeId === selectedEmployee)
      : workEntries

   // Get days for the current month
   const monthStart = startOfMonth(currentDate)
   const monthEnd = endOfMonth(currentDate)
   const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

   // Get the day of the week the month starts on (0 = Sunday, 6 = Saturday)
   const startDay = getDay(monthStart)

   // Create calendar grid with empty cells for days before the month starts
   const calendarDays = Array(startDay).fill(null).concat(monthDays)

   // Group entries by date
   const entriesByDate = filteredEntries.reduce(
      (acc, entry) => {
         const dateStr = format(new Date(entry.workedDay), "yyyy-MM-dd")
         if (!acc[dateStr]) {
            acc[dateStr] = []
         }
         acc[dateStr].push(entry)
         return acc
      },
      {},
   )

   // Get entries for selected day
   const selectedDayEntries = selectedDay ? filteredEntries.filter((entry) => isSameDay(new Date(entry.workedDay), selectedDay)) : []

   const handlePrevMonth = () => {
      setCurrentDate(subMonths(currentDate, 1))
      setSelectedDay(null)
   }

   const handleNextMonth = () => {
      setCurrentDate(addMonths(currentDate, 1))
      setSelectedDay(null)
   }

   const handleToday = () => {
      setCurrentDate(new Date())
      setSelectedDay(null)
   }

   const handleDayClick = (day) => {
      setSelectedDay(isSameDay(day, selectedDay) ? null : day)
   }

   return (
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Calendario</h1>
            </div>
            <div className="flex flex-wrap gap-2">
               <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "month" ? "list" : "month")}>
                  {viewMode === "month" ? "Vista Lista" : "Vista Mese"}
               </Button>
               <Link href={paths.salaryBatchEntry}>
                  <Button size="sm">
                     <Plus className="mr-2 h-4 w-4" />
                     Aggiungi Giornate
                  </Button>
               </Link>
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="w-full md:w-3/4 space-y-4 sm:space-y-6">
               <Card className="shadow-sm">
                  <CardHeader className="pb-2 sm:pb-3">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                           <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                              <ChevronLeft className="h-4 w-4" />
                           </Button>
                           <h2 className="text-lg sm:text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
                           <Button variant="outline" size="icon" onClick={handleNextMonth}>
                              <ChevronRight className="h-4 w-4" />
                           </Button>
                           <Button variant="outline" size="sm" onClick={handleToday} className="ml-2">
                              Oggi
                           </Button>
                        </div>
                        <div className="flex justify-end">
                           <Select
                              value={selectedEmployee || "all"}
                              onValueChange={(value) => setSelectedEmployee(value === "all" ? null : value)}
                           >
                              <SelectTrigger className="w-[180px]">
                                 <SelectValue placeholder="Tutti gli operai" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">Tutti gli operai</SelectItem>
                                 {[...employees].sort((a, b) => a.name.localeCompare(b.name)).map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                       {employee.name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                        </div>
                     ) : viewMode === "month" ? (
                        <>
                           <div className="grid grid-cols-7 gap-px bg-slate-200 text-center">
                              {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map((day) => (
                                 <div key={day} className="p-2 font-medium bg-white">
                                    {day}
                                 </div>
                              ))}
                           </div>
                           <div className="grid grid-cols-7 gap-px bg-slate-200">
                              {calendarDays.map((day, i) => {
                                 if (!day) return <div key={`empty-${i}`} className="bg-white p-1 sm:p-2 min-h-16 sm:min-h-24" />

                                 const dateStr = format(day, "yyyy-MM-dd")
                                 const dayEntries = entriesByDate[dateStr] || []
                                 const isCurrentMonth = isSameMonth(day, currentDate)
                                 const isCurrentDay = isToday(day)
                                 const isSelected = selectedDay ? isSameDay(day, selectedDay) : false

                                 return (
                                    <div
                                       key={dateStr}
                                       className={`bg-white p-1 sm:p-2 min-h-16 sm:min-h-24 overflow-hidden transition-colors ${!isCurrentMonth ? "text-slate-400" : ""
                                          } ${isCurrentDay ? "border-2 border-blue-500" : ""} ${isSelected ? "bg-blue-50" : ""
                                          } hover:bg-slate-50 cursor-pointer relative`}
                                       onClick={() => handleDayClick(day)}
                                    >
                                       <div className="font-medium">{format(day, "d")}</div>
                                       {dayEntries.length > 0 && (
                                          <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                             {dayEntries.length}
                                          </div>
                                       )}
                                       <div className="mt-1 space-y-1 hidden sm:block">
                                          {dayEntries.slice(0, 2).map((entry) => (
                                             <div
                                                key={entry.id}
                                                className={`text-xs truncate rounded px-1 py-0.5 ${entry.workType === "fullDay" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                   } ${entry.isPaid ? "border-l-2 border-green-500" : "border-l-2 border-red-500"}`}
                                             >
                                                {entry.employee.name}
                                             </div>
                                          ))}
                                          {dayEntries.length > 2 && (
                                             <div className="text-xs text-slate-500">+{dayEntries.length - 2} altro</div>
                                          )}
                                       </div>
                                    </div>
                                 )
                              })}
                           </div>
                        </>
                     ) : (
                        <div className="space-y-2">
                           {Object.entries(entriesByDate).length > 0 ? (
                              Object.entries(entriesByDate)
                                 .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                                 .map(([dateStr, entries]) => (
                                    <div key={dateStr} className="border rounded-lg p-3">
                                       <div
                                          className="font-medium flex items-center gap-2 cursor-pointer"
                                          onClick={() => handleDayClick(parseISO(dateStr))}
                                       >
                                          <CalendarIcon className="h-4 w-4" />
                                          {format(parseISO(dateStr), "EEEE d MMMM yyyy")}
                                          <Badge className="ml-2">{entries.length}</Badge>
                                       </div>
                                       {isSameDay(parseISO(dateStr), selectedDay) && (
                                          <div className="mt-2 space-y-2 pl-6">
                                             {entries.map((entry) => (
                                                <div key={entry.id} className="text-sm border-l-2 pl-2 py-1">
                                                   <div className="flex items-center justify-between">
                                                      <span className="font-medium">{entry.employee.name}</span>
                                                      <Badge variant="outline" className={entry.isPaid ?
                                                         "bg-green-50 text-green-700 border-green-200 whitespace-nowrap" :
                                                         "bg-red-50 text-red-700 border-red-200 whitespace-nowrap"
                                                      }>
                                                         {entry.isPaid ? "Pagato" : "Non pagato"}
                                                      </Badge>
                                                   </div>
                                                   <div className="text-sm text-slate-600">
                                                      {entry.workType === "fullDay" ? "Giornata intera" : "Mezza giornata"} - €{entry.total}
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 ))
                           ) : (
                              <div className="text-center py-8 text-slate-500">
                                 Nessuna giornata per questo mese
                              </div>
                           )}
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            <div className="w-full md:w-1/4 space-y-4 sm:space-y-6">
               {/* GIORNO SELEZIONATO */}
               {selectedDay && (
                  <Card className="shadow-sm">
                     <CardHeader>
                        <CardTitle>{format(selectedDay, "d MMMM yyyy")}</CardTitle>
                        <CardDescription>
                           {selectedDayEntries.length} {selectedDayEntries.length === 1 ? "giornata" : "giornate"}
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        {selectedDayEntries.length > 0 ? (
                           <div className="space-y-3">
                              {selectedDayEntries.map((entry) => (
                                 <div key={entry.id} className="border rounded-lg p-3 space-y-2 transition-all hover:shadow-sm">
                                    <div className="flex items-center justify-between">
                                       <div className="font-medium">{entry.employee.name}</div>
                                       <Badge variant="outline" className={entry.isPaid ?
                                          "bg-green-50 text-green-700 border-green-200 whitespace-nowrap" :
                                          "bg-red-50 text-red-700 border-red-200 whitespace-nowrap"
                                       }>
                                          {entry.isPaid ? "Pagato" : "Non pagato"}
                                       </Badge>
                                    </div>
                                    <div className="text-sm">
                                       <span className="text-slate-500">Tipo:</span>{" "}
                                       <span className="capitalize">{entry.workType === "fullDay" ? "Giornata intera" : "Mezza giornata"}</span>
                                    </div>
                                    <div className="text-sm">
                                       <span className="text-slate-500">Totale:</span> €{entry.total}
                                    </div>
                                    {entry.extras > 0 && (
                                       <div className="text-sm">
                                          <span className="text-slate-500">Extra:</span> €{entry.extras}
                                       </div>
                                    )}
                                    {entry.notes && (
                                       <div className="text-sm">
                                          <span className="text-slate-500">Note:</span> {entry.notes}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center py-4 text-slate-500">Nessuna giornata per questo giorno</div>
                        )}
                     </CardContent>
                  </Card>
               )}

               <Card className="shadow-sm">
                  <CardHeader>
                     <CardTitle>Legenda</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded bg-green-100"></div>
                           <span className="text-sm">Giornata intera</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded bg-yellow-100"></div>
                           <span className="text-sm">Mezza giornata</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded border-l-2 border-green-500"></div>
                           <span className="text-sm">Pagato</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded border-l-2 border-red-500"></div>
                           <span className="text-sm">Non pagato</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   )
}
