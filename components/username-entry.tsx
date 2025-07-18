"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Gift, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { LoadingOverlay } from "./loading-overlay"
import { ImageWithFallback } from "./image-with-fallback"

interface RobloxUser {
  userId: number
  username: string
  displayName: string
  avatarUrl: string
}

interface UsernameEntryProps {
  selectedRewards: string[]
  onUserVerified: (userData: RobloxUser) => void
}

export const UsernameEntry = memo(function UsernameEntry({ selectedRewards, onUserVerified }: UsernameEntryProps) {
  const { t } = useLanguage()
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const rewards = [
    { id: "10t-sheckles", name: "10T Sheckles", image: "/images/50b-sheckles.png", type: "currency" },
    { id: "red-fox", name: "Red Fox", image: "/images/red-fox.png", type: "pet" },
    { id: "dragon-fly", name: "Dragon Fly", image: "/images/dragon-fly.png", type: "pet" },
    { id: "raccoon", name: "Raccoon", image: "/images/raccoon.png", type: "pet" },
    { id: "queen-bee", name: "Queen Bee", image: "/images/queen-bee-holo.png", type: "pet" },
    { id: "disco-bee", name: "Disco Bee", image: "https://i.postimg.cc/9f57wsmg/Disco-Bee-Icon-1.gif", type: "pet" },
    { id: "candy-blossom", name: "Candy Blossom", image: "https://i.postimg.cc/gjbGQxMy/IMG-6523.webp", type: "pet" },
    { id: "octopus", name: "Octopus", image: "https://i.postimg.cc/bvKPSGjX/IMG-6524.png", type: "pet" },
    { id: "fennec-fox", name: "Fennec Fox", image: "https://i.postimg.cc/4yLcKdyp/Fennec-Fox-Icon.webp", type: "pet" },
  ]

  const handleCheck = async () => {
    if (!username.trim()) return

    playClickSound()
    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch(`/api/roblox/user?username=${encodeURIComponent(username.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user data")
      }

      onUserVerified(data)
    } catch (err: any) {
      setError(err.message || "Failed to verify username")
    } finally {
      setIsChecking(false)
    }
  }

  const getSelectedRewards = () => {
    return selectedRewards.map((id) => rewards.find((r) => r.id === id)).filter(Boolean)
  }

  return (
    <>
      <LoadingOverlay isVisible={isChecking} message="Verifying username..." />

      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header Card */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <User className="w-8 h-8 text-blue-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.enterUsername}
              </h1>
              <User className="w-8 h-8 text-blue-500" />
            </div>

            <p className="text-gray-600 text-lg">{t.enterRobloxUsername}</p>
          </div>
        </Card>

        {/* Selected Rewards Display */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-purple-800 text-center flex items-center justify-center space-x-2">
              <Gift className="w-6 h-6" />
              <span>{t.yourSelectedReward}</span>
              <Gift className="w-6 h-6" />
            </h3>

            <div className="flex justify-center">
              {getSelectedRewards().map((reward) => (
                <div
                  key={reward?.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-purple-200 transform hover:scale-105 transition-all duration-300 max-w-xs"
                >
                  <div className="text-center space-y-2">
                    <div className={`mx-auto relative ${reward?.id === "queen-bee" ? "w-12 h-12 -mt-1" : "w-16 h-16"}`}>
                      <ImageWithFallback
                        src={reward?.image || ""}
                        alt={reward?.name || ""}
                        width={reward?.id === "queen-bee" ? 48 : 64}
                        height={reward?.id === "queen-bee" ? 48 : 64}
                        className="w-full h-full object-contain"
                        unoptimized={true}
                      />
                    </div>
                    <p className="font-semibold text-purple-700">{reward?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Username Input Card */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Your ROBLOX username 🎮"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError(null)
                  }}
                  className={`w-full py-6 px-8 rounded-2xl border-2 text-center text-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 border-gray-200`}
                  disabled={isChecking}
                />
              </div>

              {/* Check Button */}
              <Button
                onClick={handleCheck}
                disabled={!username.trim() || isChecking}
                className={`
                  w-full font-bold py-6 px-8 rounded-2xl text-xl transition-all duration-500 transform relative overflow-hidden group
                  ${
                    isChecking
                      ? "bg-gradient-to-r from-gray-400 to-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95"
                  }
                  text-white
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                  before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                `}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>{t.verifyUsername}</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </span>
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center">
                <Badge className="bg-red-100 text-red-800 px-4 py-2 text-lg flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </Badge>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
          <div className="text-center space-y-2">
            <h4 className="font-bold text-yellow-800 text-lg">🎉 {t.almostThere}</h4>
            <p className="text-yellow-700">{t.enterRobloxUsername}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Badge className="bg-yellow-200 text-yellow-800 px-3 py-1">
                {selectedRewards.length} {t.rewardsSelected}
              </Badge>
              <Badge className="bg-orange-200 text-orange-800 px-3 py-1">Pending Verification</Badge>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
})
