"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

type Language = "en" | "hi";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    features: "Features",
    pricing: "Pricing",
    signIn: "Sign In",
    getStarted: "Get Started Free",
    heroTitle: "The Future of Poultry Farming is Here",
    heroSubtitle: "PoultryMitra is your AI-powered partner for a more productive and profitable farm. Get intelligent insights, real-time monitoring, and expert advice at your fingertips.",
    exploreDashboard: "Explore Dashboard",
    learnMore: "Learn More",
    powerfulFeatures: "Powerful Features for Smart Farming",
    featuresSubtitle: "Everything you need to manage and grow your poultry business, powered by cutting-edge AI.",
    startOptimizing: "Start Optimizing Your Farm Today",
    startOptimizingSubtitle: "Join hundreds of farmers who are revolutionizing their operations with PoultryMitra. Get started for free, no credit card required.",
    signUpNow: "Sign Up Now",
    footerText: "Built by Your AI Assistant. The source code is available on GitHub."
  },
  hi: {
    features: "विशेषताएँ",
    pricing: "मूल्य निर्धारण",
    signIn: "साइन इन करें",
    getStarted: "मुफ़्त में शुरू करें",
    heroTitle: "पोल्ट्री फार्मिंग का भविष्य यहाँ है",
    heroSubtitle: "पोल्ट्रीमित्रा एक अधिक उत्पादक और लाभदायक फार्म के लिए आपका AI-संचालित भागीदार है। अपनी उंगलियों पर बुद्धिमान अंतर्दृष्टि, वास्तविक समय की निगरानी और विशेषज्ञ सलाह प्राप्त करें।",
    exploreDashboard: "डैशबोर्ड एक्सप्लोर करें",
    learnMore: " और जानें",
    powerfulFeatures: "स्मार्ट फार्मिंग के लिए शक्तिशाली सुविधाएँ",
    featuresSubtitle: "अत्याधुनिक AI द्वारा संचालित, अपने पोल्ट्री व्यवसाय को प्रबंधित करने और विकसित करने के लिए आपको जो कुछ भी चाहिए।",
    startOptimizing: "आज ही अपने फार्म का अनुकूलन शुरू करें",
    startOptimizingSubtitle: "उन सैकड़ों किसानों में शामिल हों जो पोल्ट्रीमित्रा के साथ अपने कार्यों में क्रांति ला रहे हैं। मुफ्त में शुरू करें, कोई क्रेडिट कार्ड की आवश्यकता नहीं है।",
    signUpNow: "अभी साइन अप करें",
    footerText: "आपके AI सहायक द्वारा बनाया गया। स्रोत कोड GitHub पर उपलब्ध है।"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const value = useMemo(() => ({
    language,
    toggleLanguage,
    t
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
