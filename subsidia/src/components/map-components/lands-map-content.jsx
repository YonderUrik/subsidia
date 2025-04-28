"use client"

import { useCallback, useMemo, useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { getAllBounds } from "@/lib/lands-utils"
import { fixLeafletIcon } from "@/lib/leaflet-utils"
import { paths } from "@/lib/paths"
import React from "react"

// Utility functions for calculating polygon properties
const calculatePolygonCenter = (coordinates) => {
   if (!coordinates || coordinates.length === 0) return null;

   try {
      let totalLat = 0;
      let totalLng = 0;
      let count = 0;

      // Handle different coordinate formats (array of arrays, or array of arrays of arrays)
      const points = Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])
         ? coordinates[0]
         : coordinates;

      for (const point of points) {
         if (Array.isArray(point) && point.length >= 2 &&
            typeof point[0] === 'number' && !isNaN(point[0]) &&
            typeof point[1] === 'number' && !isNaN(point[1])) {
            totalLat += point[0];
            totalLng += point[1];
            count++;
         }
      }

      if (count > 0) {
         return [totalLat / count, totalLng / count];
      } else {
         return null;
      }
   } catch (error) {
      console.error("Error in calculatePolygonCenter:", error);
      return null;
   }
};

const calculateDistance = (point1, point2) => {
   // Simple Euclidean distance for x,y coordinates
   // For geographic lat/lng, we'd use the haversine formula
   try {
      if (!Array.isArray(point1) || !Array.isArray(point2) ||
         point1.length < 2 || point2.length < 2) {
         return 0;
      }

      const dx = point2[0] - point1[0];
      const dy = point2[1] - point1[1];

      // For x,y coordinates, use scaled distance
      return Math.sqrt(dx * dx + dy * dy) * 111319.9; // Approximate conversion to meters (1 degree ≈ 111.32 km)
   } catch (error) {
      console.error("Error calculating distance:", error);
      return 0;
   }
};

const calculateSideLengths = (coordinates) => {
   if (!coordinates || coordinates.length === 0) return [];

   try {
      const sides = [];
      // Handle different coordinate formats
      const points = Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])
         ? coordinates[0]
         : coordinates;

      if (points.length < 2) return [];

      for (let i = 0; i < points.length; i++) {
         const point1 = points[i];
         const point2 = points[(i + 1) % points.length]; // Loop back to first point

         if (!Array.isArray(point1) || !Array.isArray(point2) ||
            point1.length < 2 || point2.length < 2) {
            continue;
         }

         // Calculate midpoint
         if (typeof point1[0] !== 'number' || isNaN(point1[0]) ||
            typeof point1[1] !== 'number' || isNaN(point1[1]) ||
            typeof point2[0] !== 'number' || isNaN(point2[0]) ||
            typeof point2[1] !== 'number' || isNaN(point2[1])) {
            continue;
         }

         const midpoint = [
            (point1[0] + point2[0]) / 2,
            (point1[1] + point2[1]) / 2
         ];

         // Calculate distance using helper function
         const distance = calculateDistance(point1, point2);

         sides.push({
            midpoint,
            length: distance
         });
      }

      return sides;
   } catch (error) {
      console.error("Error in calculateSideLengths:", error);
      return [];
   }
};

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })
const Polygon = dynamic(() => import("react-leaflet").then(mod => mod.Polygon), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false })

// Import leaflet directly for custom icon creation
let L = null;
if (typeof window !== 'undefined') {
   L = require('leaflet');
}

// Custom CSS to be injected for styling the map components
const mapStyles = `
  .map-legend {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    padding: 12px;
    max-width: 220px;
    font-size: 12px;
  }
  
  .map-legend-title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .map-legend-item {
    display: flex;
    align-items: center;
    margin-top: 4px;
  }
  
  .map-legend-color {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    margin-right: 8px;
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
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .locate-button:hover {
    background-color: #f0f0f0;
  }

  /* Custom measurement label styles */
  .measurement-label {
    background-color: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 3px 6px;
    font-size: 11px;
    white-space: nowrap;
    box-shadow: 0 1px 5px rgba(0,0,0,0.12);
    pointer-events: none !important;
    text-align: center;
    transition: all 0.15s ease;
    transform: translate(-50%, -50%);
    width: auto;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(1px);
    -webkit-backdrop-filter: blur(1px);
  }
  
  /* Area measurement specific styles */
  .measurement-label.area {
    background-color: rgba(0, 0, 0, 0.3);
    font-weight: bold;
    font-size: 12px;
    padding: 1px 1px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    z-index: 700 !important;
    border: 1px solid rgba(0, 0, 0, 0.12);
    min-width: 60px;
  }

  /* Side measurement styles */
  .measurement-label.side {
    color: rgba(0, 0, 0, 0.85);
    font-size: 12px;
    font-weight: 500;
    padding: 1px 1px;
    min-width: 40px;
    background-color: rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%) scale(0.95);
  }
  
  /* Measurement badge styles */
  .measurement-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  /* Zoom level specific styles */
  .zoom-level-16 {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  
  .zoom-level-15 {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 1;
  }
  
  .zoom-level-14 {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
  
  .zoom-level-13 {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  
  .zoom-level-12 {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
  }
  
  .zoom-level-11 {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0;
  }
  
  .zoom-level-10, .zoom-level-9,
  .zoom-level-8, .zoom-level-7,
  .zoom-level-6, .zoom-level-5 {
    opacity: 0;
  }
  
  /* Hide side measurements at very low zoom levels */
  .zoom-level-11.side,
  .zoom-level-10.side,
  .zoom-level-9.side,
  .zoom-level-8.side,
  .zoom-level-7.side,
  .zoom-level-6.side,
  .zoom-level-5.side,
  .zoom-level-4.side,
  .zoom-level-3.side {
    opacity: 0;
  }
`;

// Component to add legend to the map
function MapLegend({ lands }) {
   const totalArea = lands.reduce((sum, land) => sum + (land?.area || 0), 0)

   return (
      <div className="leaflet-bottom leaflet-right">
         <div className="map-legend" style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}>
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
const Field = ({ land, zoom }) => {
   const center = useMemo(() => {
      try {
         return calculatePolygonCenter(land.coordinates);
      } catch (error) {
         console.error("Error calculating center for land:", land.name, error);
         return null;
      }
   }, [land.coordinates, land.name]);

   const sides = useMemo(() => {
      try {
         return calculateSideLengths(land.coordinates);
      } catch (error) {
         console.error("Error calculating sides for land:", land.name, error);
         return [];
      }
   }, [land.coordinates, land.name]);

   // Format area with appropriate precision
   const formatArea = useCallback((area) => {
      if (area >= 10) {
         return area.toFixed(1); // One decimal for larger areas
      } else {
         return area.toFixed(2); // Two decimals for smaller areas
      }
   }, []);

   // Format distance with appropriate units
   const formatDistance = useCallback((distance) => {
      if (distance >= 1000) {
         return `${(distance / 1000).toFixed(1)} km`;
      } else {
         return `${Math.round(distance)} m`;
      }
   }, []);

   // Determine label classes based on zoom level
   const getLabelClasses = useCallback((baseClass, type) => {
      const zoomLevel = Math.min(Math.max(Math.floor(zoom), 5), 16);
      return `${baseClass} ${type} zoom-level-${zoomLevel}`;
   }, [zoom]);

   // Determine if we should show divider lines for measurements
   const showDividers = useMemo(() => zoom >= 14, [zoom]);

   // Determine how many side measurements to show based on zoom level
   const getVisibleSidesRatio = useCallback(() => {
      if (zoom >= 15) return 1; // Show all sides at high zoom levels
      if (zoom >= 13) return 0.75; // Show 75% of sides
      if (zoom >= 11) return 0.5; // Show half of sides
      if (zoom >= 9) return 0.33; // Show a third of sides
      return 0.25; // Show 25% of sides at low zoom levels
   }, [zoom]);

   // Calculate perpendicular line for measurement indicators
   const getPerpendicularLine = useCallback((midpoint, point1, point2) => {
      try {
         // Basic validation for all input points
         if (!midpoint || !point1 || !point2 ||
            !Array.isArray(midpoint) || midpoint.length < 2 ||
            !Array.isArray(point1) || point1.length < 2 ||
            !Array.isArray(point2) || point2.length < 2) {
            return null;
         }

         // Check for valid numeric values
         if (isNaN(midpoint[0]) || isNaN(midpoint[1]) ||
            isNaN(point1[0]) || isNaN(point1[1]) ||
            isNaN(point2[0]) || isNaN(point2[1])) {
            return null;
         }

         // Calculate direction vector
         const dx = point2[0] - point1[0];
         const dy = point2[1] - point1[1];

         // Calculate perpendicular vector (rotate 90 degrees)
         const perpDx = -dy;
         const perpDy = dx;

         // Normalize and scale
         const length = Math.sqrt(perpDx * perpDx + perpDy * perpDy);

         // If length is too small or zero, use a simple fixed-length line
         if (length < 0.000001) {
            return [
               [midpoint[0] - 0.0001, midpoint[1]],
               [midpoint[0] + 0.0001, midpoint[1]]
            ];
         }

         // Scale line length based on zoom level
         let scale = 0.00015; // Base scale at zoom level 16
         if (zoom <= 13) scale *= 1.5; // Increase scale for lower zoom levels
         if (zoom <= 10) scale *= 1.5; // Further increase for very low zoom

         const normPerpDx = (perpDx / length) * scale;
         const normPerpDy = (perpDy / length) * scale;

         // Final validation of calculated points
         const point1Result = [midpoint[0] - normPerpDx, midpoint[1] - normPerpDy];
         const point2Result = [midpoint[0] + normPerpDx, midpoint[1] + normPerpDy];

         if (isNaN(point1Result[0]) || isNaN(point1Result[1]) ||
            isNaN(point2Result[0]) || isNaN(point2Result[1])) {
            return null;
         }

         // Create perpendicular line
         return [point1Result, point2Result];
      } catch (error) {
         console.error("Error calculating perpendicular line:", error);
         return null;
      }
   }, [zoom]);

   // Create custom DivIcon for area measurement
   const createAreaIcon = useCallback((area) => {
      if (!L) return null;

      const labelClass = getLabelClasses('measurement-label', 'area');

      return L.divIcon({
         className: '',
         html: `
            <div class="${labelClass}" style="color: #FFFFFF; background-color: rgba(46, 204, 113, 0.7); border: 2px solid white;">
               <strong>${formatArea(area)} ha</strong>
            </div>
         `,
         iconSize: [80, 30],
         iconAnchor: [40, 15]
      });
   }, [land.color, getLabelClasses, formatArea]);

   // Create custom DivIcon for side measurements
   const createSideIcon = useCallback((length) => {
      if (!L) return null;

      const labelClass = getLabelClasses('measurement-label', 'side');

      return L.divIcon({
         className: '',
         html: `
            <div class="${labelClass}" style="color: #FFFFFF; background-color: ${land.color}; border: 1px solid white;">
               ${formatDistance(length)}
            </div>
         `,
         iconSize: [60, 24],
         iconAnchor: [30, 12]
      });
   }, [land.color, getLabelClasses, formatDistance]);

   return (
      <>
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
                  Area: {formatArea(land.area)} ha
                  <br />
                  Coltura: {land.soilType}
                  <br />
                  Ultima Raccolta: {land.lastHarvest || "Nessuna"}
               </div>
            </Popup>
         </Polygon>

         {/* Area measurement in the center */}
         {center && L && (
            <Marker
               position={center}
               icon={createAreaIcon(land.area)}
            />
         )}

         {/* Side measurements */}
         {sides.filter(side => side && side.midpoint && side.length > 0).map((side, index, arr) => {
            // Skip some sides based on zoom level and array length
            const visibleRatio = getVisibleSidesRatio();
            const skipFactor = Math.ceil(1 / visibleRatio);

            if (arr.length > 4 && index % skipFactor !== 0) return null;

            // Get points for this side
            const points = Array.isArray(land.coordinates[0]) && Array.isArray(land.coordinates[0][0])
               ? land.coordinates[0]
               : land.coordinates;

            if (!points || !Array.isArray(points) || points.length <= index) {
               return null;
            }

            const point1 = points[index];
            const point2 = points[(index + 1) % points.length];

            // Skip if points are invalid
            if (!point1 || !point2 || !Array.isArray(point1) || !Array.isArray(point2)) {
               return null;
            }

            // Get perpendicular line for measurement indicator
            const perpLine = showDividers && point1 && point2 ?
               getPerpendicularLine(side.midpoint, point1, point2) : null;

            return (
               <React.Fragment key={`side-fragment-${land.id}-${index}`}>
                  {/* Divider line for measurement */}
                  {perpLine && Array.isArray(perpLine) && perpLine.length === 2 &&
                     Array.isArray(perpLine[0]) && Array.isArray(perpLine[1]) && (
                        <Polyline
                           positions={perpLine}
                           pathOptions={{
                              color: 'white',
                              weight: 2.5,
                              opacity: Math.min(0.8, zoom / 20),
                           }}
                        />
                     )}
                  {L && (
                     <Marker
                        position={side.midpoint}
                        icon={createSideIcon(side.length)}
                     />
                  )}
               </React.Fragment>
            );
         })}
      </>
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
               alert('Non è stato possibile ottenere la tua posizione. Per favore controlla le tue autorizzazioni del browser.')
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

   // State to track current zoom level
   const [currentZoom, setCurrentZoom] = useState(16);

   // Track zoom changes
   const handleZoomChange = useCallback((e) => {
      setCurrentZoom(e.target._zoom);
   }, []);

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
            const leafletBounds = L.latLngBounds(bounds)

            // Fit the map to these bounds with some padding
            mapInstance.fitBounds(leafletBounds, { padding: [50, 50] })

            // Add zoom event listener
            mapInstance.on('zoomend', handleZoomChange);

            // Set initial zoom
            setCurrentZoom(mapInstance.getZoom());

            return () => {
               if (mapInstance) {
                  mapInstance.off('zoomend', handleZoomChange);
               }
            };
         } catch (error) {
            console.error("Error fitting bounds:", error)
         }
      }
   }, [mapInstance, bounds, handleZoomChange])

   return (
      <div className="h-[600px] w-full z-0">
         <SafeMapContainer
            center={center}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            attributionControl={false}
         >
            <TileLayer
               attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
               url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
            />

            {lands.map((land) => (
               <Field key={land.id} land={land} zoom={currentZoom} />
            ))}

            <LocateButton />
            {lands.length > 0 && <MapLegend lands={lands} />}
         </SafeMapContainer>
      </div>
   )
}
