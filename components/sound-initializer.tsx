"use client"

import { useEffect } from "react"
import { preloadCommonSounds } from "@/lib/sound-utils"

/**
 * Component to initialize and preload sounds
 * This helps with browser autoplay policies by ensuring sounds
 * are loaded after user interaction
 */
export function SoundInitializer() {
  useEffect(() => {
    // Initialize audio on first user interaction
    const initializeAudio = () => {
      // Preload common sounds
      preloadCommonSounds()

      // Create and resume AudioContext (needed for some browsers)
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
          const audioContext = new AudioContext()
          if (audioContext.state === "suspended") {
            audioContext.resume()
          }
        }
      } catch (error) {
        console.warn("AudioContext initialization failed:", error)
      }

      // Remove event listeners after initialization
      document.removeEventListener("click", initializeAudio)
      document.removeEventListener("touchstart", initializeAudio)
      document.removeEventListener("keydown", initializeAudio)
    }

    // Add event listeners for user interaction
    document.addEventListener("click", initializeAudio)
    document.addEventListener("touchstart", initializeAudio)
    document.addEventListener("keydown", initializeAudio)

    // Cleanup
    return () => {
      document.removeEventListener("click", initializeAudio)
      document.removeEventListener("touchstart", initializeAudio)
      document.removeEventListener("keydown", initializeAudio)
    }
  }, [])

  // This component doesn't render anything
  return null
}
