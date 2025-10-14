

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
      title: "Power Up Your Poultry Farm with AI",
      subtitle: "Helping farmers and dealers manage flocks, sales, and crucial insights – all on one powerful platform.",
      get_started: "Manage Your Farm",
      watch_demo: "See How It Works",
    },
    features: {
      title: "Why Choose PoultryMitra?",
      subtitle: "A complete poultry ecosystem — from farm to market, powered by intelligence.",
      aiChat: {
        title: "AI Assistant Support",
        description: "Get instant, expert advice on poultry management, health, and market trends by chatting with our AI assistant in Hindi or English.",
      },
      flockTracking: {
        title: "Flock & Farm Tracking",
        description: "Easily monitor bird growth, feed consumption, health records, and daily productivity with real-time updates.",
      },
      dealerManagement: {
        title: "Dealer & Farmer Network",
        description: "A dedicated dashboard for dealers to manage their connected farmers, orders, and business performance.",
      },
      payments: {
        title: "Smart Subscription Control",
        description: "Hassle-free subscription and billing management, all powered by our secure, integrated system.",
      },
      analytics: {
        title: "Live Analytics Dashboard",
        description: "Get real-time revenue, flock performance, and AI usage insights through simple, interactive charts and reports.",
      },
      monitoring: {
        title: "Real-time Farm Monitoring",
        description: "Receive live sensor data and critical alerts for temperature, humidity, and ammonia levels to prevent issues before they start.",
      }
    },
    pricing: {
        title: "Find the Perfect Plan for Your Business",
        subtitle: "Start for free and upgrade as you grow. Simple, transparent pricing.",
        free_plan: "Free Plan",
        free_plan_price: "₹0",
        free_plan_period: "for basic needs",
        farmer_plan: "Farmer Plan",
        farmer_plan_price: "₹199",
        dealer_plan: "Dealer Plan",
        dealer_plan_price: "₹499",
        plan_period: "per month",
        free_plan_cta: "Continue with Free",
        farmer_plan_cta: "Choose Farmer Plan",
        dealer_plan_cta: "Choose Dealer Plan",
        upgrade_plan: "Upgrade Plan",
    },
    testimonials: {
      title: "Trusted by Farmers and Dealers",
      subtitle: "Real stories from people building their business with PoultryMitra.",
      farmer_role: "Farmer, Maharashtra",
      farmer_quote: "PoultryMitra has transformed my farm's productivity. I can now monitor everything from my phone, which saves me time and money!",
      dealer_role: "Poultry Feed Dealer, Karnataka",
      dealer_quote: "Managing my farmer network and their orders has never been easier. The AI Chat is a fantastic tool for answering their questions quickly.",
    },
    cta: {
      title: "Ready to Grow Your Poultry Business?",
      subtitle: "Join hundreds of others who are bringing smart technology to their farms.",
      button: "Sign Up for Free",
    },
    footer: {
        about: "About Us",
        terms: "Terms of Service",
        privacy: "Privacy Policy",
        contact: "Contact",
        copyright: "© 2025 PoultryMitra. All rights reserved.",
    },
    sidebar_logout: "Logout",
    sidebar: {
      main: "Main",
      inventory_dealers: "Inventory & Dealers",
      ai_analytics: "AI & Analytics",
      market: "Market",
    },
    login: {
      welcome_title: "Welcome Back!",
      no_account: "Don't have an account?",
      register_here: "Register here",
      back_to_home: "Back to Home",
      farmer_title: "Login as a Farmer",
      farmer_description: "Access your farm management tools and AI assistant.",
      farmer_button: "Login as Farmer",
      dealer_title: "Login as a Dealer",
      dealer_description: "Manage your network, track sales, and grow your business.",
      dealer_button: "Login as Dealer",
      admin_title: "Admin Login",
      admin_description: "Access the central control panel.",
      admin_button: "Login as Admin",
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
      yes_unsuspend: "Yes, Unsuspend",
      saving: "Saving...",
      save_changes: "Save Changes",
    },
    dialog: {
        are_you_sure_title: "Are you sure?",
        logout_title: "Logout",
        logout_desc: "Are you sure you want to logout?",
        delete_user_desc: "This will permanently delete {name} and all their data. This action cannot be undone.",
        suspend_user_desc: "Are you sure you want to suspend {name}?",
        unsuspend_user_desc: "Are you sure you want to unsuspend {name}?",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back, {name}",
      connect_dealer: "Connect to a Dealer",
      stats: {
        live_birds: "Live Birds",
        live_birds_desc: "Total birds in active batches",
        mortality: "Overall Mortality",
        mortality_desc: "Across all active batches",
        feed_consumed: "Total Feed Consumed",
        feed_consumed_desc: "Across all active batches",
        fcr: "Average FCR",
        fcr_desc: "Feed Conversion Ratio",
        ai_summary: "AI Summary",
      },
      performance: {
        title: "Farm Performance",
        description: "Key metrics over the last 6 months.",
      },
      ai_suggestions: {
        title: "AI Suggestions",
        description: "Get recommendations to improve farm efficiency.",
      }
    },
    batches: {
      title: "My Batches",
    },
    ledger: {
      title: "Ledger",
    },
    inventory: {
      title: "Inventory",
      view_stock: "View Stock",
      add_purchase: "Add Purchase",
    },
    dealers: {
      title: "Dealers",
    },
    ai_chat: {
      title: "AI Chat",
    },
    biosecurity: {
      title: "Biosecurity",
    },
    analytics: {
      title: "Analytics",
    },
    feed_ai: {
      title: "Feed AI",
    },
    daily_rates: {
      title: "Market Rates",
    },
    plans: {
      premium: "Premium Plan",
      free: "Free Plan",
      pro: "PRO",
    },
    profile: {
      title: "My Profile",
      description: "Update your personal information and settings.",
      card_title: "Personal Information",
      card_description: "Keep your contact details up to date.",
      update_success_title: "Profile Updated",
      update_success_desc: "Your information has been successfully saved.",
      update_fail_desc: "Failed to update your profile.",
    },
    messages: {
      copied_title: "Copied!",
      copied_desc: "Your unique farm ID has been copied.",
      loading_ai_data: "Loading data for AI analysis...",
      add_batch_for_ai: "Add an active batch to get AI suggestions.",
      analytics_error: "Could not load analytics data.",
      authenticating: "Authenticating, please wait...",
      error: "Error",
      must_be_logged_in: "You must be logged in to perform this action.",
      loading: "Loading...",
      loading_users: "Loading users...",
      no_users_found: "No users found.",
    },
    labels: {
      full_name: "Full Name",
      mobile_number: "Mobile Number",
      pincode: "PIN Code",
      date_joined: "Date Joined",
      user_id: "User ID",
      subscription_plan: "Subscription Plan",
      next_billing_date: "Next Billing Date",
      reason: "Reason",
      please_specify: "Please specify",
    },
    placeholders: {
      your_name: "Your full name",
      select_reason: "Select a reason",
      provide_reason: "Provide a detailed reason...",
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
        title: "AI की शक्ति से अपने पोल्ट्री फार्म को आगे बढ़ाएं",
        subtitle: "किसानों और डीलरों को झुंड, बिक्री और महत्वपूर्ण जानकारी का प्रबंधन करने में मदद करना - सब कुछ एक ही शक्तिशाली प्लेटफॉर्म पर।",
        get_started: "अपना फार्म प्रबंधित करें",
        watch_demo: "यह कैसे काम करता है देखें",
    },
    features: {
        title: "पोल्ट्रीमित्र क्यों चुनें?",
        subtitle: "फार्म से बाज़ार तक एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता से संचालित है।",
        aiChat: {
            title: "एआई असिस्टेंट सपोर्ट",
            description: "पोल्ट्री प्रबंधन, स्वास्थ्य और बाजार के रुझानों पर तुरंत, विशेषज्ञ सलाह के लिए हमारे एआई सहायक से हिंदी या अंग्रेजी में चैट करें।",
        },
        flockTracking: {
            title: "झुंड और फार्म ट्रैकिंग",
            description: "रीयल-टाइम अपडेट के साथ पक्षियों की वृद्धि, चारा खपत, स्वास्थ्य रिकॉर्ड और दैनिक उत्पादकता की आसानी से निगरानी करें।",
        },
        dealerManagement: {
            title: "डीलर और किसान नेटवर्क",
            description: "डीलरों के लिए अपने जुड़े हुए किसानों, आदेशों और व्यावसायिक प्रदर्शन का प्रबंधन करने के लिए एक समर्पित डैशबोर्ड।",
        },
        payments: {
            title: "स्मार्ट सब्सक्रिप्शन नियंत्रण",
            description: "परेशानी मुक्त सदस्यता और बिलिंग प्रबंधन, सब कुछ हमारे सुरक्षित, एकीकृत प्रणाली द्वारा संचालित है।",
        },
        analytics: {
            title: "लाइव एनालिटिक्स डैशबोर्ड",
            description: "सरल, इंटरैक्टिव चार्ट और रिपोर्ट के माध्यम से रीयल-टाइम राजस्व, झुंड प्रदर्शन और एआई उपयोग अंतर्दृष्टि प्राप्त करें।",
        },
        monitoring: {
            title: "रीयल-टाइम फार्म मॉनिटरिंग",
            description: "समस्याओं को शुरू होने से पहले रोकने के लिए तापमान, आर्द्रता और अमोनिया के स्तर के लिए लाइव सेंसर डेटा और महत्वपूर्ण अलर्ट प्राप्त करें।",
        }
    },
    pricing: {
        title: "अपने व्यवसाय के लिए सही योजना खोजें",
        subtitle: "मुफ्त में शुरू करें और जैसे-जैसे आप बढ़ते हैं, अपग्रेड करें। सरल, पारदर्शी मूल्य निर्धारण।",
        free_plan: "मुफ्त योजना",
        free_plan_price: "₹0",
        free_plan_period: "बुनियादी जरूरतों के लिए",
        farmer_plan: "किसान योजना",
        farmer_plan_price: "₹199",
        dealer_plan: "डीलर योजना",
        dealer_plan_price: "₹499",
        plan_period: "प्रति माह",
        free_plan_cta: "मुफ्त में जारी रखें",
        farmer_plan_cta: "किसान योजना चुनें",
        dealer_plan_cta: "डीलर योजना चुनें",
        upgrade_plan: "योजना अपग्रेड करें",
    },
    testimonials: {
      title: "किसानों और डीलरों द्वारा विश्वसनीय",
      subtitle: "पोल्ट्रीमित्र के साथ अपना व्यवसाय बनाने वाले लोगों की वास्तविक कहानियाँ।",
      farmer_role: "किसान, महाराष्ट्र",
      farmer_quote: "पोल्ट्रीमित्र ने मेरे फार्म की उत्पादकता बदल दी है। मैं अब अपने फोन से सब कुछ मॉनिटर कर सकता हूं, जिससे मेरा समय और पैसा बचता है!",
      dealer_role: "पोल्ट्री फीड डीलर, कर्नाटक",
      dealer_quote: "मेरे किसान नेटवर्क और उनके ऑर्डर का प्रबंधन करना इतना आसान कभी नहीं रहा। एआई चैट उनके सवालों का तुरंत जवाब देने के लिए एक शानदार उपकरण है।",
    },
    cta: {
      title: "क्या आप अपना पोल्ट्री व्यवसाय बढ़ाने के लिए तैयार हैं?",
      subtitle: "उन सैकड़ों अन्य लोगों से जुड़ें जो अपने खेतों में स्मार्ट तकनीक ला रहे हैं।",
      button: "निःशुल्क पंजीकरण करें",
    },
    footer: {
        about: "हमारे बारे में",
        terms: "सेवा की शर्तें",
        privacy: "गोपनीयता नीति",
        contact: "संपर्क करें",
        copyright: "© 2025 पोल्ट्रीमित्र। सर्वाधिकार सुरक्षित।",
    },
    sidebar_logout: "लॉगआउट",
    sidebar: {
      main: "मुख्य",
      inventory_dealers: "इन्वेंटरी और डीलर",
      ai_analytics: "एआई और एनालिटिक्स",
      market: "बाजार",
    },
    login: {
      welcome_title: "वापस स्वागत है!",
      no_account: "कोई खाता नहीं है?",
      register_here: "यहां रजिस्टर करें",
      back_to_home: "होम पर वापस जाएं",
      farmer_title: "किसान के रूप में लॉग इन करें",
      farmer_description: "अपने फार्म प्रबंधन टूल और एआई सहायक तक पहुंचें।",
      farmer_button: "किसान के रूप में लॉग इन करें",
      dealer_title: "डीलर के रूप में लॉग इन करें",
      dealer_description: "अपने नेटवर्क का प्रबंधन करें, बिक्री ट्रैक करें और अपना व्यवसाय बढ़ाएं।",
      dealer_button: "डीलर के रूप में लॉग इन करें",
      admin_title: "एडमिन लॉग इन",
      admin_description: "केंद्रीय नियंत्रण कक्ष तक पहुंचें।",
      admin_button: "एडमिन के रूप में लॉग इन करें",
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
      yes_unsuspend: "हाँ, निलंबन हटाएं",
      saving: "सहेज रहा है...",
      save_changes: "परिवर्तन सहेजें",
    },
    dialog: {
        are_you_sure_title: "क्या आप निश्चित हैं?",
        logout_title: "लॉगआउट",
        logout_desc: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
        delete_user_desc: "यह {name} और उनके सभी डेटा को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती है।",
        suspend_user_desc: "क्या आप वाकई {name} को निलंबित करना चाहते हैं?",
        unsuspend_user_desc: "क्या आप वाकई {name} का निलंबन हटाना चाहते हैं?",
    },
    dashboard: {
      title: "डैशबोर्ड",
      welcome: "वापस स्वागत है, {name}",
      connect_dealer: "डीलर से जुड़ें",
       stats: {
        live_birds: "जीवित पक्षी",
        live_birds_desc: "सक्रिय बैचों में कुल पक्षी",
        mortality: "समग्र मृत्यु दर",
        mortality_desc: "सभी सक्रिय बैचों में",
        feed_consumed: "कुल चारा खपत",
        feed_consumed_desc: "सभी सक्रिय बैचों में",
        fcr: "औसत FCR",
        fcr_desc: "फ़ीड रूपांतरण अनुपात",
        ai_summary: "एआई सारांश",
      },
      performance: {
        title: "फार्म प्रदर्शन",
        description: "पिछले 6 महीनों के प्रमुख मेट्रिक्स।",
      },
      ai_suggestions: {
        title: "एआई सुझाव",
        description: "खेत की दक्षता में सुधार के लिए सिफारिशें प्राप्त करें।",
      },
    },
    batches: {
      title: "मेरे बैच",
    },
    ledger: {
      title: "लेजर",
    },
    inventory: {
      title: "इन्वेंटरी",
      view_stock: "स्टॉक देखें",
      add_purchase: "खरीद जोड़ें",
    },
    dealers: {
      title: "डीलर",
    },
    ai_chat: {
      title: "एआई चैट",
    },
    biosecurity: {
      title: "जैव सुरक्षा",
    },
    analytics: {
      title: "एनालिटिक्स",
    },
    feed_ai: {
      title: "फ़ीड एआई",
    },
    daily_rates: {
      title: "बाजार दरें",
    },
    plans: {
      premium: "प्रीमियम योजना",
      free: "मुफ्त योजना",
      pro: "प्रो",
    },
    profile: {
      title: "मेरी प्रोफाइल",
      description: "अपनी व्यक्तिगत जानकारी और सेटिंग्स अपडेट करें।",
      card_title: "व्यक्तिगत जानकारी",
      card_description: "अपने संपर्क विवरण को अद्यतित रखें।",
      update_success_title: "प्रोफ़ाइल अपडेट की गई",
      update_success_desc: "आपकी जानकारी सफलतापूर्वक सहेज ली गई है।",
      update_fail_desc: "आपकी प्रोफ़ाइल अपडेट करने में विफल।",
    },
    messages: {
      copied_title: "कॉपी किया गया!",
      copied_desc: "आपकी अनूठी फार्म आईडी कॉपी कर ली गई है।",
      loading_ai_data: "एआई विश्लेषण के लिए डेटा लोड हो रहा है...",
      add_batch_for_ai: "एआई सुझाव प्राप्त करने के लिए एक सक्रिय बैच जोड़ें।",
      analytics_error: "एनालिटिक्स डेटा लोड नहीं किया जा सका।",
      authenticating: "प्रमाणित किया जा रहा है, कृपया प्रतीक्षा करें...",
      error: "त्रुटि",
      must_be_logged_in: "यह क्रिया करने के लिए आपको लॉग इन होना चाहिए।",
      loading: "लोड हो रहा है...",
      loading_users: "उपयोगकर्ताओं को लोड किया जा रहा है...",
      no_users_found: "कोई उपयोगकर्ता नहीं मिला।",
    },
    labels: {
      full_name: "पूरा नाम",
      mobile_number: "मोबाइल नंबर",
      pincode: "पिन कोड",
      date_joined: "शामिल होने की तिथि",
      user_id: "उपयोगकर्ता आईडी",
      subscription_plan: "सदस्यता योजना",
      next_billing_date: "अगली बिलिंग तिथि",
      reason: "कारण",
      please_specify: "कृपया निर्दिष्ट करें",
    },
    placeholders: {
      your_name: "आपका पूरा नाम",
      select_reason: "एक कारण चुनें",
      provide_reason: "एक विस्तृत कारण प्रदान करें...",
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
        details_desc: "{name} के लिए व्यापक विवरण देखा जा रहा है।",
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
        title: "AI की शक्ति से अपने पोल्ट्री फार्म को आगे बढ़ाएं",
        subtitle: "किसानों और डीलरों को झुंड, बिक्री और महत्वपूर्ण जानकारी का प्रबंधन करने में मदद करना - सब कुछ एक ही शक्तिशाली प्लेटफॉर्म पर।",
        get_started: "अपना फार्म प्रबंधित करें",
        watch_demo: "यह कैसे काम करता है देखें",
    },
    features: {
        title: "पोल्ट्रीमित्र क्यों चुनें?",
        subtitle: "फार्म से बाज़ार तक एक संपूर्ण पोल्ट्री इकोसिस्टम, जो बुद्धिमत्ता से संचालित है।",
        aiChat: {
            title: "एआई असिस्टेंट सपोर्ट",
            description: "पोल्ट्री प्रबंधन, स्वास्थ्य और बाजार के रुझानों पर तुरंत, विशेषज्ञ सलाह के लिए हमारे एआई सहायक से हिंदी या अंग्रेजी में चैट करें।",
        },
        flockTracking: {
            title: "झुंड और फार्म ट्रैकिंग",
            description: "रीयल-टाइम अपडेट के साथ पक्षियों की वृद्धि, चारा खपत, स्वास्थ्य रिकॉर्ड और दैनिक उत्पादकता की आसानी से निगरानी करें।",
        },
        dealerManagement: {
            title: "डीलर और किसान नेटवर्क",
            description: "डीलरों के लिए अपने जुड़े हुए किसानों, आदेशों और व्यावसायिक प्रदर्शन का प्रबंधन करने के लिए एक समर्पित डैशबोर्ड।",
        },
        payments: {
            title: "स्मार्ट सब्सक्रिप्शन नियंत्रण",
            description: "परेशानी मुक्त सदस्यता और बिलिंग प्रबंधन, सब कुछ हमारे सुरक्षित, एकीकृत प्रणाली द्वारा संचालित है।",
        },
        analytics: {
            title: "लाइव एनालिटिक्स डैशबोर्ड",
            description: "सरल, इंटरैक्टिव चार्ट और रिपोर्ट के माध्यम से रीयल-टाइम राजस्व, झुंड प्रदर्शन और एआई उपयोग अंतर्दृष्टि प्राप्त करें।",
        },
        monitoring: {
            title: "रीयल-टाइम फार्म मॉनिटरिंग",
            description: "समस्याओं को शुरू होने से पहले रोकने के लिए तापमान, आर्द्रता और अमोनिया के स्तर के लिए लाइव सेंसर डेटा और महत्वपूर्ण अलर्ट प्राप्त करें।",
        }
    },
    pricing: {
        title: "अपने व्यवसाय के लिए सही योजना खोजें",
        subtitle: "मुफ्त में शुरू करें और जैसे-जैसे आप बढ़ते हैं, अपग्रेड करें। सरल, पारदर्शी मूल्य निर्धारण।",
        free_plan: "मुफ्त योजना",
        free_plan_price: "₹0",
        free_plan_period: "बुनियादी जरूरतों के लिए",
        farmer_plan: "किसान योजना",
        farmer_plan_price: "₹199",
        dealer_plan: "डीलर योजना",
        dealer_plan_price: "₹499",
        plan_period: "प्रति माह",
        free_plan_cta: "मुफ्त में जारी रखें",
        farmer_plan_cta: "किसान योजना चुनें",
        dealer_plan_cta: "डीलर योजना चुनें",
        upgrade_plan: "योजना अपग्रेड करें",
    },
    testimonials: {
      title: "किसानों और डीलरों द्वारा विश्वसनीय",
      subtitle: "पोल्ट्रीमित्र के साथ अपना व्यवसाय बनाने वाले लोगों की वास्तविक कहानियाँ।",
      farmer_role: "किसान, महाराष्ट्र",
      farmer_quote: "पोल्ट्रीमित्र ने मेरे फार्म की उत्पादकता बदल दी है। मैं अब अपने फोन से सब कुछ मॉनिटर कर सकता हूं, जिससे मेरा समय और पैसा बचता है!",
      dealer_role: "पोल्ट्री फीड डीलर, कर्नाटक",
      dealer_quote: "मेरे किसान नेटवर्क और उनके ऑर्डर का प्रबंधन करना इतना आसान कभी नहीं रहा। एआई चैट उनके सवालों का तुरंत जवाब देने के लिए एक शानदार उपकरण है।",
    },
    cta: {
      title: "क्या आप अपना पोल्ट्री व्यवसाय बढ़ाने के लिए तैयार हैं?",
      subtitle: "उन सैकड़ों अन्य लोगों से जुड़ें जो अपने खेतों में स्मार्ट तकनीक ला रहे हैं।",
      button: "निःशुल्क पंजीकरण करें",
    },
    footer: {
        about: "हमारे बारे में",
        terms: "सेवा की शर्तें",
        privacy: "गोपनीयता नीति",
        contact: "संपर्क करें",
        copyright: "© 2025 पोल्ट्रीमित्र। सर्वाधिकार सुरक्षित।",
    },
    sidebar_logout: "लॉगआउट",
    sidebar: {
      main: "मुख्य",
      inventory_dealers: "इन्वेंटरी और डीलर",
      ai_analytics: "एआई और एनालिटिक्स",
      market: "बाजार",
    },
    login: {
      welcome_title: "वापस स्वागत है!",
      no_account: "कोई खाता नहीं है?",
      register_here: "यहां रजिस्टर करें",
      back_to_home: "होम पर वापस जाएं",
      farmer_title: "किसान के रूप में लॉग इन करें",
      farmer_description: "अपने फार्म प्रबंधन टूल और एआई सहायक तक पहुंचें।",
      farmer_button: "किसान के रूप में लॉग इन करें",
      dealer_title: "डीलर के रूप में लॉग इन करें",
      dealer_description: "अपने नेटवर्क का प्रबंधन करें, बिक्री ट्रैक करें और अपना व्यवसाय बढ़ाएं।",
      dealer_button: "डीलर के रूप में लॉग इन करें",
      admin_title: "एडमिन लॉग इन",
      admin_description: "केंद्रीय नियंत्रण कक्ष तक पहुंचें।",
      admin_button: "एडमिन के रूप में लॉग इन करें",
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
      yes_unsuspend: "हाँ, निलंबन हटाएं",
      saving: "सहेज रहा है...",
      save_changes: "परिवर्तन सहेजें",
    },
    dialog: {
        are_you_sure_title: "क्या आप निश्चित हैं?",
        logout_title: "लॉगआउट",
        logout_desc: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
        delete_user_desc: "यह {name} और उनके सभी डेटा को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती है।",
        suspend_user_desc: "क्या आप वाकई {name} को निलंबित करना चाहते हैं?",
        unsuspend_user_desc: "क्या आप वाकई {name} का निलंबन हटाना चाहते हैं?",
    },
    dashboard: {
      title: "डैशबोर्ड",
      welcome: "वापस स्वागत है, {name}",
      connect_dealer: "डीलर से जुड़ें",
       stats: {
        live_birds: "जीवित पक्षी",
        live_birds_desc: "सक्रिय बैचों में कुल पक्षी",
        mortality: "समग्र मृत्यु दर",
        mortality_desc: "सभी सक्रिय बैचों में",
        feed_consumed: "कुल चारा खपत",
        feed_consumed_desc: "सभी सक्रिय बैचों में",
        fcr: "औसत FCR",
        fcr_desc: "फ़ीड रूपांतरण अनुपात",
        ai_summary: "एआई सारांश",
      },
      performance: {
        title: "फार्म प्रदर्शन",
        description: "पिछले 6 महीनों के प्रमुख मेट्रिक्स।",
      },
      ai_suggestions: {
        title: "एआई सुझाव",
        description: "खेत की दक्षता में सुधार के लिए सिफारिशें प्राप्त करें।",
      },
    },
    batches: {
      title: "मेरे बैच",
    },
    ledger: {
      title: "लेजर",
    },
    inventory: {
      title: "इन्वेंटरी",
      view_stock: "स्टॉक देखें",
      add_purchase: "खरीद जोड़ें",
    },
    dealers: {
      title: "डीलर",
    },
    ai_chat: {
      title: "एआई चैट",
    },
    biosecurity: {
      title: "जैव सुरक्षा",
    },
    analytics: {
      title: "एनालिटिक्स",
    },
    feed_ai: {
      title: "फ़ीड एआई",
    },
    daily_rates: {
      title: "बाजार दरें",
    },
    plans: {
      premium: "प्रीमियम योजना",
      free: "मुफ्त योजना",
      pro: "प्रो",
    },
    profile: {
      title: "मेरी प्रोफाइल",
      description: "अपनी व्यक्तिगत जानकारी और सेटिंग्स अपडेट करें।",
      card_title: "व्यक्तिगत जानकारी",
      card_description: "अपने संपर्क विवरण को अद्यतित रखें।",
      update_success_title: "प्रोफ़ाइल अपडेट की गई",
      update_success_desc: "आपकी जानकारी सफलतापूर्वक सहेज ली गई है।",
      update_fail_desc: "आपकी प्रोफ़ाइल अपडेट करने में विफल।",
    },
    messages: {
      copied_title: "कॉपी किया गया!",
      copied_desc: "आपकी अनूठी फार्म आईडी कॉपी कर ली गई है।",
      loading_ai_data: "एआई विश्लेषण के लिए डेटा लोड हो रहा है...",
      add_batch_for_ai: "एआई सुझाव प्राप्त करने के लिए एक सक्रिय बैच जोड़ें।",
      analytics_error: "एनालिटिक्स डेटा लोड नहीं किया जा सका।",
      authenticating: "प्रमाणित किया जा रहा है, कृपया प्रतीक्षा करें...",
      error: "त्रुटि",
      must_be_logged_in: "यह क्रिया करने के लिए आपको लॉग इन होना चाहिए।",
      loading: "लोड हो रहा है...",
      loading_users: "उपयोगकर्ताओं को लोड किया जा रहा है...",
      no_users_found: "कोई उपयोगकर्ता नहीं मिला।",
    },
    labels: {
      full_name: "पूरा नाम",
      mobile_number: "मोबाइल नंबर",
      pincode: "पिन कोड",
      date_joined: "शामिल होने की तिथि",
      user_id: "उपयोगकर्ता आईडी",
      subscription_plan: "सदस्यता योजना",
      next_billing_date: "अगली बिलिंग तिथि",
      reason: "कारण",
      please_specify: "कृपया निर्दिष्ट करें",
    },
    placeholders: {
      your_name: "आपका पूरा नाम",
      select_reason: "एक कारण चुनें",
      provide_reason: "एक विस्तृत कारण प्रदान करें...",
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
        details_desc: "{name} के लिए व्यापक विवरण देखा जा रहा है।",
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
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

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

    

    