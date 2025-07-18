import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 })
  }

  try {
    // Step 1: Get user ID and display name from username
    // Using https://users.roblox.com/v1/usernames/users (POST request)
    const usersApiUrl = "https://users.roblox.com/v1/usernames/users"
    const usersResponse = await fetch(usersApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    })

    if (!usersResponse.ok) {
      console.error("Roblox API error (users):", usersResponse.status, await usersResponse.text())
      return NextResponse.json(
        { error: "Failed to fetch user from Roblox Users API", details: `Status: ${usersResponse.status}` },
        { status: usersResponse.status },
      )
    }

    const usersData = await usersResponse.json()

    if (!usersData.data || usersData.data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = usersData.data[0]
    const userId = userData.id
    const displayName = userData.displayName
    const actualUsername = userData.name // The canonical username

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in Roblox response" }, { status: 404 })
    }

    // Step 2: Get avatar headshot using the user ID
    const thumbnailsApiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    const thumbnailsResponse = await fetch(thumbnailsApiUrl)

    if (!thumbnailsResponse.ok) {
      console.error("Roblox API error (thumbnails):", thumbnailsResponse.status, await thumbnailsResponse.text())
      return NextResponse.json(
        {
          error: "Failed to fetch avatar headshot from Roblox Thumbnails API",
          details: `Status: ${thumbnailsResponse.status}`,
        },
        { status: thumbnailsResponse.status },
      )
    }

    const thumbnailsData = await thumbnailsResponse.json()

    if (!thumbnailsData.data || thumbnailsData.data.length === 0 || !thumbnailsData.data[0].imageUrl) {
      return NextResponse.json({ error: "Avatar headshot not found" }, { status: 404 })
    }

    const avatarUrl = thumbnailsData.data[0].imageUrl

    return NextResponse.json({
      userId,
      username: actualUsername,
      displayName,
      avatarUrl,
    })
  } catch (error: any) {
    console.error("Error fetching Roblox user data:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message || String(error) },
      { status: 500 },
    )
  }
}
