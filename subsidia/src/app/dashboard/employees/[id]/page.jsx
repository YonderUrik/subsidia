"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowLeft, CalendarIcon, Edit, Loader2, Trash, DollarSign, CreditCard } from "lucide-react"
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

export default function EmployeeDetailsPage() {
   const params = useParams()
   const router = useRouter()
   const id = params.id
   const [employee, setEmployee] = useState(null)

   console.log("employee", employee)

   const [error, setError] = useState(null)
   const [isLoading, setIsLoading] = useState(true)

   const fetchEmployee = useCallback(async () => {
      try {
         const response = await axios.get(`/api/employees?id=${id}`)
         setEmployee(response.data.data)
         setIsLoading(false)
      } catch (error) {
         setEmployee(null)
         setError(error.response.data.message || error.response.data.error || "Errore nel caricamento dei dati dell'impiegato")
         setIsLoading(false)
      }
   }, [id])

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
   const [isStatusUpdated, setIsStatusUpdated] = useState(false)
   const [isAddingWorkEntry, setIsAddingWorkEntry] = useState(false)

   // Payment dialog states
   const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
   const [paymentAmount, setPaymentAmount] = useState(0)
   const [isProcessingPayment, setIsProcessingPayment] = useState(false)
   const [selectedEntryId, setSelectedEntryId] = useState(null)
   const [paymentType, setPaymentType] = useState("acconto") // "acconto" or "full"

   console.log("paymentAmount", paymentAmount)
   console.log("selectedEntryId", selectedEntryId)
   console.log("paymentType", paymentType)
   console.log("isPaymentDialogOpen", isPaymentDialogOpen)
   console.log("isProcessingPayment", isProcessingPayment)

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
         toast.error(error.response.data.message || error.response.data.error || "Errore durante l'eliminazione dell'impiegato")
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
            setIsStatusUpdated(true)

            // Update local state with response data
            setEmployee(prev => ({
               ...prev,
               isActive: !prev.isActive
            }))

            // Reset status message after delay
            setTimeout(() => {
               setIsStatusUpdated(false)
            }, 3000)
         }
      } catch (error) {
         setIsTogglingStatus(false)
         toast.error(error.response.data.message || error.response.data.error || "Errore durante l'aggiornamento dello stato dell'impiegato")
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
      console.log("entryId", entryId)
      console.log("type", type)
      setSelectedEntryId(entryId)
      setPaymentType(type)

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
         })

         if (response.data.success) {
            // Refresh employee data
            fetchEmployee()
            setIsPaymentDialogOpen(false)
            setIsStatusUpdated(true)

            setTimeout(() => {
               setIsStatusUpdated(false)
            }, 3000)
         }
      } catch (error) {
         toast.error(error.response.data.message || error.response.data.error || "Errore durante il pagamento")
      } finally {
         setIsProcessingPayment(false)
      }
   }

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            <p className="mt-4 text-lg font-medium text-slate-600">Caricamento dati impiegato...</p>
            <p className="text-sm text-slate-500">Attendere mentre recuperiamo i dati</p>
         </div>
      )
   }

   if (error) {
      return (
         <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
               <Link href={paths.employees}>
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Errore</h1>
            </div>

            <Alert className="bg-red-50 border-red-200">
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
         <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900">Impiegato non trovato</h1>
            <Link href={paths.employees}>
               <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna ai dipendenti
               </Button>
            </Link>
         </div>
      )
   }

   if (isDeleted) {
      return (
         <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
               <Link href={paths.employees}>
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Impiegato eliminato</h1>
            </div>

            <Alert className="bg-green-50 border-green-200">
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
      <div className="p-6 space-y-6">
         {/* ACTIONS BAR */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Link href={paths.employees}>
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{employee.name}</h1>
                  {!employee.isActive && (
                     <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                        Disabilitato
                     </Badge>
                  )}
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Button
                  variant={employee.isActive ? "default" : "outline"}
                  onClick={() => setIsDisableDialogOpen(true)}
                  disabled={employee.isActive && employee.toPay > 0}
                  title={employee.isActive && employee.toPay > 0 ? "Non puoi disabilitare un dipendente con pagamenti in sospeso" : ""}
               >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {employee.isActive ? "Disabilita" : "Abilita"}
               </Button>
               <Link href={paths.employeeIdEdit(id)}>
                  {/* TODO : Aggiungere la modifica dell'impiegato */}
                  <Button variant="outline">
                     <Edit className="mr-2 h-4 w-4" />
                     Modifica
                  </Button>
               </Link>
               <Button disabled={employee.isActive && employee.toPay > 0} variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Elimina
               </Button>
            </div>
         </div>

         {/* STATS */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm">
               <CardHeader>
                  <CardTitle>Informazioni impiegato</CardTitle>
                  <CardDescription>Dettagli personali e professionali</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-slate-500">ID</p>
                        <p>{employee.id}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="shadow-sm">
               <CardHeader>
                  <CardTitle>Informazioni salario</CardTitle>
                  <CardDescription>Dettagli salario e pagamento</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-slate-500">Giornaliero</p>
                        <p className="text-xl font-bold">€{employee.dailyRate}</p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Mezza giornata</p>
                        <p className="text-xl font-bold">€{employee.halfDayRate}</p>
                     </div>
                     <div className="col-span-2">
                        <p className="text-sm font-medium text-slate-500">Totale da pagare</p>
                        <p className="text-2xl font-bold text-red-600">€{employee.toPay}</p>
                     </div>
                     <div className="col-span-2 mt-2 flex gap-2">
                        <Button
                           variant="outline"
                           className="flex-1"
                           onClick={() => openPaymentDialog(null, "acconto")}
                           disabled={employee.toPay <= 0}
                        >
                           <DollarSign className="mr-2 h-4 w-4" />
                           Acconto
                        </Button>
                        <Button
                           variant="default"
                           className="flex-1 bg-green-600 hover:bg-green-700"
                           onClick={() => openPaymentDialog(null, "full")}
                           disabled={employee.toPay <= 0}
                        >
                           <CreditCard className="mr-2 h-4 w-4" />
                           Paga tutto
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="shadow-sm">
               <CardHeader>
                  <CardTitle>Resoconto lavoro</CardTitle>
                  <CardDescription>Attività recenti</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div>
                     <p className="text-sm font-medium text-slate-500">Giorni lavorati</p>
                     <p className="text-xl font-bold">
                        {employee.workHistory.filter((entry) => entry.type === "fullDay").length} giorni interi,{" "}
                        {employee.workHistory.filter((entry) => entry.type === "halfDay").length} mezze giornate
                     </p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-slate-500">Totale extra</p>
                     <p className="text-xl font-bold">€{employee.workHistory.reduce((sum, entry) => sum + entry.extras, 0)}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-slate-500">Ultimo lavoro</p>
                     <p>
                        {employee.workHistory.length > 0
                           ? `${format(new Date(employee.workHistory[0].workedDay), 'dd/MM/yyyy')} (${employee.workHistory[0].type === 'fullDay' ? 'Giornata intera' : 'Mezza giornata'})`
                           : "Nessun lavoro ancora registrato"}
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>

         <Tabs defaultValue="work-history">
            <TabsList>
               <TabsTrigger value="work-history">Storico giornate</TabsTrigger>
               <TabsTrigger value="add-entry" disabled={!employee.isActive}>Aggiungi giornata</TabsTrigger>
            </TabsList>
            {/* WORK HISTORY */}
            <TabsContent value="work-history" className="space-y-4">
               <Card className="shadow-sm">
                  <CardHeader>
                     <CardTitle>Storico giornate</CardTitle>
                     <CardDescription>Record delle giornate lavorate e dei pagamenti</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="rounded-md border">
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
                                       <TableCell>€{entry.salaryAmount}</TableCell>
                                       <TableCell>€{entry.extras}</TableCell>
                                       <TableCell>€{entry.total}</TableCell>
                                       <TableCell>
                                          <Badge variant={entry.isPaid ? "default" : "outline"} className={cn(
                                             entry.isPaid && "bg-green-100 text-green-700 border-green-200",
                                             !entry.isPaid && entry.payedAmount > 0 && "bg-orange-100 text-orange-700 border-orange-200",
                                             !entry.isPaid && entry.payedAmount === 0 && "bg-red-100 text-red-700 border-red-200"
                                          )}>
                                             {entry.isPaid ? "Pagato" : entry.payedAmount > 0 ? `Parzialmente pagato (€${entry.payedAmount})` : "Non pagato"}
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
                  </CardContent>
               </Card>
            </TabsContent>

            {/* ADD WORK ENTRY */}
            <TabsContent value="add-entry">
               <Card className="shadow-sm">
                  <CardHeader>
                     <CardTitle>Aggiungi giornata</CardTitle>
                     <CardDescription>Registra una nuova giornata di lavoro per questo impiegato</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleAddWorkEntry} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                           <Button type="submit" className="w-full md:w-auto" disabled={isAddingWorkEntry}>
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
            title="Elimina impiegato"
            description={`Sei sicuro di voler eliminare ${employee.name}? Questo gli impedirà di essere assegnato a nuovi lavori e non comparirà nelle liste degli impiegati attivi. Inoltre tutte le sue giornate verranno rimosse e non potranno essere recuperate.`}
            isDeleting={isDeleting}
         />

         {isStatusUpdated && (
            <Alert className="fixed bottom-4 right-4 w-auto max-w-md bg-green-50 border-green-200 shadow-md">
               <CheckCircle2 className="h-5 w-5 text-green-600" />
               <AlertTitle className="text-green-800">Operazione completata!</AlertTitle>
               <AlertDescription className="text-green-700">
                  Lo stato dell'impiegato è stato aggiornato a {employee.isActive ? "abilitato" : "disabilitato"}.
               </AlertDescription>
            </Alert>
         )}

         <DeleteConfirmation
            isOpen={isDisableDialogOpen}
            onClose={() => setIsDisableDialogOpen(false)}
            onConfirm={handleToggleStatus}
            title={employee.isActive ? "Disabilita impiegato" : "Abilita impiegato"}
            description={
               !employee.isActive
                  ? `Sei sicuro di voler abilitare ${employee.name}? Questo gli consentirà di essere assegnato a nuovi lavori e comparirà nelle liste degli impiegati attivi.`
                  : `Sei sicuro di voler disabilitare ${employee.name}? Questo gli impedirà di essere assegnato a nuovi lavori e non comparirà nelle liste degli impiegati attivi.`
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
                     })() : "Pagamento per l'impiegato"}
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
                              return entry ? `${entry.total - entry.payedAmount}€` : "0€"
                           })()
                           : `${employee.toPay}€`
                        }
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


      </div>
   )
}
