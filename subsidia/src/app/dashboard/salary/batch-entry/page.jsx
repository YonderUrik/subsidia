"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CalendarIcon, Save } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { paths } from "@/lib/paths"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function BatchEntryPage() {
   const [selectedEmployees, setSelectedEmployees] = useState([])
   const [dateRange, setDateRange] = useState({
      from: new Date(),
      to: addDays(new Date(), 0),
   })
   const [workType, setWorkType] = useState("fullDay")
   const [extras, setExtras] = useState(0)
   const [notes, setNotes] = useState("")
   const [isPaid, setIsPaid] = useState(false)
   const [isLoading, setIsLoading] = useState(false)

   const [employees, setEmployees] = useState([])
   const router = useRouter()

   useEffect(() => {
      const fetchEmployees = async () => {
         try {
            const response = await axios.get("/api/distinct-employees?isActive=true")
            const data = response.data
            setEmployees(data)
         } catch (error) {
            console.error("Error fetching employees:", error)
            toast.error(error.response.data.error || "Impossibile caricare gli operai. Riprova più tardi.")
         }
      }
      fetchEmployees()
   }, [])

   const handleEmployeeToggle = (employeeId) => {
      setSelectedEmployees((prev) =>
         prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
      )
   }

   const handleSelectAll = () => {
      if (selectedEmployees.length === employees.length) {
         setSelectedEmployees([])
      } else {
         setSelectedEmployees(employees.map((emp) => emp.id))
      }
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setIsLoading(true)

      try {
         const entries = []

         if (dateRange?.from && dateRange?.to) {
            let currentDate = new Date(dateRange.from)
            const endDate = new Date(dateRange.to)

            while (currentDate <= endDate) {
               for (const employeeId of selectedEmployees) {
                  const employee = employees.find((emp) => emp.id === employeeId)
                  if (employee) {
                     const salaryAmount = workType === "fullDay" ? employee.dailyRate : employee.halfDayRate
                     const total = salaryAmount + extras
                     entries.push({
                        employeeId,
                        workedDay: new Date(currentDate),
                        workType,
                        salaryAmount,
                        extras,
                        total,
                        payedAmount: isPaid ? total : 0,
                        isPaid,
                        notes,
                     })
                  }
               }
               currentDate = addDays(currentDate, 1)
            }
         }

         // Create all salary entries
         await Promise.all(
            entries.map((entry) =>
               axios.post("/api/salaries", entry)
            )
         )

         toast.success("Entrate di lavoro create con successo")

         router.push(paths.salary)
         router.refresh()

      } catch (error) {
         console.error("Error creating entries:", error)
         toast.error("Impossibile creare le entrate di lavoro. Riprova più tardi.")
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className="p-6 space-y-6">
         <div className="flex items-center gap-4">
            <Link href={paths.salary}>
               <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
               </Button>
            </Link>
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Aggiungi Giornate</h1>
            </div>
         </div>

         <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Employees selection */}
               <Card className="shadow-sm">
                  <CardHeader>
                     <CardTitle>Seleziona Operai</CardTitle>
                     <CardDescription>Scegli operai per aggiungere entrate di lavoro</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="w-12">
                                 <Checkbox
                                    checked={selectedEmployees.length === employees.length}
                                    onCheckedChange={handleSelectAll}
                                 />
                              </TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead>Tariffa Giornaliera</TableHead>
                              <TableHead>Tariffa Mezza Giornata</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {employees.map((employee) => (
                              <TableRow key={employee.id}>
                                 <TableCell>
                                    <Checkbox
                                       checked={selectedEmployees.includes(employee.id)}
                                       onCheckedChange={() => handleEmployeeToggle(employee.id)}
                                    />
                                 </TableCell>
                                 <TableCell>{employee.name}</TableCell>
                                 <TableCell>€{employee.dailyRate}</TableCell>
                                 <TableCell>€{employee.halfDayRate}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                     <div className="text-sm text-slate-500">{selectedEmployees.length} operai selezionati</div>
                  </CardFooter>
               </Card>

               {/* Work details */}
               <div className="space-y-6">
                  <Card className="shadow-sm">
                     <CardHeader>
                        <CardTitle>Dettagli Lavoro</CardTitle>
                        <CardDescription>Imposta le informazioni di lavoro per gli operai selezionati</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label>Periodo</Label>
                           <Popover>
                              <PopoverTrigger asChild>
                                 <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !dateRange && "text-slate-500")}
                                 >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                       dateRange.to ? (
                                          <>
                                             {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                          </>
                                       ) : (
                                          format(dateRange.from, "LLL dd, y")
                                       )
                                    ) : (
                                       <span>Scegli un periodo</span>
                                    )}
                                 </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                 <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                 />
                              </PopoverContent>
                           </Popover>
                        </div>

                        <div className="space-y-2">
                           <Label>Tipo di Lavoro</Label>
                           <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={workType}
                              onChange={(e) => setWorkType(e.target.value)}
                           >
                              <option value="fullDay">Giornata Intera</option>
                              <option value="halfDay">Mezza Giornata</option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="extras">Supplementi (€)</Label>
                           <Input
                              id="extras"
                              type="number"
                              min="0"
                              value={extras}
                              onChange={(e) => setExtras(Number(e.target.value))}
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="notes">Note</Label>
                           <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                           <Checkbox id="paid" checked={isPaid} onCheckedChange={(checked) => setIsPaid(checked === true)} />
                           <Label htmlFor="paid" className="font-normal">
                              Segna come pagato
                           </Label>
                        </div>
                     </CardContent>
                  </Card>

                  <div className="flex justify-between">
                     <Link href="/salary">
                        <Button variant="outline">Annulla</Button>
                     </Link>
                     <Button
                        type="submit"
                        disabled={selectedEmployees.length === 0 || !dateRange?.from || isLoading}
                     >
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? "Creazione..." : "Aggiungi"}
                     </Button>
                  </div>
               </div>
            </div>
         </form>
      </div>
   )
}
