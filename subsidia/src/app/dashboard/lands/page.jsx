"use client"

import Link from "next/link"
import { Plus, Search, Filter, X, Layout, Layers, Leaf } from "lucide-react"

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
import { formatNumber } from "@/lib/utils"

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
   const [stats, setStats] = useState({
      totalHectares: 0,
      landCount: 0,
      hectaresBySoilType: {}
   })

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
         
         // Calculate statistics
         const totalHectares = response.data.reduce((sum, land) => sum + (land.area || 0), 0);
         const landCount = response.data.length;
         
         // Group by soil type
         const hectaresBySoilType = response.data.reduce((acc, land) => {
            const soilType = land.soilType || "Non specificato";
            acc[soilType] = (acc[soilType] || 0) + (land.area || 0);
            return acc;
         }, {});
         
         setStats({
            totalHectares,
            landCount,
            hectaresBySoilType
         });
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

         {/* Stats cards */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-sm p-0">
               <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Layout className="h-5 w-5 text-green-700" />
                     </div>
                     <div className="flex flex-col flex-1">
                        <p className="text-xs text-slate-500 leading-none">Ettari totali</p>
                        <p className="text-xl font-bold text-green-700">{formatNumber(stats.totalHectares.toFixed(4), false)} ha</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm p-0">
               <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-blue-700" />
                     </div>
                     <div className="flex flex-col flex-1">
                        <p className="text-xs text-slate-500 leading-none">Numero terreni</p>
                        <p className="text-xl font-bold text-blue-700">{stats.landCount}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm p-0">
               <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-amber-700" />
                     </div>
                     <div className="flex flex-col flex-1">
                        <p className="text-xs text-slate-500 leading-none">Nr. di Colture</p>
                        <p className="text-xl font-bold text-amber-700">{Object.keys(stats.hectaresBySoilType).length}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
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
                        {isLoading ? (
                           <div className="h-[600px] w-full flex items-center justify-center bg-muted/20">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                 <Layout className="h-8 w-8 animate-pulse" />
                                 <p>Caricamento terreni...</p>
                              </div>
                           </div>
                        ) : lands.length === 0 ? (
                           <div className="h-[600px] w-full flex items-center justify-center bg-muted/20">
                              <div className="flex flex-col items-center gap-4 text-muted-foreground max-w-md text-center p-6">
                                 <Layout className="h-8 w-8" />
                                 <div>
                                    <p className="text-lg font-medium mb-1">Nessun terreno trovato</p>
                                    <p className="text-sm">Non ci sono terreni per i filtri selezionati. Modifica i filtri o aggiungi un nuovo terreno.</p>
                                 </div>
                                 <Link href={paths.new_land}>
                                    <Button>
                                       <Plus className="mr-2 h-4 w-4" />
                                       Aggiungi Terreno
                                    </Button>
                                 </Link>
                              </div>
                           </div>
                        ) : (
                           <LandsMap lands={lands} />
                        )}
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
                        {isLoading ? (
                           <div className="w-full py-24 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                 <Layers className="h-8 w-8 animate-pulse" />
                                 <p>Caricamento terreni...</p>
                              </div>
                           </div>
                        ) : lands.length === 0 ? (
                           <div className="w-full py-16 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-4 text-muted-foreground max-w-md text-center">
                                 <Layers className="h-8 w-8" />
                                 <div>
                                    <p className="text-lg font-medium mb-1">Nessun terreno trovato</p>
                                    <p className="text-sm">Non ci sono terreni per i filtri selezionati. Modifica i filtri o aggiungi un nuovo terreno.</p>
                                 </div>
                                 <Link href={paths.new_land}>
                                    <Button>
                                       <Plus className="mr-2 h-4 w-4" />
                                       Aggiungi Terreno
                                    </Button>
                                 </Link>
                              </div>
                           </div>
                        ) : (
                           <LandsList lands={lands} refreshData={getLands} />
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>
      </div>
   )
}
