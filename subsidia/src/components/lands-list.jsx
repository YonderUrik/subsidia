"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { paths } from "@/lib/paths"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { Badge } from "./ui/badge"

export function LandsList({ lands, refreshData }) {
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [landToDelete, setLandToDelete] = useState(null)
   const [isDeleting, setIsDeleting] = useState(false)

   const handleDelete = async () => {
      if (!landToDelete) return

      try {
         setIsDeleting(true)
         await axios.delete("/api/lands", {
            data: { id: landToDelete.id }
         })
         toast.success("Campo eliminato con successo")
         refreshData?.()
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore durante l'eliminazione del campo")
      } finally {
         setIsDeleting(false)
         setIsDeleteDialogOpen(false)
         setLandToDelete(null)
      }
   }

   const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false)
   const [isTogglingStatus, setIsTogglingStatus] = useState(false)
   const [isStatusUpdated, setIsStatusUpdated] = useState(false)
   const [landToDisable, setLandToDisable] = useState(null)

   const handleToggleStatus = async () => {
      if (!landToDisable) return

      try {
         setIsTogglingStatus(true)
         await axios.patch("/api/lands", {
            id: landToDisable.id,
            isActive: !landToDisable.isActive
         })
         toast.success(landToDisable.isActive ? "Campo disattivato con successo" : "Campo attivato con successo")
         setIsTogglingStatus(false)
         setIsDisableDialogOpen(false)
         setIsStatusUpdated(true)

         refreshData?.()

         setLandToDisable(prev => ({
            ...prev,
            isActive: !prev.isActive
         }))
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore durante la modifica dello stato del campo")
      } finally {
         setIsTogglingStatus(false)
         setIsDisableDialogOpen(false)
      }
   }

   return (
      <div className="w-full overflow-auto">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Area (ha)</TableHead>
                  <TableHead>Tipo di suolo</TableHead>
                  <TableHead>Ultimo Raccolto</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {lands.length > 0 ? (
                  lands.map((land) => (
                     <TableRow key={land.id}>
                        <TableCell className="font-medium">
                           <Link href={`/lands/${land.id}`} className="hover:underline text-primary">
                              {land.name}
                           </Link>
                        </TableCell>
                        <TableCell className="text-right">{land.area.toFixed(2)}</TableCell>
                        <TableCell>{land.soilType}</TableCell>
                        <TableCell>{land.lastHarvest}</TableCell>
                        <TableCell>
                           {land.isActive ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Attivo</Badge>
                           ) : (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Disattivo</Badge>
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Apri menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                 <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                                 <DropdownMenuSeparator />
                                 <Link href={paths.landIdEdit(land.id)}>
                                    <DropdownMenuItem className="cursor-pointer">
                                       <Pencil className="mr-2 h-4 w-4" />
                                       Modifica
                                    </DropdownMenuItem>
                                 </Link>
                                 <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => {
                                       setLandToDisable(land)
                                       setIsDisableDialogOpen(true)
                                    }}
                                 >
                                    Disattiva
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() => {
                                       setLandToDelete(land)
                                       setIsDeleteDialogOpen(true)
                                    }}
                                 >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Elimina
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                     </TableRow>
                  ))
               ) : (
                  <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                           <p>Nessun terreno trovato</p>
                        </div>
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>

         <DeleteConfirmation
            isOpen={isDeleteDialogOpen}
            onClose={() => {
               setIsDeleteDialogOpen(false)
               setLandToDelete(null)
            }}
            onConfirm={handleDelete}
            title="Conferma eliminazione"
            description={`Sei sicuro di voler eliminare il campo "${landToDelete?.name}"? Questa azione non può essere annullata.`}
            isDeleting={isDeleting}
         />

         <DeleteConfirmation
            isOpen={isDisableDialogOpen}
            onClose={() => setIsDisableDialogOpen(false)}
            onConfirm={handleToggleStatus}
            title={landToDisable?.isActive ? "Disabilita campo" : "Abilita campo"}
            description={
               !landToDisable?.isActive
                  ? `Sei sicuro di voler disabilitare il campo "${landToDisable?.name}"? Questo impedirà di essere assegnato a nuovi lavori e non comparirà nelle liste degli operai attivi.`
                  : `Sei sicuro di voler abilitare il campo "${landToDisable?.name}"? Questo consentirà di essere assegnato a nuovi lavori e comparirà nelle liste degli operai attivi.`
            }
            isDeleting={isTogglingStatus}
            confirmButtonText={landToDisable?.isActive ? "Disabilita" : "Abilita"}
            confirmButtonVariant={landToDisable?.isActive ? "default" : "secondary"}
         />

      </div>
   )
}
