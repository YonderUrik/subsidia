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

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [employees, setEmployees] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(10)

  console.log("Employees", employees)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployees = async (searchTerm, page = 1) => {
    try {
      const response = await axios.get('/api/employees', {
        params: {
          search: searchTerm,
          page,
          pageSize
        }
      })
      if (response.data.success) {
        setEmployees(response.data.data)
        setTotalPages(Math.ceil(response.data.total / pageSize))
      } else {
        setError('Failed to fetch employees')
      }
    } catch (err) {
      setError('Errore nel caricamento dei dipendenti')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetch = useMemo(
    () => debounce((searchTerm, page) => fetchEmployees(searchTerm, page), 1000),
    []
  )

  useEffect(() => {
    setCurrentPage(1) // Reset to first page on new search
    debouncedFetch(search, 1)
    return () => {
      debouncedFetch.cancel()
    }
  }, [search, debouncedFetch])

  useEffect(() => {
    if (currentPage > 1) {
      fetchEmployees(search, currentPage)
    }
  }, [currentPage])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="mt-4 text-slate-600">Caricamento dipendenti...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
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
            fetchEmployees(search, currentPage)
          }}
        >
          Riprova
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dipendenti</h1>
          <p className="text-slate-500">Gestione dipendenti</p>
        </div>
        <Link href={paths.addEmployee}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi dipendente
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="search" placeholder="Cerca dipendenti..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="rounded-md border shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Salario giornaliero</TableHead>
              <TableHead>Tot. Giornate</TableHead>
              <TableHead>Salario mezza giornata</TableHead>
              <TableHead>Tot. Mezze giornate</TableHead>
              <TableHead>Tot. da pagare</TableHead>
              <TableHead>Attivo</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>€{employee.dailyRate}</TableCell>
                  <TableCell>{employee.fullDays}</TableCell>
                  <TableCell>€{employee.halfDayRate}</TableCell>
                  <TableCell>{employee.halfDays}</TableCell>
                  <TableCell>€{employee.toPay}</TableCell>
                  <TableCell>
                  {employee.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Attivo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Disabilitato
                    </Badge>
                  )}
                </TableCell>
                  <TableCell className="text-right">
                    <Link href={`${paths.employeeId(employee.id)}`}>
                      <Button variant="ghost" size="sm">
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
                  Nessun dipendente trovato. Aggiungi il tuo primo dipendente!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600">
                Pagina {currentPage} di {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
