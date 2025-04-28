// Centralized data store for lands information
// This will serve as the single source of truth for lands data across the application



// Helper functions for lands data
export function getTotalArea(lands) {
  return lands.reduce((sum, land) => sum + land.area, 0)
}

export function getLandById(lands, id) {
  return lands.find(land => land.id === id)
}

export function getAllBounds(lands) {
  return lands.reduce(
    (acc, land) => {
      if (land.coordinates && land.coordinates.length > 0) {
        land.coordinates.forEach((coord) => {
          acc.push([coord[0], coord[1]])
        })
      } else if (land.center) {
        acc.push([land.center[0], land.center[1]])
      }
      return acc
    },
    []
  )
} 