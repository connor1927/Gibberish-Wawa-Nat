import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface AdBlueOffer {
  url: string
  anchor: string
  conversion?: string
  id?: string | number
}

const ADBLUE_USER_ID = "757163"
const ADBLUE_API_KEY = "cf636878ed1c4c3c0778b72943652cdf"

// Enhanced country detection with multiple methods
async function detectUserCountry(request: NextRequest): Promise<string> {
  console.log("🌍 Starting enhanced country detection...")

  // Method 1: Vercel Edge headers (most reliable in production)
  const vercelCountry = request.headers.get("x-vercel-ip-country")
  if (vercelCountry && vercelCountry !== "unknown" && vercelCountry.length === 2) {
    console.log("✅ Country from Vercel Edge:", vercelCountry.toUpperCase())
    return vercelCountry.toUpperCase()
  }

  // Method 2: Cloudflare headers
  const cloudflareCountry = request.headers.get("cf-ipcountry")
  if (cloudflareCountry && cloudflareCountry !== "XX" && cloudflareCountry.length === 2) {
    console.log("✅ Country from Cloudflare:", cloudflareCountry.toUpperCase())
    return cloudflareCountry.toUpperCase()
  }

  // Method 3: Get client IP and use geolocation service
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.ip ||
    ""

  console.log("🔍 Detected client IP:", clientIp)

  // Only try IP geolocation for real IPs
  if (clientIp && !isLocalIP(clientIp)) {
    try {
      console.log("🌐 Attempting IP geolocation for:", clientIp)

      // Try ipapi.co first
      const ipApiResponse = await fetch(`https://ipapi.co/${clientIp}/country_code/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GeoDetector/1.0)",
        },
        signal: AbortSignal.timeout(3000),
      })

      if (ipApiResponse.ok) {
        const country = await ipApiResponse.text()
        if (country && country.length === 2 && country !== "XX") {
          console.log("✅ Country from ipapi.co:", country.toUpperCase())
          return country.toUpperCase()
        }
      }
    } catch (error) {
      console.warn("⚠️ IP geolocation failed:", error)
    }
  }

  // Method 4: Parse Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    const languages = acceptLanguage.split(",")
    for (const lang of languages) {
      const parts = lang.trim().split("-")
      if (parts.length === 2) {
        const countryCode = parts[1].toUpperCase()
        if (countryCode.length === 2) {
          console.log("✅ Country from Accept-Language:", countryCode)
          return countryCode
        }
      }
    }
  }

  // Ultimate fallback
  console.log("⚠️ Using fallback country: US")
  return "US"
}

function isLocalIP(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip === "localhost"
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || `user_${Date.now()}`

  // Get client information
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.ip || ""
  const userAgent = request.headers.get("user-agent") || ""

  console.log("🚀 Starting country-specific offer fetch...")
  console.log("📊 Request details:", {
    userId,
    clientIp: clientIp || "unknown",
    userAgent: userAgent.substring(0, 50) + "...",
  })

  try {
    // Detect user's country FIRST
    const detectedCountry = await detectUserCountry(request)
    console.log(`🎯 Final detected country: ${detectedCountry}`)

    // Build country-specific AdBlueMedia URL
    const cacheBuster = Date.now()
    let offerUrl = `https://d3o07fqjkwc0s0.cloudfront.net/public/offers/feed.php`

    // Add required parameters
    const params = new URLSearchParams({
      user_id: ADBLUE_USER_ID,
      api_key: ADBLUE_API_KEY,
      s1: userId,
      s2: detectedCountry, // This is crucial for country targeting
      callback: "jsonpCallback",
      t: cacheBuster.toString(),
      country: detectedCountry,
      geo: detectedCountry,
      country_code: detectedCountry,
    })

    // Add IP for better geo-targeting if available
    if (clientIp && !isLocalIP(clientIp)) {
      params.append("ip", clientIp)
    }

    // Add user agent for device targeting
    if (userAgent) {
      params.append("user_agent", userAgent)
    }

    offerUrl += `?${params.toString()}`

    console.log("📡 Country-specific AdBlueMedia URL:", offerUrl.replace(ADBLUE_API_KEY, "***"))

    const response = await fetch(offerUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": userAgent || "Mozilla/5.0 (compatible; RewardsBot/1.0)",
        "X-Forwarded-For": clientIp,
        "CF-IPCountry": detectedCountry,
        "X-Country-Code": detectedCountry,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("❌ AdBlueMedia API error:", response.status)
      return NextResponse.json(
        {
          error: "Failed to fetch offers from AdBlueMedia",
          offers: [],
          country: detectedCountry,
          userId: userId,
        },
        { status: response.status },
      )
    }

    // Get the JSONP response
    const jsonpText = await response.text()
    console.log("📥 Raw JSONP response length:", jsonpText.length)

    let offers: AdBlueOffer[] = []
    try {
      // Extract JSON from JSONP callback
      const jsonStart = jsonpText.indexOf("(")
      const jsonEnd = jsonpText.lastIndexOf(")")

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = jsonpText.substring(jsonStart + 1, jsonEnd)
        const parsedOffers = JSON.parse(jsonString)

        if (Array.isArray(parsedOffers)) {
          offers = parsedOffers
        } else if (parsedOffers?.offers && Array.isArray(parsedOffers.offers)) {
          offers = parsedOffers.offers
        }

        console.log(`✅ Successfully parsed ${offers.length} offers for ${detectedCountry}`)
      } else {
        console.warn("⚠️ Could not extract JSON from JSONP response")
        offers = []
      }
    } catch (parseError) {
      console.error("💥 Error parsing JSONP response:", parseError)
      offers = []
    }

    // If no offers for this country, try fallback countries
    if (offers.length === 0) {
      console.log(`⚠️ No offers for ${detectedCountry}, trying fallback countries...`)

      const fallbackCountries = ["US", "GB", "CA", "AU", "DE", "FR"]
      for (const fallbackCountry of fallbackCountries) {
        if (fallbackCountry !== detectedCountry) {
          console.log(`🔄 Trying fallback: ${fallbackCountry}`)

          const fallbackParams = new URLSearchParams({
            user_id: ADBLUE_USER_ID,
            api_key: ADBLUE_API_KEY,
            s1: userId,
            s2: fallbackCountry,
            callback: "jsonpCallback",
            country: fallbackCountry,
            geo: fallbackCountry,
            t: Date.now().toString(),
          })

          const fallbackUrl = `https://d3o07fqjkwc0s0.cloudfront.net/public/offers/feed.php?${fallbackParams.toString()}`

          try {
            const fallbackResponse = await fetch(fallbackUrl, {
              method: "GET",
              headers: {
                Accept: "*/*",
                "User-Agent": userAgent || "Mozilla/5.0 (compatible; RewardsBot/1.0)",
                "Cache-Control": "no-cache",
              },
              cache: "no-store",
            })

            if (fallbackResponse.ok) {
              const fallbackJsonpText = await fallbackResponse.text()
              const fallbackJsonStart = fallbackJsonpText.indexOf("(")
              const fallbackJsonEnd = fallbackJsonpText.lastIndexOf(")")

              if (fallbackJsonStart !== -1 && fallbackJsonEnd !== -1) {
                const fallbackJsonString = fallbackJsonpText.substring(fallbackJsonStart + 1, fallbackJsonEnd)
                const fallbackParsedOffers = JSON.parse(fallbackJsonString)

                if (Array.isArray(fallbackParsedOffers) && fallbackParsedOffers.length > 0) {
                  offers = fallbackParsedOffers
                  console.log(`✅ Found ${offers.length} offers using fallback ${fallbackCountry}`)
                  break
                }
              }
            }
          } catch (fallbackError) {
            console.warn(`⚠️ Fallback ${fallbackCountry} failed:`, fallbackError)
          }
        }
      }
    }

    // Process offers
    const processedOffers = offers.slice(0, 5).map((offer, index) => ({
      ...offer,
      id: offer.id || `offer_${detectedCountry}_${index}_${Date.now()}`,
    }))

    console.log(`🎉 Returning ${processedOffers.length} offers for country: ${detectedCountry}`)

    return NextResponse.json(
      {
        success: true,
        offers: processedOffers,
        country: detectedCountry,
        totalAvailable: offers.length,
        userId: userId,
        metadata: {
          detectedCountry,
          clientIp: clientIp || "unknown",
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
          "X-Country-Detected": detectedCountry,
          "X-Offers-Count": processedOffers.length.toString(),
        },
      },
    )
  } catch (error: any) {
    console.error("💥 Error fetching country-specific offers:", error)
    return NextResponse.json(
      {
        error: "Internal server error while fetching offers",
        details: error.message || String(error),
        offers: [],
        country: "US",
        userId: userId,
      },
      { status: 500 },
    )
  }
}
