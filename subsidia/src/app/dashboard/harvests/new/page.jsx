import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HarvestForm } from "@/components/harvest-form"
import { paths } from "@/lib/paths"

export default function NewHarvestPage() {
   return (
      <div className="flex min-h-screen flex-col px-6 py-6">
         <div className="mb-6 flex items-center gap-2">
            <Link href={paths.harvests}>
               <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
               </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Aggiungi nuovo raccolto</h1>
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Dettagli del raccolto</CardTitle>
               <CardDescription>Inserisci i dettagli del raccolto per tenere traccia della produzione e dei guadagni</CardDescription>
            </CardHeader>
            <CardContent>
               <HarvestForm />
            </CardContent>
         </Card>
      </div>
   )
}