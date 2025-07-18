import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Enhanced in-memory storage for conversions (in production, use Redis or database)
const conversions = new Map<string, any>()
const userCompletions = new Map<string, Set<string>>()
const offerMetrics = new Map<string, any>()

// Track postback sources for validation
const validPostbackSources = [
  "52.52.73.138", // AdBlueMedia primary IP
  "adblue", // Any IP containing adblue
  "google", // Google Cloud IPs
  "amazonaws", // AWS IPs
]

function isValidPostbackSource(ip: string): boolean {
  if (!ip) return false
  return validPostbackSources.some((source) => ip.includes(source))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timestamp = new Date().toISOString()

  // Extract all possible postback parameters
  const postbackData = {
    offerId: searchParams.get("offer_id") || searchParams.get("offer") || searchParams.get("oid"),
    offerName: searchParams.get("offer_name") || searchParams.get("name"),
    payout: searchParams.get("payout") || searchParams.get("amount"),
    payoutCents: searchParams.get("payout_cents") || searchParams.get("amount_cents"),
    userIp: searchParams.get("ip") || searchParams.get("user_ip"),
    status: searchParams.get("status") || searchParams.get("conversion_status"),
    unix: searchParams.get("unix") || searchParams.get("timestamp"),
    s1: searchParams.get("s1") || searchParams.get("subid1") || searchParams.get("user_id"),
    s2: searchParams.get("s2") || searchParams.get("subid2") || searchParams.get("country"),
    leadId: searchParams.get("lead_id") || searchParams.get("conversion_id"),
    clickId: searchParams.get("click_id") || searchParams.get("cid"),
    countryCode: searchParams.get("country_code") || searchParams.get("country") || searchParams.get("geo"),
    transactionId: searchParams.get("transaction_id") || searchParams.get("txn_id"),
    currency: searchParams.get("currency") || "USD",
    deviceType: searchParams.get("device_type") || searchParams.get("device"),
    source: searchParams.get("source") || "adblue",
  }

  // Get client information
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.ip || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const referer = request.headers.get("referer") || "unknown"

  // Validate postback source
  const isValidSource = isValidPostbackSource(clientIp)

  console.log("📥 POSTBACK RECEIVED:", {
    ...postbackData,
    clientIp,
    userAgent: userAgent.substring(0, 50) + "...",
    referer,
    isValidSource,
    timestamp,
  })

  // Validate required parameters
  if (!postbackData.offerId || !postbackData.status) {
    console.error("❌ INVALID POSTBACK: Missing required parameters")
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameters (offer_id, status)",
        received: postbackData,
      },
      { status: 400 },
    )
  }

  try {
    const conversionKey = `${postbackData.s1}_${postbackData.offerId}`
    const userId = postbackData.s1 || "unknown"

    if (postbackData.status === "1" || postbackData.status === "approved") {
      // ✅ SUCCESSFUL CONVERSION
      console.log(`✅ CONVERSION APPROVED: User ${userId} completed offer ${postbackData.offerId}`)

      // Store detailed conversion data
      const conversionRecord = {
        ...postbackData,
        clientIp,
        userAgent,
        referer,
        timestamp,
        status: "completed",
        validated: isValidSource,
        processingTime: Date.now(),
      }

      conversions.set(conversionKey, conversionRecord)

      // Update user completions
      if (!userCompletions.has(userId)) {
        userCompletions.set(userId, new Set())
      }
      userCompletions.get(userId)?.add(postbackData.offerId)

      // Update offer metrics
      const offerKey = postbackData.offerId
      if (!offerMetrics.has(offerKey)) {
        offerMetrics.set(offerKey, {
          totalConversions: 0,
          totalPayout: 0,
          countries: new Set(),
          lastConversion: null,
        })
      }

      const metrics = offerMetrics.get(offerKey)
      metrics.totalConversions += 1
      metrics.totalPayout += Number.parseFloat(postbackData.payout || "0")
      metrics.countries.add(postbackData.countryCode || postbackData.s2)
      metrics.lastConversion = timestamp
      offerMetrics.set(offerKey, metrics)

      console.log(`📊 METRICS UPDATE: Offer ${postbackData.offerId} now has ${metrics.totalConversions} conversions`)
      console.log(`👤 USER UPDATE: User ${userId} now has ${userCompletions.get(userId)?.size || 0} completions`)

      return NextResponse.json({
        success: true,
        message: "Conversion recorded successfully",
        data: {
          offerId: postbackData.offerId,
          userId: userId,
          status: "approved",
          payout: postbackData.payout,
          timestamp,
          conversionKey,
        },
      })
    } else if (
      postbackData.status === "0" ||
      postbackData.status === "rejected" ||
      postbackData.status === "chargeback"
    ) {
      // ❌ CHARGEBACK/REVERSAL
      console.log(`❌ CHARGEBACK: User ${userId} offer ${postbackData.offerId} was reversed`)

      // Remove the conversion
      conversions.delete(conversionKey)

      // Remove from user completions
      if (userCompletions.has(userId)) {
        userCompletions.get(userId)?.delete(postbackData.offerId)
      }

      // Update offer metrics
      const offerKey = postbackData.offerId
      if (offerMetrics.has(offerKey)) {
        const metrics = offerMetrics.get(offerKey)
        metrics.totalConversions = Math.max(0, metrics.totalConversions - 1)
        metrics.totalPayout = Math.max(0, metrics.totalPayout - Number.parseFloat(postbackData.payout || "0"))
        offerMetrics.set(offerKey, metrics)
      }

      console.log(
        `📊 CHARGEBACK PROCESSED: User ${userId} now has ${userCompletions.get(userId)?.size || 0} completions`,
      )

      return NextResponse.json({
        success: true,
        message: "Chargeback processed successfully",
        data: {
          offerId: postbackData.offerId,
          userId: userId,
          status: "chargeback",
          timestamp,
          conversionKey,
        },
      })
    } else {
      // ⚠️ UNKNOWN STATUS
      console.warn(`⚠️ UNKNOWN STATUS: ${postbackData.status} for offer ${postbackData.offerId}`)

      return NextResponse.json({
        success: false,
        message: "Unknown conversion status",
        data: {
          offerId: postbackData.offerId,
          userId: userId,
          status: postbackData.status,
          timestamp,
        },
      })
    }
  } catch (error) {
    console.error("💥 POSTBACK ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error processing postback",
        details: error instanceof Error ? error.message : String(error),
        timestamp,
      },
      { status: 500 },
    )
  }
}

// Handle POST requests as well
export async function POST(request: NextRequest) {
  return GET(request)
}

// Export helper functions for other endpoints
export function getUserCompletions(userId: string): string[] {
  const completions = userCompletions.get(userId)
  return completions ? Array.from(completions) : []
}

export function getConversionData(userId: string, offerId: string) {
  const conversionKey = `${userId}_${offerId}`
  return conversions.get(conversionKey)
}

export function getAllUserConversions(userId: string) {
  const userConversions: any[] = []
  for (const [key, conversion] of conversions.entries()) {
    if (key.startsWith(`${userId}_`)) {
      userConversions.push(conversion)
    }
  }
  return userConversions
}

export function getOfferMetrics(offerId: string) {
  return offerMetrics.get(offerId)
}

export function getAllMetrics() {
  return {
    totalUsers: userCompletions.size,
    totalConversions: conversions.size,
    totalOffers: offerMetrics.size,
    userCompletions: Object.fromEntries(
      Array.from(userCompletions.entries()).map(([userId, completions]) => [userId, Array.from(completions)]),
    ),
    offerMetrics: Object.fromEntries(
      Array.from(offerMetrics.entries()).map(([offerId, metrics]) => [
        offerId,
        {
          ...metrics,
          countries: Array.from(metrics.countries),
        },
      ]),
    ),
  }
}
