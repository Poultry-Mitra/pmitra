"use client"

import * as React from "react"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"

export function LanguageToggle() {
  const { toggleLanguage } = useLanguage();

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
      <span className="sr-only">Change language</span>
    </Button>
  )
}
