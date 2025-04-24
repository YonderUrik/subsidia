'use client'
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { paths } from "@/lib/paths"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
export default function DashboardPage() {
   const { data: session, status } = useSession()

   useEffect(() => {
      if (status === "loading") {
         return
      }
      if (status === "unauthenticated") {
         redirect(paths.login)
      }
   }, [status, session])


   return (

      <div className="flex flex-col px-6 space-y-6">
         {/* Main Modules */}
         <h2 className="text-xl font-semibold tracking-tight mt-6 text-slate-900">Moduli</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Users className="h-5 w-5 text-blue-600" />
                     Gestione dipendenti
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Dipendenti attivi</span>
                        <span>12</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Giornate totali</span>
                        <span>12</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Totale da pagare</span>
                        <span>12</span>
                     </div>
                  </div>
               </CardContent>
               <CardFooter>
                  <Link href={paths.employees} className="w-full">
                     <Button className="w-full">Gestione dipendenti</Button>
                  </Link>
               </CardFooter>
            </Card>

         </div>
      </div>
   )
}