"use client"

import { useEffect, useState, memo } from "react"

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

// Reduced number of bubbles for better performance
export const FloatingBubbles = memo(function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const createBubble = (id: number): Bubble => ({
      id,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50,
      size: Math.random() * 40 + 15, // Smaller bubbles for better performance
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.2 + 0.05,
    })

    // Reduced initial bubbles count
    const initialBubbles = Array.from({ length: 8 }, (_, i) => ({
      ...createBubble(i),
      y: Math.random() * window.innerHeight,
    }))
    setBubbles(initialBubbles)

    const interval = setInterval(() => {
      setBubbles((prev) => {
        const updated = prev.map((bubble) => ({
          ...bubble,
          y: bubble.y - bubble.speed,
        }))

        const filtered = updated.filter((bubble) => bubble.y > -100)

        // Reduced spawn rate
        if (Math.random() < 0.2 && filtered.length < 10) {
          filtered.push(createBubble(Date.now()))
        }

        return filtered
      })
    }, 100) // Reduced update frequency

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-white/10 to-cyan-200/20 backdrop-blur-sm border border-white/10"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            willChange: "transform, opacity",
            transform: `translate3d(0, 0, 0)`, // Force GPU acceleration
          }}
        />
      ))}
    </div>
  )
})
