
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
    "nav_home": "Home",
    "nav_features": "Features",
    "nav_pricing": "Pricing",
    "nav_ai_chat": "AI Chat",
    "nav_contact": "Contact",
    "nav_login": "Login",
    "nav_signup": "Sign Up",
    "change_language": "Change Language",
    "toggle_theme": "Toggle Theme",
    "hero_title": "Smart Poultry Management with AI",
    "hero_subtitle": "Empowering farmers, dealers, and admins to manage flocks, sales, and insights — all in one powerful dashboard.",
    "hero_get_started": "Get Started Free",
    "hero_watch_demo": "Watch Demo",
    "features_title": "Why Choose PoultryMitra?",
    "features_subtitle": "A complete poultry ecosystem — from hatchery to market, powered by intelligence.",
    "features_aiChat_title": "AI Assistant Support",
    "features_aiChat_description": "Chat with our AI assistant in Hindi or English for instant help on poultry management, health tips, and market insights.",
    "features_flockTracking_title": "Flock & Farm Tracking",
    "features_flockTracking_description": "Monitor bird growth, feed usage, health records, and productivity — with real-time updates.",
    "features_dealerManagement_title": "Dealer & Farmer Network",
    "features_dealerManagement_description": "Dealers can manage their associated farmers, orders, and performance easily through a secure Firestore dashboard.",
    "features_payments_title": "Smart Subscription Control",
    "features_payments_description": "Built-in Razorpay integration for easy subscription and billing — enabled by admin.",
    "features_analytics_title": "Live Analytics Dashboard",
    "features_analytics_description": "Admins get real-time revenue, flock performance, and AI usage insights through interactive Recharts graphs.",
    "pricing_title": "Flexible Plans for Every Need",
    "pricing_subtitle": "Start free, grow smart — choose a plan when you're ready.",
    "pricing_free_plan": "Free Plan",
    "pricing_free_plan_price": "INR 0",
    "pricing_free_plan_period": "for basic needs",
    "pricing_farmer_plan": "Farmer Plan",
    "pricing_farmer_plan_price": "INR 199",
    "pricing_dealer_plan": "Dealer Plan",
    "pricing_dealer_plan_price": "INR 499",
    "pricing_plan_period": "per month",
    "pricing_free_plan_cta": "Continue with Free",
    "pricing_farmer_plan_cta": "Choose Farmer Plan",
    "pricing_dealer_plan_cta": "Choose Dealer Plan",
    "testimonials_title": "What Our Users Say",
    "testimonials_subtitle": "Real stories from people who trust PoultryMitra.",
    "testimonials_farmer_role": "Farmer",
    "testimonials_farmer_quote": "PoultryMitra has increased my farm's productivity. Now I can monitor everything from my mobile!",
    "testimonials_dealer_role": "Dealer",
    "testimonials_dealer_quote": "Answering farmers' questions is now much easier with the AI Chat.",
    "testimonials_admin_role": "Admin",
    "testimonials_admin_quote": "The Admin Dashboard gives me control over the entire network — data, analytics, everything.",
    "cta_title": "Join PoultryMitra Today",
    "cta_subtitle": "Bring intelligence and automation to your poultry business.",
    "cta_button": "Start Free Trial",
    "footer_about": "About PoultryMitra",
    "footer_terms": "Terms & Conditions",
    "footer_privacy": "Privacy Policy",
    "footer_contact": "Contact Us",
    "footer_copyright": "© 2025 PoultryMitra. All rights reserved.",
    "sidebar_settings": "Settings",
    "sidebar_logout": "Logout",
    "login_title": "Welcome to PoultryMitra",
    "login_subtitle": "The trusted companion for smart poultry management",
    "login_illustration_subtitle": "A complete poultry ecosystem — from hatchery to market, powered by intelligence.",
    "login_tab": "Login",
    "signup_tab": "Sign Up",
    "login_email_phone_label": "Email or Phone",
    "login_email_phone_placeholder": "you@example.com",
    "login_email_phone_hint": "Enter the email or phone number you used to register.",
    "login_password_label": "Password",
    "login_forgot_password": "Forgot Password?",
    "login_login_as_farmer": "Login as Farmer",
    "login_login_as_dealer": "Login as Dealer",
    "login_admin_login": "Admin Login",
    "signup_role_label": "I am a...",
    "signup_farmer_role": "Farmer",
    "signup_dealer_role": "Dealer",
    "signup_fullname_label": "Full Name",
    "signup_fullname_placeholder": "e.g. Ravi Kumar",
    "signup_fullname_hint": "Enter your full name as per your records.",
    "signup_email_label": "Email Address",
    "signup_email_placeholder": "you@example.com",
    "signup_email_hint": "A valid email for communication and login.",
    "signup_phone_label": "Phone Number",
    "signup_phone_placeholder": "+91 98765 43210",
    "signup_phone_hint": "Your 10-digit mobile number.",
    "signup_password_label": "Create Password",
    "signup_password_hint": "Must be at least 8 characters long.",
    "signup_create_account_button": "Create Account",
    "signup_terms_prefix": "By signing up, you agree to our",
    "signup_terms_link": "Terms of Service",
    "signup_privacy_link": "Privacy Policy"
  },
  hi: {
    "nav_home": "मुखपृष्ठ",
    "nav_features": "विशेषताएं",
    "nav_pricing": "मूल्य योजना",
    "nav_ai_chat": "एआई चैट",
    "nav_contact": "संपर्क करें",
    "nav_login": "लॉगिन",
    "nav_signup": "पंजीकरण करें",
    "change_language": "भाषा बदलें",
    "toggle_theme": "थीम बदलें",
    "hero_title": "एआई के साथ स्मार्ट पोल्ट्री प्रबंधन",
    "hero_subtitle": "किसानों, डीलरों और एडमिन को झुंड, बिक्री और अंतर्दृष्टि का प्रबंधन करने के लिए सशक्त बनाना - सब कुछ एक शक्तिशाली डैशबोर्ड में।",
    "hero_get_started": "मुफ्त में शुरू करें",
    "hero_watch_demo": "डेमो देखें",
    "features_title": "पोल्ट्रीमित्र क्यों चुनें?",
    "features_subtitle": "हैकरी से बाजार तक, एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता द्वारा संचालित है।",
    "features_aiChat_title": "एआई असिस्टेंट सपोर्ट",
    "features_aiChat_description": "पोल्ट्री प्रबंधन, स्वास्थ्य टिप्स और बाजार की जानकारी पर तत्काल सहायता के लिए हमारे एआई सहायक के साथ हिंदी या अंग्रेजी में चैट करें।",
    "features_flockTracking_title": "झुंड और फार्म ट्रैकिंग",
    "features_flockTracking_description": "रीयल-टाइम अपडेट के साथ पक्षियों की वृद्धि, चारा उपयोग, स्वास्थ्य रिकॉर्ड और उत्पादकता की निगरानी करें।",
    "features_dealerManagement_title": "डीलर और किसान नेटवर्क",
    "features_dealerManagement_description": "डीलर एक सुरक्षित फायरस्टोर डैशबोर्ड के माध्यम से अपने संबंधित किसानों, आदेशों और प्रदर्शन का आसानी से प्रबंधन कर सकते हैं।",
    "features_payments_title": "स्मार्ट सब्सक्रिप्शन कंट्रोल",
    "features_payments_description": "आसान सदस्यता और बिलिंग के लिए अंतर्निहित रेजरपे एकीकरण - व्यवस्थापक द्वारा सक्षम।",
    "features_analytics_title": "लाइव एनालिटिक्स डैशबोर्ड",
    "features_analytics_description": "व्यवस्थापक इंटरैक्टिव रीचार्ट्स ग्राफ़ के माध्यम से रीयल-टाइम राजस्व, झुंड प्रदर्शन और एआई उपयोग अंतर्दृष्टि प्राप्त करते हैं।",
    "pricing_title": "हर जरूरत के लिए लचीली योजनाएं",
    "pricing_subtitle": "मुफ्त शुरू करें, स्मार्ट बनें - जब आप तैयार हों तो एक योजना चुनें।",
    "pricing_free_plan": "मुफ्त योजना",
    "pricing_free_plan_price": "INR 0",
    "pricing_free_plan_period": "बुनियादी जरूरतों के लिए",
    "pricing_farmer_plan": "किसान योजना",
    "pricing_farmer_plan_price": "INR 199",
    "pricing_dealer_plan": "डीलर योजना",
    "pricing_dealer_plan_price": "INR 499",
    "pricing_plan_period": "प्रति माह",
    "pricing_free_plan_cta": "मुफ्त में जारी रखें",
    "pricing_farmer_plan_cta": "किसान योजना चुनें",
    "pricing_dealer_plan_cta": "डीलर योजना चुनें",
    "testimonials_title": "हमारे उपयोगकर्ता क्या कहते हैं",
    "testimonials_subtitle": "पोल्ट्रीमित्र पर भरोसा करने वाले लोगों की वास्तविक कहानियाँ।",
    "testimonials_farmer_role": "किसान",
    "testimonials_farmer_quote": "पोल्ट्रीमित्र ने मेरे फार्म की प्रोडक्टिविटी बढ़ाई है। अब सबकुछ मोबाइल से देख सकता हूँ!",
    "testimonials_dealer_role": "वितरक",
    "testimonials_dealer_quote": "AI Chat से अब किसानों के सवालों का जवाब देना बहुत आसान हो गया है।",
    "testimonials_admin_role": "प्रशासक",
    "testimonials_admin_quote": "एडमिन डैशबोर्ड मुझे पूरे नेटवर्क का नियंत्रण देता है — डेटा, एनालिटिक्स, सब कुछ।",
    "cta_title": "आज ही पोल्ट्रीमित्र से जुड़ें",
    "cta_subtitle": "अपने पोल्ट्री व्यवसाय में बुद्धिमत्ता और स्वचालन लाएं।",
    "cta_button": "निःशुल्क परीक्षण शुरू करें",
    "footer_about": "पोल्ट्रीमित्र के बारे में",
    "footer_terms": "नियम और शर्तें",
    "footer_privacy": "गोपनीयता नीति",
    "footer_contact": "हमसे संपर्क करें",
    "footer_copyright": "© 2025 पोल्ट्रीमित्र। सर्वाधिकार सुरक्षित।",
    "sidebar_settings": "सेटिंग्स",
    "sidebar_logout": "लॉगआउट",
    "login_title": "पोल्ट्रीमित्र में आपका स्वागत है",
    "login_subtitle": "स्मार्ट पोल्ट्री प्रबंधन का भरोसेमंद साथी",
    "login_illustration_subtitle": "हैकरी से बाजार तक, एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता द्वारा संचालित है।",
    "login_tab": "लॉगिन",
    "signup_tab": "पंजीकरण करें",
    "login_email_phone_label": "ईमेल या फ़ोन",
    "login_email_phone_placeholder": "आप@example.com",
    "login_email_phone_hint": "पंजीकरण के लिए उपयोग किया गया ईमेल या फ़ोन नंबर दर्ज करें।",
    "login_password_label": "पासवर्ड",
    "login_forgot_password": "पासवर्ड भूल गए?",
    "login_login_as_farmer": "किसान के रूप में लॉगिन करें",
    "login_login_as_dealer": "डीलर के रूप में लॉगिन करें",
    "login_admin_login": "एडमिन लॉगिन",
    "signup_role_label": "मैं एक...",
    "signup_farmer_role": "किसान",
    "signup_dealer_role": "डीलर",
    "signup_fullname_label": "पूरा नाम",
    "signup_fullname_placeholder": "उदा. रवि कुमार",
    "signup_fullname_hint": "अपने रिकॉर्ड के अनुसार पूरा नाम दर्ज करें।",
    "signup_email_label": "ईमेल पता",
    "signup_email_placeholder": "आप@example.com",
    "signup_email_hint": "संचार और लॉगिन के लिए एक वैध ईमेल।",
    "signup_phone_label": "फ़ोन नंबर",
    "signup_phone_placeholder": "+91 98765 43210",
    "signup_phone_hint": "आपका 10 अंकों का मोबाइल नंबर।",
    "signup_password_label": "पासवर्ड बनाएं",
    "signup_password_hint": "कम से कम 8 अक्षर का होना चाहिए।",
    "signup_create_account_button": "खाता बनाएं",
    "signup_terms_prefix": "साइन अप करके, आप हमारी",
    "signup_terms_link": "सेवा की शर्तों",
    "signup_privacy_link": "गोपनीयता नीति"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string): string => {
    const keys = key.split('_');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        return fallbackResult;
      }
    }
    return typeof result === 'string' ? result : key;
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

    