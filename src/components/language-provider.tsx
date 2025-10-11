
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
    "hero.title": "Smart Poultry Management Made Simple",
    "hero.subtitle": "Empowering Farmers and Dealers with AI-driven insights, farm tracking, and bilingual support.",
    "hero.get_started": "Get Started",
    "hero.watch_demo": "Watch Demo",
    "features.title": "Core Features",
    "features.subtitle": "Everything you need to manage and grow your poultry business, powered by cutting-edge AI.",
    "features.aiChat.title": "AI Chat Support",
    "features.aiChat.description": "Get instant answers to your poultry farming questions with our expert AI assistant, available in English and Hindi.",
    "features.flockTracking.title": "Farm & Flock Tracking",
    "features.flockTracking.description": "Monitor your flock's health, production, and feed consumption with an easy-to-use dashboard.",
    "features.dealerManagement.title": "Dealer Management",
    "features.dealerManagement.description": "Connect with dealers, manage orders, and track payments seamlessly in one place.",
    "features.payments.title": "Payments & Subscriptions",
    "features.payments.description": "Handle all your transactions securely, manage subscriptions, and view payment history.",
    "features.analytics.title": "Reports & Analytics",
    "features.analytics.description": "Generate detailed reports and gain valuable insights to optimize your farm's performance.",
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle": "Choose a plan that fits your needs. No hidden fees.",
    "pricing.free_trial": "Free Trial",
    "pricing.basic_plan": "Basic Plan",
    "pricing.premium_plan": "Premium Plan",
    "pricing.free_trial_price": "₹0",
    "pricing.basic_plan_price": "₹199",
    "pricing.premium_plan_price": "₹499",
    "pricing.free_trial_period": "/30 days",
    "pricing.plan_period": "/month",
    "pricing.compare_plans": "Compare Plans",
    "testimonials.title": "Trusted by Farmers and Dealers",
    "testimonials.subtitle": "See how PoultryMitra is making a difference in the poultry industry.",
    "testimonials.farmer.role": "Farmer",
    "testimonials.farmer.quote": "The AI chat is a game-changer! I get instant advice on feed and health, which has improved my farm's productivity.",
    "testimonials.dealer.role": "Dealer",
    "testimonials.dealer.quote": "Managing orders and payments has never been easier. PoultryMitra has streamlined my entire workflow.",
    "testimonials.admin.role": "Admin",
    "testimonials.admin.quote": "The analytics dashboard gives me a complete overview of our network. It's an invaluable tool for strategic planning.",
    "cta.title": "Join 500+ poultry farmers managing their business smarter.",
    "cta.subtitle": "Sign up today and experience the future of poultry management.",
    "cta.button": "Start Your Free Month",
    "footer.about": "About",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy Policy",
    "footer.contact": "Contact",
    "footer.copyright": "© 2025 PoultryMitra. All rights reserved.",
  },
  hi: {
    "nav.home": "होम",
    "nav.features": "विशेषताएँ",
    "nav.pricing": "कीमत",
    "nav.ai_chat": "एआई चैट",
    "nav.contact": "संपर्क",
    "nav.login": "लॉग इन करें",
    "nav.signup": "साइन अप करें",
    "hero.title": "स्मार्ट पोल्ट्री प्रबंधन अब हुआ आसान",
    "hero.subtitle": "किसानों और डीलरों को एआई-संचालित अंतर्दृष्टि, फार्म ट्रैकिंग और द्विभाषी समर्थन के साथ सशक्त बनाना।",
    "hero.get_started": "शुरू हो जाओ",
    "hero.watch_demo": "डेमो देखें",
    "features.title": "मुख्य विशेषताएँ",
    "features.subtitle": "अत्याधुनिक एआई द्वारा संचालित, अपने पोल्ट्री व्यवसाय को प्रबंधित करने और विकसित करने के लिए आपको जो कुछ भी चाहिए।",
    "features.aiChat.title": "एआई चैट सपोर्ट",
    "features.aiChat.description": "हमारे विशेषज्ञ एआई सहायक से अपने मुर्गी पालन संबंधी प्रश्नों के तुरंत उत्तर प्राप्त करें, जो अंग्रेजी और हिंदी में उपलब्ध है।",
    "features.flockTracking.title": "फार्म और झुंड ट्रैकिंग",
    "features.flockTracking.description": "एक उपयोग में आसान डैशबोर्ड के साथ अपने झुंड के स्वास्थ्य, उत्पादन और फ़ीड की खपत की निगरानी करें।",
    "features.dealerManagement.title": "डीलर प्रबंधन",
    "features.dealerManagement.description": "डीलरों से जुड़ें, ऑर्डर प्रबंधित करें और एक ही स्थान पर भुगतान को निर्बाध रूप से ट्रैक करें।",
    "features.payments.title": "भुगतान और सदस्यता",
    "features.payments.description": "अपने सभी लेनदेन सुरक्षित रूप से संभालें, सदस्यता प्रबंधित करें और भुगतान इतिहास देखें।",
    "features.analytics.title": "रिपोर्ट और एनालिटिक्स",
    "features.analytics.description": "विस्तृत रिपोर्ट तैयार करें और अपने खेत के प्रदर्शन को अनुकूलित करने के लिए बहुमूल्य अंतर्दृष्टि प्राप्त करें।",
    "pricing.title": "सरल, पारदर्शी मूल्य-निर्धारण",
    "pricing.subtitle": "वह योजना चुनें जो आपकी आवश्यकताओं के अनुकूल हो। कोई छिपा हुआ शुल्क नहीं।",
    "pricing.free_trial": "निःशुल्क परीक्षण",
    "pricing.basic_plan": "बुनियादी योजना",
    "pricing.premium_plan": "प्रीमियम योजना",
    "pricing.free_trial_price": "₹0",
    "pricing.basic_plan_price": "₹199",
    "pricing.premium_plan_price": "₹499",
    "pricing.free_trial_period": "/30 दिन",
    "pricing.plan_period": "/माह",
    "pricing.compare_plans": "योजनाओं की तुलना करें",
    "testimonials.title": "किसानों और डीलरों द्वारा विश्वसनीय",
    "testimonials.subtitle": "देखें कि पोल्ट्रीमित्र पोल्ट्री उद्योग में कैसे बदलाव ला रहा है।",
    "testimonials.farmer.role": "किसान",
    "testimonials.farmer.quote": "एआई चैट एक गेम-चेंजर है! मुझे फ़ीड और स्वास्थ्य पर तुरंत सलाह मिलती है, जिससे मेरे खेत की उत्पादकता में सुधार हुआ है।",
    "testimonials.dealer.role": "डीलर",
    "testimonials.dealer.quote": "ऑर्डर और भुगतान का प्रबंधन करना इतना आसान कभी नहीं रहा। पोल्ट्रीमित्र ने मेरे पूरे वर्कफ़्लो को सुव्यवस्थित कर दिया है।",
    "testimonials.admin.role": "व्यवस्थापक",
    "testimonials.admin.quote": "एनालिटिक्स डैशबोर्ड मुझे हमारे नेटवर्क का पूरा अवलोकन देता है। यह रणनीतिक योजना के लिए एक अमूल्य उपकरण है।",
    "cta.title": "500+ पोल्ट्री किसानों से जुड़ें जो अपने व्यवसाय को बेहतर तरीके से प्रबंधित कर रहे हैं।",
    "cta.subtitle": "आज ही साइन अप करें और पोल्ट्री प्रबंधन के भविष्य का अनुभव करें।",
    "cta.button": "अपना निःशुल्क महीना शुरू करें",
    "footer.about": "हमारे बारे में",
    "footer.terms": "शर्तें",
    "footer.privacy": "गोपनीयता नीति",
    "footer.contact": "संपर्क",
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
            return key;
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
