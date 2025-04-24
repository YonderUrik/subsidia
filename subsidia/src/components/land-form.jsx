"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarIcon, MapPin, Info, Upload, Check, Loader2 } from "lucide-react"
import { format } from "date-fns"
import dynamic from "next/dynamic"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { fixLeafletIcon } from "@/lib/leaflet-utils"
import { useForm } from "react-hook-form"
import { SOIL_TYPES } from "@/lib/config"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { toast } from "sonner"
import axios from "axios"
import { paths } from "@/lib/paths"

// Form validation schema
const formSchema = z.object({
   name: z.string().min(1, "Field name is required"),
   area: z.number().min(0.01, "Area must be greater than 0"),
   coordinates: z.array(z.any()).min(3, "At least 3 coordinates are required"),
   date: z.date().optional(),
   soilType: z.string().min(1, "Please select a soil type"),
   notes: z.string().optional(),
   year: z.number().min(2020, "Year must be greater than 2020"),
   drawingMethod: z.string().optional()
})

// Import Leaflet components dynamically to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("./map-components/land-form-map"), {
   ssr: false,
   loading: () => (
      <div className="h-[500px] w-full flex items-center justify-center bg-muted/20">
         <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 animate-pulse" />
            <p>Caricamento mappa...</p>
         </div>
      </div>
   ),
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
         drawingMethod: "draw"
      }
   })

   // Fix Leaflet icon issue
   useEffect(() => {
      fixLeafletIcon()
   }, [])

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
         <div className="flex flex-col items-center gap-6 py-12">
            <div className="text-center">
               <h2 className="text-2xl font-semibold mb-2">Campo aggiunto con successo!</h2>
               <p className="text-muted-foreground">Cosa vorresti fare ora?</p>
            </div>
            <div className="flex gap-4">
               <Button onClick={() => {
                  setShowSuccess(false)
                  form.reset()
               }} variant="outline">
                  Aggiungi un altro campo
               </Button>
               <Button onClick={() => router.push(paths.lands)}>
                  Vai alla lista dei campi
               </Button>
            </div>
         </div>
      )
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
               <div className="grid gap-8 md:grid-cols-2">
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-base font-semibold">Nome del campo</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder="Inserisci il nome del campo"
                                 className="h-11"
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
                        <FormItem>
                           <FormLabel className="text-base font-semibold">Anno</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min="2020"
                                 max="2100"
                                 className="h-11"
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
                  <FormLabel className="flex items-center gap-2 text-base font-semibold">
                     Disegna il campo sulle mappe
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
                  </FormLabel>

                  <FormField
                     control={form.control}
                     name="drawingMethod"
                     render={({ field }) => (
                        <Tabs defaultValue="draw" onValueChange={field.onChange} className="mb-4">
                           <TabsContent value="draw" className="relative mt-2 rounded-lg border shadow-sm">
                              <MapWithNoSSR
                                 setArea={(value) => form.setValue("area", value)}
                                 setCoordinates={(value) => form.setValue("coordinates", JSON.parse(JSON.stringify(value)))}
                                 showSoilOverlay={form.watch("showSoilOverlay")}
                                 showElevationOverlay={form.watch("showElevationOverlay")}
                              />
                           </TabsContent>
                        </Tabs>
                     )}
                  />

                  <div className="grid gap-8 md:grid-cols-2">
                     <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel className="text-base font-semibold">Area (ettari)</FormLabel>
                              <FormControl>
                                 <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-muted h-11"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                 />
                              </FormControl>
                              <p className="mt-2 text-sm text-muted-foreground">
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
                           <FormItem>
                              <FormLabel className="text-base font-semibold">Tipo di coltura</FormLabel>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <FormControl>
                                       <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                             "h-11 w-full justify-between",
                                             !field.value && "text-muted-foreground"
                                          )}
                                       >
                                          {field.value || "Seleziona una coltura"}
                                       </Button>
                                    </FormControl>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                       <CommandInput placeholder="Cerca una coltura..." className="h-11" />
                                       <CommandList>
                                          <CommandEmpty>Nessuna coltura trovata.</CommandEmpty>
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
                                       </CommandList>
                                    </Command>
                                 </PopoverContent>
                              </Popover>
                              <p className="mt-2 text-sm text-muted-foreground">
                                 Inserisci il tipo di coltura che è stata piantata nel campo nel corso dell'anno {form.watch("year")}.
                              </p>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel className="text-base font-semibold">Note</FormLabel>
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

            <div className="flex justify-end gap-3 pt-4">
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
   )
}
