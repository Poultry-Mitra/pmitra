
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
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.ai_chat": "AI Chat",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "Change language": "Change Language",
    "Toggle theme": "Toggle Theme",
    "hero.title": "Smart Poultry Management with AI",
    "hero.subtitle": "Empowering farmers, dealers, and admins to manage flocks, sales, and insights — all in one powerful dashboard.",
    "hero.get_started": "Get Started Free",
    "hero.watch_demo": "Watch Demo",
    "features.title": "Why Choose PoultryMitra?",
    "features.subtitle": "A complete poultry ecosystem — from hatchery to market, powered by intelligence.",
    "features.aiChat.title": "AI Assistant Support",
    "features.aiChat.description": "Chat with our AI assistant in Hindi or English for instant help on poultry management, health tips, and market insights.",
    "features.flockTracking.title": "Flock & Farm Tracking",
    "features.flockTracking.description": "Monitor bird growth, feed usage, health records, and productivity — with real-time updates.",
    "features.dealerManagement.title": "Dealer & Farmer Network",
    "features.dealerManagement.description": "Dealers can manage their associated farmers, orders, and performance easily through a secure Firestore dashboard.",
    "features.payments.title": "Smart Subscription Control",
    "features.payments.description": "Built-in Razorpay integration for easy subscription and billing — enabled by admin.",
    "features.analytics.title": "Live Analytics Dashboard",
    "features.analytics.description": "Admins get real-time revenue, flock performance, and AI usage insights through interactive Recharts graphs.",
    "pricing.title": "Flexible Plans for Every Need",
    "pricing.subtitle": "Start free, grow smart — choose a plan when you're ready.",
    "pricing.free_trial": "Free Trial",
    "pricing.free_trial_price": "₹0",
    "pricing.free_trial_period": "1 Month Free Access",
    "pricing.basic_plan": "Basic Plan",
    "pricing.basic_plan_price": "₹199",
    "pricing.premium_plan": "Premium Plan",
    "pricing.premium_plan_price": "₹499",
    "pricing.plan_period": "per month",
    "pricing.compare_plans": "Compare Plans",
    "testimonials.title": "What Our Users Say",
    "testimonials.subtitle": "Real stories from people who trust PoultryMitra.",
    "testimonials.farmer.role": "Farmer",
    "testimonials.farmer.quote": "PoultryMitra has increased my farm's productivity. Now I can monitor everything from my mobile!",
    "testimonials.dealer.role": "Dealer",
    "testimonials.dealer.quote": "Answering farmers' questions is now much easier with the AI Chat.",
    "testimonials.admin.role": "Admin",
    "testimonials.admin.quote": "The Admin Dashboard gives me control over the entire network — data, analytics, everything.",
    "cta.title": "Join PoultryMitra Today",
    "cta.subtitle": "Bring intelligence and automation to your poultry business.",
    "cta.button": "Start Free Trial",
    "footer.about": "About PoultryMitra",
    "footer.terms": "Terms & Conditions",
    "footer.privacy": "Privacy Policy",
    "footer.contact": "Contact Us",
    "footer.copyright": "© 2025 PoultryMitra. All rights reserved.",
  },
  hi: {
    "nav.home": "मुखपृष्ठ",
    "nav.features": "विशेषताएं",
    "nav.pricing": "मूल्य योजना",
    "nav.ai_chat": "एआई चैट",
    "nav.contact": "संपर्क करें",
    "nav.login": "लॉगिन",
    "nav.signup": "पंजीकरण करें",
    "Change language": "भाषा बदलें",
    "Toggle theme": "थीम बदलें",
    "hero.title": "एआई के साथ स्मार्ट पोल्ट्री प्रबंधन",
    "hero.subtitle": "किसानों, डीलरों और एडमिन को झुंड, बिक्री और अंतर्दृष्टि का प्रबंधन करने के लिए सशक्त बनाना - सब कुछ एक शक्तिशाली डैशबोर्ड में।",
    "hero.get_started": "मुफ्त में शुरू करें",
    "hero.watch_demo": "डेमो देखें",
    "features.title": "पोल्ट्रीमित्र क्यों चुनें?",
    "features.subtitle": "हैकरी से बाजार तक, एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता द्वारा संचालित है।",
    "features.aiChat.title": "एआई असिस्टेंट सपोर्ट",
    "features.aiChat.description": "पोल्ट्री प्रबंधन, स्वास्थ्य टिप्स और बाजार की जानकारी पर तत्काल सहायता के लिए हमारे एआई सहायक के साथ हिंदी या अंग्रेजी में चैट करें।",
    "features.flockTracking.title": "झुंड और फार्म ट्रैकिंग",
    "features.flockTracking.description": "रीयल-टाइम अपडेट के साथ पक्षियों की वृद्धि, चारा उपयोग, स्वास्थ्य रिकॉर्ड और उत्पादकता की निगरानी करें।",
    "features.dealerManagement.title": "डीलर और किसान नेटवर्क",
    "features.dealerManagement.description": "डीलर एक सुरक्षित फायरस्टोर डैशबोर्ड के माध्यम से अपने संबंधित किसानों, आदेशों और प्रदर्शन का आसानी से प्रबंधन कर सकते हैं।",
    "features.payments.title": "स्मार्ट सब्सक्रिप्शन कंट्रोल",
    "features.payments.description": "आसान सदस्यता और बिलिंग के लिए अंतर्निहित रेजरपे एकीकरण - व्यवस्थापक द्वारा सक्षम।",
    "features.analytics.title": "लाइव एनालिटिक्स डैशबोर्ड",
    "features.analytics.description": "व्यवस्थापक इंटरैक्टिव रीचार्ट्स ग्राफ़ के माध्यम से रीयल-टाइम राजस्व, झुंड प्रदर्शन और एआई उपयोग अंतर्दृष्टि प्राप्त करते हैं।",
    "pricing.title": "हर जरूरत के लिए लचीली योजनाएं",
    "pricing.subtitle": "मुफ्त शुरू करें, स्मार्ट बनें - जब आप तैयार हों तो एक योजना चुनें।",
    "pricing.free_trial": "निःशुल्क परीक्षण",
    "pricing.free_trial_price": "₹0",
    "pricing.free_trial_period": "1 महीने की मुफ्त पहुंच",
    "pricing.basic_plan": "बुनियादी योजना",
    "pricing.basic_plan_price": "₹199",
    "pricing.premium_plan": "प्रीमियम योजना",
    "pricing.premium_plan_price": "₹499",
    "pricing.plan_period": "प्रति माह",
    "pricing.compare_plans": "योजनाओं की तुलना करें",
    "testimonials.title": "हमारे उपयोगकर्ता क्या कहते हैं",
    "testimonials.subtitle": "पोल्ट्रीमित्र पर भरोसा करने वाले लोगों की वास्तविक कहानियाँ।",
    "testimonials.farmer.role": "किसान",
    "testimonials.farmer.quote": "पोल्ट्रीमित्र ने मेरे फार्म की प्रोडक्टिविटी बढ़ाई है। अब सबकुछ मोबाइल से देख सकता हूँ!",
    "testimonials.dealer.role": "वितरक",
    "testimonials.dealer.quote": "AI Chat से अब किसानों के सवालों का जवाब देना बहुत आसान हो गया है।",
    "testimonials.admin.role": "प्रशासक",
    "testimonials.admin.quote": "एडमिन डैशबोर्ड मुझे पूरे नेटवर्क का नियंत्रण देता है — डेटा, एनालिटिक्स, सब कुछ।",
    "cta.title": "आज ही पोल्ट्रीमित्र से जुड़ें",
    "cta.subtitle": "अपने पोल्ट्री व्यवसाय में बुद्धिमत्ता और स्वचालन लाएं।",
    "cta.button": "निःशुल्क परीक्षण शुरू करें",
    "footer.about": "पोल्ट्रीमित्र के बारे में",
    "footer.terms": "नियम और शर्तें",
    "footer.privacy": "गोपनीयता नीति",
    "footer.contact": "हमसे संपर्क करें",
    "footer.copyright": "© 2025 पोल्ट्रीमित्र। सर्वाधिकार सुरक्षित।",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Fallback to English if translation is missing in current language
            let fallbackResult: any = translations.en;
            for (const fk of keys) {
                fallbackResult = fallbackResult?.[fk];
                if(fallbackResult === undefined) return key;
            }
            return fallbackResult;
        }
    }
    return result || key;
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
