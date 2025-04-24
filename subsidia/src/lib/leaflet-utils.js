// Fix for Leaflet default icon issue in Next.js
export const fixLeafletIcon = () => {
   // Only run on client side
   if (typeof window !== "undefined") {
      // Dynamically import Leaflet to avoid server-side rendering issues
      import("leaflet").then(L => {
         // @ts-ignore
         delete L.Icon.Default.prototype._getIconUrl

         L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
         })
      })
   }
}

// Calculate area of a polygon in hectares
export const calculateAreaInHectares = (latLngs) => {
   if (!latLngs || latLngs.length < 3) return 0
   
   // This function should only be called client-side
   if (typeof window === "undefined") return 0

   // Dynamically import to avoid server-side rendering issues
   const L = require("leaflet")
   
   // Calculate area in square meters
   const areaInSqMeters = L.GeometryUtil.geodesicArea(latLngs)

   // Convert to hectares (1 hectare = 10,000 sq meters)
   return Number((areaInSqMeters / 10000).toFixed(4))
}

// Convert GeoJSON to Leaflet LatLng array
export const geoJSONToLatLngs = (geojson) => {
   if (!geojson || !geojson.features) return []
   
   // This function should only be called client-side
   if (typeof window === "undefined") return []

   // Dynamically import to avoid server-side rendering issues
   const L = require("leaflet")

   // Find the first polygon feature
   const polygonFeature = geojson.features.find(
      (feature) =>
         feature.geometry && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon"),
   )

   if (!polygonFeature) return []

   let coordinates = []

   if (polygonFeature.geometry.type === "Polygon") {
      // Use the outer ring of the polygon
      coordinates = polygonFeature.geometry.coordinates[0]
   } else if (polygonFeature.geometry.type === "MultiPolygon") {
      // Use the outer ring of the first polygon
      coordinates = polygonFeature.geometry.coordinates[0][0]
   }

   // Convert to Leaflet LatLng objects (note: GeoJSON uses [lng, lat] format)
   return coordinates.map((coord) => L.latLng(coord[1], coord[0]))
}

// Format coordinates for display
export const formatCoordinates = (latLngs) => {
   if (!latLngs || latLngs.length === 0) return []

   return latLngs.map((latLng) => [
      Number(latLng.lat.toFixed(6)), 
      Number(latLng.lng.toFixed(6))
   ])
}
