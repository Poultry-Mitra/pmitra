

"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

type Language = "en" | "hi";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
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
    change_language: "Change Language",
    toggle_theme: "Toggle Theme",
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
      monitoring: {
        title: "Real-time Farm Monitoring",
        description: "Get live sensor data and critical alerts for temperature, humidity, and ammonia levels to prevent issues before they start.",
      }
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
      welcome_title: "Welcome to PoultryMitra",
      welcome_subtitle: "Choose your login type to continue",
      farmer_title: "Farmer Login",
      farmer_description: "Access farm management tools, track expenses, monitor crops, and more.",
      farmer_button: "Continue as Farmer",
      dealer_title: "Dealer Login",
      dealer_description: "Manage orders, customers, products, and see market rates.",
      dealer_button: "Continue as Dealer",
      no_account: "Don't have an account?",
      register_here: "Register here",
      back_to_home: "Back to Home",
      admin_login: "Admin Login"
    },
    signup: {
      welcome_title: "Join PoultryMitra Today",
      welcome_subtitle: "Choose how you want to get started",
      farmer_title: "Sign up as a Farmer",
      farmer_description: "Get access to our powerful farm management tools and AI assistant.",
      farmer_button: "Register as Farmer",
      dealer_title: "Sign up as a Dealer",
      dealer_description: "Manage your network of farmers, track sales, and grow your business.",
      dealer_button: "Register as Dealer",
      have_account: "Already have an account?",
      login_here: "Login here",
    },
    actions: {
      logout: "Logout",
      cancel: "Cancel",
      view_details: "View Details",
      suspend: "Suspend",
      unsuspend: "Unsuspend",
      delete: "Delete",
      toggle_menu: "Toggle menu",
      yes_delete: "Yes, Delete",
      yes_suspend: "Yes, Suspend",
      yes_unsuspend: "Yes, Unsuspend"
    },
    dialog: {
        are_you_sure_title: "Are you sure?",
        logout_title: "Logout",
        logout_desc: "Are you sure you want to logout?",
        delete_user_desc: "This will permanently delete {name} and all their data. This action cannot be undone.",
        suspend_user_desc: "Are you sure you want to suspend {name}?",
        unsuspend_user_desc: "Are you sure you want to unsuspend {name}?",
    },
    admin: {
      dashboard: {
        title: "Admin Dashboard",
        description: "Welcome to the central control panel for PoultryMitra.",
        kpi_total_users: "Total Users",
        kpi_total_users_change: "+15 this month",
        kpi_total_revenue: "Total Revenue",
        kpi_total_revenue_change: "+12% from last month",
        kpi_ai_chats_used: "AI Chats Used (24h)",
        kpi_ai_chats_used_change: "30% increase",
        kpi_platform_activity: "Platform Activity",
        kpi_platform_activity_value: "High",
        kpi_platform_activity_change: "vs last week",
        revenue_analytics_title: "Revenue Analytics",
        revenue_analytics_desc: "Monthly subscription revenue overview.",
        send_notification_button: "Send Notification",
        add_user_button: "Add New User",
      },
      users: {
        title_recent: "Recent Users",
        description_recent: "The last 5 users who joined the platform.",
        title_farmer: "Farmer Management",
        description_farmer: "View, manage, and add new farmers.",
        title_dealer: "Dealer Management",
        description_dealer: "View, manage, and add new dealers.",
        add_user_button: "Add New User",
        reason_required_title: "Reason Required",
        reason_required_desc: "Please provide a reason for suspending the user.",
        reason_required_title_delete: "Reason Required",
        reason_required_desc_delete: "Please provide a reason for deleting the user.",
        user_suspended_title: "User Suspended",
        user_suspended_desc: "{name} has been suspended for: {reason}.",
        user_unsuspended_title: "User Unsuspended",
        user_unsuspended_desc: "{name} has been unsuspended.",
        user_deleted_title: "User Deleted",
        user_deleted_desc: "{name} has been permanently deleted.",
        delete_failed_title: "Deletion Failed",
        delete_failed_desc: "Could not delete the user.",
        details_title: "User Details",
        details_desc: "Viewing comprehensive details for {name}.",
      },
      farmers_page: {
        title: "All Farmers",
        description: "A complete list of all farmers on the platform."
      },
      dealers_page: {
        title: "All Dealers",
        description: "A complete list of all dealers on the platform."
      },
    },
    roles: {
      admin: "Admin",
      farmer: "Farmer",
      dealer: "Dealer",
    },
    status: {
      active: "Active",
      suspended: "Suspended",
      pending: "Pending",
    },
    tables: {
      user: "User",
      role: "Role",
      status: "Status",
      date_joined: "Date Joined",
      actions: "Actions",
    },
    tabs: {
      overview: "Overview",
      subscription: "Subscription",
      activity: "Activity",
    },
    labels: {
      date_joined: "Date Joined",
      user_id: "User ID",
      subscription_plan: "Subscription Plan",
      next_billing_date: "Next Billing Date",
      reason: "Reason",
      please_specify: "Please specify",
    },
    placeholders: {
      select_reason: "Select a reason",
      provide_reason: "Provide a detailed reason...",
    },
    reasons: {
      user_request: "User Request",
      payment_failed: "Payment Failed",
      policy_violation: "Policy Violation",
      spam_activity: "Spam Activity",
      other: "Other",
    },
    activity: {
      logged_in: "Logged in - 2 hours ago",
      viewed_dashboard: "Viewed dashboard - 1 hour ago",
      started_chat: "Started AI chat - 30 minutes ago",
    },
    messages: {
      loading_users: "Loading users...",
      no_users_found: "No users found.",
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
    change_language: "भाषा बदलें",
    toggle_theme: "थीम बदलें",
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
        monitoring: {
            title: "रीयल-टाइम फार्म मॉनिटरिंग",
            description: "समस्याओं को शुरू होने से पहले रोकने के लिए तापमान, आर्द्रता और अमोनिया के स्तर के लिए लाइव सेंसर डेटा और महत्वपूर्ण अलर्ट प्राप्त करें।",
        }
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
      welcome_title: "पोल्ट्री मित्र में आपका स्वागत है",
      welcome_subtitle: "जारी रखने के लिए अपना लॉगिन प्रकार चुनें",
      farmer_title: "किसान लॉगिन",
      farmer_description: "फार्म प्रबंधन उपकरण, ट्रैक खर्च, फसल की निगरानी और अधिक एक्सेस करें।",
      farmer_button: "किसान के रूप में जारी रखें",
      dealer_title: "डीलर लॉगिन",
      dealer_description: "ऑर्डर, ग्राहक, उत्पाद प्रबंधित करें और बाजार दरें देखें।",
      dealer_button: "डीलर के रूप में जारी रखें",
      no_account: "कोई खाता नहीं है?",
      register_here: "यहाँ रजिस्टर करें",
      back_to_home: "होम पर वापस जाएं",
      admin_login: "एडमिन लॉगिन"
    },
    signup: {
        welcome_title: "आज ही पोल्ट्री मित्र से जुड़ें",
        welcome_subtitle: "आप कैसे शुरू करना चाहते हैं, यह चुनें",
        farmer_title: "किसान के रूप में पंजीकरण करें",
        farmer_description: "हमारे शक्तिशाली फार्म प्रबंधन टूल और एआई सहायक तक पहुंच प्राप्त करें।",
        farmer_button: "किसान के रूप में पंजीकरण करें",
        dealer_title: "डीलर के रूप में पंजीकरण करें",
        dealer_description: "किसानों के अपने नेटवर्क को प्रबंधित करें, बिक्री ट्रैक करें और अपना व्यवसाय बढ़ाएं।",
        dealer_button: "डीलर के रूप में पंजीकरण करें",
        have_account: "पहले से ही एक खाता है?",
        login_here: "यहां लॉगिन करें",
    },
    actions: {
      logout: "लॉगआउट",
      cancel: "रद्द करें",
      view_details: "विवरण देखें",
      suspend: "निलंबित करें",
      unsuspend: "निलंबन हटाएं",
      delete: "हटाएं",
      toggle_menu: "मेन्यू टॉगल करें",
      yes_delete: "हाँ, हटाएं",
      yes_suspend: "हाँ, निलंबित करें",
      yes_unsuspend: "हाँ, निलंबन हटाएं"
    },
    dialog: {
        are_you_sure_title: "क्या आप निश्चित हैं?",
        logout_title: "लॉगआउट",
        logout_desc: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
        delete_user_desc: "यह {name} और उनके सभी डेटा को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती है।",
        suspend_user_desc: "क्या आप वाकई {name} को निलंबित करना चाहते हैं?",
        unsuspend_user_desc: "क्या आप वाकई {name} का निलंबन हटाना चाहते हैं?",
    },
    admin: {
      dashboard: {
        title: "एडमिन डैशबोर्ड",
        description: "पोल्ट्रीमित्र के केंद्रीय नियंत्रण कक्ष में आपका स्वागत है।",
        kpi_total_users: "कुल उपयोगकर्ता",
        kpi_total_users_change: "इस महीने +15",
        kpi_total_revenue: "कुल राजस्व",
        kpi_total_revenue_change: "पिछले महीने से +12%",
        kpi_ai_chats_used: "एआई चैट का उपयोग (24 घंटे)",
        kpi_ai_chats_used_change: "30% की वृद्धि",
        kpi_platform_activity: "प्लेटफ़ॉर्म गतिविधि",
        kpi_platform_activity_value: "उच्च",
        kpi_platform_activity_change: "पिछले सप्ताह की तुलना में",
        revenue_analytics_title: "राजस्व विश्लेषिकी",
        revenue_analytics_desc: "मासिक सदस्यता राजस्व का अवलोकन।",
        send_notification_button: "अधिसूचना भेजें",
        add_user_button: "नया उपयोगकर्ता जोड़ें",
      },
      users: {
        title_recent: "हाल के उपयोगकर्ता",
        description_recent: "प्लेटफ़ॉर्म से जुड़ने वाले अंतिम 5 उपयोगकर्ता।",
        title_farmer: "किसान प्रबंधन",
        description_farmer: "नए किसानों को देखें, प्रबंधित करें और जोड़ें।",
        title_dealer: "डीलर प्रबंधन",
        description_dealer: "नए डीलरों को देखें, प्रबंधित करें और जोड़ें।",
        add_user_button: "नया उपयोगकर्ता जोड़ें",
        reason_required_title: "कारण आवश्यक है",
        reason_required_desc: "कृपया उपयोगकर्ता को निलंबित करने का कारण बताएं।",
        reason_required_title_delete: "कारण आवश्यक है",
        reason_required_desc_delete: "कृपया उपयोगकर्ता को हटाने का कारण बताएं।",
        user_suspended_title: "उपयोगकर्ता निलंबित",
        user_suspended_desc: "{name} को इस कारण से निलंबित कर दिया गया है: {reason}।",
        user_unsuspended_title: "उपयोगकर्ता का निलंबन हटा",
        user_unsuspended_desc: "{name} का निलंबन हटा दिया गया है।",
        user_deleted_title: "उपयोगकर्ता हटाया गया",
        user_deleted_desc: "{name} को स्थायी रूप से हटा दिया गया है।",
        delete_failed_title: "हटाने में विफल",
        delete_failed_desc: "उपयोगकर्ता को हटाया नहीं जा सका।",
        details_title: "उपयोगकर्ता विवरण",
        details_desc: "{name} के लिए व्यापक विवरण देखना।",
      },
      farmers_page: {
        title: "सभी किसान",
        description: "मंच पर सभी किसानों की पूरी सूची।"
      },
      dealers_page: {
        title: "सभी डीलर",
        description: "मंच पर सभी डीलरों की पूरी सूची।"
      },
    },
    roles: {
      admin: "एडमिन",
      farmer: "किसान",
      dealer: "डीलर",
    },
    status: {
      active: "सक्रिय",
      suspended: "निलंबित",
      pending: "लंबित",
    },
    tables: {
      user: "उपयोगकर्ता",
      role: "भूमिका",
      status: "स्थिति",
      date_joined: "शामिल होने की तिथि",
      actions: "क्रियाएँ",
    },
    tabs: {
      overview: "अवलोकन",
      subscription: "सदस्यता",
      activity: "गतिविधि",
    },
    labels: {
      date_joined: "शामिल होने की तिथि",
      user_id: "उपयोगकर्ता आईडी",
      subscription_plan: "सदस्यता योजना",
      next_billing_date: "अगली बिलिंग तिथि",
      reason: "कारण",
      please_specify: "कृपया निर्दिष्ट करें",
    },
    placeholders: {
      select_reason: "एक कारण चुनें",
      provide_reason: "एक विस्तृत कारण प्रदान करें...",
    },
    reasons: {
      user_request: "उपयोगकर्ता अनुरोध",
      payment_failed: "भुगतान विफल",
      policy_violation: "नीति का उल्लंघन",
      spam_activity: "स्पैम गतिविधि",
      other: "अन्य",
    },
    activity: {
      logged_in: "2 घंटे पहले लॉग इन किया",
      viewed_dashboard: "1 घंटा पहले डैशबोर्ड देखा",
      started_chat: "30 मिनट पहले एआई चैट शुरू की",
    },
    messages: {
      loading: "लोड हो रहा है...",
      loading_users: "उपयोगकर्ताओं को लोड किया जा रहा है...",
      no_users_found: "कोई उपयोगकर्ता नहीं मिला।",
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("hi");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string, options?: { [key: string]: string | number }): string => {
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
        result = fallbackResult;
        break;
      }
    }
    
    let finalResult = typeof result === 'string' ? result : key;

    if (options) {
      Object.keys(options).forEach(optKey => {
        finalResult = finalResult.replace(`{${optKey}}`, String(options[optKey]));
      });
    }

    return finalResult;
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
