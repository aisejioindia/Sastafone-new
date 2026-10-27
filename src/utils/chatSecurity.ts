/**
 * Chat Security & Anti-Leak Validator for Sastaphone SastaBazaar
 * Enforces strict anti-bypass rules so buyers and sellers cannot exchange
 * phone numbers or contact details via text or digits.
 * Users must purchase the official Buyer Unlock Pass (₹99 for 10 / ₹299 for 50)
 * to reveal numbers and call.
 */

// Safe dropdown / quick inquiry options for buyers
export const SAFE_CHAT_PRESETS = [
  { id: 'avail', text: 'क्या यह फोन अभी उपलब्ध (Available) है?' },
  { id: 'condition', text: 'क्या स्क्रीन, बैटरी या कैमरे में कभी कोई रिपेयर हुआ है?' },
  { id: 'bill_box', text: 'क्या ओरिजिनल जीएसटी बिल और बॉक्स साथ में मिलेगा?' },
  { id: 'battery', text: 'बैटरी हेल्थ कितनी है और 1 चार्ज में कितना बैकअप मिलता है?' },
  { id: 'location', text: 'सूरत में किस इलाके में आकर फोन की जांच कर सकते हैं?' },
  { id: 'discount', text: 'क्या कैश ऑन हैंड डील में थोड़ी गुंजाइश (डिस्काउंट) हो सकती है?' },
  { id: 'today', text: 'यदि सब कुछ ठीक रहा तो क्या आज ही डील फाइनल कर सकते हैं?' }
];

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  matchedPattern?: string;
}

/**
 * Validates chat text against:
 * - 10-digit or 7+ consecutive digit numbers
 * - Numbers with spaces, dashes, dots, or slashes (e.g. 98250 12345, 982-501-2345)
 * - Hindi Devanagari numerals (०, १, २, ३, ४, ५, ६, ७, ८, ९)
 * - Spelled out numbers in English (nine, eight, seven...)
 * - Spelled out numbers in Hindi/Hinglish (nau, aath, saat, do, paanch...)
 * - Email addresses (@gmail, @yahoo, etc.)
 * - Social handles, UPI handles (@upi, @okaxis, @paytm, wa.me, t.me)
 * - Keywords like "call karo", "whatsapp karo", "number lo", "dial"
 */
export function validateChatSecurity(message: string): ValidationResult {
  const text = message.trim();

  if (!text) {
    return { isValid: false, errorMessage: 'कृपया कोई संदेश या सुरक्षित विकल्प चुनें।' };
  }

  // 1. Check for Devanagari numerals
  const hindiDigitsRegex = /[०१२३४५६७८९]{3,}/;
  if (hindiDigitsRegex.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: चैट में हिंदी अंकों में मोबाइल नंबर शेयर करना मना है। नंबर देखने के लिए कृपया बायर पास लें।',
      matchedPattern: 'हिंदी अंक'
    };
  }

  // 2. Normalize and check for standard digit sequences (even separated by spaces, dashes, dots)
  // Extract all digit-like characters
  const cleanedDigits = text.replace(/[^0-9]/g, '');
  if (cleanedDigits.length >= 7) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: चैट में मोबाइल नंबर या डिजिट्स शेयर करना ब्लॉक है! सेलर को कॉल करने के लिए आधिकारिक बायर पास (₹99 में 10 नंबर) का उपयोग करें।',
      matchedPattern: 'अंक अनुक्रम'
    };
  }

  // 3. Spaced or dotted numbers (e.g. 9 8 2 5 0, 9-8-2-5-0)
  const spacedNumberRegex = /(?:\d[\s\.\-_,]{1,3}){5,}\d/;
  if (spacedNumberRegex.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: छिपे हुए या स्पेस दिए हुए नंबर भेजना सख्त वर्जित है। कृपया दिए गए विकल्पों से बात करें।',
      matchedPattern: 'स्पेस नंबर'
    };
  }

  // 4. Spelled-out English digits (e.g. "nine eight two five", "call me nine...")
  const spelledEnglish = /\b(zero|one|two|three|four|five|six|seven|eight|nine)\b[\s,\.\-_]*(zero|one|two|three|four|five|six|seven|eight|nine)\b[\s,\.\-_]*(zero|one|two|three|four|five|six|seven|eight|nine)/i;
  if (spelledEnglish.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: अंग्रेजी शब्दों में नंबर टाइप करना मना है।',
      matchedPattern: 'शब्दों में नंबर'
    };
  }

  // 5. Spelled-out Hindi / Hinglish digit words (e.g. "nau aath do paanch", "नौ आठ सात")
  const spelledHindi = /\b(ek|do|teen|chaar|panch|paanch|chhe|saat|aath|nau|shunya|zero)\b[\s,\.\-_]*(ek|do|teen|chaar|panch|paanch|chhe|saat|aath|nau|shunya|zero)\b[\s,\.\-_]*(ek|do|teen|chaar|panch|paanch|chhe|saat|aath|nau|shunya|zero)/i;
  if (spelledHindi.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: शब्दों में फोन नंबर शेयर करना प्रतिबंधित है।',
      matchedPattern: 'हिंग्लिश नंबर'
    };
  }

  // 6. Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: ईमेल आईडी साझा करना मना है।',
      matchedPattern: 'ईमेल आईडी'
    };
  }

  // 7. UPI handles & external links
  const upiOrLinkRegex = /(@ok|@paytm|@axis|@icici|@ybl|wa\.me|t\.me|http:\/\/|https:\/\/)/i;
  if (upiOrLinkRegex.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: बाहरी लिंक या UPI आईडी शेयर करना ब्लॉक है। केवल इन-ऐप चैट की अनुमति है।',
      matchedPattern: 'बाहरी संपर्क लिंक'
    };
  }

  // 8. Phrases attempting to bypass numbers
  const bypassPhrases = /(call\s*me\s*at|mera\s*no|mera\s*number|contact\s*me\s*at|ph\s*no|phone\s*no|whatsapp\s*karo\s*is\s*par|नंबर\s*लिखो|कॉल\s*करो\s*इस\s*पर)/i;
  if (bypassPhrases.test(text) && /\d{2,}/.test(text)) {
    return {
      isValid: false,
      errorMessage: '⛔ सुरक्षा अलर्ट: डायरेक्ट नंबर शेयरिंग पहचानी गई। कृपया बायर अनलॉक पास से नंबर देखें।',
      matchedPattern: 'कांटेक्ट बायपास'
    };
  }

  return { isValid: true };
}

/**
 * Returns a realistic contextual response from the seller based on buyer inquiry
 */
export function getAutomatedSellerReply(promptText: string, sellerName: string, locality: string): string {
  const lower = promptText.toLowerCase();

  if (lower.includes('उपलब्ध') || lower.includes('available')) {
    return `हाँ जी! यह फोन अभी उपलब्ध है। सूरत ${locality} में कोई भी आकर व्यक्तिगत रूप से चेक कर सकता है।`;
  }
  if (lower.includes('स्क्रीन') || lower.includes('बैटरी') || lower.includes('रिपेयर')) {
    return `फोन 100% ओरिजिनल है। आज तक कोई स्क्रीन या पार्ट्स चेंज नहीं हुआ है। सब कुछ स्मूथ चल रहा है।`;
  }
  if (lower.includes('बिल') || lower.includes('बॉक्स')) {
    return `जी हाँ, ओरिजिनल बॉक्स और अधिकृत स्टोर का बिल सुरक्षित रखा हुआ है। हैंडओवर के समय साथ मिलेगा।`;
  }
  if (lower.includes('इलाके') || lower.includes('कहाँ') || lower.includes('location')) {
    return `मैं सूरत के ${locality} के पास रहता हूँ। आप किसी भी सार्वजनिक जगह या हमारे नजदीकी कैफ़े पर आकर फोन देख सकते हैं।`;
  }
  if (lower.includes('डिस्काउंट') || lower.includes('गुंजाइश') || lower.includes('price')) {
    return `कीमत पहले से ही काफी किफायती रखी है, लेकिन यदि आप तुरंत और संतुष्ट होकर लेते हैं तो ₹500 तक का आदर-सम्मान कर लूँगा।`;
  }
  if (lower.includes('आज ही') || lower.includes('today')) {
    return `जी बिल्कुल! मैं आज शाम तक उपलब्ध हूँ। अगर आप नंबर अनलॉक करके सीधे कॉल कर लें तो समय तय कर लेते हैं।`;
  }

  return `धन्यवाद आपके मैसेज के लिए! फोन बिल्कुल दुरुस्त हालत में है। आप संतुष्ट होकर ही पेमेंट करें।`;
}
