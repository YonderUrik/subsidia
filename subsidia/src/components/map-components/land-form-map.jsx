"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { MapPin, Maximize2 } from "lucide-react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useMapEvents } from 'react-leaflet'; // Import useMapEvents

// Make sure these paths are correct for your project structure
import { calculateAreaInHectares, formatCoordinates, fixLeafletIcon } from "@/lib/leaflet-utils";
import { useMediaQuery } from "@/hooks/use-media-query";

// Utility functions (assuming these remain the same)
const calculatePolygonCenter = (coordinates) => {
   if (!coordinates || coordinates.length === 0) return null;
   try {
      let totalLat = 0; let totalLng = 0; let count = 0;
      const points = Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0]) ? coordinates[0] : coordinates;
      for (const point of points) {
         if (Array.isArray(point) && point.length >= 2 && typeof point[0] === 'number' && !isNaN(point[0]) && typeof point[1] === 'number' && !isNaN(point[1])) {
            totalLat += point[0]; totalLng += point[1]; count++;
         }
      }
      return count > 0 ? [totalLat / count, totalLng / count] : null;
   } catch (error) { console.error("Error in calculatePolygonCenter:", error); return null; }
};

const calculateDistance = (point1, point2) => {
   try {
      if (!Array.isArray(point1) || !Array.isArray(point2) || point1.length < 2 || point2.length < 2) return 0;
      const dx = point2[0] - point1[0]; const dy = point2[1] - point1[1];
      return Math.sqrt(dx * dx + dy * dy) * 111319.9; // Approx meters
   } catch (error) { console.error("Error calculating distance:", error); return 0; }
};

const calculateSideLengths = (coordinates) => {
   if (!coordinates || coordinates.length === 0) return [];
   try {
      const sides = [];
      const points = Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0]) ? coordinates[0] : coordinates;
      if (points.length < 2) return [];
      for (let i = 0; i < points.length; i++) {
         const point1 = points[i]; const point2 = points[(i + 1) % points.length];
         if (!Array.isArray(point1) || !Array.isArray(point2) || point1.length < 2 || point2.length < 2 ||
            typeof point1[0] !== 'number' || isNaN(point1[0]) || typeof point1[1] !== 'number' || isNaN(point1[1]) ||
            typeof point2[0] !== 'number' || isNaN(point2[0]) || typeof point2[1] !== 'number' || isNaN(point2[1])) continue;
         const midpoint = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
         const distance = calculateDistance(point1, point2);
         sides.push({ midpoint, length: distance });
      }
      return sides;
   } catch (error) { console.error("Error in calculateSideLengths:", error); return []; }
};

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const FeatureGroup = dynamic(() => import("react-leaflet").then(mod => mod.FeatureGroup), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false });
const LayerGroup = dynamic(() => import("react-leaflet").then(mod => mod.LayerGroup), { ssr: false }); // Added LayerGroup import

// Import EditControl separately with error handling
const EditControl = dynamic(
   () => import("react-leaflet-draw").then(mod => {
      if (!mod.EditControl) { console.error("EditControl not found in react-leaflet-draw"); return () => null; }
      return mod.EditControl;
   }).catch(err => { console.error("Failed to load EditControl:", err); return () => null; }),
   { ssr: false, loading: () => <div style={{ textAlign: 'center', padding: '20px' }}>Loading draw controls...</div> }
);

// Custom CSS (ensure this doesn't conflict with other global styles)
const mapStyles = `
  .leaflet-container { height: 100%; width: 100%; z-index: 0; touch-action: none; /* Keep for Leaflet's pan/zoom */ }
  .locate-button, .fullscreen-button { background-color: white; border: none; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-right: 10px; transition: all 0.2s ease; }
  .locate-button:hover, .fullscreen-button:hover { background-color: #f0f0f0; transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0,0,0,0.25); }
  .locate-button:active, .fullscreen-button:active { transform: translateY(1px); box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .leaflet-top.leaflet-left { z-index: 1000; }
  .leaflet-top.leaflet-right { z-index: 999; }
  .leaflet-draw { margin-top: 12px; }
  .leaflet-draw-toolbar a { background-color: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 6px; transition: all 0.2s ease; position: relative; border: none !important; }
  .leaflet-draw-toolbar a:hover { background-color: #f8f8f8; transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0,0,0,0.25); }
  .leaflet-draw-toolbar a:active { transform: translateY(1px); box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .leaflet-draw-toolbar a.leaflet-draw-draw-polygon, .leaflet-draw-toolbar a.leaflet-draw-draw-rectangle, .leaflet-draw-toolbar a.leaflet-draw-edit-edit, .leaflet-draw-toolbar a.leaflet-draw-edit-remove { position: relative; }
  .leaflet-draw-actions { left: 40px !important; top: 0 !important; background-color: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); overflow: hidden; }
  .leaflet-draw-actions a { color: #333; font-weight: 500; transition: all 0.15s ease; padding: 8px 12px !important; position: relative; border-bottom: 1px solid rgba(0,0,0,0.1); }
  .leaflet-draw-actions a:last-child { border-bottom: none; }
  .leaflet-draw-actions a:hover { background-color: #f0f0f0; color: #000; }
  .leaflet-draw-actions a:active { background-color: #e8e8e8; }
  .leaflet-draw-toolbar a[title]:after { content: attr(title); position: absolute; left: 40px; top: 0; background: rgba(0,0,0,0.8); color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; white-space: nowrap; opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: none; transform: translateX(-10px); z-index: 1000; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
  .leaflet-draw-toolbar a[title]:hover:after { opacity: 1; transform: translateX(0); }
  .measurement-label { background-color: rgba(255, 255, 255, 0.95); border: 1px solid rgba(0, 0, 0, 0.15); border-radius: 4px; padding: 4px 8px; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.18); pointer-events: none !important; text-align: center; transition: all 0.15s ease; transform: translate(-50%, -50%); width: auto; height: auto; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }
  .measurement-label.area { background-color: rgba(255, 255, 255, 0.95); font-weight: bold; font-size: 13px; padding: 5px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.22); z-index: 700 !important; border: 1px solid rgba(46, 204, 113, 0.5); min-width: 60px; color: #2ecc71; }
  .measurement-label.side { color: #3498db; font-size: 12px; font-weight: 500; padding: 2px 6px; min-width: 40px; background-color: rgba(255, 255, 255, 0.95); transform: translate(-50%, -50%) scale(0.95); border: 1px solid rgba(52, 152, 219, 0.5); }
  .measurement-badge { display: flex; align-items: center; justify-content: center; position: relative; }
  .zoom-level-16 { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  .zoom-level-15 { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
  .zoom-level-14 { transform: translate(-50%, -50%) scale(0.9); opacity: 0.9; }
  .zoom-level-13 { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  .zoom-level-12 { transform: translate(-50%, -50%) scale(0.7); opacity: 0.7; }
  .zoom-level-11 { transform: translate(-50%, -50%) scale(0.6); opacity: 0.6; }
  .zoom-level-10, .zoom-level-9, .zoom-level-8, .zoom-level-7, .zoom-level-6, .zoom-level-5 { opacity: 0; }
  .zoom-level-11.side, .zoom-level-10.side, .zoom-level-9.side, .zoom-level-8.side, .zoom-level-7.side, .zoom-level-6.side, .zoom-level-5.side, .zoom-level-4.side, .zoom-level-3.side { opacity: 0; }
  .fullscreen-map { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 9999 !important; }
  .fullscreen-map .exit-fullscreen { position: absolute; top: 10px; right: 10px; z-index: 1000; background: white; border: none; border-radius: 4px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; transition: all 0.2s ease; }
  .fullscreen-map .exit-fullscreen:hover { background-color: #f0f0f0; transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0,0,0,0.25); }
  .fullscreen-map .exit-fullscreen:active { transform: translateY(1px); box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  @media (max-width: 480px) { .zoom-level-13.side, .zoom-level-12.side, .zoom-level-11.side { opacity: 0; } }
  @media (max-width: 768px) {
    .leaflet-draw-toolbar a { width: 32px !important; height: 32px !important; }
    .leaflet-draw-tooltip { font-size: 14px !important; padding: 6px 10px !important; background-color: rgba(255, 255, 255, 0.95) !important; border-radius: 4px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
    .leaflet-draw-actions a { padding: 10px 12px !important; font-size: 14px !important; }
  }
`;

// SafeMapContainer Wrapper
const SafeMapContainer = ({ children, ...props }) => {
   const [isClient, setIsClient] = useState(false);
   useEffect(() => {
      setIsClient(true);
      import('leaflet/dist/leaflet.css');
      import('leaflet-draw/dist/leaflet.draw.css');
   }, []);

   if (!isClient) {
      return (
         <div style={{ height: props.style?.height || '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
            <div style={{ textAlign: 'center', color: '#aaa' }}>
               <MapPin style={{ height: '32px', width: '32px', animation: 'pulse 1.5s infinite' }} />
               <p>Loading map...</p>
               <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
         </div>
      );
   }
   return <MapContainer {...props}>{children}</MapContainer>;
};

// LocateButton Component
const LocateButton = () => {
   const handleClick = useCallback(() => {
      if (typeof window !== 'undefined' && window.navigator?.geolocation) {
         window.navigator.geolocation.getCurrentPosition(
            (position) => {
               if (window.leafletMap?.setView) {
                  window.leafletMap.setView([position.coords.latitude, position.coords.longitude], 16);
               } else { console.warn('Map instance not found or setView not available'); }
            },
            () => alert('Non è stato possibile ottenere la tua posizione. Per favore controlla le tue autorizzazioni del browser.')
         );
      }
   }, []);
   return (
      <div className="leaflet-top leaflet-right" style={{ marginTop: "50px" }}>
         <div className="leaflet-control">
            <button type="button" className="locate-button" title="Locate me" onClick={handleClick}><MapPin size={16} /></button>
         </div>
      </div>
   );
};

// FullscreenButton Component
const FullscreenButton = ({ isFullscreen, toggleFullscreen }) => (
   <div className="leaflet-top leaflet-right" style={{ marginTop: "90px" }}>
      <div className="leaflet-control">
         <button type="button" className="fullscreen-button" title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen}><Maximize2 size={16} /></button>
      </div>
   </div>
);

// MeasurementOverlay Component (ensure L.divIcon and L.Polygon are available)
const MeasurementOverlay = ({ layer, currentZoom, areaValue, isMobile }) => {
   if (!layer || !(layer instanceof L.Polygon)) return null; // Only works for Polygons

   const getLatLngs = () => {
      try { return layer.getLatLngs()[0] || []; } // Get outer ring
      catch (error) { console.error("Error getting coordinates from layer:", error); return []; }
   };

   const latLngs = getLatLngs();
   const coordinates = latLngs.map(p => [p.lat, p.lng]);
   const center = calculatePolygonCenter(coordinates);
   const sides = calculateSideLengths(coordinates);

   const formatArea = (area) => !area || isNaN(area) ? "0.00" : area >= 10 ? area.toFixed(1) : area.toFixed(2);
   const formatDistance = (dist) => dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`;

   const getLabelClasses = (base, type) => {
      const zoom = Math.min(Math.max(Math.floor(currentZoom), 5), 16);
      return `${base} ${type} zoom-level-${zoom}`;
   };

   const area = areaValue || 0;
   const getVisibleSidesRatio = () => currentZoom >= 15 ? 1 : currentZoom >= 13 ? 0.75 : currentZoom >= 11 ? 0.5 : currentZoom >= 9 ? 0.33 : 0.25;

   const getPerpendicularLine = (midpoint, p1, p2) => {
      // Simplified calculation for display purposes
      try {
         if (!midpoint || !p1 || !p2 || midpoint.length < 2 || p1.length < 2 || p2.length < 2 ||
            isNaN(midpoint[0]) || isNaN(midpoint[1]) || isNaN(p1[0]) || isNaN(p1[1]) || isNaN(p2[0]) || isNaN(p2[1])) return null;
         const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
         const perpDx = -dy, perpDy = dx;
         const len = Math.sqrt(perpDx * perpDx + perpDy * perpDy);
         if (len < 1e-6) return [[midpoint[0] - 0.0001, midpoint[1]], [midpoint[0] + 0.0001, midpoint[1]]]; // Avoid division by zero
         let scale = 0.00015 / Math.pow(2, 16 - currentZoom); // Scale based on zoom
         scale = Math.min(scale, 0.005); // Cap scale
         const normPerpDx = (perpDx / len) * scale; const normPerpDy = (perpDy / len) * scale;
         const ptA = [midpoint[0] - normPerpDx, midpoint[1] - normPerpDy];
         const ptB = [midpoint[0] + normPerpDx, midpoint[1] + normPerpDy];
         if (isNaN(ptA[0]) || isNaN(ptA[1]) || isNaN(ptB[0]) || isNaN(ptB[1])) return null;
         return [ptA, ptB];
      } catch (error) { console.error("Error calculating perp line:", error); return null; }
   };

   const showDividers = currentZoom >= 14 && !isMobile;

   const createAreaIcon = (area) => L.divIcon({ className: '', html: `<div class="${getLabelClasses('measurement-label', 'area')}" style="color: #2ecc71;"><strong>${formatArea(area)} ha</strong></div>`, iconSize: [80, 30], iconAnchor: [40, 15] });
   const createSideIcon = (length) => L.divIcon({ className: '', html: `<div class="${getLabelClasses('measurement-label', 'side')}" style="color: #3498db;">${formatDistance(length)}</div>`, iconSize: [60, 24], iconAnchor: [30, 12] });

   return (
      <>
         {center && <Marker position={center} icon={createAreaIcon(area)} />}
         {sides.filter(s => s?.midpoint && s.length > 0).map((side, index, arr) => {
            const visibleRatio = getVisibleSidesRatio();
            const skipFactor = Math.ceil(1 / visibleRatio);
            if (arr.length > 4 && index % skipFactor !== 0) return null;

            const point1 = coordinates[index]; const point2 = coordinates[(index + 1) % coordinates.length];
            if (!point1 || !point2 || !Array.isArray(point1) || !Array.isArray(point2)) return null;

            const perpLine = showDividers ? getPerpendicularLine(side.midpoint, point1, point2) : null;
            const isValidPerpLine = perpLine && Array.isArray(perpLine) && perpLine.length === 2 && Array.isArray(perpLine[0]) && Array.isArray(perpLine[1]);

            return (
               <React.Fragment key={`side-${index}`}>
                  {isValidPerpLine && (
                     <Polyline positions={perpLine} pathOptions={{ color: '#3498db', weight: 2, opacity: Math.min(0.9, currentZoom / 18), dashArray: '4, 4' }} />
                  )}
                  <Marker position={side.midpoint} icon={createSideIcon(side.length)} />
               </React.Fragment>
            );
         })}
      </>
   );
};


// Main Map Component
export default function LandFormMap({ setArea, setCoordinates }) {
   const featureGroupRef = useRef(null);
   const mapContainerRef = useRef(null);
   const isDraggingRef = useRef(false); // Ref to track map dragging state
   const [drawControlsLoaded, setDrawControlsLoaded] = useState(false);
   const [initialPosition, setInitialPosition] = useState([40.85, 14.26]); // Default to Naples if geo fails
   const [currentLayer, setCurrentLayer] = useState(null);
   const [currentZoom, setCurrentZoom] = useState(16);
   const [areaValue, setAreaValue] = useState(0);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const isMobile = useMediaQuery("(max-width: 768px)");

   // Toggle fullscreen mode
   const toggleFullscreen = useCallback(() => {
      setIsFullscreen(prev => !prev);
      setTimeout(() => { window.leafletMap?.invalidateSize(); }, 100); // Adjust map size after transition
   }, []);

   // Component Mount Effects
   useEffect(() => {
      fixLeafletIcon();
      const style = document.createElement('style');
      style.innerHTML = mapStyles;
      document.head.appendChild(style);

      navigator.geolocation?.getCurrentPosition(
         (position) => setInitialPosition([position.coords.latitude, position.coords.longitude]),
         (error) => console.error('Error getting location:', error) // Keep default or handle error
      );

      const handleEscKey = (e) => { if (e.key === "Escape" && isFullscreen) setIsFullscreen(false); };
      window.addEventListener('keydown', handleEscKey);

      // Load draw controls and customize localization
      import("react-leaflet-draw").then(() => {
         setDrawControlsLoaded(true);
         if (L.drawLocal) { // Customize Leaflet.draw strings (Italian)
            L.drawLocal.draw = { toolbar: { actions: { title: 'Annulla disegno', text: 'Annulla' }, finish: { title: 'Termina disegno', text: 'Termina' }, undo: { title: 'Elimina ultimo punto', text: 'Elimina ultimo punto' }, buttons: { polyline: 'Disegna una linea', polygon: 'Disegna un poligono', rectangle: 'Disegna un rettangolo', circle: 'Disegna un cerchio', marker: 'Posiziona un marcatore', circlemarker: 'Posiziona un marcatore circolare' } }, handlers: { circle: { tooltip: { start: 'Clicca e trascina per disegnare un cerchio' }, radius: 'Raggio' }, circlemarker: { tooltip: { start: 'Clicca per posizionare un marcatore circolare' } }, marker: { tooltip: { start: 'Clicca per posizionare un marcatore' } }, polygon: { tooltip: { start: 'Clicca per iniziare a disegnare un poligono', cont: 'Clicca per continuare a disegnare il poligono', end: 'Clicca sul primo punto per chiudere il poligono' } }, polyline: { error: '<strong>Errore:</strong> i bordi non possono incrociarsi!', tooltip: { start: 'Clicca per iniziare a disegnare una linea', cont: 'Clicca per continuare a disegnare la linea', end: 'Clicca sull\'ultimo punto per terminare la linea' } }, rectangle: { tooltip: { start: 'Clicca e trascina per disegnare un rettangolo' } }, simpleshape: { tooltip: { end: 'Rilascia il mouse per terminare il disegno' } } } };
            L.drawLocal.edit = { toolbar: { actions: { save: { title: 'Salva modifiche', text: 'Salva' }, cancel: { title: 'Annulla modifiche', text: 'Annulla' }, clearAll: { title: 'Cancella tutti i layer', text: 'Cancella tutto' } }, buttons: { edit: 'Modifica layer', editDisabled: 'Nessun layer da modificare', remove: 'Elimina layer', removeDisabled: 'Nessun layer da eliminare' } }, handlers: { edit: { tooltip: { text: 'Trascina i punti o i marcatori per modificare', subtext: 'Clicca annulla per annullare le modifiche' } }, remove: { tooltip: { text: 'Clicca su un elemento per rimuoverlo' } } } };
         }
      }).catch(err => console.error("Failed to load react-leaflet-draw:", err));

      return () => { // Cleanup
         if (style.parentNode) document.head.removeChild(style);
         window.removeEventListener('keydown', handleEscKey);
         window.leafletMap = null; // Clean up global reference if set
      };
   }, [isFullscreen]); // Re-run effect if fullscreen changes to handle escape key listener correctly

   // Handle map zoom changes
   const handleZoomChange = useCallback((e) => setCurrentZoom(e.target._zoom), []);

   // Store map instance and add listeners
   const mapRef = useCallback(node => {
      if (node) {
         window.leafletMap = node; // Set global reference if needed by LocateButton etc.
         node.on('zoomend', handleZoomChange);
         setCurrentZoom(node.getZoom()); // Set initial zoom
      }
   }, [handleZoomChange]); // Dependency ensures listener uses latest zoom handler

   // Map event handler component to track dragging state
   function MapInteractionHandler() {
      useMapEvents({
         dragstart: () => { isDraggingRef.current = true; },
         dragend: () => {
            // Timeout ensures this runs after potential click/tap events that might follow dragend
            setTimeout(() => { isDraggingRef.current = false; }, 0);
         }
      });
      return null; // Component doesn't render anything visible
   }

   // Handle shape creation - WITH DRAG CHECK
   const handleCreated = useCallback((e) => {
      // *** Check if dragging occurred just before creation ***
      if (isDraggingRef.current) {
         console.warn("Draw operation ignored, likely triggered by map drag.");
         // Optional: You might need logic here to remove the visually added point/layer
         // if leaflet-draw adds it before this check runs. This is complex.
         return; // Stop processing if dragging
      }

      const { layerType, layer } = e;
      if (featureGroupRef.current) {
         featureGroupRef.current.clearLayers(); // Clear previous shapes
         featureGroupRef.current.addLayer(layer); // Add the new shape
      }

      setCurrentLayer(layer); // Set for measurement display

      let latLngs = [];
      if (layer instanceof L.Polygon) { // Includes rectangles
         latLngs = layer.getLatLngs()[0] || [];
      } else {
         console.warn(`Unsupported layer type for area calculation: ${layerType}`);
         setCurrentLayer(null); // Don't process non-polygons further
         setCoordinates("");
         setArea(0);
         setAreaValue(0);
         return;
      }

      const coordsFormatted = formatCoordinates(latLngs);
      const areaInHectares = calculateAreaInHectares(latLngs);

      setCoordinates(coordsFormatted);
      setArea(areaInHectares);
      setAreaValue(areaInHectares); // For MeasurementOverlay

   }, [setCoordinates, setArea]); // Include state setters as dependencies

   // Handle shape edits
   const handleEdited = useCallback((e) => {
      e.layers.eachLayer((layer) => {
         if (layer instanceof L.Polygon) {
            setCurrentLayer(layer);
            const latLngs = layer.getLatLngs()[0] || [];
            const coordsFormatted = formatCoordinates(latLngs);
            const areaInHectares = calculateAreaInHectares(latLngs);
            setCoordinates(coordsFormatted);
            setArea(areaInHectares);
            setAreaValue(areaInHectares);
         }
      });
   }, [setCoordinates, setArea]);

   // Handle shape deletions
   const handleDeleted = useCallback(() => {
      setCurrentLayer(null);
      setCoordinates("");
      setArea(0);
      setAreaValue(0);
   }, [setCoordinates, setArea]);

   // Function to get draw options based on device
   const getDrawOptions = useMemo(() => {
      const baseShapeOptions = { stroke: true, color: '#3498db', weight: 3, opacity: 0.8, fill: true, fillColor: '#3498db', fillOpacity: 0.15, clickable: true };
      const baseDrawOptions = {
         polyline: false, circle: false, circlemarker: false, marker: false,
         rectangle: { shapeOptions: baseShapeOptions, showArea: true },
         polygon: { shapeOptions: baseShapeOptions, showArea: true, allowIntersection: false, drawError: { color: '#e74c3c', timeout: 1000 } },
      };

      if (isMobile) {
         return { ...baseDrawOptions, polygon: { ...baseDrawOptions.polygon, repeatMode: false }, rectangle: { ...baseDrawOptions.rectangle, repeatMode: false } };
      } else {
         // Desktop: Enable repeatMode (optional)
         return { ...baseDrawOptions, polygon: { ...baseDrawOptions.polygon, repeatMode: true }, rectangle: { ...baseDrawOptions.rectangle, repeatMode: true } };
      }
   }, [isMobile]); // Recalculate if isMobile changes


   return (
      <div ref={mapContainerRef} className={`relative w-full h-[500px] ${isFullscreen ? 'fullscreen-map' : ''}`} style={{ position: 'relative', width: '100%', height: '500px' }}>
         {/* Inject styles directly or ensure they are loaded globally */}
         <style>{mapStyles}</style>

         <SafeMapContainer
            center={initialPosition}
            zoom={currentZoom}
            ref={mapRef} // Use the callback ref to get map instance
            style={{ height: '100%', width: '100%', backgroundColor: "#f0f0f0" }}
            // Explicit map options (mostly defaults, but good for clarity)
            dragging={true}
            touchZoom={true}
            scrollWheelZoom={true}
            tap={true} // Important for touch interactions with controls/drawing
         >
            {/* Add the interaction handler */}
            <MapInteractionHandler />

            <LayerGroup>
               <TileLayer
                  attribution="Google Maps Satellite"
                  url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
               />
               <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" />
            </LayerGroup>

            <FeatureGroup ref={featureGroupRef}>
               {/* EditControl manages drawn features */}
               {drawControlsLoaded && EditControl && (
                  <EditControl
                     position="topleft"
                     onCreated={handleCreated}
                     onEdited={handleEdited}
                     onDeleted={handleDeleted}
                     draw={getDrawOptions} // Pass the memoized options
                     edit={{
                        featureGroup: featureGroupRef.current,
                        // remove: {}, // Default options usually suffice
                        // edit: {},   // Default options usually suffice
                     }}
                  />
               )}
            </FeatureGroup>

            {/* LayerGroup for custom overlays like measurements */}
            <LayerGroup>
               {currentLayer && (
                  <MeasurementOverlay
                     layer={currentLayer}
                     currentZoom={currentZoom}
                     areaValue={areaValue}
                     isMobile={isMobile}
                  />
               )}
            </LayerGroup>

            {/* Other controls */}
            <LocateButton />
            <FullscreenButton isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />

         </SafeMapContainer>

         {/* Exit Fullscreen Button (only visible when in fullscreen) */}
         {isFullscreen && (
            <button
               type="button"
               className="exit-fullscreen" // Use class defined in mapStyles
               title="Exit fullscreen"
               onClick={toggleFullscreen}
               style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10000 }} // Ensure high z-index
            >
               {/* You can use an icon here, e.g., from lucide-react */}
               <Maximize2 size={16} style={{ transform: 'rotate(180deg)' }} /> {/* Or a specific "minimize" icon */}
            </button>
         )}
      </div>
   );
}