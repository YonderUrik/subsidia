"use client"

import { useCallback, useMemo, useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { getAllBounds } from "@/lib/lands-utils"
import { fixLeafletIcon } from "@/lib/leaflet-utils"
import { paths } from "@/lib/paths"
import React from "react"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })
const Polygon = dynamic(() => import("react-leaflet").then(mod => mod.Polygon), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false })

// Custom CSS to be injected for styling the map components
const mapStyles = `
  .map-legend {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    padding: 10px;
    max-width: 200px;
    font-size: 12px;
  }
  
  .map-legend-title {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .map-legend-item {
    display: flex;
    align-items: center;
    margin-top: 3px;
  }
  
  .map-legend-color {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    margin-right: 6px;
  }
  
  .leaflet-right {
    right: 10px;
  }
  
  .leaflet-bottom {
    bottom: 10px;
  }
  
  .leaflet-top {
    top: 10px;
  }
  
  .leaflet-left {
    left: 10px;
  }
  
  .leaflet-control-layers {
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
  }

  .locate-button {
    background-color: white;
    border: none;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .locate-button:hover {
    background-color: #f0f0f0;
  }
`;

// Component to add legend to the map
function MapLegend({ lands }) {
   const totalArea = lands.reduce((sum, land) => sum + (land?.area || 0), 0)

   return (
      <div className="leaflet-bottom leaflet-right">
         <div className="map-legend">
            <div className="map-legend-title">Legenda Terreni</div>
            {lands.map((land) => (
               <div key={land.id} className="map-legend-item">
                  <div className="map-legend-color" style={{ backgroundColor: land.color }}></div>
                  <div>
                     {land.name} ({land.area.toFixed(1)} ha)
                  </div>
               </div>
            ))}
            <div className="map-legend-item" style={{ marginTop: "8px", fontWeight: "bold" }}>
               Area Totale: {totalArea.toFixed(1)} ha
            </div>
         </div>
      </div>
   )
}

// Field component to prevent unnecessary re-renders
const Field = ({ land }) => {
   return (
      <Polygon
         positions={land.coordinates}
         pathOptions={{
            color: land.color,
            fillColor: land.color,
            fillOpacity: 0.35,
         }}
      >
         <Popup>
            <div>
               <strong>{land.name}</strong>
               <br />
               Area: {land.area.toFixed(2)} ha
               <br />
               Coltura: {land.soilType}
               <br />
               Ultima Raccolta: {land.lastHarvest || "Nessuna"}
            </div>
         </Popup>
      </Polygon>
   )
}

// Create a safe wrapper for the MapContainer
const SafeMapContainer = React.forwardRef(({ children, ...props }, ref) => {
   const [isClient, setIsClient] = useState(false)

   useEffect(() => {
      setIsClient(true)
   }, [])

   if (!isClient) {
      return (
         <div className="h-[600px] w-full flex items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
               <MapPin className="h-8 w-8 animate-pulse" />
               <p>Caricamento mappa...</p>
            </div>
         </div>
      )
   }

   return <MapContainer ref={ref} {...props}>{children}</MapContainer>
})

SafeMapContainer.displayName = 'SafeMapContainer'

// Create a component that will handle the locate me functionality
// This avoids using useMap() which can cause issues with dynamic loading
const LocateButton = () => {
   const handleClick = useCallback(() => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.geolocation) {
         window.navigator.geolocation.getCurrentPosition(
            (position) => {
               // Get the map instance from a global reference set during map initialization
               if (window.leafletMap && typeof window.leafletMap.setView === 'function') {
                  window.leafletMap.setView(
                     [position.coords.latitude, position.coords.longitude],
                     16
                  )
               } else {
                  console.warn('Map instance not found or setView not available')
               }
            },
            (error) => {
               console.error('Error getting location:', error)
               alert('Could not get your location. Please check your browser permissions.')
            }
         )
      }
   }, [])

   return (
      <div className="leaflet-top leaflet-right" style={{ marginTop: "50px" }}>
         <div className="leaflet-control">
            <button
               className="locate-button"
               title="Locate me"
               onClick={handleClick}
            >
               <MapPin size={16} />
            </button>
         </div>
      </div>
   )
}

export default function LandsMapContent({ lands }) {
   // Fix Leaflet icon issue on component mount
   useEffect(() => {
      fixLeafletIcon()

      // Inject custom CSS
      const style = document.createElement('style')
      style.innerHTML = mapStyles
      document.head.appendChild(style)

      return () => {
         document.head.removeChild(style)
      }
   }, [])

   // Calculate bounds using memoization to avoid unnecessary recalculations
   const bounds = useMemo(() => {
      if (lands.length === 0) return [[51.505, -0.09]]
      return getAllBounds(lands)
   }, [lands])

   // Create a center point for the map
   const center = useMemo(() => {
      if (bounds.length === 0) return [51.505, -0.09]

      // Calculate center from bounds
      const lats = bounds.map(b => b[0])
      const lngs = bounds.map(b => b[1])

      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      return [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
   }, [bounds])

   // Set up map options for proper bounding
   const mapRef = useCallback(node => {
      if (node !== null) {
         setMapInstance(node)
      }
   }, [])

   const [mapInstance, setMapInstance] = useState(null)

   // When map and bounds are available, fit bounds
   useEffect(() => {
      if (mapInstance && bounds.length > 0) {
         try {
            // Store map reference globally for locate button
            window.leafletMap = mapInstance

            // Create a Leaflet bounds object from the coordinates
            const L = require("leaflet")
            const leafletBounds = L.latLngBounds(bounds)

            // Fit the map to these bounds with some padding
            mapInstance.fitBounds(leafletBounds, { padding: [50, 50] })
         } catch (error) {
            console.error("Error fitting bounds:", error)
         }
      }
   }, [mapInstance, bounds])

   return (
      <div className="h-[600px] w-full z-0">
         <SafeMapContainer
            center={center}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}

         >

            <TileLayer
               attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
               url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
            />

            {lands.map((land) => (
               <Field key={land.id} land={land} />
            ))}

            <LocateButton />
            <MapLegend lands={lands} />
         </SafeMapContainer>
      </div>
   )
}
