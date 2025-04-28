"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook to check if a media query matches
 * @param {string} query - The media query to check
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return
    }
    
    // Create media query list
    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)
    
    // Create event listener function
    const handleChange = (event) => {
      setMatches(event.matches)
    }
    
    // Add listener for changes
    mediaQuery.addEventListener("change", handleChange)
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])
  
  return matches
} 