"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Plus, Search, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { paths } from "@/lib/paths"
import { debounce } from "lodash"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [employees, setEmployees] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployees = async (searchTerm, page = 1, size = pageSize) => {
    try {
      const response = await axios.get('/api/employees', {
        params: {
          search: searchTerm,
          page,
          pageSize: size
        }
      })
      if (response.data.success) {
        setEmployees([...response.data.data].sort((a, b) => a.name.localeCompare(b.name)))
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
      } else {
        setError('Failed to fetch employees')
      }
    } catch (err) {
      setError('Errore nel caricamento degli operai')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetch = useMemo(
    () => debounce((searchTerm, page, size) => fetchEmployees(searchTerm, page, size), 500),
    []
  )

  useEffect(() => {
    setCurrentPage(1) // Reset to first page on new search
    debouncedFetch(search, 1, pageSize)
    return () => {
      debouncedFetch.cancel()
    }
  }, [search, pageSize, debouncedFetch])

  useEffect(() => {
    if (currentPage > 1 || pageSize !== 10) {
      fetchEmployees(search, currentPage, pageSize)
    }
  }, [currentPage])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  
  const handlePageSizeChange = (newSize) => {
    setPageSize(parseInt(newSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 sm:p-6">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="mt-4 text-slate-600">Caricamento operai...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 sm:p-6">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Errore di caricamento</h3>
        </div>
        <p className="mt-2 text-slate-600">{error}</p>
        <Button 
          className="mt-4"
          onClick={() => {
            setError(null)
            setIsLoading(true)
            fetchEmployees(search, currentPage, pageSize)
          }}
        >
          Riprova
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Operai</h1>
        </div>
        <Link href={paths.addEmployee}>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Operaio
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="search" placeholder="Cerca operaio..." className="pl-8 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="rounded-md border shadow-sm bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Nome</TableHead>
              <TableHead className="min-w-[100px]">Salario g.</TableHead>
              <TableHead className="min-w-[80px]">Tot. G.</TableHead>
              <TableHead className="min-w-[100px]">Salario 1/2g.</TableHead>
              <TableHead className="min-w-[80px]">Tot. 1/2g.</TableHead>
              <TableHead className="min-w-[100px]">Tot. da pagare</TableHead>
              <TableHead className="min-w-[80px]">Attivo</TableHead>
              <TableHead className="text-right min-w-[100px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{formatNumber(employee.dailyRate)}</TableCell>
                  <TableCell>{employee.fullDays}</TableCell>
                  <TableCell>{formatNumber(employee.halfDayRate)}</TableCell>
                  <TableCell>{employee.halfDays}</TableCell>
                  <TableCell>{formatNumber(employee.toPay)}</TableCell>
                  <TableCell>
                    {employee.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                        Attivo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
                        Disabilitato
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`${paths.employeeId(employee.id)}`}>
                      <Button variant="ghost" size="sm" className="whitespace-nowrap">
                        <Eye className="mr-2 h-4 w-4" />
                        Dettagli
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-slate-500">
                  Nessun operaio trovato. Aggiungi il tuo primo operaio!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {employees.length > 0 && (
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
                {totalItems > 0 
                  ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalItems)} di ${totalItems}`
                  : "0 risultati"}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
