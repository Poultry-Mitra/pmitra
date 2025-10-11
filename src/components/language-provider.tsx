
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
    nav: {
      home: "Home",
      features: "Features",
      pricing: "Pricing",
      ai_chat: "AI Chat",
      contact: "Contact",
      login: "Login",
      signup: "Sign Up",
    },
    "change_language": "Change Language",
    "toggle_theme": "Toggle Theme",
    hero: {
      title: "Smart Poultry Management with AI",
      subtitle: "Empowering farmers, dealers, and admins to manage flocks, sales, and insights — all in one powerful dashboard.",
      get_started: "Get Started Free",
      watch_demo: "Watch Demo",
    },
    features: {
      title: "Why Choose PoultryMitra?",
      subtitle: "A complete poultry ecosystem — from hatchery to market, powered by intelligence.",
      aiChat: {
        title: "AI Assistant Support",
        description: "Chat with our AI assistant in Hindi or English for instant help on poultry management, health tips, and market insights.",
      },
      flockTracking: {
        title: "Flock & Farm Tracking",
        description: "Monitor bird growth, feed usage, health records, and productivity — with real-time updates.",
      },
      dealerManagement: {
        title: "Dealer & Farmer Network",
        description: "Dealers can manage their associated farmers, orders, and performance easily through a secure Firestore dashboard.",
      },
      payments: {
        title: "Smart Subscription Control",
        description: "Built-in Razorpay integration for easy subscription and billing — enabled by admin.",
      },
      analytics: {
        title: "Live Analytics Dashboard",
        description: "Admins get real-time revenue, flock performance, and AI usage insights through interactive Recharts graphs.",
      },
    },
    pricing: {
        title: "Flexible Plans for Every Need",
        subtitle: "Start free, grow smart — choose a plan when you're ready.",
        free_plan: "Free Plan",
        free_plan_price: "INR 0",
        free_plan_period: "for basic needs",
        farmer_plan: "Farmer Plan",
        farmer_plan_price: "INR 199",
        dealer_plan: "Dealer Plan",
        dealer_plan_price: "INR 499",
        plan_period: "per month",
        free_plan_cta: "Continue with Free",
        farmer_plan_cta: "Choose Farmer Plan",
        dealer_plan_cta: "Choose Dealer Plan",
    },
    testimonials: {
      title: "What Our Users Say",
      subtitle: "Real stories from people who trust PoultryMitra.",
      farmer_role: "Farmer",
      farmer_quote: "PoultryMitra has increased my farm's productivity. Now I can monitor everything from my mobile!",
      dealer_role: "Dealer",
      dealer_quote: "Answering farmers' questions is now much easier with the AI Chat.",
      admin_role: "Admin",
      admin_quote: "The Admin Dashboard gives me control over the entire network — data, analytics, everything.",
    },
    cta: {
      title: "Join PoultryMitra Today",
      subtitle: "Bring intelligence and automation to your poultry business.",
      button: "Start Free Trial",
    },
    footer: {
        about: "About PoultryMitra",
        terms: "Terms & Conditions",
        privacy: "Privacy Policy",
        contact: "Contact Us",
        copyright: "© 2025 PoultryMitra. All rights reserved.",
    },
    sidebar_settings: "Settings",
    sidebar_logout: "Logout",
    login: {
        title: "Welcome to PoultryMitra",
        subtitle: "The trusted companion for smart poultry management",
        illustration_subtitle: "A complete poultry ecosystem — from hatchery to market, powered by intelligence.",
        tab: "Login",
        email_phone_label: "Email or Phone",
        email_phone_placeholder: "you@example.com",
        email_phone_hint: "Enter the email or phone number you used to register.",
        password_label: "Password",
        forgot_password: "Forgot Password?",
        login_as_farmer: "Login as Farmer",
        login_as_dealer: "Login as Dealer",
        admin_login: "Admin Login",
    },
    signup: {
        tab: "Sign Up",
        fullname_label: "Full Name",
        fullname_placeholder: "e.g. Ravi Kumar",
        fullname_hint: "Enter your full name as per your records.",
        email_label: "Email Address",
        email_placeholder: "you@example.com",
        email_hint: "A valid email for communication and login.",
        phone_label: "Phone Number",
        phone_placeholder: "+91 98765 43210",
        phone_hint: "Your 10-digit mobile number.",
        password_label: "Create Password",
        password_hint: "Must be at least 8 characters long.",
        signup_as_farmer: "Sign up as Farmer",
        signup_as_dealer: "Sign up as Dealer",
        terms_prefix: "By signing up, you agree to our",
        terms_link: "Terms of Service",
        privacy_link: "Privacy Policy",
    }
  },
  hi: {
    nav: {
      home: "मुखपृष्ठ",
      features: "विशेषताएं",
      pricing: "मूल्य योजना",
      ai_chat: "एआई चैट",
      contact: "संपर्क करें",
      login: "लॉगिन",
      signup: "पंजीकरण करें",
    },
    "change_language": "भाषा बदलें",
    "toggle_theme": "थीम बदलें",
    hero: {
        title: "एआई के साथ स्मार्ट पोल्ट्री प्रबंधन",
        subtitle: "किसानों, डीलरों और एडमिन को झुंड, बिक्री और अंतर्दृष्टि का प्रबंधन करने के लिए सशक्त बनाना - सब कुछ एक शक्तिशाली डैशबोर्ड में।",
        get_started: "मुफ्त में शुरू करें",
        watch_demo: "डेमो देखें",
    },
    features: {
        title: "पोल्ट्रीमित्र क्यों चुनें?",
        subtitle: "हैचरी से बाजार तक, एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता द्वारा संचालित है।",
        aiChat: {
            title: "एआई असिस्टेंट सपोर्ट",
            description: "पोल्ट्री प्रबंधन, स्वास्थ्य टिप्स और बाजार की जानकारी पर तत्काल सहायता के लिए हमारे एआई सहायक के साथ हिंदी या अंग्रेजी में चैट करें।",
        },
        flockTracking: {
            title: "झुंड और फार्म ट्रैकिंग",
            description: "रीयल-टाइम अपडेट के साथ पक्षियों की वृद्धि, चारा उपयोग, स्वास्थ्य रिकॉर्ड और उत्पादकता की निगरानी करें।",
        },
        dealerManagement: {
            title: "डीलर और किसान नेटवर्क",
            description: "डीलर एक सुरक्षित फायरस्टोर डैशबोर्ड के माध्यम से अपने संबंधित किसानों, आदेशों और प्रदर्शन का आसानी से प्रबंधन कर सकते हैं।",
        },
        payments: {
            title: "स्मार्ट सब्सक्रिप्शन कंट्रोल",
            description: "आसान सदस्यता और बिलिंग के लिए अंतर्निहित रेजरपे एकीकरण - व्यवस्थापक द्वारा सक्षम।",
        },
        analytics: {
            title: "लाइव एनालिटिक्स डैशबोर्ड",
            description: "व्यवस्थापक इंटरैक्टिव रीचार्ट्स ग्राफ़ के माध्यम से रीयल-टाइम राजस्व, झुंड प्रदर्शन और एआई उपयोग अंतर्दृष्टि प्राप्त करते हैं।",
        },
    },
    pricing: {
        title: "हर जरूरत के लिए लचीली योजनाएं",
        subtitle: "मुफ्त शुरू करें, स्मार्ट बनें - जब आप तैयार हों तो एक योजना चुनें।",
        free_plan: "मुफ्त योजना",
        free_plan_price: "INR 0",
        free_plan_period: "बुनियादी जरूरतों के लिए",
        farmer_plan: "किसान योजना",
        farmer_plan_price: "INR 199",
        dealer_plan: "डीलर योजना",
        dealer_plan_price: "INR 499",
        plan_period: "प्रति माह",
        free_plan_cta: "मुफ्त में जारी रखें",
        farmer_plan_cta: "किसान योजना चुनें",
        dealer_plan_cta: "डीलर योजना चुनें",
    },
    testimonials: {
      title: "हमारे उपयोगकर्ता क्या कहते हैं",
      subtitle: "पोल्ट्रीमित्र पर भरोसा करने वाले लोगों की वास्तविक कहानियाँ।",
      farmer_role: "किसान",
      farmer_quote: "पोल्ट्रीमित्र ने मेरे फार्म की प्रोडक्टिविटी बढ़ाई है। अब सबकुछ मोबाइल से देख सकता हूँ!",
      dealer_role: "वितरक",
      dealer_quote: "AI Chat से अब किसानों के सवालों का जवाब देना बहुत आसान हो गया है।",
      admin_role: "प्रशासक",
      admin_quote: "एडमिन डैशबोर्ड मुझे पूरे नेटवर्क का नियंत्रण देता है — डेटा, एनालिटिक्स, सब कुछ।",
    },
    cta: {
      title: "आज ही पोल्ट्रीमित्र से जुड़ें",
      subtitle: "अपने पोल्ट्री व्यवसाय में बुद्धिमत्ता और स्वचालन लाएं।",
      button: "निःशुल्क परीक्षण शुरू करें",
    },
    footer: {
        about: "पोल्ट्रीमित्र के बारे में",
        terms: "नियम और शर्तें",
        privacy: "गोपनीयता नीति",
        contact: "हमसे संपर्क करें",
        copyright: "© 2025 पोल्ट्रीमित्र। सर्वाधिकार सुरक्षित।",
    },
    sidebar_settings: "सेटिंग्स",
    sidebar_logout: "लॉगआउट",
    login: {
        title: "पोल्ट्रीमित्र में आपका स्वागत है",
        subtitle: "स्मार्ट पोल्ट्री प्रबंधन का भरोसेमंद साथी",
        illustration_subtitle: "हैचरी से बाजार तक, एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता द्वारा संचालित है।",
        tab: "लॉगिन",
        email_phone_label: "ईमेल या फ़ोन",
        email_phone_placeholder: "आप@example.com",
        email_phone_hint: "पंजीकरण के लिए उपयोग किया गया ईमेल या फ़ोन नंबर दर्ज करें।",
        password_label: "पासवर्ड",
        forgot_password: "पासवर्ड भूल गए?",
        login_as_farmer: "किसान के रूप में लॉगिन करें",
        login_as_dealer: "डीलर के रूप में लॉगिन करें",
        admin_login: "एडमिन लॉगिन",
    },
    signup: {
        tab: "पंजीकरण करें",
        fullname_label: "पूरा नाम",
        fullname_placeholder: "उदा. रवि कुमार",
        fullname_hint: "अपने रिकॉर्ड के अनुसार पूरा नाम दर्ज करें।",
        email_label: "ईमेल पता",
        email_placeholder: "आप@example.com",
        email_hint: "संचार और लॉगिन के लिए एक वैध ईमेल।",
        phone_label: "फ़ोन नंबर",
        phone_placeholder: "+91 98765 43210",
        phone_hint: "आपका 10 अंकों का मोबाइल नंबर।",
        password_label: "पासवर्ड बनाएं",
        password_hint: "कम से कम 8 अक्षर का होना चाहिए।",
        signup_as_farmer: "किसान के रूप में साइन अप करें",
        signup_as_dealer: "डीलर के रूप में साइन अप करें",
        terms_prefix: "साइन अप करके, आप हमारी",
        terms_link: "सेवा की शर्तों",
        privacy_link: "गोपनीयता नीति",
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string): string => {
    const keys = key.split('.');
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
