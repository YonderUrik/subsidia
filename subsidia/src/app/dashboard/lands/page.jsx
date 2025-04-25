"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { paths } from "@/lib/paths"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { LandsList } from "@/components/lands-list"
import { LandsMap } from "@/components/lands-map"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import axios from "axios"

export default function LandsPage() {
   const [lands, setLands] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
   const [years, setYears] = useState([])

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

   const getLands = useCallback(async () => {
      try {
         setIsLoading(true)
         const response = await axios.get("/api/lands", {
            params: {
               year: selectedYear
            }
         })
         setLands(response.data)
      } catch (error) {
         toast.error(error.response.data.error || "Errore nel fetch dei campi")
      } finally {
         setIsLoading(false)
      }
   }, [selectedYear])

   useEffect(() => {
      getLands()
   }, [getLands])

   return (
      <div className="flex min-h-screen flex-col px-6 py-6">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Terreni</h1>
               <p className="text-muted-foreground">Gestione dei tuoi terreni e calcolo automatico delle aree</p>
            </div>
            <div className="flex items-center gap-2">
               <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-[180px]">
                     <SelectValue placeholder="Seleziona Anno" />
                  </SelectTrigger>
                  <SelectContent>
                     {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                           {year}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               <Link href={paths.new_land}>
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Aggiungi Terreno
                  </Button>
               </Link>
            </div>
         </div>
         <div className="mt-6">
            <Tabs defaultValue="map">
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
