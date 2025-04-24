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

export function LandsList({ lands }) {
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [landToDelete, setLandToDelete] = useState(null)
   const [isDeleting, setIsDeleting] = useState(false)

   const handleDelete = async () => {
      if (!landToDelete) return

      try {
         setIsDeleting(true)
         await axios.delete("/api/distinct-lands-year", {
            data: { id: landToDelete.id }
         })
         toast.success("Campo eliminato con successo")
         // Refresh the page to update the list
         window.location.reload()
      } catch (error) {
         toast.error(error.response?.data?.error || "Errore durante l'eliminazione del campo")
      } finally {
         setIsDeleting(false)
         setIsDeleteDialogOpen(false)
         setLandToDelete(null)
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
                  <TableHead className="text-right">Azioni</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {lands.map((land) => (
                  <TableRow key={land.id}>
                     <TableCell className="font-medium">
                        <Link href={`/lands/${land.id}`} className="hover:underline text-primary">
                           {land.name}
                        </Link>
                     </TableCell>
                     <TableCell className="text-right">{land.area.toFixed(2)}</TableCell>
                     <TableCell>{land.soilType}</TableCell>
                     <TableCell>{land.lastHarvest}</TableCell>
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
                              <DropdownMenuItem>
                                 <Link href={paths.landIdEdit(land.id)} className="flex w-full items-center">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifica
                                 </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem >
                                 Disattiva
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                 setLandToDelete(land)
                                 setIsDeleteDialogOpen(true)
                              }}>
                                 <Trash className="mr-2 h-4 w-4" />
                                 Elimina
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </TableCell>
                  </TableRow>
               ))}
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
      </div>
   )
}
