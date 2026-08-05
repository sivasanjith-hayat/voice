import type { Language } from './types';

export type { Language };

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.chat': 'AI Assistant',
  'nav.knowledge': 'Knowledge Base',
  'nav.map': 'Campus Map',
  'nav.events': 'Events',
  'nav.dashboard': 'Dashboard',
  'nav.admin': 'Admin',
  'nav.signin': 'Sign In',
  'nav.signup': 'Sign Up',
  'nav.signout': 'Sign Out',
  'hero.tagline': 'Your Campus. One Conversation Away.',
  'hero.subtitle': 'Ask anything about admissions, academics, placements, facilities, and campus life — by voice or text, in 8 languages.',
  'hero.cta': 'Start Conversation',
  'hero.cta.voice': 'Tap to Speak',
  'home.popular': 'Popular Questions',
  'home.quick': 'Quick Actions',
  'home.events': 'Upcoming Events',
  'home.announcements': 'Announcements',
  'home.emergency': 'Emergency Contacts',
  'chat.placeholder': 'Ask me anything about the campus…',
  'chat.thinking': 'Searching knowledge base…',
  'chat.sources': 'Sources',
  'chat.confidence': 'Confidence',
  'chat.bookmark': 'Bookmark',
  'chat.copy': 'Copy',
  'chat.share': 'Share',
  'chat.new': 'New Conversation',
  'chat.history': 'Conversation History',
  'chat.empty': 'Start a conversation by asking a question below.',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.readmore': 'Read more',
  'common.register': 'Register',
  'common.viewall': 'View all',
};

const ta: Dict = {
  'nav.home': 'முகப்பு',
  'nav.chat': 'AI உதவியாளர்',
  'nav.knowledge': 'அறிவு தளம்',
  'nav.map': 'வளாக வரைபடம்',
  'nav.events': 'நிகழ்வுகள்',
  'nav.dashboard': 'டாஷ்போர்டு',
  'nav.admin': 'நிர்வாகம்',
  'nav.signin': 'உள்நுழை',
  'nav.signup': 'பதிவு செய்',
  'nav.signout': 'வெளியேறு',
  'hero.tagline': 'உங்கள் வளாகம். ஒரு உரையாடலில்.',
  'hero.subtitle': 'சேர்ப்பு, கல்வி, வேலைவாய்ப்பு, வசதிகள் பற்றி கேளுங்கள் — குரல் அல்லது உரையில்.',
  'hero.cta': 'உரையாடலைத் தொடங்கு',
  'hero.cta.voice': 'பேச தட்டு',
  'home.popular': 'பிரபலமான கேள்விகள்',
  'home.quick': 'விரைவு செயல்கள்',
  'home.events': 'வரவிரும் நிகழ்வுகள்',
  'home.announcements': 'அறிவிப்புகள்',
  'home.emergency': 'அவசர தொடர்புகள்',
  'chat.placeholder': 'வளாகத்தைப் பற்றி ஏதேனும் கேளுங்கள்…',
  'chat.thinking': 'அறிவு தளத்தில் தேடுகிறது…',
  'chat.sources': 'ஆதாரங்கள்',
  'chat.confidence': 'நம்பகத்தன்மை',
  'chat.bookmark': 'புக்மார்க்',
  'chat.copy': 'நகலெடு',
  'chat.share': 'பகிர்',
  'chat.new': 'புதிய உரையாடல்',
  'chat.history': 'உரையாடல் வரலாறு',
  'chat.empty': 'கீழே ஒரு கேள்வியைக் கேட்டு உரையாடலைத் தொடங்கவும்.',
  'common.search': 'தேடு',
  'common.filter': 'வடிகட்டு',
  'common.all': 'அனைத்தும்',
  'common.readmore': 'மேலும் படி',
  'common.register': 'பதிவு செய்',
  'common.viewall': 'அனைத்தையும் காண்க',
};

const hi: Dict = {
  'nav.home': 'होम',
  'nav.chat': 'AI सहायक',
  'nav.knowledge': 'ज्ञान आधार',
  'nav.map': 'कैंपस मानचित्र',
  'nav.events': 'कार्यक्रम',
  'nav.dashboard': 'डैशबोर्ड',
  'nav.admin': 'व्यवस्थापक',
  'nav.signin': 'साइन इन',
  'nav.signup': 'साइन अप',
  'nav.signout': 'साइन आउट',
  'hero.tagline': 'आपका कैंपस। एक बातचीत की दूरी पर।',
  'hero.subtitle': 'प्रवेश, शिक्षा, नौकरी, सुविधाओं के बारे में पूछें — आवाज़ या टेक्स्ट में।',
  'hero.cta': 'बातचीत शुरू करें',
  'hero.cta.voice': 'बोलने के लिए टैप करें',
  'home.popular': 'लोकप्रिय प्रश्न',
  'home.quick': 'त्वरित क्रियाएँ',
  'home.events': 'आगामी कार्यक्रम',
  'home.announcements': 'घोषणाएँ',
  'home.emergency': 'आपातकालीन संपर्क',
  'chat.placeholder': 'कैंपस के बारे में कुछ भी पूछें…',
  'chat.thinking': 'ज्ञान आधार खोज रहे हैं…',
  'chat.sources': 'स्रोत',
  'chat.confidence': 'विश्वास',
  'chat.bookmark': 'बुकमार्क',
  'chat.copy': 'कॉपी',
  'chat.share': 'साझा करें',
  'chat.new': 'नई बातचीत',
  'chat.history': 'बातचीत इतिहास',
  'chat.empty': 'नीचे एक प्रश्न पूछकर बातचीत शुरू करें।',
  'common.search': 'खोज',
  'common.filter': 'फ़िल्टर',
  'common.all': 'सभी',
  'common.readmore': 'और पढ़ें',
  'common.register': 'पंजीकरण',
  'common.viewall': 'सभी देखें',
};

const te: Dict = { ...en, 'hero.tagline': 'మీ క్యాంపస్. ఒక సంభాషణ దూరంలో.', 'hero.cta': 'సంభాషణ ప్రారంభించండి' };
const ml: Dict = { ...en, 'hero.tagline': 'നിങ്ങളുടെ കാമ്പസ്. ഒരു സംഭാഷണത്തിന്റെ അകലെ.', 'hero.cta': 'സംഭാഷണം ആരംഭിക്കുക' };
const kn: Dict = { ...en, 'hero.tagline': 'ನಿಮ್ಮ ಕ್ಯಾಂಪಸ್. ಒಂದು ಸಂಭಾಷಣೆಯ ದೂರದಲ್ಲಿ.', 'hero.cta': 'ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ' };
const fr: Dict = {
  ...en,
  'hero.tagline': 'Votre campus. À une conversation près.',
  'hero.subtitle': 'Demandez tout sur les admissions, les études, les stages et les installations — par voix ou texte.',
  'hero.cta': 'Commencer la conversation',
  'nav.home': 'Accueil', 'nav.chat': 'Assistant IA', 'nav.knowledge': 'Base de connaissances',
  'nav.map': 'Plan du campus', 'nav.events': 'Événements', 'nav.dashboard': 'Tableau de bord',
};
const ar: Dict = {
  ...en,
  'hero.tagline': 'حرمك الجامعي. على بعد محادثة واحدة.',
  'hero.subtitle': 'اسأل عن أي شيء متعلق بالقبول والدراسة والوظائف والمرافق — بالصوت أو النص.',
  'hero.cta': 'ابدأ المحادثة',
  'nav.home': 'الرئيسية', 'nav.chat': 'المساعد الذكي', 'nav.knowledge': 'قاعدة المعرفة',
  'nav.map': 'خريطة الحرم', 'nav.events': 'الفعاليات', 'nav.dashboard': 'لوحة التحكم',
};

const dictionaries: Record<Language, Dict> = { en, ta, hi, te, ml, kn, fr, ar };

export const languageNames: Record<Language, string> = {
  en: 'English',
  ta: 'தமிழ்',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  kn: 'ಕನ್ನಡ',
  fr: 'Français',
  ar: 'العربية',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  ta: '🇮🇳',
  hi: '🇮🇳',
  te: '🇮🇳',
  ml: '🇮🇳',
  kn: '🇮🇳',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

export function translate(lang: Language, key: string): string {
  return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}
