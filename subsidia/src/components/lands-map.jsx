"use client"

import MapboxExample from "./map-components/mapbox"

export function LandsMap({ lands }) {  
   return (
      <>
         <div className="h-[600px]">
            <MapboxExample lands={lands} newLand={false} />
         </div>
      </>
   )
}
