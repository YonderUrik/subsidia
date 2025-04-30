import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { formatNumber } from '@/lib/utils';

// Define this class outside your component, or inside if preferred,
// but ensure it's defined before being used in useEffect.

class CustomFullscreenControl {
   constructor(container) {
      this._container = container; // The map's container element (e.g., mapContainerRef.current)
      this._isCssFullscreen = false; // Track CSS fullscreen state
   }

   onAdd(map) {
      this._map = map;
      this._controlContainer = document.createElement('div');
      this._controlContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

      this._button = document.createElement('button');
      this._button.className = 'mapboxgl-ctrl-icon';
      this._button.type = 'button';
      this._button.onclick = () => this.toggleFullscreen();

      this._controlContainer.appendChild(this._button);

      // Listen for native fullscreen changes
      document.addEventListener('fullscreenchange', this._handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', this._handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', this._handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', this._handleFullscreenChange);

      this._updateButtonState(); // Set initial state

      return this._controlContainer;
   }

   onRemove() {
      // Ensure we exit CSS mode if active when control is removed
      if (this._isCssFullscreen) {
         this.exitCssFullscreen();
      }

      if (this._controlContainer && this._controlContainer.parentNode) {
         this._controlContainer.parentNode.removeChild(this._controlContainer);
      }
      // Remove native listeners
      document.removeEventListener('fullscreenchange', this._handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this._handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', this._handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', this._handleFullscreenChange);

      this._map = undefined;
      this._button = undefined;
      this._controlContainer = undefined;
   }

   // --- CSS Fullscreen Methods ---
   enterCssFullscreen() {
      if (!this._container || this._isCssFullscreen) return;
      console.log("Entering CSS Fullscreen Fallback");
      this._container.classList.add('map-css-fullscreen');
      document.body.classList.add('body-map-fullscreen');
      this._isCssFullscreen = true;
      this._updateButtonState(); // Update button icon
      this._map.resize(); // Important: Tell Mapbox to resize to the new container dimensions
   }

   exitCssFullscreen() {
      if (!this._container || !this._isCssFullscreen) return;
      console.log("Exiting CSS Fullscreen Fallback");
      this._container.classList.remove('map-css-fullscreen');
      document.body.classList.remove('body-map-fullscreen');
      this._isCssFullscreen = false;
      this._updateButtonState(); // Update button icon
      this._map.resize(); // Important: Tell Mapbox to resize back
   }
   // --- End CSS Fullscreen Methods ---


   // Combined handler for native fullscreen changes and updating button state
   _handleFullscreenChange = () => {
      // If a native fullscreen change occurs, ensure our CSS state is off
      if (this.isNativeFullscreenActive() && this._isCssFullscreen) {
         this.exitCssFullscreen(); // Should ideally not happen, but safety check
      }
      this._updateButtonState();
   };

   // Update button based on EITHER native OR CSS fullscreen state
   _updateButtonState = () => {
      if (!this._button) return;

      const isNative = this.isNativeFullscreenActive();
      const isActive = isNative || this._isCssFullscreen; // Active if either mode is on

      if (isActive) {
         this._button.classList.remove('mapboxgl-ctrl-fullscreen');
         this._button.classList.add('mapboxgl-ctrl-shrink');
         this._button.setAttribute('aria-label', 'Exit fullscreen');
      } else {
         this._button.classList.remove('mapboxgl-ctrl-shrink');
         this._button.classList.add('mapboxgl-ctrl-fullscreen');
         this._button.setAttribute('aria-label', 'Enter fullscreen');
      }
   };

   // Helper to check native fullscreen status consistently
   isNativeFullscreenActive() {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      // Check if native fullscreen is active AND applied to our map container
      return !!fullscreenElement && fullscreenElement === this._container;
   }

   // Main toggle logic
   async toggleFullscreen() {
      if (!this._container) {
         console.error("Map container element not found.");
         return;
      }

      // --- Check if exiting ---
      if (this.isNativeFullscreenActive()) {
         // Exit native fullscreen
         console.log("Exiting Native Fullscreen");
         if (document.exitFullscreen) await document.exitFullscreen().catch(e => console.error("Exit FS Error:", e));
         else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
         else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
         else if (document.msExitFullscreen) document.msExitFullscreen();
         // _updateButtonState will be called by the 'fullscreenchange' event listener
         return;
      }

      if (this._isCssFullscreen) {
         // Exit CSS fullscreen
         this.exitCssFullscreen();
         return;
      }

      // --- Attempt to enter ---
      const targetElement = this._container;
      const isCapabilitySupported = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
      this.enterCssFullscreen();
      // if (isCapabilitySupported) {
      //    console.log("Attempting Native Fullscreen");
      //    try {
      //       if (targetElement.requestFullscreen) await targetElement.requestFullscreen();
      //       else if (targetElement.webkitRequestFullscreen) targetElement.webkitRequestFullscreen(); // Note: Safari might need options or specific context
      //       else if (targetElement.mozRequestFullScreen) targetElement.mozRequestFullScreen();
      //       else if (targetElement.msRequestFullscreen) targetElement.msRequestFullscreen();
      //       else throw new Error("No known requestFullscreen method found despite capability check.");

      //       // Success! Native fullscreen initiated. State update handled by event listener.
      //       console.log("Native Fullscreen request successful (or initiated).");

      //    } catch (err) {
      //       console.warn(`Native Fullscreen failed: ${err.message}. Falling back to CSS method.`);
      //       // Native method failed OR was refused by browser (common on iOS)
      //       this.enterCssFullscreen();
      //    }
      // } else {
      //    // Native API not supported at all, go directly to CSS fallback
      //    console.log("Native Fullscreen not supported. Using CSS fallback.");
      //    this.enterCssFullscreen();
      // }
   }
}

// Custom styles for map controls
const customStyles = `

/* Styles for the map container in CSS fullscreen mode */
.map-css-fullscreen {
  position: fixed !important; /* Override any relative/absolute positioning */
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important; /* Full viewport width */
  height: 100vh !important; /* Full viewport height */
  z-index: 99999 !important; /* Drastically increased z-index to be above everything */
  background-color: #ffffff; /* Ensure white background */
}

/* Style for the body when map is in CSS fullscreen to prevent scrolling */
.body-map-fullscreen {
  overflow: hidden !important; /* Prevent scrolling of underlying page content */
}
  
.mapboxgl-ctrl-group {
  background-color: #ffffff;
  border-radius: 8px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
}

.mapboxgl-ctrl-group button {
  width: 36px !important;
  height: 36px !important;
  border-radius: 4px !important;
  transition: all 0.2s ease;
}

.mapboxgl-ctrl-group button:hover {
  background-color: #f0f0f0 !important;
}

.mapboxgl-ctrl-icon {
  filter: none !important;
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .mapboxgl-ctrl-top-right {
    top: 10px;
    right: 10px;
  }
  
  .mapboxgl-ctrl-group {
    margin: 0 0 10px 0 !important;
  }
  
  .mapboxgl-ctrl-group button {
    width: 42px !important;
    height: 42px !important;
  }
}

/* Ensure fullscreen icons are displayed correctly */
.mapboxgl-ctrl-fullscreen {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill='%23333'%3E%3Cpath d='M2 9V3h6M18 9V3h-6M2 11v6h6M18 11v6h-6' stroke='%23333' stroke-width='1.2' fill='none'/%3E%3C/svg%3E") !important;
  background-size: 16px 16px !important; /* Adjust size as needed */
  background-repeat: no-repeat !important;
  background-position: center !important;
}

.mapboxgl-ctrl-shrink {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill='%23333'%3E%3Cpath d='M8 3v6H2M12 3v6h6M8 17v-6H2M12 17v-6h6' stroke='%23333' stroke-width='1.2' fill='none'/%3E%3C/svg%3E") !important;
  background-size: 16px 16px !important; /* Adjust size as needed */
  background-repeat: no-repeat !important;
  background-position: center !important;
}
`;

const MapboxExample = ({ lands, newLand = true, setArea, setCoordinates }) => {
   const mapContainerRef = useRef();
   const mapRef = useRef();
   const drawRef = useRef();
   const [roundedArea, setRoundedArea] = useState();
   const [isMapLoading, setIsMapLoading] = useState(true); // Add loading state
   const measurementMarkersRef = useRef([]);

   useEffect(() => {
      // Add custom styles to head
      const styleElement = document.createElement('style');
      styleElement.textContent = customStyles;
      document.head.appendChild(styleElement);

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      // Initialize map with default center
      mapRef.current = new mapboxgl.Map({
         container: mapContainerRef.current,
         style: 'mapbox://styles/mapbox/satellite-streets-v12',
         center: [-91.874, 42.76],
         zoom: 12
      });

      // Show loading initially
      setIsMapLoading(true);

      // Add locate control with animation disabled
      const geolocate = new mapboxgl.GeolocateControl({
         positionOptions: {
            enableHighAccuracy: true
         },
         trackUserLocation: false, // Only geolocate once, don't track continuously
         showUserHeading: true,
         fitBoundsOptions: {
            animate: false
         }
      });
      mapRef.current.addControl(geolocate, 'top-right');

      // --- Use the Custom Fullscreen Control ---
      // Check if mapContainerRef.current exists before creating control
      if (mapContainerRef.current) {
         const customFullscreen = new CustomFullscreenControl(mapContainerRef.current);
         mapRef.current.addControl(customFullscreen, 'top-right');
      }
      // --- End of Custom Fullscreen Control usage ---


      // Trigger geolocation or fit bounds on map load
      mapRef.current.on('load', () => {
         // Add lands to the map if provided
         if (lands && lands.length > 0) {
            // --- Data preparation for labels ---
            const areaLabelFeatures = [];
            const distanceLabelFeatures = [];
            // --- End Data preparation ---

            // Create a feature collection of all lands to calculate the center
            const features = [];
            let allCoordinatesValid = true;

            lands.forEach(land => {
               if (land.coordinates && land.coordinates.length >= 3) {
                  // Convert coordinates to GeoJSON format (swap lat/lng)
                  const lngLatCoords = land.coordinates.map(coord => [coord[1], coord[0]]);

                  // Make sure the polygon is closed (first and last points are the same)
                  const closedCoords = [...lngLatCoords];
                  if (JSON.stringify(closedCoords[0]) !== JSON.stringify(closedCoords[closedCoords.length - 1])) {
                     closedCoords.push(closedCoords[0]);
                  }

                  try {
                     const polygon = turf.polygon([closedCoords]);
                     features.push(polygon);
                  } catch (error) {
                     console.error("Error creating polygon for land:", land.id, error);
                     allCoordinatesValid = false;
                  }
               }
            });

            // Center map on all lands if we have valid features
            if (features.length > 0) {
               try {
                  const featureCollection = turf.featureCollection(features);
                  const bbox = turf.bbox(featureCollection);

                  // Fit the map to the bounds of all lands
                  mapRef.current.fitBounds([
                     [bbox[0], bbox[1]], // Southwest coordinates
                     [bbox[2], bbox[3]]  // Northeast coordinates
                  ], {
                     padding: 50, // Add some padding around the bounds
                     maxZoom: 16,  // Limit zoom level
                     animate: false // Disable animation for initial load
                  });
               } catch (error) {
                  console.error("Error calculating center of all lands:", error);
                  // If no valid land features could be processed, geolocate as fallback
                  console.warn("No valid land features found to fit bounds, attempting geolocation.");
                  geolocate.trigger();
               }
            } else if (!allCoordinatesValid) {
               // If no valid land features could be processed, geolocate as fallback
               console.warn("No valid land features found to fit bounds, attempting geolocation.");
               geolocate.trigger();
            }

            // Fallback function to center on first land (only if bbox fails)
            function centerOnFirstLand() {
               const firstLand = lands[0];
               if (firstLand.coordinates && firstLand.coordinates.length > 0) {
                  const lngLatCoords = firstLand.coordinates.map(coord => [coord[1], coord[0]]);

                  const closedCoords = [...lngLatCoords];
                  if (JSON.stringify(closedCoords[0]) !== JSON.stringify(closedCoords[closedCoords.length - 1])) {
                     closedCoords.push(closedCoords[0]);
                  }

                  try {
                     if (closedCoords.length >= 4) {
                        const polygon = turf.polygon([closedCoords]);
                        const center = turf.center(polygon);
                        mapRef.current.flyTo({ center: center.geometry.coordinates });
                     } else {
                        mapRef.current.flyTo({ center: lngLatCoords[0] });
                     }
                  } catch (error) {
                     console.error("Error calculating center:", error);
                     mapRef.current.flyTo({ center: lngLatCoords[0] });
                  }
               }
            }

            // Add each land as a polygon and prepare label data
            lands.forEach(land => {
               if (land.coordinates && land.coordinates.length >= 3) {
                  // Convert coordinates to GeoJSON format (swap lat/lng)
                  const lngLatCoords = land.coordinates.map(coord => [coord[1], coord[0]]);

                  // Make sure the polygon is closed (first and last points are the same)
                  const closedCoords = [...lngLatCoords];
                  if (JSON.stringify(closedCoords[0]) !== JSON.stringify(closedCoords[closedCoords.length - 1])) {
                     closedCoords.push(closedCoords[0]);
                  }

                  const landId = `land-${land.id}`;
                  const polygonFeature = {
                     type: 'Feature',
                     geometry: {
                        type: 'Polygon',
                        coordinates: [closedCoords]
                     },
                     properties: {
                        id: land.id,
                        name: land.name,
                        area: land.area,
                        soilType: land.soilType,
                        lastHarvest: land.lastHarvest
                     }
                  };


                  // Create a polygon feature
                  mapRef.current.addSource(landId, {
                     type: 'geojson',
                     data: polygonFeature
                  });

                  // Add a fill layer with grey color if newLand is true
                  mapRef.current.addLayer({
                     id: `land-fill-${land.id}`,
                     type: 'fill',
                     source: landId, // Use the landId source
                     paint: {
                        'fill-color': newLand ? '#D3D3D3' : (land.color || '#009688'),
                        'fill-opacity': newLand ? 0.8 : 0.4
                     }
                  });

                  // Add an outline layer
                  mapRef.current.addLayer({
                     id: `land-line-${land.id}`,
                     type: 'line',
                     source: landId, // Use the landId source
                     paint: {
                        'line-color': newLand ? '#888888' : (land.color || '#009688'),
                        'line-width': 2
                     }
                  });

                  // Add popup on click
                  mapRef.current.on('click', `land-fill-${land.id}`, (e) => {
                     const props = e.features[0].properties;
                     const lastHarvest = props.lastHarvest ? new Date(props.lastHarvest).toLocaleDateString() : 'Nessuna';

                     new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`
                           <strong>${props.name}</strong><br/>
                           Area: ${formatNumber(props.area.toFixed(4), false)} ha<br/>
                           Coltura: ${props.soilType || 'Non specificata'}<br/>
                           Ultima Raccolta: ${lastHarvest}
                        `)
                        .addTo(mapRef.current);
                  });

                  // Change cursor on hover
                  mapRef.current.on('mouseenter', `land-fill-${land.id}`, () => {
                     mapRef.current.getCanvas().style.cursor = 'pointer';
                  });

                  mapRef.current.on('mouseleave', `land-fill-${land.id}`, () => {
                     mapRef.current.getCanvas().style.cursor = '';
                  });

                  // Only prepare labels if newLand is false
                  if (!newLand) {
                     try {
                        const polygon = turf.polygon([closedCoords]);
                        const center = turf.center(polygon);

                        // Prepare area label feature
                        areaLabelFeatures.push({
                           type: 'Feature',
                           geometry: center.geometry, // Use the calculated center point
                           properties: {
                              labelText: `${formatNumber(land.area.toFixed(4), false)} ha`
                           }
                        });

                        // Prepare distance label features for each side
                        for (let i = 0; i < closedCoords.length - 1; i++) {
                           const start = closedCoords[i];
                           const end = closedCoords[i + 1];

                           const midpoint = [
                              (start[0] + end[0]) / 2,
                              (start[1] + end[1]) / 2
                           ];

                           const from = turf.point(start);
                           const to = turf.point(end);
                           const distance = turf.distance(from, to) * 1000; // meters
                           const roundedDistance = Math.round(distance * 10) / 10;

                           distanceLabelFeatures.push({
                              type: 'Feature',
                              geometry: {
                                 type: 'Point',
                                 coordinates: midpoint
                              },
                              properties: {
                                 labelText: `${formatNumber(roundedDistance, false)} m`
                              }
                           });
                        }
                     } catch (error) {
                        console.error("Error preparing label features:", error);
                     }
                  }
               }
            });

            // --- Add Label Layers ---
            if (!newLand && (areaLabelFeatures.length > 0 || distanceLabelFeatures.length > 0)) {
               // Add source for Area Labels
               mapRef.current.addSource('area-labels', {
                  type: 'geojson',
                  data: turf.featureCollection(areaLabelFeatures)
               });

               // Add source for Distance Labels
               mapRef.current.addSource('distance-labels', {
                  type: 'geojson',
                  data: turf.featureCollection(distanceLabelFeatures)
               });

               // Add Area Label Layer
               mapRef.current.addLayer({
                  id: 'area-label-layer',
                  type: 'symbol',
                  source: 'area-labels',
                  minzoom: 10, // Only show area labels when zoomed in reasonably
                  layout: {
                     'text-field': ['get', 'labelText'],
                     'text-size': 14,
                     'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                     'text-allow-overlap': false, // Prevent overlap
                     'text-ignore-placement': false, // Prevent overlap
                     'text-offset': [0, -0.5], // Adjust offset slightly if needed
                     'text-anchor': 'center',
                  },
                  paint: {
                     'text-color': '#009688', // Area label color
                     'text-halo-color': 'rgba(255, 255, 255, 0.9)', // White halo for legibility
                     'text-halo-width': 1,
                     'text-halo-blur': 1
                  }
               });

               // Add Distance Label Layer
               mapRef.current.addLayer({
                  id: 'distance-label-layer',
                  type: 'symbol',
                  source: 'distance-labels',
                  minzoom: 15, // Only show distance labels when zoomed in quite a bit
                  layout: {
                     'text-field': ['get', 'labelText'],
                     'text-size': 12,
                     'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                     'text-allow-overlap': false, // Prevent overlap
                     'text-ignore-placement': false, // Prevent overlap
                     'text-rotation-alignment': 'map', // Align text with map rotation
                     'text-pitch-alignment': 'map' // Align text with map pitch
                  },
                  paint: {
                     'text-color': '#333333', // Distance label color
                     'text-halo-color': 'rgba(255, 255, 255, 0.9)', // White halo for legibility
                     'text-halo-width': 1,
                     'text-halo-blur': 1
                  }
               });
            }
            // --- End Add Label Layers ---
         } else {
            // No lands provided, trigger geolocation
            console.log("No lands provided, triggering geolocation.");
            geolocate.trigger();
         }

         // Hide loading indicator
         setIsMapLoading(false);
      });

      // Helper function to create label elements
      function createLabelElement(text, className) {
         const el = document.createElement('div');
         el.className = className;
         el.style.background = 'rgba(255, 255, 255, 0.9)';
         el.style.padding = '3px 6px';
         el.style.borderRadius = '4px';
         el.style.fontSize = '12px';
         el.style.fontWeight = 'bold';
         el.style.textAlign = 'center';
         el.style.whiteSpace = 'pre-line';
         el.style.pointerEvents = 'none';
         el.style.border = '1px solid rgba(0, 0, 0, 0.1)';
         el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

         if (className === 'area-label') {
            el.style.color = '#009688';
            el.style.fontSize = '14px';
            el.style.padding = '4px 8px';
         } else if (className === 'distance-label') {
            el.style.color = '#333';
            el.style.transform = 'translateY(-50%)';
         } else if (className === 'name-label') {
            el.style.color = '#000';
            el.style.fontWeight = 'bold';
         }

         el.textContent = text;
         return el;
      }

      // Only add drawing tools if newLand is true
      if (newLand) {
         // Custom drawing tools with improved styling
         const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
               polygon: true,
               trash: true
            },
            defaultMode: 'draw_polygon',
            styles: [
               // Style for points (vertices)
               {
                  'id': 'gl-draw-point',
                  'type': 'circle',
                  'filter': ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
                  'paint': {
                     'circle-radius': 6,
                     'circle-color': '#1e88e5'
                  }
               },
               // Style for midpoints
               {
                  'id': 'gl-draw-point-midpoint',
                  'type': 'circle',
                  'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                  'paint': {
                     'circle-radius': 4,
                     'circle-color': '#90caf9'
                  }
               },
               // Style for point stroke
               {
                  'id': 'gl-draw-point-stroke-active',
                  'type': 'circle',
                  'filter': ['all', ['==', '$type', 'Point'], ['==', 'active', 'true']],
                  'paint': {
                     'circle-radius': 7,
                     'circle-color': '#fff'
                  }
               },
               // Style for the polygon fill
               {
                  'id': 'gl-draw-polygon-fill',
                  'type': 'fill',
                  'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                  'paint': {
                     'fill-color': '#1e88e5',
                     'fill-outline-color': '#1e88e5',
                     'fill-opacity': 0.3
                  }
               },
               // Style for the polygon outline
               {
                  'id': 'gl-draw-polygon-stroke',
                  'type': 'line',
                  'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                  'layout': {
                     'line-cap': 'round',
                     'line-join': 'round'
                  },
                  'paint': {
                     'line-color': '#1e88e5',
                     'line-width': 2
                  }
               }
            ]
         });

         drawRef.current = draw;
         mapRef.current.addControl(draw, 'top-right');

         // Event listeners for drawing
         mapRef.current.on('draw.create', (e) => {
            // Ensure only one polygon can be drawn at a time
            const features = drawRef.current.getAll().features;
            if (features.length > 1) {
               // Keep only the newest polygon
               const latestFeatureId = e.features[0].id;
               features.forEach(feature => {
                  if (feature.id !== latestFeatureId) {
                     drawRef.current.delete(feature.id);
                  }
               });
            }
            updateArea(e);
         });

         mapRef.current.on('draw.delete', updateArea);
         mapRef.current.on('draw.update', updateArea);

         // Update measurements in real-time while drawing
         let debounceTimer;
         mapRef.current.on('draw.selectionchange', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateDrawingMeasurements, 100);
         });

         mapRef.current.on('draw.modechange', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateDrawingMeasurements, 100);
         });

         // Use a throttled version for render events which happen frequently
         let lastRenderUpdate = 0;
         mapRef.current.on('draw.render', () => {
            const now = Date.now();
            if (now - lastRenderUpdate > 300) { // Only update every 300ms
               lastRenderUpdate = now;
               updateDrawingMeasurements();
            }
         });
      }

      function updateDrawingMeasurements() {
         if (!drawRef.current || !mapRef.current) return;

         // Clear previous measurements
         clearMeasurements();

         const data = drawRef.current.getAll();
         if (data.features.length > 0) {
            // Calculate area
            const area = turf.area(data);
            const roundedAreaValue = Math.round(area * 100) / 100;
            setRoundedArea(roundedAreaValue);

            // For each feature being drawn
            data.features.forEach(feature => {
               if (feature.geometry.type === 'Polygon') {
                  const coords = feature.geometry.coordinates[0];

                  // Add area label in the center if we have a valid polygon
                  if (coords.length >= 4) { // At least 3 points plus the closing point
                     try {
                        const polygon = turf.polygon([coords]);
                        const center = turf.center(polygon);

                        // Add area marker
                        const areaMarker = new mapboxgl.Marker({
                           element: createLabelElement(`${formatNumber((roundedAreaValue / 10000).toFixed(4), false)} ha`, 'area-label')
                        })
                           .setLngLat(center.geometry.coordinates)
                           .addTo(mapRef.current);

                        measurementMarkersRef.current.push(areaMarker);
                     } catch (error) {
                        console.error("Error calculating polygon center:", error);
                     }
                  }

                  // Add distance measurements for each side
                  for (let i = 0; i < coords.length - 1; i++) {
                     const start = coords[i];
                     const end = coords[i + 1];

                     // Calculate midpoint
                     const midpoint = [
                        (start[0] + end[0]) / 2,
                        (start[1] + end[1]) / 2
                     ];

                     // Calculate distance
                     const from = turf.point(start);
                     const to = turf.point(end);
                     const distance = turf.distance(from, to) * 1000; // Convert to meters
                     const roundedDistance = Math.round(distance * 10) / 10;

                     // Add distance marker
                     const distanceMarker = new mapboxgl.Marker({
                        element: createLabelElement(`${formatNumber(roundedDistance, false)} m`, 'distance-label')
                     })
                        .setLngLat(midpoint)
                        .addTo(mapRef.current);

                     measurementMarkersRef.current.push(distanceMarker);
                  }
               }
            });
         } else {
            setRoundedArea(undefined);
            setCoordinates?.([]);
            setArea?.(0);
         }
      }

      function clearMeasurements() {
         // Remove all current measurement markers
         measurementMarkersRef.current.forEach(marker => {
            if (marker) marker.remove();
         });
         measurementMarkersRef.current = [];
      }

      function updateArea(e) {
         if (!drawRef.current) return;

         const data = drawRef.current.getAll();
         if (data.features.length > 0) {
            const area = turf.area(data);
            const roundedAreaValue = Math.round(area * 100) / 100;
            setRoundedArea(roundedAreaValue);
            setArea?.(roundedAreaValue / 10000);

            // Update coordinates for parent component
            if (data.features[0] && data.features[0].geometry.coordinates[0]) {
               // Convert from [lng, lat] to [lat, lng] format
               const coordinates = data.features[0].geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
               setCoordinates?.(coordinates);
            }

            updateDrawingMeasurements();
         } else {
            setRoundedArea(undefined);
            clearMeasurements();
            setCoordinates?.([]);
            setArea?.(0);
            if (e && e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
         }
      }

      // Cleanup function
      return () => {
         // Remove custom styles
         const styleElement = document.querySelector('style');
         if (styleElement && styleElement.textContent === customStyles) {
            styleElement.remove();
         }

         if (mapRef.current) {
            // Clear all measurements
            clearMeasurements();

            // Remove the custom undo button if it exists
            const undoControl = document.querySelector('.mapbox-undo-btn');
            if (undoControl && undoControl.parentNode) {
               undoControl.parentNode.remove();
            }

            mapRef.current.remove();
         }
      };
   }, [lands, newLand]);

   return (
      <>
         <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {isMapLoading && (
               <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10, // Ensure it's above the map container but below controls if needed
                  fontSize: '1.2em',
                  color: '#333'
               }}>
                  Caricamento mappa...
               </div>
            )}
            <div ref={mapContainerRef} id="map" style={{ height: '100%', width: '100%' }}></div>
         </div>
      </>
   );
};

export default MapboxExample;