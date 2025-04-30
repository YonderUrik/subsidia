"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CalendarIcon, MapPin, Info, Upload, Check, Loader2 } from "lucide-react"
import { format } from "date-fns"
import dynamic from "next/dynamic"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { SketchPicker } from "react-color"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useForm } from "react-hook-form"
import { SOIL_TYPES } from "@/lib/config"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { toast } from "sonner"
import axios from "axios"
import { paths } from "@/lib/paths"
import MapboxExample from "./map-components/mapbox"

// Helper function to check if a value exists in SOIL_TYPES
const isInSoilTypes = (value) => {
   return Object.values(SOIL_TYPES).some(group => group.includes(value));
}

// Form validation schema
const formSchema = z.object({
   name: z.string().min(1, "Field name is required"),
   area: z.number().min(0.01, "Area must be greater than 0"),
   coordinates: z.array(z.any()).min(3, "At least 3 coordinates are required"),
   date: z.date().optional(),
   soilType: z.string().min(1, "Please select a soil type"),
   notes: z.string().optional(),
   year: z.number().min(2020, "Year must be greater than 2020"),
   drawingMethod: z.string().optional(),
   color: z.string().min(1, "Color is required")
})


export function LandForm() {
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [showSuccess, setShowSuccess] = useState(false)
   const router = useRouter()

   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
         area: 0,
         coordinates: [],
         soilType: "",
         notes: "",
         year: new Date().getFullYear(),
         drawingMethod: "draw",
         color: "#4CAF50"
      }
   })

   const [lands, setLands] = useState([])

   const getLands = useCallback(async () => {
      try {
         const response = await axios.get("/api/lands", {
            params: {
               year: form.watch("year"),
            }
         })
         setLands(response.data)
      } catch (error) {
         toast.error(error.response.data.error || "Errore nel fetch dei campi")
      }

   }, [form.watch("year")])

   useEffect(() => {
      getLands()
   }, [getLands])


   async function onSubmit(values) {
      setIsSubmitting(true)
      try {
         await axios.post("/api/lands", values)
         toast.success("Campo aggiunto con successo")
         setShowSuccess(true)
      } catch (error) {
         toast.error(error.response.data.error || "Errore nell'aggiunta del campo")
      } finally {
         setIsSubmitting(false)
      }
   }

   if (showSuccess) {
      return (
         <>
            <CardHeader className="text-center">
               <CardTitle className="text-2xl font-semibold">Campo aggiunto con successo!</CardTitle>
               <p className="text-muted-foreground">Cosa vorresti fare ora?</p>
            </CardHeader>
            <CardContent className="flex justify-center gap-4 pt-2 pb-6">
               <Button onClick={() => {
                  setShowSuccess(false)
                  form.reset()
               }} variant="outline">
                  Aggiungi un altro campo
               </Button>
               <Button onClick={() => router.push(paths.lands)}>
                  Vai alla lista dei campi
               </Button>
            </CardContent>
         </>
      )
   }

   return (
      <CardContent className="p-0">
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                           <FormItem className="space-y-2">
                              <FormLabel className="text-base font-medium block">Nome del campo</FormLabel>
                              <FormControl>
                                 <Input
                                    placeholder="Inserisci il nome del campo"
                                    className="h-10"
                                    {...field}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                           <FormItem className="space-y-2">
                              <FormLabel className="text-base font-medium block">Anno</FormLabel>
                              <FormControl>
                                 <Input
                                    type="number"
                                    min="2020"
                                    max="2100"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">Disegna il campo sulle mappe</h3>
                        <TooltipProvider>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                 <p>
                                    Usa le strumenti di disegno in alto sulla mappa per delineare il tuo campo. Puoi disegnare un poligono o un rettangolo.
                                 </p>
                              </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                     </div>

                     <FormField
                        control={form.control}
                        name="drawingMethod"
                        render={({ field }) => (
                           <Tabs defaultValue="draw" onValueChange={field.onChange} className="mb-4 h-[600px]">
                              <TabsContent value="draw" className="relative mt-2 rounded-lg border h-[600px]">
                                 <MapboxExample lands={lands} newLand={true} setArea={(value) => {
                                    form.setValue("area", value)
                                    console.log("area set ARES", value)
                                 }} setCoordinates={(value) => form.setValue("coordinates", JSON.parse(JSON.stringify(value)))} />
                              </TabsContent>
                           </Tabs>
                        )}
                     />

                     <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                           control={form.control}
                           name="area"
                           render={({ field }) => (
                              <FormItem className="space-y-2">
                                 <FormLabel className="text-base font-medium block">Area (ettari)</FormLabel>
                                 <FormControl>
                                    <Input
                                       type="number"
                                       step="0.01"
                                       className="h-10"
                                       {...field}
                                       onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                    />
                                 </FormControl>
                                 <p className="text-sm text-muted-foreground mt-1.5">
                                    Questo valore viene calcolato automaticamente dalla tua disegno, ma può essere modificato se necessario.
                                 </p>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        <FormField
                           control={form.control}
                           name="soilType"
                           render={({ field }) => (
                              <FormItem className="space-y-2">
                                 <FormLabel className="text-base font-medium block">Tipo di coltura</FormLabel>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                       <FormControl>
                                          <Button
                                             variant="outline"
                                             role="combobox"
                                             className={cn(
                                                "h-10 w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                             )}
                                          >
                                             {field.value || "Seleziona una coltura"}
                                          </Button>
                                       </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0" align="start">
                                       <Command>
                                          <CommandInput placeholder="Cerca una coltura..." className="h-10" />
                                          <CommandList>
                                             <CommandEmpty>
                                                <div className="p-2">
                                                   <p className="text-sm mb-2">Nessuna coltura trovata.</p>
                                                   <div className="flex gap-2 items-center">
                                                      <Input
                                                         placeholder="Inserisci coltura personalizzata"
                                                         value={field.value && !isInSoilTypes(field.value) ? field.value : ""}
                                                         onChange={(e) => field.onChange(e.target.value)}
                                                         className="h-9"
                                                      />
                                                      <Button
                                                         type="button"
                                                         size="sm"
                                                         onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Inserisci coltura personalizzata"]');
                                                            if (input && input.value) {
                                                               field.onChange(input.value);
                                                               const popoverTrigger = document.querySelector('[role="combobox"]');
                                                               if (popoverTrigger) {
                                                                  popoverTrigger.click();
                                                               }
                                                            }
                                                         }}
                                                      >
                                                         Conferma
                                                      </Button>
                                                   </div>
                                                </div>
                                             </CommandEmpty>
                                             {Object.keys(SOIL_TYPES).map((category) => (
                                                <CommandGroup key={category} heading={category}>
                                                   {SOIL_TYPES[category].map((item) => (
                                                      <CommandItem
                                                         key={item}
                                                         value={item}
                                                         onSelect={(value) => {
                                                            field.onChange(value)
                                                         }}
                                                      >
                                                         <Check
                                                            className={cn(
                                                               "mr-2 h-4 w-4",
                                                               field.value === item ? "opacity-100" : "opacity-0"
                                                            )}
                                                         />
                                                         {item}
                                                      </CommandItem>
                                                   ))}
                                                </CommandGroup>
                                             ))}
                                             <CommandGroup heading="Opzioni personalizzate">
                                                <div className="p-2">
                                                   <div className="flex gap-2 items-center">
                                                      <Input
                                                         placeholder="Inserisci coltura personalizzata"
                                                         value={field.value && !isInSoilTypes(field.value) ? field.value : ""}
                                                         onChange={(e) => field.onChange(e.target.value)}
                                                         className="h-9"
                                                      />
                                                      <Button
                                                         type="button"
                                                         size="sm"
                                                         onClick={() => {
                                                            const popoverTrigger = document.querySelector('[role="combobox"]');
                                                            if (popoverTrigger) {
                                                               popoverTrigger.click();
                                                            }
                                                         }}
                                                      >
                                                         Conferma
                                                      </Button>
                                                   </div>
                                                </div>
                                             </CommandGroup>
                                          </CommandList>
                                       </Command>
                                    </PopoverContent>
                                 </Popover>
                                 <p className="text-sm text-muted-foreground mt-1.5">
                                    Inserisci il tipo di coltura che è stata piantata nel campo nel corso dell'anno {form.watch("year")}. Puoi selezionare dalla lista o inserire un valore personalizzato.
                                 </p>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>
                  </div>

                  <FormField
                     control={form.control}
                     name="color"
                     render={({ field }) => (
                        <FormItem className="space-y-2">
                           <FormLabel className="text-base font-medium block">Colore del campo</FormLabel>
                           <FormControl>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <Button
                                       variant="outline"
                                       className="w-full justify-start text-left font-normal h-10"
                                       style={{ backgroundColor: field.value }}
                                    >
                                       <div className="w-full flex items-center gap-2">
                                          <div
                                             className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
                                             style={{ background: field.value }}
                                          ></div>
                                          <div className="flex-1 truncate text-white mix-blend-difference">
                                             {field.value}
                                          </div>
                                       </div>
                                    </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0" align="start">
                                    <SketchPicker
                                       color={field.value}
                                       onChangeComplete={(color) => field.onChange(color.hex)}
                                    />
                                 </PopoverContent>
                              </Popover>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="notes"
                     render={({ field }) => (
                        <FormItem className="space-y-2">
                           <FormLabel className="text-base font-medium block">Note</FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Note aggiuntive sul campo (opzionale)"
                                 className="min-h-[120px] resize-none"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" type="button" className="px-6">
                     Annulla
                  </Button>
                  <Button disabled={isSubmitting} type="submit" className="px-6">
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Aggiunta in corso...
                        </>
                     ) : (
                        "Aggiungi campo"
                     )}
                  </Button>
               </div>
            </form>
         </Form>
      </CardContent>
   )
}
