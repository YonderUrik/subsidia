import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { formatNumber } from '@/lib/utils';

// Custom styles for map controls
const customStyles = `
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
`;

const MapboxExample = ({ lands, newLand = true, setArea, setCoordinates }) => {
   const mapContainerRef = useRef();
   const mapRef = useRef();
   const drawRef = useRef();
   const [roundedArea, setRoundedArea] = useState();
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

      // Add locate control with animation disabled
      const geolocate = new mapboxgl.GeolocateControl({
         positionOptions: {
            enableHighAccuracy: true
         },
         trackUserLocation: true,
         showUserHeading: true,
         fitBoundsOptions: {
            animate: false
         }
      });
      mapRef.current.addControl(geolocate, 'top-right');

      // Add fullscreen control - positioned for better mobile visibility
      const fullscreen = new mapboxgl.FullscreenControl();
      mapRef.current.addControl(fullscreen, 'top-right');

      // Trigger geolocation on map load
      mapRef.current.on('load', () => {
         geolocate.trigger();

         // Add lands to the map if provided
         if (lands && lands.length > 0) {
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
                     maxZoom: 16  // Limit zoom level
                  });
               } catch (error) {
                  console.error("Error calculating center of all lands:", error);
                  // Fall back to first land if there's an error
                  centerOnFirstLand();
               }
            } else if (!allCoordinatesValid) {
               // Fall back to first land if there were errors
               centerOnFirstLand();
            }

            // Fallback function to center on first land
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

            // Add each land as a polygon
            lands.forEach(land => {
               if (land.coordinates && land.coordinates.length >= 3) {
                  // Convert coordinates to GeoJSON format (swap lat/lng)
                  const lngLatCoords = land.coordinates.map(coord => [coord[1], coord[0]]);

                  // Make sure the polygon is closed (first and last points are the same)
                  const closedCoords = [...lngLatCoords];
                  if (JSON.stringify(closedCoords[0]) !== JSON.stringify(closedCoords[closedCoords.length - 1])) {
                     closedCoords.push(closedCoords[0]);
                  }

                  // Create a polygon feature
                  mapRef.current.addSource(`land-${land.id}`, {
                     type: 'geojson',
                     data: {
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
                     }
                  });

                  // Add a fill layer with grey color if newLand is true
                  mapRef.current.addLayer({
                     id: `land-fill-${land.id}`,
                     type: 'fill',
                     source: `land-${land.id}`,
                     paint: {
                        'fill-color': newLand ? '#D3D3D3' : (land.color || '#009688'),
                        'fill-opacity': newLand ? 0.8 : 0.4
                     }
                  });

                  // Add an outline layer
                  mapRef.current.addLayer({
                     id: `land-line-${land.id}`,
                     type: 'line',
                     source: `land-${land.id}`,
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

                  // Only add labels if newLand is false
                  if (!newLand) {
                     // Calculate center of the polygon for area label
                     try {
                        const polygon = turf.polygon([closedCoords]);
                        const center = turf.center(polygon);

                        // Add area label in the center
                        new mapboxgl.Marker({
                           element: createLabelElement(`${formatNumber(land.area.toFixed(4), false)} ha`, 'area-label')
                        })
                           .setLngLat(center.geometry.coordinates)
                           .addTo(mapRef.current);

                        // Calculate and add distance measurements for each side
                        for (let i = 0; i < closedCoords.length - 1; i++) {
                           const start = closedCoords[i];
                           const end = closedCoords[i + 1];

                           // Calculate midpoint for label placement
                           const midpoint = [
                              (start[0] + end[0]) / 2,
                              (start[1] + end[1]) / 2
                           ];

                           // Calculate distance in meters
                           const from = turf.point(start);
                           const to = turf.point(end);
                           const distance = turf.distance(from, to) * 1000; // Convert to meters
                           const roundedDistance = Math.round(distance * 10) / 10;

                           // Add distance label
                           new mapboxgl.Marker({
                              element: createLabelElement(`${formatNumber(roundedDistance, false)} m`, 'distance-label')
                           })
                              .setLngLat(midpoint)
                              .addTo(mapRef.current);
                        }
                     } catch (error) {
                        console.error("Error adding measurements:", error);
                     }
                  }
               }
            });
         }
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
         <div ref={mapContainerRef} id="map" style={{ height: '100%', width: '100%' }}></div>
      </>
   );
};

export default MapboxExample;