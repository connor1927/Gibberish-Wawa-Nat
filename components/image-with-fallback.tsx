"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  fallbackSrc?: string
  priority?: boolean
  unoptimized?: boolean
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackSrc,
  priority = false,
  unoptimized = false,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      if (fallbackSrc) {
        setImgSrc(fallbackSrc)
      } else {
        // Create a simple SVG fallback
        const svgFallback = `data:image/svg+xml;base64,${btoa(`
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" fill="#F0F9FF"/>
            <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 3}" fill="#3497F5"/>
            <text x="${width / 2}" y="${height / 2 + 5}" fontFamily="Arial, sans-serif" fontSize="12" fill="white" textAnchor="middle">${alt.substring(0, 8)}</text>
          </svg>
        `)}`
        setImgSrc(svgFallback)
      }
    }
  }

  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={priority}
      unoptimized={unoptimized}
      {...props}
    />
  )
}
