
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
    testimonials: "Testimonials",
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
    footerText: "Built by Your AI Assistant. The source code is available on GitHub.",
    featureAnalyticsTitle: "Analytics Dashboard",
    featureAnalyticsDesc: "Visualize key farm metrics like production rates, mortality, and feed consumption.",
    featureChatTitle: "AI Chat Support",
    featureChatDesc: "Get instant answers to your poultry farming questions with our expert AI assistant.",
    featureMonitoringTitle: "Farm Monitoring",
    featureMonitoringDesc: "Real-time monitoring of farm conditions with alerts for critical events and AI-powered forecasts.",
    featureFeedTitle: "Feed Recommendation",
    featureFeedDesc: "Our AI analyzes your farm data to recommend the most optimal and cost-effective feed.",
    featureUsersTitle: "User Management",
    featureUsersDesc: "An intuitive interface for admins to manage users, roles, and subscriptions.",
    featurePlansTitle: "Premium Plans",
    featurePlansDesc: "Unlock advanced features, detailed reports, and unlimited AI support with a subscription.",
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Get started in just three simple steps and revolutionize your farm management.",
    howItWorksStep1Title: "Connect Your Data",
    howItWorksStep1Desc: "Integrate your existing farm sensors or use our easy-to-install hardware for real-time data collection.",
    howItWorksStep2Title: "Get AI Insights",
    howItWorksStep2Desc: "Our AI analyzes your data to provide actionable insights on feed, health, and productivity.",
    howItWorksStep3Title: "Optimize & Grow",
    howItWorksStep3Desc: "Implement AI-driven recommendations to boost efficiency, reduce costs, and increase profitability.",
    testimonialsTitle: "What Farmers Are Saying",
    testimonialsSubtitle: "Don't just take our word for it. Here's what our users think about PoultryMitra.",
    testimonial1Quote: "PoultryMitra has transformed my farm. The AI feed recommendations have cut my costs by 15% and egg production is up!",
    testimonial2Quote: "The real-time monitoring and alerts are a lifesaver. I can finally sleep peacefully knowing my flock is safe.",
  },
  hi: {
    features: "विशेषताएँ",
    testimonials: "प्रशंसापत्र",
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
    footerText: "आपके AI सहायक द्वारा बनाया गया। स्रोत कोड GitHub पर उपलब्ध है।",
    featureAnalyticsTitle: "एनालिटिक्स डैशबोर्ड",
    featureAnalyticsDesc: "उत्पादन दर, मृत्यु दर और फ़ीड की खपत जैसे प्रमुख कृषि मेट्रिक्स की कल्पना करें।",
    featureChatTitle: "एआई चैट सपोर्ट",
    featureChatDesc: "हमारे विशेषज्ञ एआई सहायक से अपने मुर्गी पालन संबंधी प्रश्नों के तुरंत उत्तर प्राप्त करें।",
    featureMonitoringTitle: "फार्म की निगरानी",
    featureMonitoringDesc: "महत्वपूर्ण घटनाओं और एआई-संचालित पूर्वानुमानों के लिए अलर्ट के साथ खेत की स्थितियों की वास्तविक समय पर निगरानी।",
    featureFeedTitle: "फ़ीड अनुशंसा",
    featureFeedDesc: "हमारा एआई सबसे इष्टतम और लागत प्रभावी फ़ीड की सिफारिश करने के लिए आपके खेत के डेटा का विश्लेषण करता है।",
    featureUsersTitle: "उपयोगकर्ता प्रबंधन",
    featureUsersDesc: "उपयोगकर्ताओं, भूमिकाओं और सदस्यताओं को प्रबंधित करने के लिए व्यवस्थापकों के लिए एक सहज इंटरफ़ेस।",
    featurePlansTitle: "प्रीमियम योजनाएं",
    featurePlansDesc: "एक सदस्यता के साथ उन्नत सुविधाएँ, विस्तृत रिपोर्ट और असीमित एआई समर्थन अनलॉक करें।",
    howItWorksTitle: "यह कैसे काम करता है",
    howItWorksSubtitle: "बस तीन सरल चरणों में शुरुआत करें और अपने कृषि प्रबंधन में क्रांति लाएँ।",
    howItWorksStep1Title: "अपना डेटा कनेक्ट करें",
    howItWorksStep1Desc: "वास्तविक समय डेटा संग्रह के लिए अपने मौजूदा फार्म सेंसर को एकीकृत करें या हमारे आसान-से-स्थापित हार्डवेयर का उपयोग करें।",
    howItWorksStep2Title: "एआई अंतर्दृष्टि प्राप्त करें",
    howItWorksStep2Desc: "हमारा एआई फ़ीड, स्वास्थ्य और उत्पादकता पर कार्रवाई योग्य अंतर्दृष्टि प्रदान करने के लिए आपके डेटा का विश्लेषण करता है।",
    howItWorksStep3Title: "अनुकूलन और विकास करें",
    howItWorksStep3Desc: "दक्षता बढ़ाने, लागत कम करने और लाभप्रदता बढ़ाने के लिए एआई-संचालित सिफारिशों को लागू करें।",
    testimonialsTitle: "किसान क्या कह रहे हैं",
    testimonialsSubtitle: "सिर्फ हमारी बात पर विश्वास न करें। यहां बताया गया है कि हमारे उपयोगकर्ता पोल्ट्रीमित्रा के बारे में क्या सोचते हैं।",
    testimonial1Quote: "पोल्ट्रीमित्रा ने मेरे खेत को बदल दिया है। एआई फ़ीड की सिफारिशों ने मेरी लागत में 15% की कटौती की है और अंडे का उत्पादन बढ़ा है!",
    testimonial2Quote: "वास्तविक समय की निगरानी और अलर्ट एक जीवन रक्षक हैं। मैं आखिरकार यह जानकर शांति से सो सकता हूं कि मेरा झुंड सुरक्षित है।",
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

    