export interface PageSeoConfig {
  key: string;
  name: string;
  url: string;
  metaTitle: string;
  metaTitleCharCount: number;
  metaDescription: string;
  metaDescriptionCharCount: number;
  metaDescriptionEn: string;
  metaDescriptionEnCharCount: number;
  targetKeywords: string[];
  h1: string;
}

export const SURAT_PAGES_SEO: Record<string, PageSeoConfig> = {
  home: {
    key: 'home',
    name: 'Home / All Services',
    url: 'https://sastafone.in/',
    metaTitle: 'Sastafone Surat – Sell Old Mobile, Buy & Doorstep Repair',
    metaTitleCharCount: 57,
    metaDescription: 'सूरत का #1 मोबाइल हब Sastafone: पुराना फोन तुरंत कैश में बेचें, ₹199 में 30 मिनट में घर बैठे रिपेयर, 6M वारंटी फोन खरीदें व 0% ब्रोकरेज सस्ता बाज़ार डील करें।',
    metaDescriptionCharCount: 157,
    metaDescriptionEn: 'Sell old mobile for instant cash in Surat, get doorstep phone repair in 30 mins at ₹199, buy 6M warranty certified refurbished phones & trade on Sasta Bazaar.',
    metaDescriptionEnCharCount: 160,
    targetKeywords: [
      'sastafone surat',
      'sastaphone surat',
      'purana mobile beche surat',
      'mobile repair surat',
      'second hand mobile surat',
      'doorstep mobile repair surat'
    ],
    h1: 'सूरत का #1 विश्वसनीय मोबाइल हब – पुराना फोन बेचें, खरीदें व 30 मिनट में रिपेयर'
  },
  sell: {
    key: 'sell',
    name: 'Sell Old & Dead Phone',
    url: 'https://sastafone.in/?service=sell',
    metaTitle: 'Sell Old Phone in Surat – Instant Cash & Free Home Pickup',
    metaTitleCharCount: 57,
    metaDescription: 'सूरत में पुराना या डेड फोन तुरंत नकद में बेचें। फ्री 2-घंटे होम पिकअप, बेस्ट AI वैल्यूएशन, ऑन-द-स्पॉट UPI पेमेंट व स्क्रैप फोन का सबसे ज्यादा दाम Sastafone पर।',
    metaDescriptionCharCount: 157,
    metaDescriptionEn: 'Sell old or dead mobile for instant cash in Surat. Free 2-hour doorstep pickup across Adajan, Vesu & Varachha with spot UPI payment and guaranteed best rates.',
    metaDescriptionEnCharCount: 159,
    targetKeywords: [
      'sell old phone surat',
      'purana phone beche surat',
      'dead mobile scrap rate surat',
      'cash for phone surat',
      'used phone buyer surat'
    ],
    h1: 'सूरत में पुराना या डेड मोबाइल बेचें – 2 घंटे में फ्री होम पिकअप व तुरंत नकद भुगतान'
  },
  buy: {
    key: 'buy',
    name: 'Buy Certified Refurbished Phones',
    url: 'https://sastafone.in/?service=buy',
    metaTitle: 'Buy Refurbished Phones in Surat – 6M Warranty & Low Price',
    metaTitleCharCount: 57,
    metaDescription: 'सूरत में 6 महीने वारंटी वाले सर्टिफाइड सेकंड-हैंड iPhone, Samsung व OnePlus फोन खरीदें। 32-पॉइंट टेस्टिंग, 7 दिन रिप्लेसमेंट और GST इनवॉइस के साथ सबसे सस्ता भाव।',
    metaDescriptionCharCount: 159,
    metaDescriptionEn: 'Buy certified second-hand phones in Surat with 6 months warranty, 32-point inspection, 7-day replacement & GST invoice. Top deals on iPhone, Samsung & OnePlus.',
    metaDescriptionEnCharCount: 160,
    targetKeywords: [
      'buy second hand phone surat',
      'refurbished iphone surat',
      'certified used mobile surat',
      'cheap 5g phone surat',
      'samsung second hand surat'
    ],
    h1: 'सर्टिफाइड सेकंड-हैंड मोबाइल खरीदें – 32-पॉइंट क्वालिटी चेक व 6 महीने वारंटी'
  },
  repair: {
    key: 'repair',
    name: 'Doorstep Mobile Repair',
    url: 'https://sastafone.in/?service=repair',
    metaTitle: 'Doorstep Mobile Repair in Surat – 30 Min Fix at Just ₹199',
    metaTitleCharCount: 57,
    metaDescription: 'सूरत में मात्र ₹199 में 30 मिनट में घर बैठे मोबाइल रिपेयर। ओरिजिनल डिस्प्ले, बैटरी व कैमरा रिपेयर, 90 दिन वारंटी और नो-फिक्स नो-फी गारंटी। आज ही स्लॉट बुक करें!',
    metaDescriptionCharCount: 158,
    metaDescriptionEn: 'Doorstep mobile repair in Surat in 30 mins! Expert screen replacement, battery & camera fix at ₹199 visit fee. 90-day warranty & genuine parts. Book tech now.',
    metaDescriptionEnCharCount: 158,
    targetKeywords: [
      'doorstep mobile repair surat',
      'mobile screen repair surat',
      'phone display change surat',
      'phone battery replacement surat',
      'mobile repair near me surat'
    ],
    h1: 'डोरस्टेप मोबाइल रिपेयर सूरत – 30 मिनट में घर बैठे ओरिजिनल पार्ट्स के साथ रिपेयर'
  },
  bazaar: {
    key: 'bazaar',
    name: 'Sasta Bazaar (P2P Mobile Mandi)',
    url: 'https://sastafone.in/?service=bazaar',
    metaTitle: 'Sasta Bazaar Surat – Buy & Sell Mobile with 0% Brokerage',
    metaTitleCharCount: 56,
    metaDescription: 'सूरत की डायरेक्ट मोबाइल मंडी \'सस्ता बाज़ार\'। ₹99 में लिस्टिंग, 0% ब्रोकरेज, सीधे खरीदार-विक्रेता चैट और प्राइवेसी सुरक्षा के साथ सेकंड-हैंड फोन तुरंत डील करें।',
    metaDescriptionCharCount: 158,
    metaDescriptionEn: 'Surat\'s direct P2P mobile marketplace. Post phone ad for just ₹99, trade with 0% brokerage, enjoy secure in-app chat & privacy shield. Deal directly in Surat.',
    metaDescriptionEnCharCount: 159,
    targetKeywords: [
      'sasta bazaar surat',
      'buy sell mobile p2p surat',
      'direct customer phone deal surat',
      'second hand mobile olx surat',
      'mobile mandi surat'
    ],
    h1: 'सस्ता बाज़ार सूरत – 0% ब्रोकरेज पर सीधे ग्राहक से फोन खरीदें व बेचें'
  }
};

/**
 * Updates DOM title, meta description, and OpenGraph tags dynamically based on tab
 */
export function applyPageSeo(tabKey: string, lang: 'hi' | 'en' = 'hi') {
  const config = SURAT_PAGES_SEO[tabKey] || SURAT_PAGES_SEO.home;

  // Title
  document.title = config.metaTitle;

  // Meta description
  const metaDescTag = document.querySelector('meta[name="description"]');
  const descriptionContent = lang === 'en' ? config.metaDescriptionEn : config.metaDescription;
  if (metaDescTag) {
    metaDescTag.setAttribute('content', descriptionContent);
  }

  // OG Title & Description
  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (ogTitleTag) {
    ogTitleTag.setAttribute('content', config.metaTitle);
  }

  const ogDescTag = document.querySelector('meta[property="og:description"]');
  if (ogDescTag) {
    ogDescTag.setAttribute('content', descriptionContent);
  }

  const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitleTag) {
    twitterTitleTag.setAttribute('content', config.metaTitle);
  }

  const twitterDescTag = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescTag) {
    twitterDescTag.setAttribute('content', descriptionContent);
  }

  // Canonical URL
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalTag.setAttribute('href', config.url);
  }
}
