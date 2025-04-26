"use client"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import L from "leaflet"
import { calculateAreaInHectares, formatCoordinates, fixLeafletIcon } from "@/lib/leaflet-utils"
import React from "react"

// Utility functions for calculating polygon properties
const calculatePolygonCenter = (coordinates) => {
   if (!coordinates || coordinates.length === 0) return null;

   try {
      let totalLat = 0;
      let totalLng = 0;
      let count = 0;

      // Handle different coordinate formats
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
   try {
      if (!Array.isArray(point1) || !Array.isArray(point2) ||
         point1.length < 2 || point2.length < 2) {
         return 0;
      }

      const dx = point2[0] - point1[0];
      const dy = point2[1] - point1[1];

      return Math.sqrt(dx * dx + dy * dy) * 111319.9; // Approximate conversion to meters
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
const FeatureGroup = dynamic(() => import("react-leaflet").then(mod => mod.FeatureGroup), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false })

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
  
  /* Improve draw control buttons */
  .leaflet-draw-toolbar a {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    margin-bottom: 5px;
  }
  
  .leaflet-draw-toolbar a:hover {
    background-color: #f0f0f0;
  }
  
  /* Add tooltips for better usability */
  .leaflet-draw-toolbar a[title]:after {
    content: attr(title);
    position: absolute;
    left: 40px;
    top: 0;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  
  .leaflet-draw-toolbar a[title]:hover:after {
    opacity: 1;
  }
  
  /* Make actions more visible */
  .leaflet-draw-actions {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  
  .leaflet-draw-actions a {
    color: #333;
    font-weight: 500;
  }
  
  .leaflet-draw-actions a:hover {
    background-color: #f0f0f0;
    color: #000;
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
    opacity: 0.9;
  }
  
  .zoom-level-13 {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  
  .zoom-level-12 {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0.7;
  }
  
  .zoom-level-11 {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.6;
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
               alert('Non è stato possibile ottenere la tua posizione. Per favore controlla le tue autorizzazioni del browser.')
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

// MeasurementOverlay component to show area and side measurements
const MeasurementOverlay = ({ layer, currentZoom, areaValue }) => {
   // Return empty if no layer exists
   if (!layer) return null;
   
   // Get polygon coordinates from the layer
   const getLatLngs = () => {
      try {
         if (layer instanceof L.Polygon) {
            return layer.getLatLngs()[0];
         }
         return [];
      } catch (error) {
         console.error("Error getting coordinates from layer:", error);
         return [];
      }
   };

   // Get coordinates and calculate center and sides
   const latLngs = getLatLngs();
   const coordinates = Array.isArray(latLngs) ? latLngs.map(p => [p.lat, p.lng]) : [];
   const center = calculatePolygonCenter(coordinates);
   const sides = calculateSideLengths(coordinates);
   
   // Format area with appropriate precision
   const formatArea = (area) => {
      if (!area || isNaN(area)) return "0.00";
      if (area >= 10) {
         return area.toFixed(1); // One decimal for larger areas
      } else {
         return area.toFixed(2); // Two decimals for smaller areas
      }
   };
   
   // Format distance with appropriate units
   const formatDistance = (distance) => {
      if (distance >= 1000) {
         return `${(distance / 1000).toFixed(1)} km`;
      } else {
         return `${Math.round(distance)} m`;
      }
   };
   
   // Determine label classes based on zoom level
   const getLabelClasses = (baseClass, type) => {
      const zoomLevel = Math.min(Math.max(Math.floor(currentZoom), 5), 16);
      return `${baseClass} ${type} zoom-level-${zoomLevel}`;
   };
   
   // Use the passed area value instead of recalculating it
   const area = areaValue || 0;
   
   // Determine how many side measurements to show based on zoom level
   const getVisibleSidesRatio = () => {
      if (currentZoom >= 15) return 1; // Show all sides at high zoom levels
      if (currentZoom >= 13) return 0.75; // Show 75% of sides
      if (currentZoom >= 11) return 0.5; // Show half of sides
      if (currentZoom >= 9) return 0.33; // Show a third of sides
      return 0.25; // Show 25% of sides at low zoom levels
   };

   // Calculate perpendicular line for measurement indicators
   const getPerpendicularLine = (midpoint, point1, point2) => {
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
         if (currentZoom <= 13) scale *= 1.5; // Increase scale for lower zoom levels
         if (currentZoom <= 10) scale *= 1.5; // Further increase for very low zoom

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
   };

   // Determine if we should show divider lines for measurements
   const showDividers = currentZoom >= 14;

   // Create custom DivIcon for area measurement
   const createAreaIcon = (area) => {
      const labelClass = getLabelClasses('measurement-label', 'area');
      const color = '#FFFFFF'; // White text for better visibility

      return L.divIcon({
         className: '',
         html: `
            <div class="${labelClass}" style="color: ${color}; background-color: rgba(46, 204, 113, 0.7); border: 2px solid white;">
               <strong>${formatArea(area)} ha</strong>
            </div>
         `,
         iconSize: [80, 30],
         iconAnchor: [40, 15]
      });
   };

   // Create custom DivIcon for side measurements
   const createSideIcon = (length) => {
      const labelClass = getLabelClasses('measurement-label', 'side');
      const color = '#FFFFFF'; // White text for better visibility

      return L.divIcon({
         className: '',
         html: `
            <div class="${labelClass}" style="color: ${color}; background-color: rgba(52, 152, 219, 0.8); border: 1px solid white;">
               ${formatDistance(length)}
            </div>
         `,
         iconSize: [60, 24],
         iconAnchor: [30, 12]
      });
   };

   return (
      <>
         {/* Area measurement in the center */}
         {center && (
            <Marker
               position={center}
               icon={createAreaIcon(area)}
            />
         )}

         {/* Side measurements */}
         {sides.filter(side => side && side.midpoint && side.length > 0).map((side, index, arr) => {
            // Skip some sides based on zoom level and array length
            const visibleRatio = getVisibleSidesRatio();
            const skipFactor = Math.ceil(1 / visibleRatio);

            if (arr.length > 4 && index % skipFactor !== 0) return null;

            // Get points for this side
            if (!coordinates || !Array.isArray(coordinates) || coordinates.length <= index) {
               return null;
            }

            const point1 = coordinates[index];
            const point2 = coordinates[(index + 1) % coordinates.length];

            // Skip if points are invalid
            if (!point1 || !point2 || !Array.isArray(point1) || !Array.isArray(point2)) {
               return null;
            }

            // Get perpendicular line for measurement indicator
            const perpLine = showDividers && point1 && point2 ?
               getPerpendicularLine(side.midpoint, point1, point2) : null;

            return (
               <React.Fragment key={`side-${index}`}>
                  {/* Divider line for measurement */}
                  {perpLine && Array.isArray(perpLine) && perpLine.length === 2 &&
                     Array.isArray(perpLine[0]) && Array.isArray(perpLine[1]) && (
                        <Polyline
                           positions={perpLine}
                           pathOptions={{
                              color: 'white',
                              weight: 2.5,
                              opacity: Math.min(0.8, currentZoom / 20),
                           }}
                        />
                     )}
                  <Marker
                     position={side.midpoint}
                     icon={createSideIcon(side.length)}
                  />
               </React.Fragment>
            );
         })}
      </>
   );
};

export default function LandFormMap({ setArea, setCoordinates }) {
   const featureGroupRef = useRef(null)
   const [drawControlsLoaded, setDrawControlsLoaded] = useState(false)
   const [initialPosition, setInitialPosition] = useState([51.505, -0.09])
   const [currentLayer, setCurrentLayer] = useState(null)
   const [currentZoom, setCurrentZoom] = useState(16)
   const [areaValue, setAreaValue] = useState(0)

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
         
         // Customize Leaflet.draw strings to Italian
         if (L.drawLocal) {
            // Draw toolbar
            L.drawLocal.draw = {
               toolbar: {
                  actions: {
                     title: 'Annulla disegno',
                     text: 'Annulla'
                  },
                  finish: {
                     title: 'Termina disegno',
                     text: 'Termina'
                  },
                  undo: {
                     title: 'Elimina ultimo punto',
                     text: 'Elimina ultimo punto'
                  },
                  buttons: {
                     polyline: 'Disegna una linea',
                     polygon: 'Disegna un poligono',
                     rectangle: 'Disegna un rettangolo',
                     circle: 'Disegna un cerchio',
                     marker: 'Posiziona un marcatore',
                     circlemarker: 'Posiziona un marcatore circolare'
                  }
               },
               handlers: {
                  circle: {
                     tooltip: {
                        start: 'Clicca e trascina per disegnare un cerchio'
                     },
                     radius: 'Raggio'
                  },
                  circlemarker: {
                     tooltip: {
                        start: 'Clicca per posizionare un marcatore circolare'
                     }
                  },
                  marker: {
                     tooltip: {
                        start: 'Clicca per posizionare un marcatore'
                     }
                  },
                  polygon: {
                     tooltip: {
                        start: 'Clicca per iniziare a disegnare un poligono',
                        cont: 'Clicca per continuare a disegnare il poligono',
                        end: 'Clicca sul primo punto per chiudere il poligono'
                     }
                  },
                  polyline: {
                     error: '<strong>Errore:</strong> i bordi non possono incrociarsi!',
                     tooltip: {
                        start: 'Clicca per iniziare a disegnare una linea',
                        cont: 'Clicca per continuare a disegnare la linea',
                        end: 'Clicca sull\'ultimo punto per terminare la linea'
                     }
                  },
                  rectangle: {
                     tooltip: {
                        start: 'Clicca e trascina per disegnare un rettangolo'
                     }
                  },
                  simpleshape: {
                     tooltip: {
                        end: 'Rilascia il mouse per terminare il disegno'
                     }
                  }
               }
            };
            
            // Edit toolbar
            L.drawLocal.edit = {
               toolbar: {
                  actions: {
                     save: {
                        title: 'Salva modifiche',
                        text: 'Salva'
                     },
                     cancel: {
                        title: 'Annulla modifiche',
                        text: 'Annulla'
                     },
                     clearAll: {
                        title: 'Cancella tutti i layer',
                        text: 'Cancella tutto'
                     }
                  },
                  buttons: {
                     edit: 'Modifica layer',
                     editDisabled: 'Nessun layer da modificare',
                     remove: 'Elimina layer',
                     removeDisabled: 'Nessun layer da eliminare'
                  }
               },
               handlers: {
                  edit: {
                     tooltip: {
                        text: 'Trascina i punti o i marcatori per modificare',
                        subtext: 'Clicca annulla per annullare le modifiche'
                     }
                  },
                  remove: {
                     tooltip: {
                        text: 'Clicca su un elemento per rimuoverlo'
                     }
                  }
               }
            };
         }
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

      // Store the current layer for measurement display
      setCurrentLayer(layer)

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
      setAreaValue(areaInHectares) // Store the area value for the measurement component
   }

   // Function to handle when a shape is edited
   const handleEdited = (e) => {
      const layers = e.layers

      layers.eachLayer((layer) => {
         // Update current layer reference
         setCurrentLayer(layer)
         
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
         setAreaValue(areaInHectares) // Store the area value for the measurement component
      })
   }

   // Function to handle when a shape is deleted
   const handleDeleted = () => {
      setCurrentLayer(null)
      setCoordinates("")
      setArea(0)
      setAreaValue(0) // Reset the area value
   }

   // Handle zoom changes
   const handleZoomChange = useCallback((e) => {
      setCurrentZoom(e.target._zoom);
   }, []);

   // Set up map options for proper bounding
   const mapRef = useCallback(node => {
      if (node !== null) {
         window.leafletMap = node;
         
         // Add zoom event listener
         node.on('zoomend', handleZoomChange);
         
         // Set initial zoom
         setCurrentZoom(node.getZoom());
      }
   }, [handleZoomChange])

   return (
      <div className="h-[500px] w-full relative">
         <SafeMapContainer
            center={initialPosition}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            attributionControl={false}
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
            
            {/* Add measurements overlay */}
            <MeasurementOverlay layer={currentLayer} currentZoom={currentZoom} areaValue={areaValue} />

            <LocateButton />
         </SafeMapContainer>

      </div>
   )
}
