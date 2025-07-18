"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/lib/i18n/language-context"
import { languages } from "@/lib/i18n/translations"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage, currentLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate slider position when language changes
  useEffect(() => {
    const index = languages.findIndex((lang) => lang.code === language)
    if (index >= 0 && sliderRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const itemWidth = 80 // Width of each language item
      const maxScroll = Math.max(0, languages.length * itemWidth - containerWidth)

      // Center the selected language
      let newPosition = index * itemWidth - containerWidth / 2 + itemWidth / 2

      // Clamp the position to valid range
      newPosition = Math.max(0, Math.min(newPosition, maxScroll))

      setSliderPosition(newPosition)
    }
  }, [language, isOpen])

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode)
    // Don't close the slider to allow for easy language switching
  }

  const toggleSlider = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {/* Language Button */}
      <Button
        onClick={toggleSlider}
        className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 px-4 py-2"
      >
        <Globe className="w-5 h-5" />
        <span className="font-medium">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
      </Button>

      {/* Language Slider */}
      {isOpen && (
        <Card className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl p-4 w-[320px] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Select Language</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>

            {/* Language Slider */}
            <div className="relative overflow-hidden" style={{ height: "120px" }} ref={containerRef}>
              <div
                ref={sliderRef}
                className="flex gap-2 absolute transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${sliderPosition}px)` }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`
                      flex flex-col items-center justify-center w-[80px] h-[100px] rounded-xl transition-all duration-300
                      ${
                        lang.code === language
                          ? "bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-500 shadow-lg scale-110"
                          : "bg-white/80 hover:bg-gray-100 border border-gray-200"
                      }
                    `}
                  >
                    <span className="text-2xl mb-1">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    <span className="text-xs text-gray-500">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sliderPosition > 0) {
                    setSliderPosition(Math.max(0, sliderPosition - 160))
                  }
                }}
                disabled={sliderPosition <= 0}
              >
                ← Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sliderRef.current && containerRef.current) {
                    const containerWidth = containerRef.current.clientWidth
                    const sliderWidth = languages.length * 80 // 80px per language
                    const maxScroll = sliderWidth - containerWidth

                    if (sliderPosition < maxScroll) {
                      setSliderPosition(Math.min(maxScroll, sliderPosition + 160))
                    }
                  }
                }}
                disabled={
                  sliderRef.current &&
                  containerRef.current &&
                  sliderPosition >= languages.length * 80 - containerRef.current.clientWidth
                }
              >
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
