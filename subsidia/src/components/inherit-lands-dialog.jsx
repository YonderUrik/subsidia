"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Loader2, Sprout } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export function InheritLandsDialog({ targetYear, existingLandNames, onInherited, trigger }) {
   const [open, setOpen] = useState(false)
   const [availableYears, setAvailableYears] = useState([])
   const [sourceYear, setSourceYear] = useState("")
   const [sourceLands, setSourceLands] = useState([])
   const [loadingYears, setLoadingYears] = useState(false)
   const [loadingLands, setLoadingLands] = useState(false)
   const [selectedIds, setSelectedIds] = useState([])
   const [isSubmitting, setIsSubmitting] = useState(false)

   const existingNamesSet = useMemo(
      () => new Set((existingLandNames || []).map(n => n.toLowerCase())),
      [existingLandNames]
   )

   // Load the years the user can inherit from whenever the dialog opens
   useEffect(() => {
      if (!open) return

      const fetchYears = async () => {
         try {
            setLoadingYears(true)
            const response = await axios.get("/api/distinct-lands-year")
            const pastYears = response.data.filter(y => y !== targetYear)
            setAvailableYears(pastYears)
            setSourceYear(pastYears.length > 0 ? pastYears[0].toString() : "")
         } catch (error) {
            toast.error(error.response?.data?.error || "Errore nel caricamento degli anni")
         } finally {
            setLoadingYears(false)
         }
      }

      fetchYears()
   }, [open, targetYear])

   // Load lands for the chosen source year
   useEffect(() => {
      if (!open || !sourceYear) {
         setSourceLands([])
         setSelectedIds([])
         return
      }

      const fetchLands = async () => {
         try {
            setLoadingLands(true)
            const response = await axios.get("/api/lands", { params: { year: sourceYear } })
            setSourceLands(response.data)
            // Preselect lands whose name doesn't already exist in the target year
            setSelectedIds(
               response.data
                  .filter(l => !existingNamesSet.has(l.name.toLowerCase()))
                  .map(l => l.id)
            )
         } catch (error) {
            toast.error(error.response?.data?.error || "Errore nel caricamento dei terreni")
         } finally {
            setLoadingLands(false)
         }
      }

      fetchLands()
   }, [open, sourceYear, existingNamesSet])

   const toggleLand = (id, checked) => {
      setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id))
   }

   const handleInherit = async () => {
      if (selectedIds.length === 0) return

      try {
         setIsSubmitting(true)
         const response = await axios.post("/api/lands/inherit", {
            sourceYear: parseInt(sourceYear),
            targetYear,
            landIds: selectedIds
         })
         toast.success(`${response.data.count} terreni ereditati da ${sourceYear}`)
         setOpen(false)
         onInherited?.()
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore nell'ereditarietà dei terreni")
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            {trigger || (
               <Button variant="outline">
                  <Sprout className="mr-2 h-4 w-4" />
                  Eredita terreni
               </Button>
            )}
         </DialogTrigger>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Eredita terreni da un anno precedente</DialogTitle>
               <DialogDescription>
                  Copia i terreni di un anno passato nell&apos;anno {targetYear}, senza dover reinserire manualmente i dati.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
               <p className="text-sm font-medium">Anno sorgente</p>
               <Select value={sourceYear} onValueChange={setSourceYear} disabled={loadingYears || availableYears.length === 0}>
                  <SelectTrigger>
                     <SelectValue placeholder={availableYears.length === 0 ? "Nessun anno disponibile" : "Seleziona anno"} />
                  </SelectTrigger>
                  <SelectContent>
                     {availableYears.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto">
               {loadingLands ? (
                  <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
               ) : sourceLands.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                     {sourceYear ? "Nessun terreno trovato per l'anno selezionato" : "Seleziona un anno per vedere i terreni disponibili"}
                  </p>
               ) : (
                  sourceLands.map((land) => {
                     const alreadyExists = existingNamesSet.has(land.name.toLowerCase())
                     return (
                        <label
                           key={land.id}
                           className="flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
                        >
                           <Checkbox
                              checked={selectedIds.includes(land.id)}
                              onCheckedChange={(checked) => toggleLand(land.id, checked)}
                           />
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{land.name}</p>
                              <p className="text-xs text-muted-foreground">{land.soilType} · {land.area} ha</p>
                           </div>
                           {alreadyExists && (
                              <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50">
                                 già esistente in {targetYear}
                              </Badge>
                           )}
                        </label>
                     )
                  })
               )}
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
               <Button onClick={handleInherit} disabled={isSubmitting || selectedIds.length === 0}>
                  {isSubmitting ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ereditando...
                     </>
                  ) : (
                     `Eredita ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}
