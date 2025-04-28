import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LandForm } from "@/components/land-form"
import { paths } from "@/lib/paths"

export default function NewLandPage() {
   return (
      <div className="flex min-h-screen flex-col px-6 py-6">
         <div className="mb-6 flex items-center gap-2">
            <Link href={paths.lands}>
               <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
               </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Aggiungi nuovo campo</h1>
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Dettagli del campo</CardTitle>
               <CardDescription>Disegna il tuo campo sulle mappe e inserisci i dettagli</CardDescription>
            </CardHeader>
            <CardContent>
               <LandForm />
            </CardContent>
         </Card>
      </div>
   )
}
