"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HarvestForm } from "@/components/harvest-form"
import { paths } from "@/lib/paths"

export default function EditHarvestPage({ params }) {
   return (
      <div className="flex min-h-screen flex-col px-6 py-6">
         <div className="mb-6 flex items-center gap-2">
            <Link href={paths.harvestsList}>
               <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
               </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Modifica raccolto</h1>
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Dettagli del raccolto</CardTitle>
               <CardDescription>
                  Modifica le informazioni del raccolto per aggiornare i dati di produzione e guadagni
               </CardDescription>
            </CardHeader>
            <CardContent>
               <HarvestForm harvestId={params.id} mode="edit" />
            </CardContent>
         </Card>
      </div>
   )
}