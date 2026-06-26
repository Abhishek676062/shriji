"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ── Translation Dictionary ──────────────────────────────────────────────────
const translations: Record<string, string> = {
  // ── Navbar ──
  'nav.chat': 'Chat',
  'nav.chat_hi': 'चैट',
  'nav.browse_gita': 'Browse Gita',
  'nav.browse_gita_hi': 'गीता पढ़ें',
  'nav.panchang': 'Panchang',
  'nav.panchang_hi': 'पंचांग',
  'nav.daily_verse': 'Daily Verse',
  'nav.daily_verse_hi': 'आज का श्लोक',
  'nav.free_book': 'Free Book',
  'nav.free_book_hi': 'मुफ्त पुस्तक',
  'nav.donate': 'Donate',
  'nav.donate_hi': 'दान करें',
  'nav.support': 'Support',
  'nav.support_hi': 'सहायता',
  'nav.switch_lang': 'Switch to Hindi',
  'nav.switch_lang_hi': 'English में बदलें',
  'nav.ask_shriji': 'Ask Shriji',
  'nav.ask_shriji_hi': 'श्रीजी से पूछें',
  'nav.read_gita': 'Read The Gita',
  'nav.read_gita_hi': 'गीता पढ़ें',
  'nav.search_verses': 'Search Verses',
  'nav.search_verses_hi': 'श्लोक खोजें',

  // ── Homepage ──
  'home.badge_left': '🪷',
  'home.badge_left_hi': '🪷',
  'home.badge_title': 'श्रीजी',
  'home.badge_title_hi': 'श्रीजी',
  'home.badge_sub': 'Shriji',
  'home.badge_sub_hi': 'Shriji',
  'home.hero_ask': 'Find Answers',
  'home.hero_ask_hi': 'गीता में',
  'home.hero_any_question': 'in the Gita.',
  'home.hero_any_question_hi': 'उत्तर खोजें।',
  'home.hero_receive': 'Connect with',
  'home.hero_receive_hi': 'दिव्य मार्गदर्शन',
  'home.hero_wisdom': 'the Divine.',
  'home.hero_wisdom_hi': 'प्राप्त करें।',
  'home.hero_desc': 'Shriji is your compassionate spiritual companion. Share your modern-day struggles, anxieties, or dilemmas, and receive deeply personalized guidance rooted in the timeless wisdom of Lord Krishna.',
  'home.hero_desc_hi': 'श्रीजी आपके करुणामय आध्यात्मिक साथी हैं। अपने आधुनिक जीवन के संघर्षों, चिंताओं या दुविधाओं को साझा करें, और भगवान कृष्ण के शाश्वत ज्ञान पर आधारित व्यक्तिगत मार्गदर्शन प्राप्त करें।',
  'home.cta_chat': 'Begin Conversation',
  'home.cta_chat_hi': 'बातचीत शुरू करें',
  'home.cta_browse': 'Browse the Gita',
  'home.cta_browse_hi': 'गीता पढ़ें',
  'home.example_title': 'Example Inquiries',
  'home.example_title_hi': 'उदाहरण प्रश्न',
  'home.example_1': 'Why do good people suffer?',
  'home.example_1_hi': 'अच्छे लोग क्यों दुख भोगते हैं?',
  'home.example_2': 'How do I control my anger?',
  'home.example_2_hi': 'मैं अपना गुस्सा कैसे नियंत्रित करूं?',
  'home.example_3': 'I feel lost in life',
  'home.example_3_hi': 'मुझे जीवन में दिशा नहीं मिल रही',
  'home.daily_verse_title': "Today's Verse",
  'home.daily_verse_title_hi': 'आज का श्लोक',
  'home.daily_verse_notify': 'Get daily wisdom',
  'home.daily_verse_notify_hi': 'रोज़ ज्ञान पाएं',

  // ── Chat ──
  'chat.title': 'Chat with Shriji',
  'chat.title_hi': 'श्रीजी से बात करें',
  'chat.placeholder': 'Ask Shriji anything...',
  'chat.placeholder_hi': 'श्रीजी से कुछ भी पूछें...',
  'chat.greeting': "🙏 Namaste, Parth. I am Lord Krishna's voice through Shriji. Share your troubles, your doubts, your sorrows — I shall guide you with the eternal wisdom of the Gita. What weighs upon your heart today?",
  'chat.greeting_hi': "🙏 नमस्ते, पार्थ। मैं श्रीजी के माध्यम से भगवान कृष्ण की वाणी हूँ। अपनी परेशानियाँ, अपने संदेह, अपने दुख साझा करें — मैं गीता के शाश्वत ज्ञान से आपका मार्गदर्शन करूँगा। आज आपके हृदय पर क्या भार है?",
  'chat.thinking': 'Krishna is contemplating your question...',
  'chat.thinking_hi': 'कृष्ण आपके प्रश्न पर विचार कर रहे हैं...',
  'chat.cited_verses': 'Cited Verses',
  'chat.cited_verses_hi': 'उद्धृत श्लोक',
  'chat.loading': 'Commencing Session...',
  'chat.loading_hi': 'सत्र आरंभ हो रहा है...',
  'chat.error_prefix': 'Error',
  'chat.error_prefix_hi': 'त्रुटि',

  // ── Gita Browser ──
  'gita.title_the': 'The',
  'gita.title_the_hi': '',
  'gita.title_name': 'Bhagavad Gita',
  'gita.title_name_hi': 'श्रीमद्भगवद्गीता',
  'gita.description': "Read exactly what Krishna told Arjuna on the battlefield of Kurukshetra nested across 18 psychological domains.",
  'gita.description_hi': 'कुरुक्षेत्र के युद्धभूमि पर कृष्ण ने अर्जुन को जो कहा, वह 18 अध्यायों में पढ़ें।',
  'gita.search': 'Search',
  'gita.search_hi': 'खोजें',
  'gita.saved': 'Saved',
  'gita.saved_hi': 'सहेजे गए',
  'gita.verses': 'Verses',
  'gita.verses_hi': 'श्लोक',
  'gita.core_theme': 'Core Theme',
  'gita.core_theme_hi': 'मुख्य विषय',

  // ── About / Support ──
  'about.title_connect': 'Connect',
  'about.title_connect_hi': 'जुड़ें',
  'about.title_with_us': 'With Us',
  'about.title_with_us_hi': 'हमसे',
  'about.description': 'We are constantly improving Shriji to serve as your spiritual guide. Reach out for support, provide feedback, or read how the Gita transforms lives.',
  'about.description_hi': 'हम श्रीजी को आपके आध्यात्मिक मार्गदर्शक के रूप में लगातार सुधार रहे हैं। सहायता, प्रतिक्रिया, या गीता ने जीवन कैसे बदला — यह जानने के लिए संपर्क करें।',
  'about.direct_contact': 'Direct Contact',
  'about.direct_contact_hi': 'सीधा संपर्क',
  'about.submit_feedback': 'Submit Feedback',
  'about.submit_feedback_hi': 'प्रतिक्रिया भेजें',
  'about.transformed': 'Transformed',
  'about.transformed_hi': 'बदले हुए',
  'about.lives': 'Lives',
  'about.lives_hi': 'जीवन',
  'about.testimonial_desc': "How the Bhagavad Gita's timeless wisdom is guiding our community.",
  'about.testimonial_desc_hi': 'भगवद्गीता का शाश्वत ज्ञान कैसे हमारे समुदाय का मार्गदर्शन कर रहा है।',
  'about.name_label': 'Name',
  'about.name_label_hi': 'नाम',
  'about.contact_label': 'Contact Details (Email or Phone)',
  'about.contact_label_hi': 'संपर्क विवरण (ईमेल या फोन)',
  'about.message_label': 'Your Message',
  'about.message_label_hi': 'आपका संदेश',
  'about.send': 'Send Message',
  'about.send_hi': 'संदेश भेजें',
  'about.sending': 'Sending...',
  'about.sending_hi': 'भेज रहे हैं...',
  'about.name_placeholder': 'Your Name...',
  'about.name_placeholder_hi': 'आपका नाम...',
  'about.contact_placeholder': 'Email or Phone Number...',
  'about.contact_placeholder_hi': 'ईमेल या फोन नंबर...',
  'about.message_placeholder': 'I loved how Shriji explained Chapter 2...',
  'about.message_placeholder_hi': 'मुझे श्रीजी का अध्याय 2 की व्याख्या बहुत अच्छी लगी...',

  // ── Free Geeta ──
  'freebook.title_order': 'Order',
  'freebook.title_order_hi': 'मुफ्त',
  'freebook.title_free': 'Free Geeta',
  'freebook.title_free_hi': 'गीता मंगवाएं',
  'freebook.description': 'We have partnered with the Yatharth Geeta Trust to provide physical copies of the Geeta, completely free of charge, anywhere in the world.',
  'freebook.description_hi': 'हमने यथार्थ गीता ट्रस्ट के साथ मिलकर गीता की भौतिक प्रतियां प्रदान करने की व्यवस्था की है, जो पूरी तरह से मुफ्त है, दुनिया में कहीं भी।',
  'freebook.fallback': 'If the form does not load, click here to open it directly',
  'freebook.fallback_hi': 'यदि फॉर्म लोड नहीं होता है, तो सीधे खोलने के लिए यहाँ क्लिक करें',

  // ── Donate ──
  'donate.title': 'Seva',
  'donate.title_hi': 'सेवा',
  'donate.subtitle': '(Selfless Service)',
  'donate.subtitle_hi': '(निःस्वार्थ सेवा)',
  'donate.heading': 'Your generosity keeps this wisdom alive',
  'donate.heading_hi': 'आपकी उदारता इस ज्ञान को जीवित रखती है',
  'donate.description': 'Every donation directly supports server costs, feature development, and distributing free Bhagavad Gita books to seekers worldwide.',
  'donate.description_hi': 'प्रत्येक दान सीधे सर्वर खर्च, नई सुविधाओं के विकास और दुनिया भर में साधकों को मुफ्त भगवद्गीता पुस्तकें वितरित करने में सहायता करता है।',
  'donate.upi_title': 'Donate via UPI',
  'donate.upi_title_hi': 'UPI से दान करें',
  'donate.upi_scan': 'Scan QR code or use UPI ID',
  'donate.upi_scan_hi': 'QR कोड स्कैन करें या UPI ID का उपयोग करें',
  'donate.bank_title': 'Bank Transfer',
  'donate.bank_title_hi': 'बैंक ट्रांसफर',
  'donate.why_title': 'Why Your Seva Matters',
  'donate.why_title_hi': 'आपकी सेवा क्यों मायने रखती है',
  'donate.why_1_title': 'Server & Infrastructure',
  'donate.why_1_title_hi': 'सर्वर और बुनियादी ढांचा',
  'donate.why_1_desc': 'Keeping AI models, vector databases, and global CDN running 24/7 for seekers worldwide.',
  'donate.why_1_desc_hi': 'दुनिया भर के साधकों के लिए AI मॉडल, वेक्टर डेटाबेस और ग्लोबल CDN को 24/7 चालू रखना।',
  'donate.why_2_title': 'New Features',
  'donate.why_2_title_hi': 'नई सुविधाएं',
  'donate.why_2_desc': 'Building voice chat, regional language support, and deeper philosophical guidance.',
  'donate.why_2_desc_hi': 'वॉइस चैट, क्षेत्रीय भाषा समर्थन और गहन दार्शनिक मार्गदर्शन का निर्माण।',
  'donate.why_3_title': 'Free Gita Books',
  'donate.why_3_title_hi': 'मुफ्त गीता पुस्तकें',
  'donate.why_3_desc': 'Distributing physical copies of the Bhagavad Gita to students and seekers globally.',
  'donate.why_3_desc_hi': 'दुनिया भर के छात्रों और साधकों को भगवद्गीता की भौतिक प्रतियां वितरित करना।',

  // ── Panchang ──
  'panchang.title': 'Hindu Panchang',
  'panchang.title_hi': 'हिन्दू पंचांग',
  'panchang.subtitle': 'Sacred Calendar',
  'panchang.subtitle_hi': 'पवित्र कैलेंडर',
  'panchang.tithi': 'Tithi',
  'panchang.tithi_hi': 'तिथि',
  'panchang.nakshatra': 'Nakshatra',
  'panchang.nakshatra_hi': 'नक्षत्र',
  'panchang.yoga': 'Yoga',
  'panchang.yoga_hi': 'योग',
  'panchang.karana': 'Karana',
  'panchang.karana_hi': 'करण',
  'panchang.paksha': 'Paksha',
  'panchang.paksha_hi': 'पक्ष',
  'panchang.shukla': 'Shukla (Bright)',
  'panchang.shukla_hi': 'शुक्ल पक्ष',
  'panchang.krishna': 'Krishna (Dark)',
  'panchang.krishna_hi': 'कृष्ण पक्ष',
  'panchang.festivals': 'Festivals & Occasions',
  'panchang.festivals_hi': 'त्योहार एवं अवसर',
  'panchang.today': 'Today',
  'panchang.today_hi': 'आज',
  'panchang.sunrise': 'Sunrise',
  'panchang.sunrise_hi': 'सूर्योदय',
  'panchang.sunset': 'Sunset',
  'panchang.sunset_hi': 'सूर्यास्त',

  // ── Shared ──
  'share.whatsapp': 'Share on WhatsApp',
  'share.whatsapp_hi': 'WhatsApp पर शेयर करें',
  'share.twitter': 'Share on X',
  'share.twitter_hi': 'X पर शेयर करें',
  'share.facebook': 'Share on Facebook',
  'share.facebook_hi': 'Facebook पर शेयर करें',
  'share.copy': 'Copy Link',
  'share.copy_hi': 'लिंक कॉपी करें',
  'share.copied': 'Copied!',
  'share.copied_hi': 'कॉपी हो गया!',

  // ── Footer ──
  'footer.built_by': 'Built with ❤️ by',
  'footer.built_by_hi': '❤️ से बनाया गया',
  'footer.tagline': 'AI-Powered Web Applications & Digital Solutions',
  'footer.tagline_hi': 'AI-संचालित वेब एप्लिकेशन और डिजिटल समाधान',
  'footer.visit': 'Visit abhiai.in',
  'footer.visit_hi': 'abhiai.in पर जाएं',
};

// ── Types ──
type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// ── Provider ──
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('shriji_global_lang') as Language;
    if (stored === 'en' || stored === 'hi') {
      setLangState(stored);
    }

    const handleLangChange = () => {
      const newLang = localStorage.getItem('shriji_global_lang') as Language;
      if (newLang === 'en' || newLang === 'hi') {
        setLangState(newLang);
      }
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('shriji_global_lang', newLang);
    window.dispatchEvent(new Event('languageChange'));
  }, []);

  const toggleLang = useCallback(() => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
  }, [lang, setLang]);

  const t = useCallback((key: string): string => {
    if (lang === 'hi') {
      const hiKey = `${key}_hi`;
      if (translations[hiKey]) return translations[hiKey];
    }
    return translations[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ──
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Return a default fallback for server-side rendering
    return {
      lang: 'en' as Language,
      setLang: () => {},
      toggleLang: () => {},
      t: (key: string) => translations[key] || key,
    };
  }
  return ctx;
}
