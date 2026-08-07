import { createContext, useContext, useState } from "react";

// ─── Translation map ──────────────────────────────────────────────────────────
const translations = {
  en: {
    // Navbar
    searchPlaceholder: "Search products, brands…",
    allCategories: "All Categories",
    sort: "Sort",
    rating: "Rating",
    home: "Home",
    wishlist: "Wishlist",
    cart: "Cart",
    login: "Login",
    signup: "Signup",
    logout: "Logout",
    language: "Language",
    moreSettings: "More Settings",
    lowToHigh: "Low → High",
    highToLow: "High → Low",
    star4: "4★ & above",
    star3: "3★ & above",
    star2: "2★ & above",
    account: "Account",
    // Banner
    bannerLine1: "Best Deals on",
    bannerLine2: "Electronic Products",
    bannerSub: "Up to 40% off on top brands — Limited time offer",
    shopNow: "Shop Now",
    // CategoryBar
    catHome: "Home",
    catBeauty: "Beauty",
    catBooks: "Books",
    catElectronics: "Electronics",
    catFashion: "Fashion",
    catFurniture: "Furniture",
    catMobile: "Mobile",
    catSports: "Sports",
    // ProductCard
    inStock: "In Stock",
    off: "OFF",
    freeDelivery: "Free Delivery",
    addToWishlist: "Add to wishlist",
    removeFromWishlist: "Remove from wishlist",
  },

  hi: {
    searchPlaceholder: "उत्पाद, ब्रांड खोजें…",
    allCategories: "सभी श्रेणियाँ",
    sort: "क्रमबद्ध",
    rating: "रेटिंग",
    home: "होम",
    wishlist: "विशलिस्ट",
    cart: "कार्ट",
    login: "लॉगिन",
    signup: "साइनअप",
    logout: "लॉगआउट",
    language: "भाषा",
    moreSettings: "अधिक सेटिंग्स",
    lowToHigh: "कम → अधिक",
    highToLow: "अधिक → कम",
    star4: "4★ और ऊपर",
    star3: "3★ और ऊपर",
    star2: "2★ और ऊपर",
    account: "खाता",
    bannerLine1: "इलेक्ट्रॉनिक उत्पादों पर",
    bannerLine2: "सर्वोत्तम डील",
    bannerSub: "शीर्ष ब्रांडों पर 40% तक की छूट — सीमित समय का ऑफर",
    shopNow: "अभी खरीदें",
    catHome: "होम",
    catBeauty: "सौंदर्य",
    catBooks: "किताबें",
    catElectronics: "इलेक्ट्रॉनिक्स",
    catFashion: "फैशन",
    catFurniture: "फर्नीचर",
    catMobile: "मोबाइल",
    catSports: "खेल",
    inStock: "स्टॉक में है",
    off: "छूट",
    freeDelivery: "मुफ्त डिलीवरी",
    addToWishlist: "विशलिस्ट में जोड़ें",
    removeFromWishlist: "विशलिस्ट से हटाएं",
  },

  kn: {
    searchPlaceholder: "ಉತ್ಪನ್ನಗಳು, ಬ್ರ್ಯಾಂಡ್‌ಗಳನ್ನು ಹುಡುಕಿ…",
    allCategories: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
    sort: "ವಿಂಗಡಿಸು",
    rating: "ರೇಟಿಂಗ್",
    home: "ಮನೆ",
    wishlist: "ವಿಶ್‌ಲಿಸ್ಟ್",
    cart: "ಕಾರ್ಟ್",
    login: "ಲಾಗಿನ್",
    signup: "ಸೈನಪ್",
    logout: "ಲಾಗ್‌ಔಟ್",
    language: "ಭಾಷೆ",
    moreSettings: "ಹೆಚ್ಚಿನ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    lowToHigh: "ಕಡಿಮೆ → ಹೆಚ್ಚು",
    highToLow: "ಹೆಚ್ಚು → ಕಡಿಮೆ",
    star4: "4★ ಮತ್ತು ಮೇಲೆ",
    star3: "3★ ಮತ್ತು ಮೇಲೆ",
    star2: "2★ ಮತ್ತು ಮೇಲೆ",
    account: "ಖಾತೆ",
    bannerLine1: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಉತ್ಪನ್ನಗಳ ಮೇಲೆ",
    bannerLine2: "ಅತ್ಯುತ್ತಮ ಡೀಲ್‌ಗಳು",
    bannerSub: "ಪ್ರಮುಖ ಬ್ರ್ಯಾಂಡ್‌ಗಳಲ್ಲಿ 40% ವರೆಗೆ ರಿಯಾಯಿತಿ — ಸೀಮಿತ ಸಮಯದ ಆಫರ್",
    shopNow: "ಈಗ ಖರೀದಿಸಿ",
    catHome: "ಮನೆ",
    catBeauty: "ಸೌಂದರ್ಯ",
    catBooks: "ಪುಸ್ತಕಗಳು",
    catElectronics: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್",
    catFashion: "ಫ್ಯಾಶನ್",
    catFurniture: "ಪೀಠೋಪಕರಣ",
    catMobile: "ಮೊಬೈಲ್",
    catSports: "ಕ್ರೀಡೆ",
    inStock: "ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ",
    off: "ರಿಯಾಯಿತಿ",
    freeDelivery: "ಉಚಿತ ಡೆಲಿವರಿ",
    addToWishlist: "ವಿಶ್‌ಲಿಸ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    removeFromWishlist: "ವಿಶ್‌ಲಿಸ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಿ",
  },
};

// ─── Language option metadata ──────────────────────────────────────────────────
export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English",  flag: "🇬🇧", native: "English" },
  { code: "hi", label: "Hindi",    flag: "🇮🇳", native: "हिन्दी" },
  { code: "kn", label: "Kannada",  flag: "🇮🇳", native: "ಕನ್ನಡ" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("fc_lang") || "en"
  );

  const setLang = (code) => {
    setLangState(code);
    localStorage.setItem("fc_lang", code);
  };

  const t = translations[lang] ?? translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside <LanguageProvider>");
  return ctx;
}
