"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
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
} from "date-fns"
import { paths } from "@/lib/paths"
import { toast } from "sonner"
import axios from "axios"
// Mock data for work entries
const workEntries = [
   {
      id: 1,
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: new Date(2023, 4, 1),
      type: "full",
      extras: 20,
      notes: "Worked on Project A",
      isPaid: true,
   },
   {
      id: 2,
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: new Date(2023, 4, 2),
      type: "half",
      extras: 0,
      notes: "Training session",
      isPaid: true,
   },
   {
      id: 3,
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: new Date(2023, 4, 3),
      type: "full",
      extras: 30,
      notes: "Overtime for deployment",
      isPaid: false,
   },
   {
      id: 4,
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: new Date(2023, 4, 1),
      type: "full",
      extras: 0,
      notes: "Team meeting",
      isPaid: true,
   },
   {
      id: 5,
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: new Date(2023, 4, 2),
      type: "full",
      extras: 50,
      notes: "Client presentation",
      isPaid: true,
   },
   {
      id: 6,
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: new Date(2023, 4, 3),
      type: "half",
      extras: 0,
      notes: "Documentation",
      isPaid: false,
   },
   {
      id: 7,
      employeeId: "EMP003",
      employeeName: "Michael Johnson",
      date: new Date(2023, 4, 1),
      type: "half",
      extras: 0,
      notes: "Design review",
      isPaid: true,
   },
   {
      id: 8,
      employeeId: "EMP003",
      employeeName: "Michael Johnson",
      date: new Date(2023, 4, 2),
      type: "full",
      extras: 25,
      notes: "Prototype creation",
      isPaid: false,
   },
   {
      id: 9,
      employeeId: "EMP003",
      employeeName: "Michael Johnson",
      date: new Date(2023, 4, 3),
      type: "full",
      extras: 0,
      notes: "User testing",
      isPaid: false,
   },
   {
      id: 10,
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: new Date(),
      type: "full",
      extras: 15,
      notes: "Current day entry",
      isPaid: false,
   },
   {
      id: 11,
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: new Date(),
      type: "half",
      extras: 10,
      notes: "Current day entry",
      isPaid: true,
   },
]


export default function CalendarPage() {
   const [currentDate, setCurrentDate] = useState(new Date())
   const [selectedEmployee, setSelectedEmployee] = useState(null)
   const [selectedDay, setSelectedDay] = useState(null)

   const [employees, setEmployees] = useState([])

   useEffect(() => {
      const fetchEmployees = async () => {
         try {
            const response = await axios.get('/api/distinct-employees')
            const data = response.data

            console.log(data)
            setEmployees(data)
         } catch (error) {
            toast.error("Errore nel caricamento dei dipendenti")
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
         const dateStr = format(entry.date, "yyyy-MM-dd")
         if (!acc[dateStr]) {
            acc[dateStr] = []
         }
         acc[dateStr].push(entry)
         return acc
      },
      {},
   )

   // Get entries for selected day
   const selectedDayEntries = selectedDay ? filteredEntries.filter((entry) => isSameDay(entry.date, selectedDay)) : []

   const handlePrevMonth = () => {
      setCurrentDate(subMonths(currentDate, 1))
      setSelectedDay(null)
   }

   const handleNextMonth = () => {
      setCurrentDate(addMonths(currentDate, 1))
      setSelectedDay(null)
   }

   const handleDayClick = (day) => {
      setSelectedDay(isSameDay(day, selectedDay) ? null : day)
   }

   return (
      <div className="p-6 space-y-6">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Calendario</h1>
            </div>
            <Link href={paths.salaryBatchEntry}>
               <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi giornate
               </Button>
            </Link>
         </div>

         <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/4 space-y-6">
               <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                              <ChevronLeft className="h-4 w-4" />
                           </Button>
                           <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
                           <Button variant="outline" size="icon" onClick={handleNextMonth}>
                              <ChevronRight className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-7 gap-px bg-slate-200 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                           <div key={day} className="p-2 font-medium bg-white">
                              {day}
                           </div>
                        ))}
                     </div>
                     <div className="grid grid-cols-7 gap-px bg-slate-200">
                        {calendarDays.map((day, i) => {
                           if (!day) return <div key={`empty-${i}`} className="bg-white p-2 h-24" />

                           const dateStr = format(day, "yyyy-MM-dd")
                           const dayEntries = entriesByDate[dateStr] || []
                           const isCurrentMonth = isSameMonth(day, currentDate)
                           const isCurrentDay = isToday(day)
                           const isSelected = selectedDay ? isSameDay(day, selectedDay) : false

                           return (
                              <div
                                 key={dateStr}
                                 className={`bg-white p-2 h-24 overflow-hidden transition-colors ${!isCurrentMonth ? "text-slate-400" : ""
                                    } ${isCurrentDay ? "border-2 border-blue-500" : ""} ${isSelected ? "bg-blue-50" : ""
                                    } hover:bg-slate-50 cursor-pointer`}
                                 onClick={() => handleDayClick(day)}
                              >
                                 <div className="font-medium">{format(day, "d")}</div>
                                 <div className="mt-1 space-y-1">
                                    {dayEntries.slice(0, 2).map((entry) => (
                                       <div
                                          key={entry.id}
                                          className={`text-xs truncate rounded px-1 py-0.5 ${entry.type === "full" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                             } ${entry.isPaid ? "border-l-2 border-green-500" : "border-l-2 border-red-500"}`}
                                       >
                                          {entry.employeeName}
                                       </div>
                                    ))}
                                    {dayEntries.length > 2 && (
                                       <div className="text-xs text-slate-500">+{dayEntries.length - 2} more</div>
                                    )}
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </CardContent>
               </Card>
            </div>

            <div className="w-full md:w-1/4 space-y-6">
               <Card className="shadow-sm">
                  <CardHeader>
                     <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Employee</label>
                        <Select
                           value={selectedEmployee || "all"}
                           onValueChange={(value) => setSelectedEmployee(value === "all" ? null : value)}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="All Employees" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Employees</SelectItem>
                              {employees.map((employee) => (
                                 <SelectItem key={employee.id} value={employee.id}>
                                    {employee.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  </CardContent>
               </Card>

               {selectedDay && (
                  <Card className="shadow-sm">
                     <CardHeader>
                        <CardTitle>{format(selectedDay, "MMMM d, yyyy")}</CardTitle>
                        <CardDescription>
                           {selectedDayEntries.length} work {selectedDayEntries.length === 1 ? "entry" : "entries"}
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        {selectedDayEntries.length > 0 ? (
                           <div className="space-y-4">
                              {selectedDayEntries.map((entry) => (
                                 <div key={entry.id} className="border rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                       <div className="font-medium">{entry.employeeName}</div>
                                       <Badge variant={entry.isPaid ? "default" : "outline"}>
                                          {entry.isPaid ? "Paid" : "Unpaid"}
                                       </Badge>
                                    </div>
                                    <div className="text-sm">
                                       <span className="text-slate-500">Type:</span>{" "}
                                       <span className="capitalize">{entry.type} day</span>
                                    </div>
                                    {entry.extras > 0 && (
                                       <div className="text-sm">
                                          <span className="text-slate-500">Extras:</span> ${entry.extras}
                                       </div>
                                    )}
                                    {entry.notes && (
                                       <div className="text-sm">
                                          <span className="text-slate-500">Notes:</span> {entry.notes}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center py-4 text-slate-500">No work entries for this day</div>
                        )}
                     </CardContent>
                  </Card>
               )}

               <Card className="shadow-sm">
                  <CardHeader>
                     <CardTitle>Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded bg-green-100"></div>
                           <span className="text-sm">Full Day</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded bg-yellow-100"></div>
                           <span className="text-sm">Half Day</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded border-l-2 border-green-500"></div>
                           <span className="text-sm">Paid</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded border-l-2 border-red-500"></div>
                           <span className="text-sm">Unpaid</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   )
}
