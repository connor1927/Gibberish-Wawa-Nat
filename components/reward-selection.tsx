"use client"

import { useState, memo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { LoadingOverlay } from "./loading-overlay"
import { ImageWithFallback } from "./image-with-fallback"
import { useSearchParams } from "next/navigation"

interface RewardSelectionProps {
  onRewardsSelected: (rewards: string[]) => void
}

interface Reward {
  id: string
  name: string
  image: string
  type: "currency" | "pet"
  rarity: "common" | "rare" | "legendary" | "mythical" | "divine"
}

export const RewardSelection = memo(function RewardSelection({ onRewardsSelected }: RewardSelectionProps) {
  const { t } = useLanguage()
  const [selectedRewards, setSelectedRewards] = useState<string[]>([])
  const [clickedReward, setClickedReward] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const maxSelections = 1
  const searchParams = useSearchParams()

  const rewards: Reward[] = [
    {
      id: "10t-sheckles",
      name: "10T Sheckles",
      image: "/images/50b-sheckles.png",
      type: "currency",
      rarity: "legendary",
    },
    { id: "red-fox", name: "Red Fox", image: "/images/red-fox.png", type: "pet", rarity: "mythical" },
    { id: "dragon-fly", name: "Dragon Fly", image: "/images/dragon-fly.png", type: "pet", rarity: "divine" },
    { id: "raccoon", name: "Raccoon", image: "/images/raccoon.png", type: "pet", rarity: "divine" },
    { id: "queen-bee", name: "Queen Bee", image: "/images/queen-bee-holo.png", type: "pet", rarity: "divine" },
    {
      id: "disco-bee",
      name: "Disco Bee",
      image: "https://i.postimg.cc/9f57wsmg/Disco-Bee-Icon-1.gif",
      type: "pet",
      rarity: "divine",
    },
    {
      id: "candy-blossom",
      name: "Candy Blossom",
      image: "https://i.postimg.cc/gjbGQxMy/IMG-6523.webp",
      type: "pet",
      rarity: "mythical",
    },
    {
      id: "octopus",
      name: "Octopus",
      image: "https://i.postimg.cc/bvKPSGjX/IMG-6524.png",
      type: "pet",
      rarity: "divine",
    },
    {
      id: "fennec-fox",
      name: "Fennec Fox",
      image: "https://i.postimg.cc/4yLcKdyp/Fennec-Fox-Icon.webp",
      type: "pet",
      rarity: "mythical",
    },
  ]

  // Handle URL parameters for automatic reward selection
  useEffect(() => {
    const prizeParam = searchParams.get("prize")
    if (prizeParam) {
      const prizeNumber = Number.parseInt(prizeParam)
      if (!isNaN(prizeNumber) && prizeNumber >= 1 && prizeNumber <= rewards.length) {
        // Map prize parameter to reward index (1-based to 0-based)
        const rewardIndex = prizeNumber - 1
        const rewardId = rewards[rewardIndex]?.id

        if (rewardId) {
          console.log(`Auto-selecting reward from URL parameter: prize=${prizeParam}, reward=${rewardId}`)
          setSelectedRewards([rewardId])

          // Optional: Auto-continue after a short delay
          // setTimeout(() => {
          //   if (rewardId) handleContinue()
          // }, 1500)
        }
      }
    }
  }, [searchParams, rewards])

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

  const handleRewardToggle = (rewardId: string) => {
    playClickSound()
    setClickedReward(rewardId)

    setTimeout(() => {
      setSelectedRewards((prev) => {
        if (prev.includes(rewardId)) {
          return prev.filter((id) => id !== rewardId)
        } else if (prev.length < maxSelections) {
          return [...prev, rewardId]
        }
        return prev
      })
      setClickedReward(null)
    }, 200)
  }

  const handleContinue = async () => {
    if (selectedRewards.length > 0) {
      playClickSound()
      setIsLoading(true)

      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsLoading(false)
      onRewardsSelected(selectedRewards)
    }
  }

  const removeReward = (rewardId: string) => {
    setSelectedRewards((prev) => prev.filter((id) => id !== rewardId))
  }

  const getRarityColor = (rarity: string, rewardId?: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600"
      case "rare":
        return "from-blue-400 to-purple-600"
      case "legendary":
        return "from-yellow-400 to-orange-600"
      case "mythical":
        return "from-purple-500 to-pink-600"
      case "divine":
        if (rewardId === "raccoon") {
          return "from-gray-600 to-gray-800"
        }
        if (rewardId === "queen-bee") {
          return "from-yellow-300 via-yellow-400 to-amber-500"
        }
        return "from-cyan-400 to-blue-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRarityBorder = (rarity: string, rewardId?: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300"
      case "rare":
        return "border-blue-400"
      case "legendary":
        return "border-yellow-400"
      case "mythical":
        return "border-purple-500"
      case "divine":
        if (rewardId === "raccoon") {
          return "border-gray-600"
        }
        if (rewardId === "queen-bee") {
          return "border-yellow-400"
        }
        return "border-cyan-400"
      default:
        return "border-gray-300"
    }
  }

  const getSelectedRewards = () => {
    return selectedRewards.map((rewardId) => rewards.find((r) => r.id === rewardId)).filter(Boolean) as Reward[]
  }

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Preparing your rewards..." />

      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header Card with Circular Logo */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-8 transform hover:scale-105 transition-all duration-300 relative">
          {/* Circular Animated Logo */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
              <ImageWithFallback
                src="https://i.postimg.cc/c431tCvZ/a-7b4dcbf8ecfe42950fa4412bdb3b6bd5.gif"
                alt="Garden Logo"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized={true}
                priority={true}
                fallbackSrc="https://i.postimg.cc/y84Wg4X5/Ga-G-Celebrate.png"
              />
            </div>
          </div>

          <div className="text-center space-y-4 pt-8">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.chooseRewards}
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-lg font-semibold">
                {selectedRewards.length}/{maxSelections} {t.rewardsSelected}
              </Badge>
              {selectedRewards.length > 0 && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-lg font-semibold animate-pulse">
                  {t.readyToContinue}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => {
            const isSelected = selectedRewards.includes(reward.id)
            const isDisabled = !isSelected && selectedRewards.length >= maxSelections
            const isClicked = clickedReward === reward.id

            return (
              <Card
                key={reward.id}
                className={`
                  relative overflow-hidden cursor-pointer transition-all duration-500 border-4 group
                  ${isSelected ? `${getRarityBorder(reward.rarity, reward.id)} bg-gradient-to-br from-white to-green-50 shadow-2xl` : "border-white/50 bg-white/80"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/25"}
                  ${isClicked ? "scale-125 shadow-3xl" : ""}
                  backdrop-blur-xl shadow-xl rounded-2xl p-6
                  transform hover:rotate-1 hover:-translate-y-4
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                  before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                `}
                onClick={() => !isDisabled && handleRewardToggle(reward.id)}
              >
                {/* Magical glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${isSelected ? "bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 animate-pulse" : ""}`}
                />

                {/* Rarity Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(reward.rarity, reward.id)} opacity-10 rounded-2xl transition-all duration-500 group-hover:opacity-20`}
                />

                {/* Selection Indicator with bounce */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Check className="w-5 h-5 text-white" />
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                )}

                <div className="text-center space-y-4 relative z-10">
                  {/* Reward Image with enhanced effects */}
                  <div
                    className={`mx-auto relative group-hover:scale-110 transition-all duration-500 mb-4 ${
                      reward.id === "queen-bee"
                        ? "w-16 h-16 -mt-2 transform rotate-12" // Add rotation to make it float away
                        : reward.id === "disco-bee"
                          ? "w-16 h-16 -mt-2" // Same size as queen bee
                          : "w-20 h-20"
                    }`}
                  >
                    <ImageWithFallback
                      src={reward.image || "/placeholder.svg"}
                      alt={reward.name}
                      width={reward.id === "queen-bee" ? 64 : 80}
                      height={reward.id === "queen-bee" ? 64 : 80}
                      className={`w-full h-full object-contain transition-all duration-500 ${isClicked ? "scale-150 rotate-12" : ""} ${isSelected ? "drop-shadow-2xl" : ""}`}
                      unoptimized={true}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full animate-pulse" />
                    )}
                    {/* Sparkle effect on hover */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping" />
                    <div
                      className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-ping"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>

                  {/* Reward Name with gradient text */}
                  <div>
                    <p
                      className={`font-bold text-lg transition-all duration-300 ${isSelected ? "text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text" : "text-gray-700 group-hover:text-purple-700"}`}
                    >
                      {reward.name}
                    </p>

                    {/* Rarity Badge */}
                    {reward.type === "pet" && (
                      <div
                        className={`inline-block px-2 py-1 rounded-md text-xs font-bold uppercase mt-1 ${
                          reward.rarity === "divine" && reward.id === "queen-bee"
                            ? "bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-yellow-900 shadow-lg animate-pulse"
                            : reward.rarity === "divine" && reward.id === "raccoon"
                              ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                              : reward.rarity === "divine"
                                ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                                : reward.rarity === "mythical"
                                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                                  : reward.rarity === "legendary"
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-600 text-white"
                                    : reward.rarity === "rare"
                                      ? "bg-gradient-to-r from-blue-400 to-purple-600 text-white"
                                      : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {reward.rarity}
                      </div>
                    )}

                    {/* Currency Badge */}
                    {reward.type === "currency" && (
                      <div className="inline-block px-2 py-1 rounded-md text-xs font-bold uppercase mt-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        Currency
                      </div>
                    )}
                  </div>

                  {/* Enhanced click effect */}
                  {isClicked && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 to-purple-400/40 rounded-2xl animate-ping" />
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-pink-400/30 rounded-2xl animate-pulse" />
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Selected Rewards Summary */}
        {selectedRewards.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-green-800 text-center flex items-center justify-center space-x-2">
                <Sparkles className="w-6 h-6" />
                <span>{t.selectedReward}</span>
                <Sparkles className="w-6 h-6" />
              </h3>

              <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                {getSelectedRewards().map((reward) => (
                  <div
                    key={reward?.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-purple-200 transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-center space-y-2">
                      <div
                        className={`mx-auto relative ${reward?.id === "queen-bee" ? "w-12 h-12 -mt-1" : "w-16 h-16"}`}
                      >
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
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={selectedRewards.length === 0 || isLoading}
            className={`
              px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-500 transform relative overflow-hidden group
              ${
                selectedRewards.length > 0 && !isLoading
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white hover:scale-110 hover:shadow-3xl hover:shadow-green-500/50 active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
              before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
            `}
          >
            {selectedRewards.length > 0 ? (
              <span className="flex items-center space-x-3 relative z-10">
                <span>{t.continueToUsername}</span>
                <Sparkles className="w-6 h-6 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              </span>
            ) : (
              t.selectRewards
            )}
          </Button>
        </div>
      </div>
    </>
  )
})
