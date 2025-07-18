"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({ isVisible, message = "Loading..." }: LoadingOverlayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  const loadingImages = [
    "https://i.postimg.cc/FKMF9ZXq/loading1.png", // loading1.png
    "https://i.postimg.cc/k4WJDbn5/loading-2.png", // loading2.png
    "https://i.postimg.cc/437Nk0qV/loading3.png", // loading3.png
  ]

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex + direction

        // If we reach the end, reverse direction
        if (nextIndex >= loadingImages.length - 1) {
          setDirection(-1)
          return loadingImages.length - 1
        }

        // If we reach the beginning, reverse direction
        if (nextIndex <= 0) {
          setDirection(1)
          return 0
        }

        return nextIndex
      })
    }, 300) // Change image every 300ms

    return () => clearInterval(interval)
  }, [isVisible, direction, loadingImages.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 text-center space-y-6 max-w-sm mx-4">
        {/* Loading Animation */}
        <div className="w-32 h-32 mx-auto relative">
          <Image
            src={loadingImages[currentImageIndex] || "/placeholder.svg"}
            alt="Loading"
            width={128}
            height={128}
            className="w-full h-full object-contain animate-pulse"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.onerror = null
              target.src = "/placeholder.svg?height=128&width=128"
            }}
          />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">{message}</h3>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
