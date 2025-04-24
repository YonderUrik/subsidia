"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

// Leaflet CSS must be imported only on the client side
const LeafletStylesheet = () => {
   useEffect(() => {
      // Dynamically import Leaflet CSS
      import('leaflet/dist/leaflet.css')
   }, [])
   return null
}

// Import Leaflet components dynamically to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("./map-components/lands-map-content"), {
   ssr: false,
   loading: () => (
      <div className="h-[600px] w-full flex items-center justify-center bg-muted/20">
         <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 animate-pulse" />
            <p>Caricamento Mappa...</p>
         </div>
      </div>
   ),
})

export function LandsMap({ lands }) {
   const [mounted, setMounted] = useState(false)

   // Make sure component is mounted before rendering map
   useEffect(() => {
      setMounted(true)
   }, [])

   if (!mounted) {
      return (
         <div className="h-[600px] w-full flex items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
               <MapPin className="h-8 w-8 animate-pulse" />
               <p>Inizializzazione Mappa...</p>
            </div>
         </div>
      )
   }

   return (
      <>
         <LeafletStylesheet />

         <div className="relative">
            <MapWithNoSSR lands={lands} />

            <div className="absolute bottom-24 right-4 z-[400]">
               <Link href="/lands/new">
                  <Button size="icon" className="h-10 w-10 rounded-full shadow-md">
                     <Plus size={18} />
                  </Button>
               </Link>
            </div>
         </div>
      </>
   )
}
