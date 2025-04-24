"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Plus, Home } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { paths } from "@/lib/paths"
import axios from "axios"

export default function AddEmployeePage() {
  const [formData, setFormData] = useState({
    name: "",
    dailyRate: "",
    halfDayRate: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [addedEmployeeName, setAddedEmployeeName] = useState("")

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await axios.post('/api/employees', {
        name: formData.name,
        dailyRate: parseFloat(formData.dailyRate),
        halfDayRate: parseFloat(formData.halfDayRate)
      })

      if (response.data.success) {
        setIsSuccess(true)
        setAddedEmployeeName(formData.name)
        setFormData({
          name: "",
          dailyRate: "",
          halfDayRate: "",
        })
      } else {
        setError(response.data.message || "Si è verificato un errore durante l'aggiunta dell'operaio")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Si è verificato un errore durante l'aggiunta dell'operaio")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddAnother = () => {
    setIsSuccess(false)
    setError(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={paths.employees}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Aggiungi Operaio</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess ? (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Successo!</AlertTitle>
            <AlertDescription className="text-green-700">
              {addedEmployeeName} è stato aggiunto al sistema.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleAddAnother} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi un altro operaio
            </Button>
            <Link href={paths.employees}>
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Vai alla lista degli operai
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Informazioni personali</CardTitle>
                <CardDescription>Inserisci i dettagli personali dell'operaio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Mario Rossi" required value={formData.name} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Informazioni salariali</CardTitle>
                <CardDescription>Imposta le rate di pagamento dell'operaio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Salario giornaliero (€)</Label>
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
                  <Label htmlFor="halfDayRate">Salario mezza giornata (€)</Label>
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
            <Link href={paths.employees}>
              <Button variant="outline">Annulla</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Sto processando...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Aggiungi operaio
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
