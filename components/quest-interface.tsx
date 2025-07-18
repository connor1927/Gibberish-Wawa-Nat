"use client"

import { useState, useEffect, memo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Clock,
  AlertTriangle,
  MapPin,
  Flower,
  TreePine,
  Sun,
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { ImageWithFallback } from "./image-with-fallback"

interface AdBlueOffer {
  url: string
  anchor: string
  conversion?: string
  id: string | number
  _clientCountry?: string
  _clientIp?: string
  _userId?: string
}

interface OffersResponse {
  offers?: AdBlueOffer[]
  country?: string
  totalAvailable?: number
  message?: string
  error?: string
  userId?: string
}

interface QuestInterfaceProps {
  onComplete: () => void
  requiredCompletions?: number
  userId?: number
  username?: string
  selectedRewards: string[]
}

// Enhanced reward mapping with rarity colors
const rewardMap = {
  "10t-sheckles": { name: "10T Sheckles", image: "/images/50b-sheckles.png", type: "currency" },
  "red-fox": { name: "Red Fox", image: "/images/red-fox.png", rarity: "mythical" },
  "dragon-fly": { name: "Dragon Fly", image: "/images/dragon-fly.png", rarity: "divine" },
  raccoon: { name: "Raccoon", image: "/images/raccoon.png", rarity: "divine" },
  "queen-bee": { name: "Queen Bee", image: "/images/queen-bee-holo.png", rarity: "divine" },
  "disco-bee": { name: "Disco Bee", image: "https://i.postimg.cc/9f57wsmg/Disco-Bee-Icon-1.gif", rarity: "divine" },
  "candy-blossom": { name: "Candy Blossom", image: "https://i.postimg.cc/gjbGQxMy/IMG-6523.webp", rarity: "mythical" },
  octopus: { name: "Octopus", image: "https://i.postimg.cc/bvKPSGjX/IMG-6524.png", rarity: "divine" },
  "fennec-fox": { name: "Fennec Fox", image: "https://i.postimg.cc/4yLcKdyp/Fennec-Fox-Icon.webp", rarity: "mythical" },
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

// Memoized components for performance
const RewardCard = memo(({ rewardId }: { rewardId: string }) => {
  const reward = rewardMap[rewardId as keyof typeof rewardMap]
  if (!reward) return null

  return (
    <div className="relative group">
      {/* Lego-style base */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg transform rotate-1 group-hover:rotate-2 transition-transform duration-300" />
      <div className="absolute inset-1 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg" />

      {/* Lego studs */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-300 rounded-full shadow-inner" />
      <div className="absolute top-1 left-1/4 w-2 h-2 bg-amber-300 rounded-full shadow-inner" />
      <div className="absolute top-1 right-1/4 w-2 h-2 bg-amber-300 rounded-full shadow-inner" />

      {/* Main content */}
      <div
        className={`relative bg-gradient-to-br ${getRarityColor(reward.rarity, rewardId)} p-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-amber-400`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3">
          <div
            className={`relative ${rewardId === "queen-bee" || rewardId === "disco-bee" ? "w-8 h-8 -mt-1" : "w-10 h-10"}`}
          >
            <ImageWithFallback
              src={reward.image || "/placeholder.svg"}
              alt={reward.name}
              width={rewardId === "queen-bee" || rewardId === "disco-bee" ? 32 : 40}
              height={rewardId === "queen-bee" || rewardId === "disco-bee" ? 32 : 40}
              className="w-full h-full object-contain"
              unoptimized={true}
            />
          </div>
          <div className="flex-1">
            <span className="text-gray-800 font-bold text-sm">{reward.name}</span>
          </div>
        </div>

        {/* Sparkle effects */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-75" />
      </div>
    </div>
  )
})

RewardCard.displayName = "RewardCard"

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

export const QuestInterface = memo(function QuestInterface({
  onComplete,
  requiredCompletions = 2,
  userId,
  username,
  selectedRewards,
}: QuestInterfaceProps) {
  const { t } = useLanguage()
  const [offers, setOffers] = useState<AdBlueOffer[]>([])
  const [completedOffers, setCompletedOffers] = useState<Set<string | number>>(new Set())
  const [pendingOffers, setPendingOffers] = useState<Set<string | number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCheckingLeads, setIsCheckingLeads] = useState(false)
  const [country, setCountry] = useState<string>("")
  const [totalAvailable, setTotalAvailable] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Use refs to prevent continuous refreshing
  const fetchOffersRef = useRef<() => Promise<void>>()
  const checkLeadsRef = useRef<() => Promise<void>>()
  const intervalRef = useRef<NodeJS.Timeout>()

  const fetchOffers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = userId ? `/api/adblue/offers?userId=${userId}` : "/api/adblue/offers"
      const response = await fetch(url)
      const data: OffersResponse = await response.json()

      if (response.ok) {
        setOffers(data.offers || [])
        setCountry(data.country || "")
        setTotalAvailable(data.totalAvailable || 0)

        console.log(`🎯 Loaded ${data.offers?.length || 0} offers for country: ${data.country}`)

        if (data.offers && data.offers.length === 0) {
          setError(data.message || t.noQuests || "No quests available at this time.")
        }
      } else {
        setError(data.error || "Failed to fetch offers")
        setCountry(data.country || "")
      }
    } catch (error) {
      console.error("Error fetching offers:", error)
      setError("Network error while fetching offers")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [userId, t.noQuests])

  const checkLeads = useCallback(async () => {
    if (isCheckingLeads) return // Prevent multiple simultaneous checks

    setIsCheckingLeads(true)
    try {
      const response = await fetch("/api/adblue/check-leads")
      if (response.ok) {
        const leads = await response.json()

        const newCompletedOffers = new Set(completedOffers)
        leads.forEach((lead: any) => {
          if (lead.offer_id) {
            newCompletedOffers.add(lead.offer_id)
            setPendingOffers((prev) => {
              const updated = new Set(prev)
              updated.delete(lead.offer_id)
              return updated
            })
          }
        })

        setCompletedOffers(newCompletedOffers)

        if (newCompletedOffers.size >= requiredCompletions) {
          setTimeout(() => {
            onComplete()
          }, 1000)
        }
      }
    } catch (error) {
      console.error("Error checking leads:", error)
    } finally {
      setIsCheckingLeads(false)
    }
  }, [completedOffers, requiredCompletions, onComplete, isCheckingLeads])

  // Store refs
  fetchOffersRef.current = fetchOffers
  checkLeadsRef.current = checkLeads

  useEffect(() => {
    // Initial load
    fetchOffersRef.current?.()

    // Set up interval for checking leads (but not fetching offers)
    intervalRef.current = setInterval(() => {
      checkLeadsRef.current?.()
    }, 15000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleOfferClick = useCallback((offer: AdBlueOffer) => {
    playClickSound()
    setPendingOffers((prev) => new Set(prev).add(offer.id))
    window.open(offer.url, "_blank")
    setTimeout(() => {
      checkLeadsRef.current?.()
    }, 5000)
  }, [])

  const handleRefresh = useCallback(() => {
    playClickSound()
    setIsRefreshing(true)
    fetchOffersRef.current?.()
  }, [])

  const getOfferStatus = useCallback(
    (offerId: string | number) => {
      if (completedOffers.has(offerId)) return "completed"
      if (pendingOffers.has(offerId)) return "pending"
      return "available"
    },
    [completedOffers, pendingOffers],
  )

  const getCountryFlag = useCallback((countryCode: string) => {
    const flags: { [key: string]: string } = {
      US: "🇺🇸",
      GB: "🇬🇧",
      CA: "🇨🇦",
      AU: "🇦🇺",
      DE: "🇩🇪",
      FR: "🇫🇷",
      IT: "🇮🇹",
      ES: "🇪🇸",
      BR: "🇧🇷",
      MX: "🇲🇽",
      IN: "🇮🇳",
      JP: "🇯🇵",
      KR: "🇰🇷",
      CN: "🇨🇳",
      RU: "🇷🇺",
      TR: "🇹🇷",
      SA: "🇸🇦",
      AE: "🇦🇪",
      EG: "🇪🇬",
      ZA: "🇿🇦",
      PT: "🇵🇹",
      NL: "🇳🇱",
      PL: "🇵🇱",
      SE: "🇸🇪",
      VN: "🇻🇳",
      TH: "🇹🇭",
      ID: "🇮🇩",
      MY: "🇲🇾",
    }
    return flags[countryCode] || "🌍"
  }, [])

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Lego-style loading container */}
        <div className="relative">
          {/* Dirt base layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600 to-amber-900 rounded-3xl transform rotate-1" />
          <div className="absolute inset-2 bg-gradient-to-b from-amber-500 to-amber-800 rounded-3xl" />

          <Card className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 border-4 border-amber-500 shadow-2xl rounded-3xl p-8">
            {/* Lego studs decoration */}
            <div className="absolute top-4 left-8 w-6 h-6 bg-amber-400 rounded-full shadow-lg" />
            <div className="absolute top-4 right-8 w-6 h-6 bg-amber-400 rounded-full shadow-lg" />
            <div className="absolute bottom-4 left-1/4 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />
            <div className="absolute bottom-4 right-1/4 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />

            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative">
                <div className="w-12 h-12 bg-white rounded-md animate-pulse" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-spin" />
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-800">{t.loading}</p>
                <div className="flex justify-center items-center space-x-3">
                  <MapPin className="w-6 h-6 animate-pulse text-blue-500" />
                  <span className="text-gray-600 font-medium">{t.loadingQuests || "Loading quests..."}</span>
                </div>
              </div>

              {/* Garden decorations */}
              <div className="flex justify-center space-x-4 opacity-60">
                <Flower className="w-8 h-8 text-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <TreePine className="w-8 h-8 text-green-500 animate-bounce" style={{ animationDelay: "200ms" }} />
                <Sun className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Selected Rewards Display - Garden Style */}
      <div className="relative">
        {/* Rainbow background layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-indigo-400 to-purple-400 rounded-3xl transform rotate-1 opacity-20" />
        <div className="absolute inset-1 bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 to-red-300 rounded-3xl opacity-15" />

        {/* Dirt base */}
        <div className="absolute inset-2 bg-gradient-to-b from-amber-600 to-amber-900 rounded-3xl" />
        <div className="absolute inset-3 bg-gradient-to-b from-amber-500 to-amber-800 rounded-3xl" />

        <Card className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border-4 border-amber-500 shadow-2xl rounded-3xl p-6">
          {/* Lego studs around the border */}
          <div className="absolute top-2 left-8 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />
          <div className="absolute top-2 right-8 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />
          <div className="absolute bottom-2 left-12 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />
          <div className="absolute bottom-2 right-12 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />
          <div className="absolute top-1/2 left-2 w-3 h-3 bg-amber-400 rounded-full shadow-lg" />
          <div className="absolute top-1/2 right-2 w-3 h-3 bg-amber-400 rounded-full shadow-lg" />

          {/* Garden decorations */}
          <div className="absolute top-4 left-1/4 opacity-30">
            <Flower className="w-6 h-6 text-pink-500 animate-pulse" />
          </div>
          <div className="absolute top-4 right-1/4 opacity-30">
            <TreePine className="w-6 h-6 text-green-600 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-1/3 opacity-30">
            <Sun className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center space-x-3">
              <Sparkles className="w-7 h-7 text-yellow-500 animate-spin" />
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Grow a Garden Reward
              </span>
              <Sparkles className="w-7 h-7 text-yellow-500 animate-spin" />
            </h3>

            <div className="flex justify-center">
              {selectedRewards.map((rewardId) => (
                <RewardCard key={rewardId} rewardId={rewardId} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Quest Interface - Enhanced Garden Style */}
      <div className="relative">
        {/* Multi-layer dirt base */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-700 to-amber-900 rounded-3xl transform rotate-1" />
        <div className="absolute inset-1 bg-gradient-to-b from-amber-600 to-amber-800 rounded-3xl transform -rotate-1" />
        <div className="absolute inset-2 bg-gradient-to-b from-amber-500 to-amber-700 rounded-3xl" />

        <Card className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 border-4 border-amber-600 shadow-2xl rounded-3xl p-8">
          {/* Enhanced Lego studs pattern */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-lg"
              style={{
                top: `${10 + (i % 4) * 20}%`,
                left: `${5 + Math.floor(i / 4) * 30}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}

          {/* Floating garden elements */}
          <div className="absolute top-6 left-6 opacity-40 animate-float">
            <Flower className="w-8 h-8 text-pink-500" />
          </div>
          <div className="absolute top-6 right-6 opacity-40 animate-float" style={{ animationDelay: "1s" }}>
            <TreePine className="w-8 h-8 text-green-600" />
          </div>
          <div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-40 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <Sun className="w-8 h-8 text-yellow-500" />
          </div>

          <div className="relative z-10 text-center space-y-6">
            {/* Header with rainbow effect */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                {t.completeAtleastQuests}
              </h1>

              {username && (
                <p className="text-xl text-gray-700 font-semibold">
                  Welcome to the Garden, <span className="text-green-600">{username}</span>! 🌱
                </p>
              )}

              {/* Enhanced status badges with country display */}
              <div className="flex justify-center items-center space-x-4 flex-wrap gap-2">
                {country && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-2 border-blue-300 px-4 py-2 text-lg font-bold shadow-lg">
                    <span className="text-xl mr-2">{getCountryFlag(country)}</span>
                    {country} Offers
                  </Badge>
                )}
                {totalAvailable > 0 && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-2 border-green-300 px-4 py-2 text-lg font-bold shadow-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {totalAvailable} {t.offersAvailable}
                  </Badge>
                )}
              </div>

              {/* Progress status */}
              <div className="flex items-center justify-center space-x-3 mt-4">
                {completedOffers.size >= requiredCompletions ? (
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg border-2 border-green-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-bold text-lg">{t.readyToClaimPrize}</span>
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg border-2 border-cyan-300">
                    <span className="font-bold text-lg">
                      {t.completeMoreQuestsPrize
                        ? t.completeMoreQuestsPrize.replace(
                            "{count}",
                            String(requiredCompletions - completedOffers.size),
                          )
                        : `Complete ${requiredCompletions - completedOffers.size} more quests to claim your prize!`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* HOLOGRAPHIC NOTE */}
            <div className="holographic-glow mx-auto max-w-md">
              <p className="holographic-text text-lg font-bold text-center">{t.privateServerNote}</p>
            </div>

            {/* Error Message with garden styling */}
            {error && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-400 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Enhanced Offer Buttons */}
            <div className="space-y-4">
              {offers.length === 0 && !error ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 border-2 border-gray-300">
                    <p className="text-gray-600 text-lg font-semibold">
                      No offers available for {country} at this time.
                    </p>
                    <p className="text-gray-500 mt-2">{t.tryRefreshing}</p>
                    <div className="flex justify-center space-x-2 mt-4 opacity-50">
                      <Flower className="w-6 h-6 text-pink-400" />
                      <TreePine className="w-6 h-6 text-green-500" />
                      <Sun className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </div>
              ) : (
                offers.map((offer, index) => {
                  const status = getOfferStatus(offer.id)
                  const rainbowColors = [
                    "from-red-500 to-pink-500",
                    "from-orange-500 to-yellow-500",
                    "from-green-500 to-emerald-500",
                    "from-blue-500 to-cyan-500",
                    "from-indigo-500 to-purple-500",
                    "from-purple-500 to-pink-500",
                  ]
                  const colorClass = rainbowColors[index % rainbowColors.length]

                  return (
                    <div key={offer.id} className="relative">
                      {/* Lego-style button base */}
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-600 to-amber-800 rounded-2xl transform rotate-1" />
                      <div className="absolute inset-1 bg-gradient-to-b from-amber-500 to-amber-700 rounded-2xl" />

                      <Button
                        onClick={() => handleOfferClick(offer)}
                        disabled={status === "completed"}
                        className={`
                          relative w-full font-bold py-6 px-8 rounded-2xl text-lg leading-tight h-auto transition-all duration-300 transform overflow-hidden group border-4 border-amber-400
                          ${
                            status === "completed"
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-default shadow-lg"
                              : status === "pending"
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:scale-105"
                                : `bg-gradient-to-r ${colorClass} hover:shadow-2xl text-white hover:scale-105 active:scale-95 shadow-lg`
                          }
                        `}
                      >
                        {/* Lego studs on button */}
                        <div className="absolute top-2 left-4 w-2 h-2 bg-white/30 rounded-full" />
                        <div className="absolute top-2 right-4 w-2 h-2 bg-white/30 rounded-full" />

                        <span className="relative z-10 flex items-center justify-between w-full">
                          <span className="flex-1 text-left">{offer.anchor}</span>
                          <div className="flex items-center space-x-2">
                            {status === "completed" ? (
                              <>
                                <CheckCircle className="w-6 h-6" />
                                <span className="text-sm font-bold">DONE!</span>
                              </>
                            ) : status === "pending" ? (
                              <>
                                <Clock className="w-5 h-5 animate-pulse" />
                                <span className="text-sm">{t.awaiting}</span>
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-5 h-5" />
                                <Sparkles className="w-4 h-4 animate-pulse" />
                              </>
                            )}
                          </div>
                        </span>

                        {/* Rainbow shimmer effect */}
                        {status === "available" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        )}
                      </Button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-green-600 to-green-800 rounded-2xl transform rotate-1" />
                <Button
                  onClick={() => {
                    playClickSound()
                    checkLeadsRef.current?.()
                  }}
                  disabled={isCheckingLeads}
                  className="relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 active:scale-95 border-4 border-green-400 shadow-xl"
                >
                  {isCheckingLeads ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>{t.checkingCompletions}</span>
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>{t.checkCompletions}</span>
                      <Flower className="w-5 h-5 animate-bounce" />
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-2xl transform -rotate-1" />
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="relative w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 active:scale-95 border-4 border-gray-500 shadow-xl"
                >
                  <RefreshCw className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>
                    {t.refreshQuests || "Refresh Quests"} {country && `(${country})`}
                  </span>
                  <TreePine className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Server Link Button (Always Disabled) */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl transform rotate-1 opacity-50" />
              <Button
                disabled={true}
                className="relative w-full bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 cursor-not-allowed border-4 border-gray-400 shadow-xl opacity-60"
              >
                <span className="text-2xl">🔒</span>
                <span>Server Link (complete to unlock)</span>
                <span className="text-2xl">🔒</span>
              </Button>
            </div>

            {/* Enhanced Progress Badges */}
            <div className="flex justify-center space-x-4 flex-wrap gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-lg font-bold border-2 border-blue-300 shadow-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                {completedOffers.size}/{requiredCompletions} {t.completed}
              </Badge>

              {pendingOffers.size > 0 && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-lg font-bold border-2 border-yellow-300 shadow-lg">
                  <Clock className="w-5 h-5 mr-2 animate-pulse" />
                  {pendingOffers.size} {t.awaiting}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
})
