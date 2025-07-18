"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n/language-context"
import { ImageWithFallback } from "./image-with-fallback"

interface RobloxUser {
  userId: number
  username: string
  displayName: string
  avatarUrl: string
}

interface UserVerificationProps {
  user: RobloxUser
  onConfirm: () => void
  onDeny: () => void
}

export const UserVerification = memo(function UserVerification({ user, onConfirm, onDeny }: UserVerificationProps) {
  const { t } = useLanguage()

  const playClickSound = () => {
    try {
      // Create audio context on user interaction (required by many browsers)
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext()

      // Use both approaches for better compatibility
      // Method 1: HTML Audio element with fallbacks
      const audio = new Audio()
      audio.volume = 0.3

      // Try multiple sources for better compatibility
      const sources = [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-234708-xQErOrgau1o0PzqKaZ1qG4utusJIVK.mp3",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-234708-xQErOrgau1o0PzqKaZ1qG4utusJIVK.mp3", // Direct blob URL as fallback
      ]

      // Try each source until one works
      const trySource = (index: number) => {
        if (index >= sources.length) {
          console.warn("Could not play click sound: all sources failed")
          return
        }

        audio.src = sources[index]
        audio.oncanplaythrough = () => {
          audio.play().catch((err) => {
            console.warn("Could not play click sound:", err)
            trySource(index + 1)
          })
        }
        audio.onerror = () => trySource(index + 1)
      }

      trySource(0)

      // Method 2: Fetch and decode for browsers that support it
      fetch("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-234708-xQErOrgau1o0PzqKaZ1qG4utusJIVK.mp3")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          const source = audioContext.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContext.destination)
          source.start(0)
        })
        .catch((err) => console.warn("Alternative audio method failed:", err))
    } catch (error) {
      console.warn("Could not play click sound:", error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8">
      <div className="text-center space-y-6">
        {/* Roblox Logo - Properly positioned and sized */}
        <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden shadow-lg bg-black flex items-center justify-center p-2">
          <ImageWithFallback
            src="https://sjc.microlink.io/4dkGP7Vz-jeW6enho9Npcmm5LosyM1LNFCBFruT1dRXEPd1FSMWYTpwbr1Qs0elIfmc-IwuBHaKSmP_FL3ipuw.jpeg"
            alt="Roblox Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            unoptimized={true}
            fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMDAwMDAwIi8+CjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRkZGRkZGIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSAzMiAzMikiLz4KPHJlY3QgeD0iMjgiIHk9IjI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo="
          />
        </div>

        {/* Question */}
        <h1 className="text-3xl font-bold text-gray-800">{t.isThisYou}</h1>

        {/* User Profile Card */}
        <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
            <ImageWithFallback
              src={user.avatarUrl || "/placeholder.svg"}
              alt={user.displayName || user.username}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{user.displayName || user.username}</h2>
            <p className="text-gray-600 text-lg">@{user.username}</p>
            <p className="text-sm text-gray-500">User ID: {user.userId}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={() => {
              playClickSound()
              onDeny()
            }}
            className="flex-1 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-600 font-semibold py-4 px-6 rounded-2xl border-2 border-red-200 hover:border-red-300 transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10">{t.no}</span>
          </Button>
          <Button
            onClick={() => {
              playClickSound()
              onConfirm()
            }}
            className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-green-500/50 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>{t.yes}</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  )
})
