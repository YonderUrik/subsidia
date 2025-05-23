"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowLeft, CalendarIcon, Edit, Loader2, Trash, DollarSign, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import axios from "axios"
import { paths } from "@/lib/paths"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatNumber } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dayjs from "dayjs"
import { DatePicker } from "@/components/ui/date-picker"

export default function EmployeeDetailsPage() {
   const params = useParams()
   const router = useRouter()
   const id = params.id
   const [employee, setEmployee] = useState(null)

   const [error, setError] = useState(null)
   const [isLoading, setIsLoading] = useState(true)

   // Add pagination state
   const [historyPage, setHistoryPage] = useState(1)
   const [historyPageSize, setHistoryPageSize] = useState(10)
   const [accontiPage, setAccontiPage] = useState(1)
   const [accontiPageSize, setAccontiPageSize] = useState(10)

   const fetchEmployee = useCallback(async () => {
      try {
         const response = await axios.get(`/api/employees?id=${id}&historyPage=${historyPage}&historyPageSize=${historyPageSize}&accontiPage=${accontiPage}&accontiPageSize=${accontiPageSize}`)
         setEmployee(response.data.data)
         setIsLoading(false)
      } catch (error) {
         setEmployee(null)
         setError(error.response.data.message || error.response.data.error || "Errore nel caricamento dei dati dell'operaio")
         setIsLoading(false)
      }
   }, [id, historyPage, historyPageSize, accontiPage, accontiPageSize])

   useEffect(() => {
      fetchEmployee()
   }, [fetchEmployee])

   const [newWorkEntry, setNewWorkEntry] = useState({
      workedDay: new Date().toISOString().split("T")[0],
      workType: "fullDay",
      salaryAmount: employee?.dailyRate,
      extras: 0,
      total: employee?.dailyRate,
      payedAmount: 0,
      isPaid: false,
      notes: "",
   })

   useEffect(() => {
      setNewWorkEntry((prev) => ({
         ...prev,
         workedDay: new Date().toISOString().split("T")[0],
         workType: "fullDay",
         salaryAmount: employee?.dailyRate,
         total: employee?.dailyRate,
      }))
   }, [employee])

   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [isDeleting, setIsDeleting] = useState(false)
   const [isDeleted, setIsDeleted] = useState(false)

   const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false)
   const [isTogglingStatus, setIsTogglingStatus] = useState(false)
   const [isAddingWorkEntry, setIsAddingWorkEntry] = useState(false)

   // Payment dialog states
   const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
   const [paymentAmount, setPaymentAmount] = useState(0)
   const [isProcessingPayment, setIsProcessingPayment] = useState(false)
   const [selectedEntryId, setSelectedEntryId] = useState(null)
   const [paymentType, setPaymentType] = useState("acconto") // "acconto" or "full"
   const [paymentNote, setPaymentNote] = useState("")

   // New Acconto state
   const [newAcconto, setNewAcconto] = useState({
      date: dayjs().format(),
      amount: 0,
      notes: ""
   })

   // Acconto dialog state
   const [isAccontoDialogOpen, setIsAccontoDialogOpen] = useState(false)
   const [isAddingAcconto, setIsAddingAcconto] = useState(false)
   const [accontoToEdit, setAccontoToEdit] = useState(null)

   const handleDelete = async () => {
      setIsDeleting(true)

      try {
         const response = await axios.delete('/api/employees', {
            data: { id }
         })

         if (response.data.success) {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
            setIsDeleted(true)

            // Redirect after showing success message
            setTimeout(() => {
               router.push(paths.employees)
            }, 1500)
         }
      } catch (error) {
         setIsDeleting(false)
         toast.error(error.response.data.message || error.response.data.error || "Errore durante l'eliminazione dell'operaio")
      }
   }

   const handleToggleStatus = async () => {
      setIsTogglingStatus(true)

      try {
         const response = await axios.patch('/api/employees', {
            id: employee.id,
            isActive: employee.isActive // If disabled is true, we want to make it active
         })

         if (response.data.success) {
            setIsTogglingStatus(false)
            setIsDisableDialogOpen(false)


            // Update local state with response data
            setEmployee(prev => ({
               ...prev,
               isActive: !prev.isActive
            }))

            toast.success("Stato aggiornato con successo")


         }
      } catch (error) {
         setIsTogglingStatus(false)
         toast.error(error.response.data.message || error.response.data.error || "Errore durante l'aggiornamento dello stato dell'opario")
      }
   }

   const handleAddWorkEntry = async (e) => {
      e.preventDefault()
      setIsAddingWorkEntry(true)

      try {
         const response = await axios.post('/api/salaries', {
            employeeId: id,
            workedDay: newWorkEntry.workedDay,
            workType: newWorkEntry.workType,
            salaryAmount: newWorkEntry.salaryAmount,
            extras: newWorkEntry.extras,
            total: newWorkEntry.total,
            payedAmount: newWorkEntry.payedAmount,
            isPaid: newWorkEntry.isPaid,
            notes: newWorkEntry.notes
         })

         if (response.data.success) {
            // Update employee data with new work entry and sort by workedDay
            fetchEmployee()

            // Reset form
            setNewWorkEntry({
               workedDay: new Date().toISOString().split("T")[0],
               workType: "fullDay",
               salaryAmount: employee?.dailyRate,
               extras: 0,
               total: employee?.dailyRate,
               payedAmount: 0,
               isPaid: false,
               notes: "",
            })
         }
      } catch (error) {
         toast.error(error.response.data.message || error.response.data.error || "Errore durante l'aggiunta della giornata lavorativa")
      } finally {
         setIsAddingWorkEntry(false)
      }
   }

   const openPaymentDialog = (entryId = null, type = "acconto") => {
      setSelectedEntryId(entryId)
      setPaymentType(type)
      setPaymentNote("")

      if (type === "full") {
         if (entryId) {
            // For a specific entry, set the remaining amount for that entry
            const entry = employee.workHistory.find(e => e.id === entryId)
            if (entry) {
               setPaymentAmount(entry.total - entry.payedAmount)
            }
         } else {
            // For full payment of all, set the total remaining
            setPaymentAmount(employee.toPay)
         }
      } else {
         // For acconto, start with 0
         setPaymentAmount(0)
      }

      setIsPaymentDialogOpen(true)
   }

   const handleProcessPayment = async () => {
      setIsProcessingPayment(true)

      try {
         const response = await axios.patch('/api/salaries', {
            salaryId: selectedEntryId,
            employeeId: id,
            paymentAmount: paymentAmount,
            notes: paymentNote
         })

         if (response.data.success) {
            // Refresh employee data
            fetchEmployee()
            setIsPaymentDialogOpen(false)


            // Show success message with acconto details
            toast.success("Pagamento registrato con successo")


         }
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore durante il pagamento")
      } finally {
         setIsProcessingPayment(false)
      }
   }

   // Function to handle saving an acconto
   const handleSaveAcconto = async () => {
      setIsAddingAcconto(true)

      try {
         if (accontoToEdit) {
            // Update existing acconto
            const response = await axios.patch('/api/acconti', {
               id: accontoToEdit.id,
               amount: newAcconto.amount,
               date: dayjs(newAcconto.date).format(),
               notes: newAcconto.notes
            })

            if (response.data.success) {
               toast.success("Acconto aggiornato con successo")
               fetchEmployee()
               setIsAccontoDialogOpen(false)
            }
         }
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore durante il salvataggio dell'acconto")
      } finally {
         setIsAddingAcconto(false)
      }
   }

   // Function to handle deleting an acconto
   const handleDeleteAcconto = async (accontoId) => {
      if (!confirm("Sei sicuro di voler eliminare questo acconto?")) {
         return
      }

      try {
         await axios.delete('/api/acconti', {
            data: { id: accontoId }
         })
         toast.success("Acconto eliminato con successo");
         fetchEmployee()
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore durante l'eliminazione dell'acconto")
      }
   }

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            <p className="mt-4 text-lg font-medium text-slate-600">Caricamento dati operai...</p>
            <p className="text-sm text-slate-500">Attendere mentre recuperiamo i dati</p>
         </div>
      )
   }

   if (error) {
      return (
         <div className="p-4">
            <div className="flex items-center gap-4">
               <Link href={paths.employees}>
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <h1 className="text-2xl font-bold tracking-tight text-slate-900">Errore</h1>
            </div>

            <Alert className="mt-4 bg-red-50 border-red-200">
               <AlertTriangle className="h-5 w-5 text-red-600" />
               <AlertTitle className="text-red-800">Si è verificato un errore</AlertTitle>
               <AlertDescription className="text-red-700">
                  {error}
               </AlertDescription>
            </Alert>
         </div>
      )
   }

   if (!employee) {
      return (
         <div className="p-4">
            <h1 className="text-2xl font-bold text-slate-900">Operaio non trovato</h1>
            <Link href={paths.employees}>
               <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna agli operai
               </Button>
            </Link>
         </div>
      )
   }

   if (isDeleted) {
      return (
         <div className="p-4">
            <div className="flex items-center gap-4">
               <Link href={paths.employees}>
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operaio eliminato</h1>
            </div>

            <Alert className="mt-4 bg-green-50 border-green-200">
               <CheckCircle2 className="h-5 w-5 text-green-600" />
               <AlertTitle className="text-green-800">Operazione completata!</AlertTitle>
               <AlertDescription className="text-green-700">
                  {employee.name} è stato rimosso dal sistema.
               </AlertDescription>
            </Alert>
         </div>
      )
   }

   return (
      <div className="p-4 space-y-4">
         {/* ACTIONS BAR */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <Link href={paths.employees}>
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{employee.name}</h1>
                  {!employee.isActive && (
                     <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                        Disabilitato
                     </Badge>
                  )}
               </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
               <Button
                  variant={employee.isActive ? "default" : "outline"}
                  onClick={() => setIsDisableDialogOpen(true)}
                  disabled={employee.isActive && employee.toPay > 0}
                  title={employee.isActive && employee.toPay > 0 ? "Non puoi disabilitare un operaio con pagamenti in sospeso" : ""}
                  className="flex-1 sm:flex-none"
               >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {employee.isActive ? "Disabilita" : "Abilita"}
               </Button>
               <Link href={paths.employeeIdEdit(id)} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full">
                     <Edit className="mr-2 h-4 w-4" />
                     Modifica
                  </Button>
               </Link>
               <Button
                  disabled={employee.isActive && employee.toPay > 0}
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex-1 sm:flex-none"
               >
                  <Trash className="mr-2 h-4 w-4" />
                  Elimina
               </Button>
            </div>
         </div>

         {/* STATS */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white/50 backdrop-blur-sm">
               <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Informazioni Operaio</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-sm">
                     <p className="text-slate-500">ID: <span className="text-slate-900">{employee.id}</span></p>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
               <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Informazioni salario</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <div>
                        <p className="text-slate-500">Giornaliero</p>
                        <p className="font-semibold">{formatNumber(employee.dailyRate)}</p>
                     </div>
                     <div>
                        <p className="text-slate-500">Mezza giornata</p>
                        <p className="font-semibold">{formatNumber(employee.halfDayRate)}</p>
                     </div>
                  </div>
                  <div className="pt-2 border-t">
                     <p className="text-slate-500 text-sm">Totale da pagare</p>
                     <p className="text-xl font-bold text-red-600">{formatNumber(employee.toPay)}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                     <Button
                        variant="outline"
                        className="flex-1 text-sm h-8"
                        onClick={() => openPaymentDialog(null, "acconto")}
                        disabled={employee.toPay <= 0}
                     >
                        <DollarSign className="mr-1 h-3 w-3" />
                        Acconto
                     </Button>
                     <Button
                        variant="default"
                        className="flex-1 text-sm h-8 bg-green-600 hover:bg-green-700"
                        onClick={() => openPaymentDialog(null, "full")}
                        disabled={employee.toPay <= 0}
                     >
                        <CreditCard className="mr-1 h-3 w-3" />
                        Paga tutto
                     </Button>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
               <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resoconto lavoro</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2 text-sm">
                  <div>
                     <p className="text-slate-500">Giorni lavorati</p>
                     <p className="font-semibold">
                        {employee.fullDays} giorni interi,{" "}
                        {employee.halfDays} mezze giornate
                     </p>
                  </div>
                  <div>
                     <p className="text-slate-500">Totale extra</p>
                     <p className="font-semibold">{formatNumber(employee.totalExtras)}</p>
                  </div>
                  <div>
                     <p className="text-slate-500">Ultimo lavoro</p>
                     <p className="font-semibold">
                        {employee.lastWorkedDay
                           ? `${format(new Date(employee.lastWorkedDay), 'dd/MM/yyyy')} (${employee.lastWorkType === 'fullDay' ? 'Giornata intera' : 'Mezza giornata'})`
                           : "Nessun lavoro ancora registrato"}
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>

         <Tabs defaultValue="work-history" className="mt-6">
            <TabsList className="w-full sm:w-auto">
               <TabsTrigger value="work-history" className="flex-1 sm:flex-none">Storico giornate</TabsTrigger>
               <TabsTrigger value="acconti" className="flex-1 sm:flex-none">Acconti</TabsTrigger>
               <TabsTrigger value="add-entry" disabled={!employee.isActive} className="flex-1 sm:flex-none">Aggiungi giornata</TabsTrigger>
            </TabsList>
            {/* WORK HISTORY */}
            <TabsContent value="work-history" className="space-y-4">
               <Card>
                  <CardHeader className="pb-2">
                     <CardTitle>Storico giornate</CardTitle>
                     <CardDescription>Record delle giornate lavorate e dei pagamenti</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="rounded-md border overflow-x-auto">
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Data</TableHead>
                                 <TableHead>Tipo</TableHead>
                                 <TableHead>Paga base</TableHead>
                                 <TableHead>Extra</TableHead>
                                 <TableHead>Totale</TableHead>
                                 <TableHead>Pagato</TableHead>
                                 <TableHead>Note</TableHead>
                                 <TableHead>Azioni</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {employee.workHistory.map((entry, index) => {
                                 const remainingAmount = entry.total - entry.payedAmount;
                                 return (
                                    <TableRow key={index}>
                                       <TableCell>{format(new Date(entry.workedDay), 'dd/MM/yyyy')}</TableCell>
                                       <TableCell className="capitalize">{entry.type === 'fullDay' ? 'Giornata intera' : 'Mezza giornata'}</TableCell>
                                       <TableCell>{formatNumber(entry.salaryAmount)}</TableCell>
                                       <TableCell>{formatNumber(entry.extras)}</TableCell>
                                       <TableCell>{formatNumber(entry.total)}</TableCell>
                                       <TableCell>
                                          <Badge variant={entry.isPaid ? "default" : "outline"} className={cn(
                                             entry.isPaid && "bg-green-100 text-green-700 border-green-200",
                                             !entry.isPaid && entry.payedAmount > 0 && "bg-orange-100 text-orange-700 border-orange-200",
                                             !entry.isPaid && entry.payedAmount === 0 && "bg-red-100 text-red-700 border-red-200"
                                          )}>
                                             {entry.isPaid ? "Pagato" : entry.payedAmount > 0 ? `Parziale (${formatNumber(entry.payedAmount)})` : "Non pagato"}
                                          </Badge>
                                       </TableCell>
                                       <TableCell>{entry.notes}</TableCell>
                                       <TableCell>
                                          {!entry.isPaid && (
                                             <div className="flex gap-1">
                                                <Button
                                                   variant="outline"
                                                   size="sm"
                                                   onClick={() => openPaymentDialog(entry.id, "acconto")}
                                                   disabled={remainingAmount <= 0}
                                                >
                                                   <DollarSign className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                   variant="default"
                                                   size="sm"
                                                   className="bg-green-600 hover:bg-green-700"
                                                   onClick={() => openPaymentDialog(entry.id, "full")}
                                                   disabled={remainingAmount <= 0}
                                                >
                                                   <CreditCard className="h-3 w-3" />
                                                </Button>
                                             </div>
                                          )}
                                       </TableCell>
                                    </TableRow>
                                 )
                              })}
                           </TableBody>
                        </Table>
                     </div>

                     {/* Pagination controls */}
                     {employee.workHistoryPagination && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-4 border-t gap-3">
                           <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">
                                 Righe per pagina:
                              </span>
                              <Select value={historyPageSize.toString()} onValueChange={(value) => {
                                 setHistoryPageSize(Number(value))
                                 setHistoryPage(1) // Reset to first page when changing page size
                              }}>
                                 <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder="10" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="text-sm text-slate-500 mr-2">
                                 {employee.workHistoryPagination.totalItems > 0
                                    ? `${(historyPage - 1) * historyPageSize + 1}-${Math.min(historyPage * historyPageSize, employee.workHistoryPagination.totalItems)} di ${employee.workHistoryPagination.totalItems}`
                                    : "0 risultati"}
                              </span>
                              <div className="flex items-center gap-1">
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                                    disabled={historyPage === 1}
                                    className="h-8 w-8"
                                 >
                                    <ChevronLeft className="h-4 w-4" />
                                 </Button>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setHistoryPage(prev => Math.min(prev + 1, employee.workHistoryPagination.totalPages))}
                                    disabled={historyPage === employee.workHistoryPagination.totalPages}
                                    className="h-8 w-8"
                                 >
                                    <ChevronRight className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            {/* ACCONTI TAB */}
            <TabsContent value="acconti" className="space-y-4">
               <Card>
                  <CardHeader className="pb-2">
                     <div className="flex justify-between items-center">
                        <div>
                           <CardTitle>Storico acconti</CardTitle>
                           <CardDescription>Record degli acconti versati all'operaio</CardDescription>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <div className="rounded-md border overflow-x-auto">
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Data</TableHead>
                                 <TableHead>Importo</TableHead>
                                 <TableHead>Note</TableHead>
                                 <TableHead>Azioni</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {employee.acconti?.length > 0 ? (
                                 employee.acconti.map((acconto) => (
                                    <TableRow key={acconto.id}>
                                       <TableCell>{format(new Date(acconto.date), 'dd/MM/yyyy')}</TableCell>
                                       <TableCell>{formatNumber(acconto.amount)}</TableCell>
                                       <TableCell>{acconto.notes || ""}</TableCell>
                                       <TableCell>
                                          <div className="flex gap-1">
                                             <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                   setAccontoToEdit(acconto)
                                                   setNewAcconto({
                                                      date: new Date(acconto.date).toISOString().split("T")[0],
                                                      amount: acconto.amount,
                                                      notes: acconto.notes || ""
                                                   })
                                                   setIsAccontoDialogOpen(true)
                                                }}
                                             >
                                                <Edit className="h-3 w-3" />
                                             </Button>
                                             <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteAcconto(acconto.id)}
                                             >
                                                <Trash className="h-3 w-3" />
                                             </Button>
                                          </div>
                                       </TableCell>
                                    </TableRow>
                                 ))
                              ) : (
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                                       Nessun acconto registrato
                                    </TableCell>
                                 </TableRow>
                              )}
                           </TableBody>
                        </Table>
                     </div>

                     {/* Pagination controls for acconti */}
                     {employee.accontiPagination && employee.accontiPagination.totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-4 border-t gap-3">
                           <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">
                                 Righe per pagina:
                              </span>
                              <Select value={accontiPageSize.toString()} onValueChange={(value) => {
                                 setAccontiPageSize(Number(value))
                                 setAccontiPage(1) // Reset to first page when changing page size
                              }}>
                                 <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder="10" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="text-sm text-slate-500 mr-2">
                                 {employee.accontiPagination.totalItems > 0
                                    ? `${(accontiPage - 1) * accontiPageSize + 1}-${Math.min(accontiPage * accontiPageSize, employee.accontiPagination.totalItems)} di ${employee.accontiPagination.totalItems}`
                                    : "0 risultati"}
                              </span>
                              <div className="flex items-center gap-1">
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setAccontiPage(prev => Math.max(prev - 1, 1))}
                                    disabled={accontiPage === 1}
                                    className="h-8 w-8"
                                 >
                                    <ChevronLeft className="h-4 w-4" />
                                 </Button>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setAccontiPage(prev => Math.min(prev + 1, employee.accontiPagination.totalPages))}
                                    disabled={accontiPage === employee.accontiPagination.totalPages}
                                    className="h-8 w-8"
                                 >
                                    <ChevronRight className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            {/* ADD WORK ENTRY */}
            <TabsContent value="add-entry">
               <Card>
                  <CardHeader className="pb-2">
                     <CardTitle>Aggiungi giornata</CardTitle>
                     <CardDescription>Registra una nuova giornata di lavoro per questo operaio</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleAddWorkEntry} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {/* DATE */}
                           <div className="flex flex-col gap-2">
                              <Label htmlFor="workedDay">Data</Label>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <Button
                                       variant={"outline"}
                                       className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !newWorkEntry?.workedDay && "text-muted-foreground"
                                       )}
                                    >
                                       <CalendarIcon className="mr-2 h-4 w-4" />
                                       {newWorkEntry?.workedDay ? format(new Date(newWorkEntry?.workedDay), "PPP") : <span>Seleziona una data</span>}
                                    </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                       mode="single"
                                       selected={newWorkEntry?.workedDay ? new Date(newWorkEntry?.workedDay) : undefined}
                                       onSelect={(date) => {
                                          setNewWorkEntry({
                                             ...newWorkEntry,
                                             workedDay: date ? date : ''
                                          })
                                       }}
                                       initialFocus
                                    />
                                 </PopoverContent>
                              </Popover>
                           </div>

                           {/* WORK TYPE */}
                           <div className="flex flex-col gap-2">
                              <Label htmlFor="workType">Tipo di lavoro</Label>
                              <select
                                 id="workType"
                                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                 value={newWorkEntry.workType}
                                 onChange={(e) => {
                                    const workType = e.target.value;
                                    const salaryAmount = workType === 'fullDay' ? employee?.dailyRate : employee?.halfDayRate;
                                    setNewWorkEntry({
                                       ...newWorkEntry,
                                       workType,
                                       salaryAmount,
                                       total: salaryAmount + newWorkEntry.extras
                                    });
                                 }}
                              >
                                 <option value="fullDay">Giornata intera</option>
                                 <option value="halfDay">Mezza giornata</option>
                              </select>
                           </div>

                           {/* EXTRAS */}
                           <div className="flex flex-col gap-2">
                              <Label htmlFor="extras">Paga extra (€)</Label>
                              <Input
                                 id="extras"
                                 type="number"
                                 min="0"
                                 value={newWorkEntry.extras}
                                 onChange={(e) => setNewWorkEntry({
                                    ...newWorkEntry,
                                    extras: Number(e.target.value),
                                    total: newWorkEntry.salaryAmount + Number(e.target.value)
                                 })}
                              />
                           </div>

                           {/* TOTAL */}
                           <div className="flex flex-col gap-2">
                              <Label htmlFor="total">Totale (€)</Label>
                              <Input
                                 id="total"
                                 value={newWorkEntry.total}
                                 disabled
                                 className="bg-slate-50"
                              />
                           </div>

                           {/* PAYED AMOUNT */}
                           <div className="flex flex-col gap-2">
                              <Label htmlFor="payedAmount">Pagato (€)</Label>
                              <Input
                                 id="payedAmount"
                                 value={newWorkEntry.payedAmount}
                                 onChange={(e) => setNewWorkEntry({ ...newWorkEntry, payedAmount: Number(e.target.value) })}
                                 className="bg-slate-50"
                              />
                           </div>

                           {/* NOTES */}
                           <div className="flex flex-col gap-2">
                              <Label htmlFor="notes">Note</Label>
                              <Input
                                 id="notes"
                                 value={newWorkEntry.notes}
                                 onChange={(e) => setNewWorkEntry({ ...newWorkEntry, notes: e.target.value })}
                                 placeholder="Aggiungi note..."
                              />
                           </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t">
                           <Checkbox
                              id="isPaid"
                              checked={newWorkEntry.isPaid}
                              onCheckedChange={(checked) => setNewWorkEntry({
                                 ...newWorkEntry,
                                 isPaid: checked === true,
                                 payedAmount: checked ? newWorkEntry.total : 0
                              })}
                           />
                           <Label htmlFor="isPaid" className="font-normal text-sm text-slate-600">
                              Segna come pagato
                           </Label>
                        </div>

                        <div className="flex justify-end pt-4">
                           <Button type="submit" className="w-full sm:w-auto" disabled={isAddingWorkEntry}>
                              {isAddingWorkEntry ? (
                                 <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Aggiunta in corso...
                                 </>
                              ) : (
                                 "Aggiungi giornata"
                              )}
                           </Button>
                        </div>
                     </form>
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>

         <DeleteConfirmation
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            title="Elimina operaio"
            description={`Sei sicuro di voler eliminare ${employee.name}? Questo gli impedirà di essere assegnato a nuovi lavori e non comparirà nelle liste degli operai attivi. Inoltre tutte le sue giornate verranno rimosse e non potranno essere recuperate.`}
            isDeleting={isDeleting}
         />



         <DeleteConfirmation
            isOpen={isDisableDialogOpen}
            onClose={() => setIsDisableDialogOpen(false)}
            onConfirm={handleToggleStatus}
            title={employee.isActive ? "Disabilita operaio" : "Abilita operaio"}
            description={
               !employee.isActive
                  ? `Sei sicuro di voler abilitare ${employee.name}? Questo gli consentirà di essere assegnato a nuovi lavori e comparirà nelle liste degli operai attivi.`
                  : `Sei sicuro di voler disabilitare ${employee.name}? Questo gli impedirà di essere assegnato a nuovi lavori e non comparirà nelle liste degli operai attivi.`
            }
            isDeleting={isTogglingStatus}
            confirmButtonText={employee.isActive ? "Disabilita" : "Abilita"}
            confirmButtonVariant={employee.isActive ? "default" : "secondary"}
         />

         {/* PAYMENT DIALOG */}
         <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Pagamento</DialogTitle>
               </DialogHeader>
               <DialogDescription>
                  {selectedEntryId ?
                     (() => {
                        const entry = employee.workHistory.find(entry => entry.id === selectedEntryId)
                        return `Pagamento per la giornata di lavoro del ${format(new Date(entry.workedDay), 'dd/MM/yyyy')}`
                     })() : "Pagamento per l'operaio"}
               </DialogDescription>

               <div className="space-y-4 py-4">
                  <div className="flex flex-col gap-2">
                     <Label htmlFor="paymentAmount">Importo (€)</Label>
                     <Input
                        id="paymentAmount"
                        type="number"
                        min="0"
                        max={selectedEntryId
                           ? (() => {
                              const entry = employee.workHistory.find(entry => entry.id === selectedEntryId)
                              return entry ? entry.total - entry.payedAmount : 0
                           })()
                           : employee.toPay
                        }
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                     />
                     <p className="text-sm text-muted-foreground">
                        Importo massimo: {selectedEntryId
                           ? (() => {
                              const entry = employee.workHistory.find(entry => entry.id === selectedEntryId)
                              return entry ? `${formatNumber(entry.total - entry.payedAmount)}` : formatNumber(0)
                           })()
                           : `${formatNumber(employee.toPay)}`
                        }
                     </p>
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="paymentNote">Note (opzionale)</Label>
                     <Input
                        id="paymentNote"
                        type="text"
                        placeholder="Aggiungi una nota all'acconto"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                     />
                     <p className="text-sm text-muted-foreground">
                        Questa nota verrà salvata nel record dell'acconto
                     </p>
                  </div>
               </div>

               <DialogFooter>
                  <Button
                     variant="default"
                     onClick={() => handleProcessPayment()}
                     disabled={isProcessingPayment || paymentAmount <= 0}
                  >
                     {isProcessingPayment ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                     ) : (
                        <CreditCard className="h-3 w-3 mr-2" />
                     )}
                     Paga
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* ACCONTI DIALOG */}
         <Dialog open={isAccontoDialogOpen} onOpenChange={setIsAccontoDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{accontoToEdit ? "Modifica acconto" : "Aggiungi acconto"}</DialogTitle>
               </DialogHeader>
               <DialogDescription>
                  {accontoToEdit
                     ? "Modifica le informazioni dell'acconto"
                     : "Inserisci i dettagli del nuovo acconto per l'operaio"}
               </DialogDescription>

               <div className="space-y-4 py-4">
                  <div className="flex flex-col gap-2">
                     <Label htmlFor="accontoDate">Data</Label>
                     <DatePicker
                        id="accontoDate"
                        date={newAcconto.date ? dayjs(newAcconto.date).toDate() : undefined}
                        setDate={(date) => {
                           setNewAcconto({
                              ...newAcconto,
                              date: date ? dayjs(date).format() : ''
                           })
                        }}
                     />
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="accontoAmount">Importo (€)</Label>
                     <Input
                        id="accontoAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newAcconto.amount}
                        onChange={(e) => setNewAcconto({
                           ...newAcconto,
                           amount: parseFloat(e.target.value) || 0
                        })}
                     />
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="accontoNotes">Note (opzionale)</Label>
                     <Input
                        id="accontoNotes"
                        value={newAcconto.notes}
                        onChange={(e) => setNewAcconto({
                           ...newAcconto,
                           notes: e.target.value
                        })}
                        placeholder="Aggiungi note..."
                     />
                  </div>
               </div>

               <DialogFooter>
                  <Button
                     variant="default"
                     onClick={handleSaveAcconto}
                     disabled={isAddingAcconto || newAcconto.amount <= 0}
                  >
                     {isAddingAcconto ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                     ) : (
                        <CreditCard className="h-3 w-3 mr-2" />
                     )}
                     {accontoToEdit ? "Salva modifiche" : "Aggiungi acconto"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

      </div>
   )
}


