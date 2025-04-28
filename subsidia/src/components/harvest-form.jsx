"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Calculator, Euro, X, CalendarIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { DatePicker } from "@/components/ui/date-picker"
import { paths } from "@/lib/paths"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

// Form validation schema
const formSchema = z.object({
   landId: z.string().min(1, "Seleziona un terreno"),
   quantity: z.number().min(0.01, "Quantità deve essere maggiore di 0"),
   price: z.number().min(0.01, "Prezzo deve essere maggiore di 0"),
   isPaid: z.boolean().default(false),
   paidAmount: z.number().nullable().optional(),
   client: z.string().min(1, "Seleziona un cliente"),
   notes: z.string().optional(),
   harvestDay: z.date()
})

export function HarvestForm() {
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [showSuccess, setShowSuccess] = useState(false)
   const [lands, setLands] = useState([])
   const [loading, setLoading] = useState(true)
   const [clients, setClients] = useState([])
   const [clientsLoading, setClientsLoading] = useState(true)
   const [openClientSelect, setOpenClientSelect] = useState(false)
   const [harvestDate, setHarvestDate] = useState(new Date())
   const router = useRouter()

   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         landId: "",
         quantity: "",
         price: "",
         isPaid: false,
         paidAmount: 0,
         client: "",
         notes: "",
         harvestDay: new Date()
      }
   })

   // Update the form when harvestDate changes
   useEffect(() => {
      form.setValue("harvestDay", harvestDate)
   }, [harvestDate, form])

   const isPaidValue = form.watch("isPaid")
   const paidAmount = form.watch("paidAmount") || 0
   const quantity = form.watch("quantity") || 0
   const price = form.watch("price") || 0

   // Calculate total earnings
   const totalEarnings = useMemo(() => {
      return quantity * price
   }, [quantity, price])

   // Calculate payment status data
   const paymentData = useMemo(() => {
      if (!isPaidValue) return { status: "nonPagato", statusClass: "text-red-500" }
      
      if (paidAmount >= totalEarnings) {
         return { status: "Pagato completamente", statusClass: "text-green-600" }
      } else if (paidAmount > 0) {
         return { status: "Pagato parzialmente", statusClass: "text-amber-500" }
      } else {
         return { status: "Marcato come pagato", statusClass: "text-amber-500" }
      }
   }, [isPaidValue, paidAmount, totalEarnings])

   // Fetch lands for the dropdown
   useEffect(() => {
      const fetchLands = async () => {
         try {
            setLoading(true)
            const currentYear = new Date().getFullYear()
            const response = await axios.get(`/api/lands?year=${currentYear}`)
            
            // Get distinct name-soilType combinations
            const distinctLands = response.data.reduce((acc, land) => {
               const key = `${land.name}-${land.soilType}`
               if (!acc.some(l => `${l.name}-${l.soilType}` === key)) {
                  acc.push(land)
               }
               return acc
            }, [])
            
            setLands(distinctLands)
         } catch (error) {
            console.error("Error fetching lands:", error)
            toast.error("Errore nel caricamento dei terreni")
         } finally {
            setLoading(false)
         }
      }

      fetchLands()
   }, [])

   // Fetch clients for autocomplete
   useEffect(() => {
      const fetchClients = async () => {
         try {
            setClientsLoading(true)
            const response = await axios.get('/api/harvest-clients')
            setClients(response.data)
         } catch (error) {
            console.error("Error fetching clients:", error)
            // Silently fail, not critical
         } finally {
            setClientsLoading(false)
         }
      }

      fetchClients()
   }, [])

   async function onSubmit(values) {
      setIsSubmitting(true)
      try {
         const processedValues = {
            ...values,
            quantity: parseFloat(values.quantity),
            price: parseFloat(values.price),
            paidAmount: values.paidAmount ? parseFloat(values.paidAmount) : null
         }
         
         await axios.post("/api/harvests", processedValues)
         toast.success("Raccolto aggiunto con successo")
         setShowSuccess(true)
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore nell'aggiunta del raccolto")
      } finally {
         setIsSubmitting(false)
      }
   }

   if (showSuccess) {
      return (
         <>
            <CardHeader className="text-center">
               <CardTitle className="text-2xl font-semibold">Raccolto aggiunto con successo!</CardTitle>
               <p className="text-muted-foreground">Cosa vorresti fare ora?</p>
            </CardHeader>
            <CardContent className="flex justify-center gap-4 pt-2 pb-6">
               <Button onClick={() => {
                  setShowSuccess(false)
                  form.reset({
                     landId: "",
                     quantity: "",
                     price: "",
                     isPaid: false,
                     paidAmount: 0,
                     client: "",
                     notes: "",
                     harvestDay: new Date()
                  })
                  setHarvestDate(new Date())
               }} variant="outline">
                  Aggiungi un altro raccolto
               </Button>
               <Button onClick={() => router.push(paths.harvestsList)}>
                  Vai alla lista dei raccolti
               </Button>
            </CardContent>
         </>
      )
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
               <FormField
                  control={form.control}
                  name="landId"
                  render={({ field }) => (
                     <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium block">Terreno</FormLabel>
                        <Select
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           disabled={loading}
                        >
                           <FormControl>
                              <SelectTrigger className="h-10">
                                 <SelectValue placeholder="Seleziona un terreno" />
                              </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {lands.map(land => (
                                 <SelectItem key={land.id} value={land.id}>
                                    {land.name} - {land.soilType}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               {/* Harvest Date */}
               <FormField
                  control={form.control}
                  name="harvestDay"
                  render={({ field }) => (
                     <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium block">Data raccolta</FormLabel>
                        <FormControl>
                           <DatePicker
                              date={harvestDate}
                              setDate={setHarvestDate}
                              className="w-full"
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                     control={form.control}
                     name="quantity"
                     render={({ field }) => (
                        <FormItem className="space-y-2">
                           <FormLabel className="text-base font-medium block">Quantità (Kg)</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min="0.01"
                                 step="0.01"
                                 className="h-10"
                                 placeholder="0.00"
                                 {...field}
                                 value={field.value}
                                 onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? "" : parseFloat(value));
                                 }}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="price"
                     render={({ field }) => (
                        <FormItem className="space-y-2">
                           <FormLabel className="text-base font-medium block">Prezzo per Kg (€)</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min="0.01"
                                 step="0.01"
                                 className="h-10"
                                 placeholder="0.00"
                                 {...field}
                                 value={field.value}
                                 onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? "" : parseFloat(value));
                                 }}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               {/* Totale Guadagno Calcolato */}
               <div className="rounded-lg border p-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                     <Calculator className="h-5 w-5 text-blue-600" />
                     <h3 className="font-medium">Calcolo Guadagno</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                     <div>
                        <span className="text-muted-foreground">Quantità:</span>
                        <p className="font-medium">{formatNumber(quantity, false)} Kg</p>
                     </div>
                     <div>
                        <span className="text-muted-foreground">Prezzo:</span>
                        <p className="font-medium">{formatNumber(price)} /Kg</p>
                     </div>
                     <div>
                        <span className="text-muted-foreground">Totale:</span>
                        <p className="font-semibold text-lg text-green-600">{formatNumber(totalEarnings)}</p>
                     </div>
                  </div>
               </div>

               <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                     <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium block">Cliente</FormLabel>
                        <Popover open={openClientSelect} onOpenChange={setOpenClientSelect}>
                           <PopoverTrigger asChild>
                              <FormControl>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openClientSelect}
                                    className={cn(
                                       "h-10 w-full justify-between",
                                       !field.value && "text-muted-foreground"
                                    )}
                                 >
                                    {field.value || "Seleziona o aggiungi un cliente"}
                                    {field.value && (
                                       <X 
                                          className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                                          onClick={(e) => {
                                             e.stopPropagation()
                                             form.setValue("client", "")
                                          }}
                                       />
                                    )}
                                 </Button>
                              </FormControl>
                           </PopoverTrigger>
                           <PopoverContent className="p-0 w-full min-w-[300px]">
                              <Command>
                                 <CommandInput 
                                    placeholder="Cerca o aggiungi cliente..." 
                                    className="h-10"
                                    value={field.value}
                                    onValueChange={(value) => {
                                       form.setValue("client", value)
                                    }}
                                 />
                                 {clients.length > 0 && (
                                    <CommandEmpty>
                                       <div className="px-2 py-1.5 text-sm">
                                          Nessun cliente trovato, premere Invio per aggiungere &quot;{field.value}&quot;
                                       </div>
                                    </CommandEmpty>
                                 )}
                                 <CommandGroup>
                                    {clients.map((client) => (
                                       <CommandItem
                                          key={client}
                                          value={client}
                                          onSelect={() => {
                                             form.setValue("client", client)
                                             setOpenClientSelect(false)
                                          }}
                                       >
                                          {client}
                                          {client === field.value && (
                                             <Check className="ml-auto h-4 w-4" />
                                          )}
                                       </CommandItem>
                                    ))}
                                 </CommandGroup>
                              </Command>
                           </PopoverContent>
                        </Popover>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               {/* Payment Section */}
               <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <Euro className="h-5 w-5 text-blue-600" />
                     <h3 className="font-medium">Stato Pagamento</h3>
                  </div>
                  
                  <FormField
                     control={form.control}
                     name="isPaid"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                           <FormControl>
                              <Switch
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                              />
                           </FormControl>
                           <FormLabel className="text-base font-medium">Segna come pagato</FormLabel>
                           {isPaidValue && (
                              <span className={`ml-2 text-sm font-medium ${paymentData.statusClass}`}>
                                 ({paymentData.status})
                              </span>
                           )}
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="paidAmount"
                     render={({ field }) => (
                        <FormItem className="space-y-2">
                           <FormLabel className="text-base font-medium block">
                              Importo pagato (€)
                           </FormLabel>
                           <div className="flex gap-2 items-start">
                              <FormControl>
                                 <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-10"
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                       const value = e.target.value;
                                       field.onChange(value === "" ? 0 : parseFloat(value));
                                    }}
                                 />
                              </FormControl>
                              <Button
                                 type="button"
                                 variant="outline"
                                 className="flex-shrink-0"
                                 onClick={() => form.setValue("paidAmount", totalEarnings)}
                              >
                                 <Euro className="h-4 w-4 mr-1" /> 
                                 Tutto
                              </Button>
                           </div>
                           {isPaidValue && paidAmount > 0 && paidAmount < totalEarnings && (
                              <p className="text-sm text-amber-500">
                                 Mancano {formatNumber(totalEarnings - paidAmount)} al pagamento completo
                              </p>
                           )}
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                     <FormItem className="space-y-2">
                        <FormLabel className="text-base font-medium block">Note (opzionale)</FormLabel>
                        <FormControl>
                           <Textarea
                              placeholder="Note aggiuntive sul raccolto"
                              className="min-h-[100px]"
                              {...field}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
               {isSubmitting ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Salvataggio...
                  </>
               ) : (
                  <>
                     <Check className="mr-2 h-4 w-4" />
                     Salva raccolto
                  </>
               )}
            </Button>
         </form>
      </Form>
   )
} 