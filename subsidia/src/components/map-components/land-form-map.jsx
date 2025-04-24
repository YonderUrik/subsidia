"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import L from "leaflet"
import { calculateAreaInHectares, formatCoordinates, fixLeafletIcon } from "@/lib/leaflet-utils"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })
const FeatureGroup = dynamic(() => import("react-leaflet").then(mod => mod.FeatureGroup), { ssr: false })

// Import EditControl separately with proper error handling
const EditControl = dynamic(
   () => import("react-leaflet-draw").then(mod => {
      if (!mod.EditControl) {
         console.error("EditControl not found in react-leaflet-draw");
         return () => null; // Return a dummy component if not found
      }
      return mod.EditControl;
   }).catch(err => {
      console.error("Failed to load EditControl:", err);
      return () => null; // Return a dummy component on error
   }),
   { ssr: false, loading: () => <div>Loading draw controls...</div> }
);

// Custom CSS to be injected for styling the map components
const mapStyles = `
  .leaflet-container {
    height: 100%;
    width: 100%;
    z-index: 0;
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
    margin-right: 10px;
  }

  .locate-button:hover {
    background-color: #f0f0f0;
  }
  
  /* Fix position conflicts */
  .leaflet-top.leaflet-left {
    z-index: 1000;
  }
  
  .leaflet-top.leaflet-right {
    z-index: 999;
  }
  
  .leaflet-draw {
    margin-top: 12px;
  }
`;

// Create a safe wrapper for the MapContainer
const SafeMapContainer = ({ children, ...props }) => {
   const [isClient, setIsClient] = useState(false)

   useEffect(() => {
      setIsClient(true)

      // Import Leaflet CSS
      import('leaflet/dist/leaflet.css')
      import('leaflet-draw/dist/leaflet.draw.css')
   }, [])

   if (!isClient) {
      return (
         <div className="h-[500px] w-full flex items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
               <MapPin className="h-8 w-8 animate-pulse" />
               <p>Loading map...</p>
            </div>
         </div>
      )
   }

   return <MapContainer {...props}>{children}</MapContainer>
}

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
               type="button"
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

export default function LandFormMap({ setArea, setCoordinates }) {
   const featureGroupRef = useRef(null)
   const [drawControlsLoaded, setDrawControlsLoaded] = useState(false)
   const [initialPosition, setInitialPosition] = useState([51.505, -0.09])

   // Fix Leaflet icon issue on component mount and get initial position
   useEffect(() => {
      fixLeafletIcon()

      // Inject custom CSS
      const style = document.createElement('style')
      style.innerHTML = mapStyles
      document.head.appendChild(style)

      // Get initial position
      if (typeof window !== 'undefined' && window.navigator && window.navigator.geolocation) {
         window.navigator.geolocation.getCurrentPosition(
            (position) => {
               setInitialPosition([position.coords.latitude, position.coords.longitude])
            },
            (error) => {
               console.error('Error getting location:', error)
            }
         )
      }

      // Check if react-leaflet-draw is available
      import("react-leaflet-draw").then(() => {
         setDrawControlsLoaded(true)
      }).catch(err => {
         console.error("Failed to load react-leaflet-draw:", err)
      })

      return () => {
         if (style.parentNode) {
            document.head.removeChild(style)
         }
      }
   }, [])

   // Function to handle when a shape is created
   const handleCreated = (e) => {
      const { layerType, layer } = e

      // Clear any existing layers
      if (featureGroupRef.current) {
         featureGroupRef.current.clearLayers()
         featureGroupRef.current.addLayer(layer)
      }

      // Get coordinates from the layer
      let latLngs = []

      if (layerType === "polygon" || layerType === "rectangle") {
         latLngs = layer.getLatLngs()[0]
      }

      // Update state
      setCoordinates(formatCoordinates(latLngs))

      // Calculate area
      const areaInHectares = calculateAreaInHectares(latLngs)
      setArea(areaInHectares)
   }

   // Function to handle when a shape is edited
   const handleEdited = (e) => {
      const layers = e.layers

      layers.eachLayer((layer) => {
         // Get coordinates from the layer
         let latLngs = []

         if (layer instanceof L.Polygon) {
            latLngs = layer.getLatLngs()[0]
         }

         // Update state
         setCoordinates(formatCoordinates(latLngs))

         // Calculate area
         const areaInHectares = calculateAreaInHectares(latLngs)
         setArea(areaInHectares)
      })
   }

   // Function to handle when a shape is deleted
   const handleDeleted = () => {
      setCoordinates("")
      setArea(0)
   }

   // Set up map options for proper bounding
   const mapRef = useCallback(node => {
      if (node !== null) {
         window.leafletMap = node;
      }
   }, [])

   return (
      <div className="h-[500px] w-full relative">
         <SafeMapContainer
            center={initialPosition}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
         >
            {/* Stadia.AlidadeSatellite view */}
            <TileLayer
               attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
               url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
            />

            <FeatureGroup ref={featureGroupRef}>
               {drawControlsLoaded && (
                  <EditControl
                     position="topleft"
                     onCreated={handleCreated}
                     onEdited={handleEdited}
                     onDeleted={handleDeleted}
                     draw={{
                        rectangle: true,
                        polygon: true,
                        polyline: false,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                     }}
                  />
               )}
            </FeatureGroup>

            <LocateButton />
         </SafeMapContainer>
      </div>
   )
}
