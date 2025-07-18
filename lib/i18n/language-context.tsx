"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getTranslation, type TranslationStrings, languages, type Language } from "./translations"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: TranslationStrings
  currentLanguage: Language
  direction: "ltr" | "rtl"
}

const defaultLanguage = "en"

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: getTranslation(defaultLanguage),
  currentLanguage: languages.find((lang) => lang.code === defaultLanguage) || languages[0],
  direction: "ltr",
})

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(defaultLanguage)
  const [translations, setTranslations] = useState<TranslationStrings>(getTranslation(defaultLanguage))
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages.find((lang) => lang.code === defaultLanguage) || languages[0],
  )

  useEffect(() => {
    // Try to get language from localStorage on client side
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setLanguageState(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0]
      const supportedLang = languages.find((lang) => lang.code === browserLang)
      if (supportedLang) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  useEffect(() => {
    // Update translations when language changes
    setTranslations(getTranslation(language))

    // Find current language object
    const langObj = languages.find((lang) => lang.code === language) || languages[0]
    setCurrentLanguage(langObj)

    // Save to localStorage
    localStorage.setItem("preferred-language", language)

    // Update document direction for RTL languages
    document.documentElement.dir = langObj.direction || "ltr"
  }, [language])

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations,
        currentLanguage,
        direction: currentLanguage.direction || "ltr",
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
