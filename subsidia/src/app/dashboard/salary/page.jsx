"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Trash2, Tag } from "lucide-react"
import { format } from "date-fns"
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

const months = [
   "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
   "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
]

export default function SalaryPage() {
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
   const [periodType, setPeriodType] = useState("month") // month, year, all
   const [year, setYear] = useState(new Date().getFullYear())
   const [searchTerm, setSearchTerm] = useState("")
   const [notesKeyword, setNotesKeyword] = useState("")
   const [notesKeywordInput, setNotesKeywordInput] = useState("")
   const [notesKeywords, setNotesKeywords] = useState([])
   const [salaries, setSalaries] = useState([])
   const [totalPayed, setTotalPayed] = useState(0)
   const [totalToPay, setTotalToPay] = useState(0)
   const [years, setYears] = useState([])
   const [groupBy, setGroupBy] = useState("day") // employee, month, year
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState(1)
   const [pageSize, setPageSize] = useState(10)
   const [totalCount, setTotalCount] = useState(0)
   const [totalPages, setTotalPages] = useState(1)

   // Delete dialog states
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [salaryToDelete, setSalaryToDelete] = useState(null)

   const getSalaries = useCallback(async (search) => {
      setIsLoading(true)
      setError(null)
      try {
         // Calculate date range based on selected period
         let fromDate, toDate;
         
         if (periodType === "month") {
            // First create dates in local timezone, then convert to UTC
            const startYear = parseInt(year);
            const startMonth = parseInt(selectedMonth);
            
            // Start of month in local timezone
            fromDate = dayjs()
               .year(startYear)
               .month(startMonth)
               .date(1)
               .hour(0)
               .minute(0)
               .second(0)
               .millisecond(0)
               // Convert to UTC
               .utc()
               .format();
            
            // Start of next month in local timezone
            toDate = dayjs()
               .year(startMonth === 11 ? startYear + 1 : startYear)
               .month(startMonth === 11 ? 0 : startMonth + 1)
               .date(1)
               .hour(0)
               .minute(0)
               .second(0)
               .millisecond(0)
               // Convert to UTC
               .utc()
               .format();
         } else if (periodType === "year") {
            // Start of year in local timezone
            fromDate = dayjs()
               .year(parseInt(year))
               .month(0)
               .date(1)
               .hour(0)
               .minute(0)
               .second(0)
               .millisecond(0)
               // Convert to UTC
               .utc()
               .format();
            
            // Start of next year in local timezone
            toDate = dayjs()
               .year(parseInt(year) + 1)
               .month(0)
               .date(1)
               .hour(0)
               .minute(0)
               .second(0)
               .millisecond(0)
               // Convert to UTC
               .utc()
               .format();
         } else {
            // All time - use distant dates (local to UTC)
            fromDate = dayjs('2000-01-01').utc().format();
            toDate = dayjs('2100-01-01').utc().format();
         }
         
         const response = await axios.get('/api/salaries', {
            params: {
               from: fromDate,
               to: toDate,
               search: search,
               notesKeyword: notesKeyword,
               groupBy: groupBy,
               page: currentPage,
               pageSize: pageSize
            }
         })

         setSalaries(response.data.data)
         setTotalPayed(response.data.totalPayed)
         setTotalToPay(response.data.totalToPay)
         setYears(response.data.years)
         setYear(response.data.years[0])
         setTotalCount(response.data.totalCount)
         setTotalPages(response.data.totalPages)
         
         if (response.data.notesKeywords) {
            setNotesKeywords(response.data.notesKeywords);
         }
      } catch (error) {
         setError(error.response?.data?.error || "Errore nel caricamento delle giornate")
         toast.error(error.response?.data?.error || "Errore nel caricamento delle giornate")
      } finally {
         setIsLoading(false)
      }
   }, [periodType, year, selectedMonth, groupBy, currentPage, pageSize, notesKeyword])

   // Get notes keywords separately
   useEffect(() => {
      const fetchNotesKeywords = async () => {
         try {
            const response = await axios.get('/api/notes-keywords');
            if (response.data.success) {
               setNotesKeywords(response.data.data);
            }
         } catch (error) {
            console.error('Error fetching notes keywords:', error);
         }
      };
      
      fetchNotesKeywords();
   }, []);

   const debouncedSearch = useMemo(
      () => debounce((search) => getSalaries(search), 500),
      [getSalaries]
   )

   // Debounced function for handling notes keyword input
   const debouncedNotesSearch = useMemo(
      () => debounce((value) => {
         setNotesKeyword(value);
      }, 500),
      []
   )

   // Handle input change with debounce
   const handleNotesInputChange = (e) => {
      const value = e.target.value;
      setNotesKeywordInput(value);
      debouncedNotesSearch(value);
   };

   useEffect(() => {
      debouncedSearch(searchTerm)
      return () => {
         debouncedSearch.cancel()
         debouncedNotesSearch.cancel()
      }
   }, [debouncedSearch, searchTerm])
   
   // Reset to first page when filters change
   useEffect(() => {
      setCurrentPage(1)
   }, [periodType, year, selectedMonth, groupBy, searchTerm, notesKeyword])

   const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setCurrentPage(newPage)
      }
   }

   const handlePageSizeChange = (newSize) => {
      setPageSize(parseInt(newSize))
      setCurrentPage(1) // Reset to first page when changing page size
   }
   
   const handleDeleteClick = (salary) => {
      // Only allow deletion for ungrouped (day) records
      if (groupBy === 'day') {
         setSalaryToDelete(salary)
         setIsDeleteDialogOpen(true)
      } else {
         toast.error("Non è possibile eliminare i dati raggruppati. Passa alla visualizzazione per giorno.")
      }
   }
   
   const confirmDelete = async () => {
      if (!salaryToDelete) return
      
      try {
         await axios.delete(`/api/salaries?id=${salaryToDelete.id}`)
         toast.success("Giornata eliminata con successo")
         getSalaries(searchTerm) // Refresh the list
      } catch (error) {
         console.error("Error deleting salary:", error)
         toast.error(error.response?.data?.error || "Errore durante l'eliminazione della giornata")
      } finally {
         setSalaryToDelete(null)
         setIsDeleteDialogOpen(false)
      }
   }
   
   const handleNotesKeywordSelect = (keyword) => {
      setNotesKeywordInput(keyword);
      setNotesKeyword(keyword);
   }
   
   const clearNotesFilter = () => {
      setNotesKeywordInput("");
      setNotesKeyword("");
   }

   return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
         {/* ACTIONS */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Giornate</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
               <Link href={paths.calendar} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     Calendario
                  </Button>
               </Link>
               <Link href={paths.salaryBatchEntry} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                     <Plus className="mr-2 h-4 w-4" />
                     Aggiungi Giornate
                  </Button>
               </Link>
            </div>
         </div>

         {/* TOTALS */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-white/40">
               <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-slate-500">Totale pagato</p>
                     <p className="text-lg font-semibold">€{totalPayed.toLocaleString()}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-white/40">
               <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-slate-500">Da pagare</p>
                     <p className="text-lg font-semibold">€{totalToPay.toLocaleString()}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="sm:col-span-2 bg-white/40">
               <CardContent className="py-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-2">
                     <Select value={periodType} onValueChange={setPeriodType}>
                        <SelectTrigger className="h-9 w-full sm:w-auto min-w-[150px]">
                           <SelectValue placeholder="Tipo periodo" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="month">Mese specifico</SelectItem>
                           <SelectItem value="year">Anno intero</SelectItem>
                           {/* <SelectItem value="all">Tutti i periodi</SelectItem> */}
                        </SelectContent>
                     </Select>

                     {periodType !== "all" && (
                        <Select value={year} onValueChange={setYear}>
                           <SelectTrigger className="h-9 w-full sm:w-auto min-w-[120px]">
                              <SelectValue placeholder="Anno" />
                           </SelectTrigger>
                           <SelectContent>
                              {years.map((y) => (
                                 <SelectItem key={y} value={y}>{y}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}

                     {periodType === "month" && (
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                           <SelectTrigger className="h-9 w-full sm:w-auto min-w-[150px]">
                              <SelectValue placeholder="Mese" />
                           </SelectTrigger>
                           <SelectContent>
                              {months.map((month, index) => (
                                 <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="w-full sm:w-auto">
                  <Tabs value={groupBy} onValueChange={setGroupBy} defaultValue="day" className="w-full">
                     <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="day">Giorno</TabsTrigger>
                        <TabsTrigger value="week">Settimana</TabsTrigger>
                        <TabsTrigger value="month">Mese</TabsTrigger>
                        <TabsTrigger value="year">Anno</TabsTrigger>
                     </TabsList>
                  </Tabs>
               </div>
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                     type="search"
                     placeholder="Cerca operai..."
                     className="pl-8 w-full"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="w-full sm:w-auto">
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-9 justify-between">
                           <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              {notesKeyword ? (
                                 <span className="max-w-[150px] truncate">{notesKeyword}</span>
                              ) : (
                                 <span>Filtra per parola chiave</span>
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
                                 placeholder="Cerca parole chiave..."
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
                           <div className="max-h-[200px] overflow-y-auto">
                              {notesKeywords.length > 0 ? (
                                 <div className="flex flex-wrap gap-1 p-1">
                                    {notesKeywords.map((keyword) => (
                                       <Badge 
                                          key={keyword} 
                                          variant="secondary" 
                                          className="cursor-pointer hover:bg-slate-200"
                                          onClick={() => handleNotesKeywordSelect(keyword)}
                                       >
                                          {keyword}
                                       </Badge>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="p-2 text-center text-slate-500 text-sm">Nessuna parola chiave trovata</div>
                              )}
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>
               </div>
            </div>

            <Card className="shadow-sm overflow-hidden">
               <CardContent className="p-0">
                  {isLoading ? (
                     <div className="flex items-center justify-center p-8 text-slate-500">
                        Caricamento in corso...
                     </div>
                  ) : error ? (
                     <div className="flex items-center justify-center p-8 text-red-500">
                        {error}
                     </div>
                  ) : salaries.length === 0 ? (
                     <div className="flex items-center justify-center p-8 text-slate-500">
                        Nessuna giornata trovata per il periodo selezionato
                     </div>
                  ) : (
                     <>
                        <div className="overflow-x-auto">
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Operaio</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Base</TableHead>
                                    <TableHead>Extra</TableHead>
                                    <TableHead>Stato</TableHead>
                                    <TableHead className="text-right">Totale</TableHead>
                                    {groupBy === 'day' && <TableHead>Note</TableHead>}
                                    <TableHead className="w-[50px]"></TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {salaries.map((salary) => (
                                    <TableRow key={salary.id}>
                                       <TableCell className="whitespace-nowrap">{salary.employee.name}</TableCell>
                                       <TableCell className="whitespace-nowrap">
                                          {groupBy === 'day' ? 
                                             (() => {
                                                try {
                                                   return format(new Date(salary.workedDay), "dd/MM/yyyy")
                                                } catch (e) {
                                                   return "Data Non Valida"
                                                }
                                             })() 
                                             : String(salary.workedDay)}
                                       </TableCell>
                                       <TableCell>{groupBy === 'day' ? (salary.workType === 'fullDay' ? 'Giornata' : 'Mezza') : '-'}</TableCell>
                                       <TableCell>€{salary.salaryAmount}</TableCell>
                                       <TableCell>€{salary.extras}</TableCell>
                                       <TableCell>
                                          <Badge
                                             variant="outline"
                                             className={salary.payedAmount >= salary.total ?
                                                "bg-green-50 text-green-700 border-green-200" :
                                                "bg-yellow-50 text-yellow-700 border-yellow-200"
                                             }
                                          >
                                             Da pagare : {" "}
                                             {salary.payedAmount >= salary.total ?
                                                `€${salary.payedAmount}` :
                                                `€${(salary.total - salary.payedAmount).toFixed(2)}`
                                             }
                                          </Badge>
                                       </TableCell>
                                       <TableCell className="text-right font-medium">€{salary.total}</TableCell>
                                       {groupBy === 'day' && (
                                          <TableCell>
                                             {salary.notes ? (
                                                <div className="max-w-[200px] truncate text-slate-600">
                                                   {salary.notes}
                                                </div>
                                             ) : (
                                                <span className="text-slate-400">-</span>
                                             )}
                                          </TableCell>
                                       )}
                                       <TableCell>
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             className="h-8 w-8 text-slate-500 hover:text-red-600"
                                             onClick={() => handleDeleteClick(salary)}
                                             title="Elimina giornata"
                                          >
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                        
                        {/* Pagination controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-4 border-t gap-3">
                           <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">
                                 Righe per pagina:
                              </span>
                              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
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
                                 {totalCount > 0 
                                    ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} di ${totalCount}`
                                    : "0 risultati"}
                              </span>
                              <div className="flex items-center gap-1">
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8"
                                 >
                                    <ChevronLeft className="h-4 w-4" />
                                 </Button>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8"
                                 >
                                    <ChevronRight className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Delete Confirmation Dialog */}
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                  <AlertDialogDescription>
                     Sei sicuro di voler eliminare questa giornata di lavoro?
                  </AlertDialogDescription>
               </AlertDialogHeader>
               
               {salaryToDelete && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-md">
                     <div className="mb-1"><strong>Operaio:</strong> {salaryToDelete.employee.name}</div>
                     <div className="mb-1"><strong>Data:</strong> {format(new Date(salaryToDelete.workedDay), "dd/MM/yyyy")}</div>
                     <div><strong>Importo:</strong> €{salaryToDelete.total}</div>
                  </div>
               )}
               
               <div className="mt-2 text-red-600 text-sm">
                  Questa azione non può essere annullata.
               </div>
               
               <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction 
                     className="bg-red-600 hover:bg-red-700"
                     onClick={confirmDelete}
                  >
                     Elimina
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   )
}
