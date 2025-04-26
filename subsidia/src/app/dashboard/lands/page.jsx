"use client"

import Link from "next/link"
import { Plus, Search, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { paths } from "@/lib/paths"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { LandsList } from "@/components/lands-list"
import { LandsMap } from "@/components/lands-map"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import axios from "axios"

export default function LandsPage() {
   const [lands, setLands] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
   const [nameFilter, setNameFilter] = useState("")
   const [selectedSoilType, setSelectedSoilType] = useState("all")
   const [years, setYears] = useState([])
   const [soilTypes, setSoilTypes] = useState([])
   const [filtersOpen, setFiltersOpen] = useState(false)
   const [activeFiltersCount, setActiveFiltersCount] = useState(0)

   useEffect(() => {
      // Calculate active filters count
      let count = 0
      if (nameFilter) count++
      if (selectedSoilType !== "all") count++
      setActiveFiltersCount(count)
   }, [nameFilter, selectedSoilType])

   useEffect(() => {
      const fetchYears = async () => {
         try {
            const response = await axios.get("/api/distinct-lands-year")
            setYears(response.data)
         } catch (error) {
            toast.error(error.response.data.error || "Errore nel fetch dei distretti")
         }
      }

      fetchYears()
   }, [])

   useEffect(() => {
      const fetchSoilTypes = async () => {
         try {
            const response = await axios.get("/api/distinct-soil-types", {
               params: {
                  year: selectedYear
               }
            })
            setSoilTypes(response.data)
         } catch (error) {
            toast.error(error.response.data.error || "Errore nel fetch dei tipi di suolo")
         }
      }

      fetchSoilTypes()
   }, [selectedYear])

   const getLands = useCallback(async () => {
      try {
         setIsLoading(true)
         const response = await axios.get("/api/lands", {
            params: {
               year: selectedYear,
               name: nameFilter || undefined,
               soilType: selectedSoilType === "all" ? undefined : selectedSoilType
            }
         })
         setLands(response.data)
      } catch (error) {
         toast.error(error.response.data.error || "Errore nel fetch dei campi")
      } finally {
         setIsLoading(false)
      }
   }, [selectedYear, nameFilter, selectedSoilType])

   useEffect(() => {
      getLands()
   }, [getLands])

   const handleNameFilterChange = (e) => {
      setNameFilter(e.target.value)
   }

   const handleClearFilters = () => {
      setNameFilter("")
      setSelectedSoilType("all")
   }

   return (
      <div className="flex min-h-screen flex-col px-6 py-6">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Terreni</h1>
            </div>
            <div className="flex items-center gap-2">
               <div className="relative" style={{ zIndex: 100 }}>
                  <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                     <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                           <Filter className="h-4 w-4" />
                           Filtri
                           {activeFiltersCount > 0 && (
                              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                 {activeFiltersCount}
                              </Badge>
                           )}
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[400px] p-4" align="end" sideOffset={5} style={{ zIndex: 100 }}>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <p className="text-sm font-medium">Anno</p>
                              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Seleziona Anno" />
                                 </SelectTrigger>
                                 <SelectContent style={{ zIndex: 110 }}>
                                    {years.map((year) => (
                                       <SelectItem key={year} value={year.toString()}>
                                          {year}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>

                           <div className="space-y-2">
                              <p className="text-sm font-medium">Nome</p>
                              <div className="relative">
                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                 <Input
                                    placeholder="Cerca per nome..."
                                    className="pl-8"
                                    value={nameFilter}
                                    onChange={handleNameFilterChange}
                                 />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <p className="text-sm font-medium">Coltura</p>
                              <Select value={selectedSoilType} onValueChange={setSelectedSoilType}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Seleziona tipo di suolo" />
                                 </SelectTrigger>
                                 <SelectContent style={{ zIndex: 110 }}>
                                    <SelectItem value="all">Tutti</SelectItem>
                                    {soilTypes.map((soilType) => (
                                       <SelectItem key={soilType} value={soilType}>
                                          {soilType}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                           
                           {(nameFilter || selectedSoilType !== "all") && (
                              <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={handleClearFilters}
                                 className="w-full mt-2"
                              >
                                 <X className="h-4 w-4 mr-1" />
                                 Pulisci filtri
                              </Button>
                           )}
                        </div>
                     </PopoverContent>
                  </Popover>
               </div>
               
               {(nameFilter || selectedSoilType !== "all") && (
                  <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={handleClearFilters}
                     className="h-8 px-2"
                  >
                     <X className="h-4 w-4 mr-1" />
                     Pulisci
                  </Button>
               )}
               
               <Link href={paths.new_land}>
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Aggiungi Terreno
                  </Button>
               </Link>
            </div>
         </div>

         <div className="mt-6">
            <Tabs defaultValue="map" className="relative" style={{ zIndex: 1 }}>
               <TabsList className="mb-4">
                  <TabsTrigger value="map">Vista Mappa</TabsTrigger>
                  <TabsTrigger value="list">Vista Lista</TabsTrigger>
               </TabsList>
               <TabsContent value="map">
                  <Card>
                     <CardHeader>
                        <CardTitle>Mappa Terreni</CardTitle>
                        <CardDescription>Visualizza e modifica i tuoi terreni sulla mappa</CardDescription>
                     </CardHeader>
                     <CardContent className="p-0">
                        <LandsMap lands={lands} />
                     </CardContent>
                  </Card>
               </TabsContent>
               <TabsContent value="list">
                  <Card>
                     <CardHeader>
                        <CardTitle>Lista Terreni</CardTitle>
                        <CardDescription>Gestione dei tuoi terreni e dei loro dettagli</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <LandsList lands={lands} refreshData={getLands} />
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>
      </div>
   )
}
