/**
 * Panchang data utilities — Tithi, Nakshatra, Festivals
 * Uses panchang-ts for highly accurate astronomical calculations.
 */
import { getDailyPanchang } from 'panchang-ts';

// Tithi names (30 tithis in a lunar month)
export const TITHI_NAMES = {
  en: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'],
  hi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या'],
};

export const NAKSHATRA_NAMES = {
  en: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
  hi: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती'],
};

export const YOGA_NAMES = {
  en: ['Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
  hi: ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'],
};

export const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
};

export const DAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
};

// Hindu festivals with Gregorian dates (2025-2027 curated)
interface Festival {
  date: string; // YYYY-MM-DD
  name_en: string;
  name_hi: string;
  type: 'major' | 'minor' | 'fast';
}

export const FESTIVALS: Festival[] = [
  // 2026
  { date: '2026-01-14', name_en: 'Makar Sankranti', name_hi: 'मकर संक्रांति', type: 'major' },
  { date: '2026-01-26', name_en: 'Republic Day', name_hi: 'गणतंत्र दिवस', type: 'major' },
  { date: '2026-02-17', name_en: 'Maha Shivaratri', name_hi: 'महा शिवरात्रि', type: 'major' },
  { date: '2026-03-03', name_en: 'Holi', name_hi: 'होली', type: 'major' },
  { date: '2026-03-10', name_en: 'Ugadi / Gudi Padwa', name_hi: 'उगादी / गुड़ी पड़वा', type: 'major' },
  { date: '2026-03-26', name_en: 'Ram Navami', name_hi: 'राम नवमी', type: 'major' },
  { date: '2026-04-02', name_en: 'Hanuman Jayanti', name_hi: 'हनुमान जयंती', type: 'major' },
  { date: '2026-04-14', name_en: 'Baisakhi', name_hi: 'बैसाखी', type: 'major' },
  { date: '2026-05-13', name_en: 'Buddha Purnima', name_hi: 'बुद्ध पूर्णिमा', type: 'major' },
  { date: '2026-06-23', name_en: 'Rath Yatra', name_hi: 'रथ यात्रा', type: 'major' },
  { date: '2026-07-07', name_en: 'Guru Purnima', name_hi: 'गुरु पूर्णिमा', type: 'major' },
  { date: '2026-08-15', name_en: 'Independence Day', name_hi: 'स्वतंत्रता दिवस', type: 'major' },
  { date: '2026-08-16', name_en: 'Janmashtami', name_hi: 'जन्माष्टमी', type: 'major' },
  { date: '2026-08-28', name_en: 'Raksha Bandhan', name_hi: 'रक्षा बंधन', type: 'major' },
  { date: '2026-08-26', name_en: 'Ganesh Chaturthi', name_hi: 'गणेश चतुर्थी', type: 'major' },
  { date: '2026-10-02', name_en: 'Navratri Begins', name_hi: 'नवरात्रि आरंभ', type: 'major' },
  { date: '2026-10-10', name_en: 'Dussehra', name_hi: 'दशहरा', type: 'major' },
  { date: '2026-10-20', name_en: 'Karva Chauth', name_hi: 'करवा चौथ', type: 'fast' },
  { date: '2026-10-29', name_en: 'Diwali', name_hi: 'दीपावली', type: 'major' },
  { date: '2026-10-30', name_en: 'Govardhan Puja', name_hi: 'गोवर्धन पूजा', type: 'major' },
  { date: '2026-10-31', name_en: 'Bhai Dooj', name_hi: 'भाई दूज', type: 'major' },
  { date: '2026-11-08', name_en: 'Chhath Puja', name_hi: 'छठ पूजा', type: 'major' },
  { date: '2026-11-24', name_en: 'Dev Deepawali', name_hi: 'देव दीपावली', type: 'minor' },
  // Ekadashi (some major ones in 2026)
  { date: '2026-01-06', name_en: 'Pausha Putrada Ekadashi', name_hi: 'पौष पुत्रदा एकादशी', type: 'fast' },
  { date: '2026-02-05', name_en: 'Jaya Ekadashi', name_hi: 'जया एकादशी', type: 'fast' },
  { date: '2026-07-23', name_en: 'Devshayani Ekadashi', name_hi: 'देवशयनी एकादशी', type: 'fast' },
  { date: '2026-11-09', name_en: 'Devutthani Ekadashi', name_hi: 'देवोत्थानी एकादशी', type: 'fast' },
];

// Highly accurate Panchang calculation using panchang-ts
export function getPanchangForDate(date: Date, lang: 'en' | 'hi') {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Indore coordinates as default
  const loc = { latitude: 22.7196, longitude: 75.8577 };
  const options = { timezone: 330 }; // IST is UTC+5:30

  // Fallback indices if panchang-ts fails for some reason
  let tithiIndex = 0;
  let paksha = 'shukla';
  let nakshatraIndex = 0;
  let yogaIndex = 0;
  let sunriseStr = "06:00";
  let sunsetStr = "18:00";

  try {
    const p = getDailyPanchang(date, loc, options);
    if (p) {
      if (p.tithis && p.tithis.length > 0) {
        const tIdx = p.tithis[0].index; // 1 to 30
        paksha = tIdx <= 15 ? 'shukla' : 'krishna';
        tithiIndex = (tIdx - 1) % 15;
      }
      if (p.nakshatras && p.nakshatras.length > 0) {
        nakshatraIndex = p.nakshatras[0].index - 1;
      }
      if (p.yogas && p.yogas.length > 0) {
        yogaIndex = p.yogas[0].index - 1;
      }
      if (p.sunrise) {
        const sr = new Date(p.sunrise);
        const h = sr.getUTCHours().toString().padStart(2, '0');
        const m = sr.getUTCMinutes().toString().padStart(2, '0');
        sunriseStr = `${h}:${m}`;
      }
      if (p.sunset) {
        const ss = new Date(p.sunset);
        const h = ss.getUTCHours().toString().padStart(2, '0');
        const m = ss.getUTCMinutes().toString().padStart(2, '0');
        sunsetStr = `${h}:${m}`;
      }
    }
  } catch (e) {
    console.error("Panchang calculation failed:", e);
  }

  // Get dynamic festivals from panchang-ts
  let computedFestivals: string[] = [];
  let computedFestivalTypes: string[] = [];
  try {
    // If we have festivals from the daily panchang (or we can extract them)
    // Note: getDailyPanchang populates festivals!
    const p = getDailyPanchang(date, loc, options);
    if (p && p.festivals && p.festivals.length > 0) {
      computedFestivals = p.festivals.map((f: any) => f.name);
      computedFestivalTypes = p.festivals.map((f: any) => f.type || 'minor');
    }
  } catch (e) {
    // Ignore
  }

  // Fallback to our hardcoded list if empty
  if (computedFestivals.length === 0) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const fallbackFestivals = FESTIVALS.filter(f => f.date === dateStr);
    computedFestivals = fallbackFestivals.map(f => lang === 'hi' ? f.name_hi : f.name_en);
    computedFestivalTypes = fallbackFestivals.map(f => f.type);
  }

  return {
    tithi: TITHI_NAMES[lang][tithiIndex] || TITHI_NAMES[lang][0],
    tithiIndex,
    paksha: lang === 'hi' ? (paksha === 'shukla' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष') : (paksha === 'shukla' ? 'Shukla (Bright)' : 'Krishna (Dark)'),
    nakshatra: NAKSHATRA_NAMES[lang][nakshatraIndex] || NAKSHATRA_NAMES[lang][0],
    yoga: YOGA_NAMES[lang][yogaIndex] || YOGA_NAMES[lang][0],
    sunrise: sunriseStr,
    sunset: sunsetStr,
    festivals: computedFestivals,
    festivalTypes: computedFestivalTypes,
    isAuspicious: tithiIndex === 4 || tithiIndex === 9 || tithiIndex === 14 || nakshatraIndex === 3 || nakshatraIndex === 7 || nakshatraIndex === 12,
  };
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
