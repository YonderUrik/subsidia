"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { paths } from "@/lib/paths"
import axios from "axios"
import { toast } from "sonner"

export default function EditEmployeePage() {
   const params = useParams()
   const router = useRouter()
   const id = params.id

   console.log("id", id)

   const [formData, setFormData] = useState({
      id: id,
      name: "",
      dailyRate: "",
      halfDayRate: "",
   })

   const [isSubmitting, setIsSubmitting] = useState(false)
   const [isSuccess, setIsSuccess] = useState(false)
   const [employee, setEmployee] = useState(null)
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState(null)

   const fetchEmployee = useCallback(async () => {
      try {
         const response = await axios.get(`/api/employees?id=${id}`)
         setEmployee(response.data.data)
         setIsLoading(false)
      } catch (error) {
         setEmployee(null)
         setError(error.response.data.message || error.response.data.error || "Errore nel caricamento dei dati dell'impiegato")
         setIsLoading(false)
      }
   }, [id])

   useEffect(() => {
      fetchEmployee()
   }, [fetchEmployee])

   useEffect(() => {
      // In a real app, this would fetch data from an API
      if (employee) {
         setFormData((prev) => ({
            ...prev,
            name: employee.name,
            dailyRate: parseFloat(employee.dailyRate),
            halfDayRate: parseFloat(employee.halfDayRate).toString(),
         }))
      }
   }, [employee])

   const handleChange = (e) => {
      const { id, value } = e.target
      setFormData((prev) => ({ ...prev, [id]: value }))
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setIsSubmitting(true)

      // In a real app, this would send the data to an API
      console.log("Form submitted:", formData)


      try {
         const response = await axios.put(`/api/employees`, { ...formData, dailyRate: parseFloat(formData.dailyRate), halfDayRate: parseFloat(formData.halfDayRate) })
         if (response.data.success) {
            setIsSuccess(true)
            setIsSubmitting(false)
            setTimeout(() => {
               router.push(paths.employeeId(id))
            }, 1500)
         }
      } catch (error) {
         setIsSubmitting(false)
         toast.error(error.response.data.message || error.response.data.error || "Errore nel salvataggio dei dati dell'impiegato")
      }
   }

   if (!employee) {
      return (
         <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900">Impiegato non trovato</h1>
            <Link href={paths.employees}>
               <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna ai dipendenti
               </Button>
            </Link>
         </div>
      )
   }

   return (
      <div className="p-6 space-y-6">
         <div className="flex items-center gap-4">
            <Link href={paths.employeeId(id)}>
               <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
               </Button>
            </Link>
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modifica impiegato</h1>
               {!employee?.isActive && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                     Disabilitato
                  </Badge>
               )}
            </div>
         </div>

         {isSuccess ? (
            <Alert className="bg-green-50 border-green-200">
               <CheckCircle2 className="h-5 w-5 text-green-600" />
               <AlertTitle className="text-green-800">Operazione completata con successo!</AlertTitle>
               <AlertDescription className="text-green-700">
                  Le informazioni dell'impiegato sono state aggiornate con successo.
               </AlertDescription>
            </Alert>
         ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                     <CardHeader>
                        <CardTitle>Informazioni personali</CardTitle>
                        <CardDescription>Modifica i dati personali dell'impiegato</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="name">Nome completo</Label>
                           <Input id="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                     <CardHeader>
                        <CardTitle>Informazioni salariali</CardTitle>
                        <CardDescription>Modifica le rate di pagamento dell'impiegato</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="dailyRate">Salario giornaliero</Label>
                           <Input
                              id="dailyRate"
                              type="number"
                              placeholder="150"
                              required
                              min="0"
                              value={formData.dailyRate}
                              onChange={handleChange}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="halfDayRate">Salario mezza giornata</Label>
                           <Input
                              id="halfDayRate"
                              type="number"
                              placeholder="80"
                              required
                              min="0"
                              value={formData.halfDayRate}
                              onChange={handleChange}
                           />
                        </div>
                     </CardContent>
                  </Card>
               </div>

               <div className="flex justify-end gap-4">
                  <Link href={paths.employeeId(id)}>
                     <Button variant="outline">Annulla</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? (
                        <>Sto processando...</>
                     ) : (
                        <>
                           <Save className="mr-2 h-4 w-4" />
                           Salva modifiche
                        </>
                     )}
                  </Button>
               </div>
            </form>
         )}
      </div>
   )
}
