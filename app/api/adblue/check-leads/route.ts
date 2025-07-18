import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserCompletions as getLocalUserCompletions, getAllUserConversions } from "../postback/route"

// In-memory storage for conversions (should match postback route)
const conversions = new Map<string, any>()
const userCompletions = new Map<string, Set<string>>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || searchParams.get("s1")
  const testingParam = searchParams.get("testing") || "0"
  const cacheBuster = Date.now()

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.ip || ""

  console.log(`🔍 CHECKING LEADS for user: ${userId || "anonymous"} (testing: ${testingParam === "1" ? "ON" : "OFF"})`)

  // Enhanced check leads URL with better parameters
  let checkLeadsUrl = `https://d3o07fqjkwc0s0.cloudfront.net/public/external/check2.php?testing=${testingParam}&callback=jsonpCallback`

  // Add user tracking if available
  if (userId) {
    checkLeadsUrl += `&s1=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`
  }

  console.log("🌐 Fetching from AdBlueMedia check leads:", checkLeadsUrl)

  try {
    const response = await fetch(checkLeadsUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0 (compatible; RewardsBot/1.0)",
        "X-Forwarded-For": clientIp,
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ AdBlueMedia Check Leads API error:", response.status, errorText.substring(0, 200))

      // Return local tracking data as fallback
      if (userId) {
        const localCompletions = getLocalUserCompletions(userId)
        const localConversions = getAllUserConversions(userId)

        console.log(`📊 Returning ${localCompletions.length} local completions as fallback`)

        const fallbackLeads = localCompletions.map((offerId) => ({
          offer_id: offerId,
          status: "1",
          source: "local_tracking",
          timestamp: new Date().toISOString(),
          user_id: userId,
          fallback: true,
        }))

        return NextResponse.json(fallbackLeads, {
          headers: {
            "Cache-Control": "no-store, max-age=0",
            "X-Data-Source": "local_fallback",
          },
        })
      }

      return NextResponse.json(
        {
          error: "Failed to check leads from AdBlueMedia",
          details: `Status: ${response.status}`,
          fallback_data: [],
        },
        { status: response.status },
      )
    }

    // Parse JSONP response
    const jsonpText = await response.text()
    console.log("📥 Raw JSONP response length:", jsonpText.length)

    let apiLeads: any[] = []
    try {
      const jsonStart = jsonpText.indexOf("(")
      const jsonEnd = jsonpText.lastIndexOf(")")

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = jsonpText.substring(jsonStart + 1, jsonEnd)
        apiLeads = JSON.parse(jsonString) || []
        console.log(`✅ Parsed ${apiLeads.length} leads from API`)
      } else {
        console.warn("⚠️ Could not parse JSONP response")
        apiLeads = []
      }
    } catch (parseError) {
      console.error("💥 Error parsing JSONP:", parseError)
      apiLeads = []
    }

    // Combine API leads with local tracking
    const combinedLeads = [...apiLeads]

    if (userId) {
      const localCompletions = getLocalUserCompletions(userId)
      const localConversions = getAllUserConversions(userId)

      console.log(`📊 Local tracking: ${localCompletions.length} completions, ${localConversions.length} conversions`)

      // Add local completions that might not be in API response
      localCompletions.forEach((offerId) => {
        const existingLead = combinedLeads.find((lead: any) => lead.offer_id === offerId || lead.oid === offerId)

        if (!existingLead) {
          const localConversion = localConversions.find((conv) => conv.offerId === offerId)
          combinedLeads.push({
            offer_id: offerId,
            status: "1",
            source: "local_tracking",
            timestamp: localConversion?.timestamp || new Date().toISOString(),
            user_id: userId,
            payout: localConversion?.payout || "0",
            local_tracking: true,
          })
        }
      })
    }

    // Enhance leads with additional metadata
    const enhancedLeads = combinedLeads.map((lead: any) => ({
      ...lead,
      checked_at: new Date().toISOString(),
      user_id: userId,
      client_ip: clientIp,
      enhanced: true,
    }))

    console.log(
      `🎉 Returning ${enhancedLeads.length} total leads (${apiLeads.length} API + ${combinedLeads.length - apiLeads.length} local)`,
    )

    return NextResponse.json(enhancedLeads, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        "X-API-Leads": apiLeads.length.toString(),
        "X-Local-Leads": (combinedLeads.length - apiLeads.length).toString(),
        "X-Total-Leads": enhancedLeads.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("💥 Error checking leads:", error)

    // Return local tracking as ultimate fallback
    if (userId) {
      const localCompletions = getLocalUserCompletions(userId)
      console.log(`📊 Error fallback: returning ${localCompletions.length} local completions`)

      const fallbackLeads = localCompletions.map((offerId) => ({
        offer_id: offerId,
        status: "1",
        source: "error_fallback",
        timestamp: new Date().toISOString(),
        user_id: userId,
        error_fallback: true,
      }))

      return NextResponse.json(fallbackLeads, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Data-Source": "error_fallback",
        },
      })
    }

    return NextResponse.json(
      {
        error: "Internal server error while checking leads",
        details: error.message || String(error),
        fallback_data: [],
      },
      { status: 500 },
    )
  }
}

// Helper functions to sync with postback route
export function addUserCompletion(userId: string, offerId: string) {
  if (!userCompletions.has(userId)) {
    userCompletions.set(userId, new Set())
  }
  userCompletions.get(userId)?.add(offerId)
}

export function removeUserCompletion(userId: string, offerId: string) {
  if (userCompletions.has(userId)) {
    userCompletions.get(userId)?.delete(offerId)
  }
}

export function getUserCompletions(userId: string): string[] {
  const completions = userCompletions.get(userId)
  return completions ? Array.from(completions) : []
}
