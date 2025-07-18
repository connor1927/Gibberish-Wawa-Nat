import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || request.ip || ""

  console.log("Detecting country for IP:", clientIp)
  console.log("Available headers:", {
    "x-vercel-ip-country": request.headers.get("x-vercel-ip-country"),
    "cf-ipcountry": request.headers.get("cf-ipcountry"),
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "x-real-ip": request.headers.get("x-real-ip"),
  })

  // Try Vercel's geo headers first (most reliable in deployment)
  const vercelCountry = request.headers.get("x-vercel-ip-country")
  if (vercelCountry && vercelCountry !== "unknown" && vercelCountry.length === 2) {
    console.log("Country from Vercel:", vercelCountry)
    return NextResponse.json({
      country: vercelCountry.toUpperCase(),
      source: "vercel",
      ip: clientIp,
    })
  }

  // Try Cloudflare's geo headers
  const cloudflareCountry = request.headers.get("cf-ipcountry")
  if (cloudflareCountry && cloudflareCountry !== "XX" && cloudflareCountry.length === 2) {
    console.log("Country from Cloudflare:", cloudflareCountry)
    return NextResponse.json({
      country: cloudflareCountry.toUpperCase(),
      source: "cloudflare",
      ip: clientIp,
    })
  }

  // Fallback to IP geolocation service only for real IPs
  if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1" && !clientIp.startsWith("192.168.")) {
    try {
      console.log("Trying IP geolocation for:", clientIp)

      // Try ipapi.co (free tier: 1000 requests/day)
      const ipApiResponse = await fetch(`https://ipapi.co/${clientIp}/country/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GeoDetector/1.0)",
        },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      })

      if (ipApiResponse.ok) {
        const country = await ipApiResponse.text()
        if (country && country.length === 2 && country !== "XX") {
          console.log("Country from ipapi.co:", country)
          return NextResponse.json({
            country: country.toUpperCase(),
            source: "ipapi.co",
            ip: clientIp,
          })
        }
      }
    } catch (error) {
      console.warn("IP geolocation failed:", error)
    }

    // Try another service as backup
    try {
      console.log("Trying backup IP geolocation for:", clientIp)

      // Try ip-api.com (free tier: 1000 requests/hour)
      const backupResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GeoDetector/1.0)",
        },
        signal: AbortSignal.timeout(3000),
      })

      if (backupResponse.ok) {
        const data = await backupResponse.json()
        if (data.countryCode && data.countryCode !== "XX") {
          console.log("Country from ip-api.com:", data.countryCode)
          return NextResponse.json({
            country: data.countryCode.toUpperCase(),
            source: "ip-api.com",
            ip: clientIp,
          })
        }
      }
    } catch (error) {
      console.warn("Backup IP geolocation failed:", error)
    }
  }

  // Final fallback - try to guess from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    const languages = acceptLanguage.split(",")
    for (const lang of languages) {
      const parts = lang.trim().split("-")
      if (parts.length === 2) {
        const countryCode = parts[1].toUpperCase()
        if (countryCode.length === 2) {
          console.log("Country from Accept-Language:", countryCode)
          return NextResponse.json({
            country: countryCode,
            source: "accept-language",
            ip: clientIp,
          })
        }
      }
    }
  }

  // Ultimate fallback
  console.log("No country detected, using fallback")
  return NextResponse.json({
    country: "US",
    source: "fallback",
    ip: clientIp,
    warning: "Could not detect country, using US as fallback",
  })
}
