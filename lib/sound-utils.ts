/**
 * Utility functions for handling sounds in the application
 */

// Preload audio files for better performance
const preloadedSounds: Record<string, HTMLAudioElement> = {}

/**
 * Preload a sound file for later use
 * @param soundPath Path to the sound file
 * @param id Identifier for the sound
 */
export function preloadSound(soundPath: string, id: string): void {
  try {
    const audio = new Audio(soundPath)
    audio.load() // Start loading the audio file
    preloadedSounds[id] = audio
  } catch (error) {
    console.warn(`Failed to preload sound ${id}:`, error)
  }
}

/**
 * Play a sound with fallback options and error handling
 * @param soundPath Primary path to the sound file
 * @param fallbackPath Optional fallback path if primary fails
 * @param volume Volume level (0.0 to 1.0)
 */
export function playSound(soundPath: string, fallbackPath?: string, volume = 0.3): void {
  try {
    // Try to use preloaded sound first
    const soundId = soundPath.split("/").pop() || soundPath

    if (preloadedSounds[soundId]) {
      const preloadedSound = preloadedSounds[soundId]
      preloadedSound.currentTime = 0
      preloadedSound.volume = volume
      preloadedSound.play().catch((error) => {
        console.warn(`Failed to play preloaded sound ${soundId}:`, error)
        playWithFallbacks(soundPath, fallbackPath, volume)
      })
      return
    }

    // If not preloaded, use fallback approach
    playWithFallbacks(soundPath, fallbackPath, volume)
  } catch (error) {
    console.warn("Sound playback error:", error)
  }
}

/**
 * Internal helper to try multiple approaches to play a sound
 */
function playWithFallbacks(soundPath: string, fallbackPath?: string, volume = 0.3): void {
  // Method 1: Standard Audio API
  const audio = new Audio()
  audio.volume = volume

  // Try sources in sequence
  const sources = [soundPath]
  if (fallbackPath) sources.push(fallbackPath)

  const trySource = (index: number) => {
    if (index >= sources.length) {
      console.warn("All sound sources failed")
      return
    }

    audio.src = sources[index]
    audio.oncanplaythrough = () => {
      audio.play().catch((err) => {
        console.warn(`Sound source ${index} failed:`, err)
        trySource(index + 1)
      })
    }
    audio.onerror = () => trySource(index + 1)
  }

  trySource(0)

  // Method 2: Web Audio API (more compatible with some browsers)
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContext) {
      const audioContext = new AudioContext()

      fetch(soundPath)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          const source = audioContext.createBufferSource()
          const gainNode = audioContext.createGain()
          gainNode.gain.value = volume

          source.buffer = audioBuffer
          source.connect(gainNode)
          gainNode.connect(audioContext.destination)
          source.start(0)
        })
        .catch(() => {
          if (fallbackPath) {
            fetch(fallbackPath)
              .then((response) => response.arrayBuffer())
              .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
              .then((audioBuffer) => {
                const source = audioContext.createBufferSource()
                const gainNode = audioContext.createGain()
                gainNode.gain.value = volume

                source.buffer = audioBuffer
                source.connect(gainNode)
                gainNode.connect(audioContext.destination)
                source.start(0)
              })
              .catch((err) => console.warn("Web Audio API fallback failed:", err))
          }
        })
    }
  } catch (error) {
    console.warn("Web Audio API not supported:", error)
  }
}

/**
 * Preload common sounds used throughout the application
 */
export function preloadCommonSounds(): void {
  if (typeof window !== "undefined") {
    // Preload click sound
    preloadSound("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-234708-xQErOrgau1o0PzqKaZ1qG4utusJIVK.mp3", "click")
    preloadSound(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-234708-xQErOrgau1o0PzqKaZ1qG4utusJIVK.mp3",
      "click-fallback",
    )

    // Add more sounds as needed
  }
}
