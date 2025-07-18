import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Map prize parameter to reward ID
export function getPrizeRewardId(prizeNumber: number): string | null {
  const prizeMap: Record<number, string> = {
    1: "10t-sheckles", // Updated from 100b-sheckles to 10t-sheckles
    2: "red-fox",
    3: "dragon-fly",
    4: "raccoon",
    5: "queen-bee",
    6: "disco-bee",
    7: "candy-blossom",
    8: "octopus",
    9: "fennec-fox", // NEW: Fennec Fox - Prize #9
  }

  return prizeMap[prizeNumber] || null
}
