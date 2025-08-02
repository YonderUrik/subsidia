"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"


export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting = false,
  confirmButtonText = "Elimina",
  confirmButtonVariant = "destructive",
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle
              className={`h-5 w-5 ${confirmButtonVariant === "destructive" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
            />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annulla
          </Button>
          <Button variant={confirmButtonVariant} onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Sto processando..." : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
