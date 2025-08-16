"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Trash2, Tag, Filter, Weight, Pencil } from "lucide-react"
import { CreditCard, Clock, Euro } from "lucide-react"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { paths } from "@/lib/paths"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { toast } from "sonner"
import { debounce } from "lodash"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { formatNumber } from "@/lib/utils"

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover"

// Initialize dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

export default function HarvestsListPage() {
   // State variables
   const [year, setYear] = useState(new Date().getFullYear())
   const [searchTerm, setSearchTerm] = useState("")
   const [notesKeyword, setNotesKeyword] = useState("")
   const [notesKeywordInput, setNotesKeywordInput] = useState("")
   const [harvests, setHarvests] = useState([])
   const [years, setYears] = useState([])
   const [totalPaid, setTotalPaid] = useState(0)
   const [totalToPay, setTotalToPay] = useState(0)
   const [totalQuantity, setTotalQuantity] = useState(0)
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)
   
   // Filter states
   const [dateFilter, setDateFilter] = useState(null)
   const [clientFilter, setClientFilter] = useState("all")
   const [landFilter, setLandFilter] = useState("all")
   const [soilTypeFilter, setSoilTypeFilter] = useState("all")
   const [activeFilter, setActiveFilter] = useState(null) // 'paid', 'unpaid'
   
   // Available client and land options for filters
   const [clientOptions, setClientOptions] = useState([])
   const [landOptions, setLandOptions] = useState([])
   const [soilTypeOptions, setSoilTypeOptions] = useState([])
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState(1)
   const [pageSize, setPageSize] = useState(10)
   const [totalCount, setTotalCount] = useState(0)
   const [totalPages, setTotalPages] = useState(1)

   // Selection and deletion states
   const [selectedHarvests, setSelectedHarvests] = useState([])
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [harvestToDelete, setHarvestToDelete] = useState(null)
   
   // Function to get harvests with filters
   const getHarvests = useCallback(async (search) => {
      setIsLoading(true)
      setError(null)
      try {
         // Calculate date range based on year filter
         let fromDate, toDate
         
         if (dateFilter) {
            // If specific date is selected
            fromDate = dayjs(dateFilter).startOf('day').utc().format()
            toDate = dayjs(dateFilter).endOf('day').utc().format()
         } else {
            // Filter by year
            fromDate = dayjs().year(parseInt(year)).month(0).date(1).startOf('day').utc().format()
            toDate = dayjs().year(parseInt(year) + 1).month(0).date(1).startOf('day').utc().format()
         }
         
         // Build additional filter based on active filter
         let additionalFilter = {}
         if (activeFilter === 'paid') {
            additionalFilter = { isPaid: 'true' }
         } else if (activeFilter === 'unpaid') {
            additionalFilter = { isPaid: 'false' }
         }
         
         // Process client, land, and soil type filters
         const clientParam = clientFilter === "all" ? null : clientFilter
         const landNameParam = landFilter === "all" ? null : landFilter
         const soilTypeParam = soilTypeFilter === "all" ? null : soilTypeFilter
         
         const response = await axios.get('/api/harvests', {
            params: {
               from: fromDate,
               to: toDate,
               search: search,
               client: clientParam,
               landName: landNameParam,
               soilType: soilTypeParam,
               notesKeyword: notesKeyword,
               page: currentPage,
               pageSize: pageSize,
               ...additionalFilter
            }
         })
         
         setHarvests(response.data.data || response.data)
         if (response.data.totalPaid !== undefined) {
            setTotalPaid(response.data.totalPaid)
            setTotalToPay(response.data.totalToPay)
         }
         if (response.data.totalQuantity !== undefined) {
            setTotalQuantity(response.data.totalQuantity)
         }
         if (response.data.years) {
            setYears(response.data.years)
            if (response.data.years.length > 0 && !years.includes(year)) {
               setYear(response.data.years[0])
            }
         }
         if (response.data.totalCount !== undefined) {
            setTotalCount(response.data.totalCount)
            setTotalPages(response.data.totalPages)
         } else {
            setTotalCount(response.data.length)
            setTotalPages(Math.ceil(response.data.length / pageSize))
         }
         
         // Collect unique clients, lands, and soil types for filters
         if (response.data.clients) {
            setClientOptions(response.data.clients)
         } else {
            const clients = [...new Set(response.data.map(h => h.client).filter(Boolean))]
            setClientOptions(clients)
         }
         
         if (response.data.lands) {
            const distinctLands = [...new Set(response.data.lands.map(land => land.name))]
               .map(name => response.data.lands.find(land => land.name === name))
            setLandOptions(distinctLands)
         }
         
         if (response.data.soilTypes) {
            setSoilTypeOptions(response.data.soilTypes)
         } else {
            const soilTypes = [...new Set(response.data.map(h => h.land?.soilType).filter(Boolean))]
            setSoilTypeOptions(soilTypes)
         }
         
      } catch (error) {
         setError(error.response?.data?.error || "Errore nel caricamento dei raccolti")
         toast.error(error.response?.data?.error || "Errore nel caricamento dei raccolti")
      } finally {
         setIsLoading(false)
      }
   }, [year, dateFilter, clientFilter, landFilter, soilTypeFilter, activeFilter, currentPage, pageSize, notesKeyword])

   const debouncedSearch = useMemo(
      () => debounce((search) => getHarvests(search), 500),
      [getHarvests]
   )

   // Effect to fetch harvests when filters change
   useEffect(() => {
      debouncedSearch(searchTerm)
      return () => {
         debouncedSearch.cancel()
      }
   }, [debouncedSearch, searchTerm])
   
   // Reset to first page when filters change
   useEffect(() => {
      setCurrentPage(1)
   }, [year, dateFilter, clientFilter, landFilter, soilTypeFilter, activeFilter, searchTerm, notesKeyword])
   
   // Clear selections when filters change
   useEffect(() => {
      setSelectedHarvests([])
   }, [year, dateFilter, clientFilter, landFilter, soilTypeFilter, activeFilter, currentPage])

   // Page navigation handlers
   const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setCurrentPage(newPage)
      }
   }

   const handlePageSizeChange = (newSize) => {
      setPageSize(parseInt(newSize))
      setCurrentPage(1) // Reset to first page when changing page size
   }
   
   // Toggle filter function
   const toggleFilter = (filter) => {
      if (activeFilter === filter) {
         // If clicking the currently active filter, clear it
         setActiveFilter(null)
      } else {
         // Otherwise set the new filter
         setActiveFilter(filter)
      }
   }
   
   // Notes keyword filter handlers
   const debouncedNotesSearch = useMemo(
      () => debounce((value) => {
         setNotesKeyword(value)
      }, 500),
      []
   )

   const handleNotesInputChange = (e) => {
      const value = e.target.value
      setNotesKeywordInput(value)
      debouncedNotesSearch(value)
   }

   const handleNotesKeywordSelect = (keyword) => {
      setNotesKeywordInput(keyword)
      setNotesKeyword(keyword)
   }
   
   const clearNotesFilter = () => {
      setNotesKeywordInput("")
      setNotesKeyword("")
   }
   
   // Selection and deletion handlers
   const handleDeleteClick = (harvest) => {
      setHarvestToDelete(harvest)
      setIsDeleteDialogOpen(true)
   }
   
   const confirmDelete = async () => {
      if (!harvestToDelete) return
      
      try {
         if (Array.isArray(harvestToDelete)) {
            // Bulk deletion
            await axios.delete(`/api/harvests/bulk`, {
               data: { ids: harvestToDelete.map(h => h.id) }
            })
            toast.success(`${harvestToDelete.length} raccolti eliminati con successo`)
            setSelectedHarvests([])
         } else {
            // Single deletion
            await axios.delete(`/api/harvests?id=${harvestToDelete.id}`)
            toast.success("Raccolto eliminato con successo")
         }
         getHarvests(searchTerm) // Refresh the list
      } catch (error) {
         console.error("Error deleting harvest:", error)
         toast.error(error.response?.data?.error || "Errore durante l'eliminazione dei raccolti")
      } finally {
         setHarvestToDelete(null)
         setIsDeleteDialogOpen(false)
      }
   }
   
   const handleBulkDeleteClick = () => {
      if (selectedHarvests.length > 0) {
         setHarvestToDelete(selectedHarvests)
         setIsDeleteDialogOpen(true)
      }
   }
   
   const handleSelectRow = (harvest, checked) => {
      if (checked) {
         setSelectedHarvests(prev => [...prev, harvest])
      } else {
         setSelectedHarvests(prev => prev.filter(h => h.id !== harvest.id))
      }
   }
   
   const handleSelectAll = (checked) => {
      if (checked) {
         setSelectedHarvests(harvests)
      } else {
         setSelectedHarvests([])
      }
   }

   return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
         {/* HEADER */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Raccolti</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
               <Link href={paths.new_harvest} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                     <Plus className="mr-2 h-4 w-4" />
                     Aggiungi Raccolto
                  </Button>
               </Link>
            </div>
         </div>

         {/* SUMMARY CARDS */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Card 
               className={`bg-gradient-to-br p-1 from-blue-50 to-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${activeFilter === 'paid' ? 'ring-2 ring-blue-400' : ''}`}
               onClick={() => toggleFilter('paid')}
            >
               <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-blue-700" />
                     </div>
                     <div className="flex flex-col flex-1">
                        <p className="text-xs text-slate-500 leading-none">Totale pagato</p>
                        <p className="text-lg font-bold text-blue-700 leading-tight">{formatNumber(totalPaid)}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
            <Card 
               className={`bg-gradient-to-br p-1 from-amber-50 to-amber-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${activeFilter === 'unpaid' ? 'ring-2 ring-amber-400' : ''}`}
               onClick={() => toggleFilter('unpaid')}
            >
               <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-amber-700" />
                     </div>
                     <div className="flex flex-col flex-1">
                        <p className="text-xs text-slate-500 leading-none">Da pagare</p>
                        <p className="text-lg font-bold text-amber-700 leading-tight">{formatNumber(totalToPay)}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-gradient-to-br p-1 from-green-50 to-green-100 shadow-sm hover:shadow-md transition-shadow">
               <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Weight className="h-4 w-4 text-green-700" />
                     </div>
                     <div className="flex flex-col flex-1">
                        <p className="text-xs text-slate-500 leading-none">Quantità totale</p>
                        <p className="text-lg font-bold text-green-700 leading-tight">{formatNumber(totalQuantity, false)} Kg</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* FILTER CARD */}
         <Card className="p-0 bg-white shadow-sm">
            <CardContent className="py-3 px-4">
               <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-2">
                  <Select value={year.toString()} onValueChange={setYear}>
                     <SelectTrigger className="h-9 w-full sm:w-auto min-w-[120px]">
                        <SelectValue placeholder="Anno" />
                     </SelectTrigger>
                     <SelectContent>
                        {years.map((y) => (
                           <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>

                  <DatePicker
                     date={dateFilter}
                     setDate={setDateFilter}
                     className="w-full sm:w-auto"
                     placeholder="Filtra per data specifica"
                  />
                  
                  {dateFilter && (
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDateFilter(null)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                     >
                        Rimuovi filtro data
                     </Button>
                  )}
               </div>
            </CardContent>
         </Card>

         <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                     type="search"
                     placeholder="Cerca cliente..."
                     className="pl-8 w-full"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               
               {/* CLIENT FILTER */}
               <div className="w-full sm:w-auto">
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                     <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Filtra per cliente" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Tutti i clienti</SelectItem>
                        {clientOptions.map((client) => (
                           <SelectItem key={client} value={client}>{client}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               
               {/* LAND FILTER */}
               <div className="w-full sm:w-auto">
                  <Select value={landFilter} onValueChange={setLandFilter}>
                     <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Filtra per terreno" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Tutti i terreni</SelectItem>
                        {landOptions.map((land) => (
                           <SelectItem key={land.id} value={land.name}>{land.name}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               
               {/* SOIL TYPE FILTER */}
               <div className="w-full sm:w-auto">
                  <Select value={soilTypeFilter} onValueChange={setSoilTypeFilter}>
                     <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Tipo terreno" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Tutti i tipi</SelectItem>
                        {soilTypeOptions.map((type) => (
                           <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               
               {/* NOTES KEYWORD FILTER */}
               <div className="w-full sm:w-auto">
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-9 justify-between">
                           <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              {notesKeyword ? (
                                 <span className="max-w-[150px] truncate">{notesKeyword}</span>
                              ) : (
                                 <span>Filtra per note</span>
                              )}
                           </div>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[240px] p-0">
                        <div className="p-2">
                           <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                              <Input
                                 type="search"
                                 placeholder="Cerca nelle note..."
                                 className="pl-8 w-full"
                                 value={notesKeywordInput}
                                 onChange={handleNotesInputChange}
                              />
                           </div>
                           {notesKeyword && (
                              <Button 
                                 variant="ghost" 
                                 className="w-full justify-start mb-2 text-red-500 hover:text-red-700 hover:bg-red-50" 
                                 onClick={clearNotesFilter}
                              >
                                 Cancella filtro
                              </Button>
                           )}
                        </div>
                     </PopoverContent>
                  </Popover>
               </div>
            </div>

            {/* Active Filters Summary */}
            <div className="flex flex-wrap gap-2">
               {activeFilter && (
                  <Badge 
                     variant="outline" 
                     className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1 flex items-center gap-1"
                     onClick={() => setActiveFilter(null)}
                  >
                     {activeFilter === 'paid' ? 'Solo pagati' : 'Solo da pagare'}
                     <button className="ml-1 text-blue-700 hover:text-blue-900">×</button>
                  </Badge>
               )}
               {dateFilter && (
                  <Badge 
                     variant="outline" 
                     className="bg-green-50 border-green-200 text-green-700 px-3 py-1 flex items-center gap-1"
                     onClick={() => setDateFilter(null)}
                  >
                     Data: {format(dateFilter, "dd/MM/yyyy")}
                     <button className="ml-1 text-green-700 hover:text-green-900">×</button>
                  </Badge>
               )}
               {clientFilter && clientFilter !== "all" && (
                  <Badge 
                     variant="outline" 
                     className="bg-purple-50 border-purple-200 text-purple-700 px-3 py-1 flex items-center gap-1"
                     onClick={() => setClientFilter("all")}
                  >
                     Cliente: {clientFilter}
                     <button className="ml-1 text-purple-700 hover:text-purple-900">×</button>
                  </Badge>
               )}
               {landFilter && landFilter !== "all" && (
                  <Badge 
                     variant="outline" 
                     className="bg-amber-50 border-amber-200 text-amber-700 px-3 py-1 flex items-center gap-1"
                     onClick={() => setLandFilter("all")}
                  >
                     Terreno: {landFilter}
                     <button className="ml-1 text-amber-700 hover:text-amber-900">×</button>
                  </Badge>
               )}
               {soilTypeFilter && soilTypeFilter !== "all" && (
                  <Badge 
                     variant="outline" 
                     className="bg-slate-50 border-slate-200 text-slate-700 px-3 py-1 flex items-center gap-1"
                     onClick={() => setSoilTypeFilter("all")}
                  >
                     Tipo terreno: {soilTypeFilter}
                     <button className="ml-1 text-slate-700 hover:text-slate-900">×</button>
                  </Badge>
               )}
               {notesKeyword && (
                  <Badge 
                     variant="outline" 
                     className="bg-red-50 border-red-200 text-red-700 px-3 py-1 flex items-center gap-1"
                     onClick={clearNotesFilter}
                  >
                     Note: {notesKeyword}
                     <button className="ml-1 text-red-700 hover:text-red-900">×</button>
                  </Badge>
               )}
            </div>

            {/* Bulk actions */}
            {selectedHarvests.length > 0 && (
               <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">
                     {selectedHarvests.length} {selectedHarvests.length === 1 ? 'raccolto selezionato' : 'raccolti selezionati'}
                  </p>
                  <Button 
                     variant="destructive" 
                     size="sm" 
                     onClick={handleBulkDeleteClick}
                     className="bg-red-600 hover:bg-red-700"
                  >
                     <Trash2 className="h-4 w-4 mr-2" />
                     Elimina selezionati
                  </Button>
               </div>
            )}

            {/* TABLE OF HARVESTS */}
            <Card className="overflow-hidden">
               <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="w-[40px]">
                                 <Checkbox 
                                    checked={selectedHarvests.length === harvests.length && harvests.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Seleziona tutti i raccolti"
                                 />
                              </TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Terreno</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Quantità</TableHead>
                              <TableHead>Prezzo</TableHead>
                              <TableHead>Sconto</TableHead>
                              <TableHead>Stato</TableHead>
                              <TableHead className="text-right">Totale</TableHead>
                              <TableHead className="text-right">Pagato</TableHead>
                              <TableHead>Note</TableHead>
                              <TableHead className="w-[70px]"></TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {isLoading ? (
                              <TableRow>
                                 <TableCell colSpan={12} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                       <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-slate-900"></div>
                                       <p className="mt-2 text-sm text-slate-500">Caricamento raccolti...</p>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ) : error ? (
                              <TableRow>
                                 <TableCell colSpan={12} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                       <p className="text-red-500">{error}</p>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ) : harvests.length === 0 ? (
                              <TableRow>
                                 <TableCell colSpan={12} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                       <p className="text-slate-500">Nessun raccolto trovato</p>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ) : (
                              harvests.map((harvest) => (
                                 <TableRow key={harvest.id}>
                                    <TableCell>
                                       <Checkbox 
                                          checked={selectedHarvests.some(h => h.id === harvest.id)}
                                          onCheckedChange={(checked) => handleSelectRow(harvest, checked)}
                                          aria-label={`Seleziona raccolto di ${harvest.client}`}
                                       />
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap font-medium">
                                       {harvest.client}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {harvest.land?.name}
                                       {harvest.land?.soilType && (
                                          <span className="ml-1 text-xs text-slate-500">
                                             ({harvest.land.soilType})
                                          </span>
                                       )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {harvest.harvestDay 
                                        ? format(new Date(harvest.harvestDay), "dd/MM/yyyy") 
                                        : format(new Date(harvest.createdAt), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>{formatNumber(harvest.quantity, false)} Kg</TableCell>
                                    <TableCell>{formatNumber(harvest.price)} /Kg</TableCell>
                                    <TableCell>
                                       {harvest.discount && harvest.discount > 0 ? (
                                          <span className="text-red-600 dark:text-red-400 font-medium">
                                             {harvest.discount}%
                                          </span>
                                       ) : (
                                          <span className="text-slate-400">-</span>
                                       )}
                                    </TableCell>
                                    <TableCell>
                                       {harvest.isPaid || harvest.paidAmount >= harvest.total ? (
                                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                                             Pagato
                                          </Badge>
                                       ) : harvest.paidAmount > 0 ? (
                                          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
                                             Parziale
                                          </Badge>
                                       ) : (
                                          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                                             Non pagato
                                          </Badge>
                                       )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                       {formatNumber(harvest.total)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                       {harvest.paidAmount > 0 ? (
                                          <div className="flex flex-col items-end">
                                             <span>{formatNumber(harvest.paidAmount)}</span>
                                             {harvest.paidAmount < harvest.total && (
                                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                                   Parziale
                                                </span>
                                             )}
                                          </div>
                                       ) : "-"}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                       {harvest.notes}
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex items-center justify-end space-x-1">
                                          <Link href={paths.harvestEdit(harvest.id)}>
                                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                             </Button>
                                          </Link>
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                             onClick={() => handleDeleteClick(harvest)}
                                          >
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  </div>
               </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 ? (
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 bg-gray-50 px-4 rounded-md border">
                  <div className="flex items-center space-x-2">
                     <p className="text-sm font-medium text-slate-600">
                        Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} di {totalCount} raccolti
                     </p>
                     <div className="flex items-center space-x-1">
                        <span className="text-sm text-slate-600">Righe:</span>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                           <SelectTrigger className="h-8 w-[70px]">
                              <SelectValue placeholder="10" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className="text-sm text-slate-600 hidden sm:inline">Pagina {currentPage} di {totalPages}</span>
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                     >
                        <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                           // Logic to show pages around current page
                           let pageNum;
                           if (totalPages <= 5) {
                              pageNum = i + 1;
                           } else if (currentPage <= 3) {
                              pageNum = i + 1;
                           } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                           } else {
                              pageNum = currentPage - 2 + i;
                           }
                           
                           return (
                              <Button
                                 key={i}
                                 variant={currentPage === pageNum ? "default" : "outline"}
                                 size="icon"
                                 onClick={() => handlePageChange(pageNum)}
                                 className={`h-8 w-8 p-0 ${currentPage === pageNum ? "bg-blue-600" : ""}`}
                              >
                                 {pageNum}
                              </Button>
                           );
                        })}
                     </div>
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                     >
                        <ChevronRight className="h-4 w-4" />
                     </Button>
                  </div>
               </div>
            ) : harvests.length > 0 && (
               <div className="py-2 px-4 text-sm text-slate-600 bg-gray-50 rounded-md border">
                  Mostrando {harvests.length} {harvests.length === 1 ? 'raccolto' : 'raccolti'}
               </div>
            )}
         </div>

         {/* Delete Confirmation Dialog */}
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                  <AlertDialogDescription>
                     {Array.isArray(harvestToDelete) ? (
                        <span>Sei sicuro di voler eliminare {harvestToDelete.length} raccolti? Questa azione non può essere annullata.</span>
                     ) : (
                        <span>Sei sicuro di voler eliminare questo raccolto? Questa azione non può essere annullata.</span>
                     )}
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={confirmDelete}
                     className="bg-red-600 text-white hover:bg-red-700"
                  >
                     Elimina
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   )
}
