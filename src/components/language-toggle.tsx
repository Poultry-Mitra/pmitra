"use client"

import * as React from "react"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const [language, setLanguage] = React.useState("en")

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "hi" : "en"))
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
      <span className="sr-only">Change language</span>
    </Button>
  )
}
