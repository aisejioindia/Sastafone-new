export interface PageSeoConfig {
  key: string;
  name: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  metaDescriptionEn: string;
  targetKeywords: string[];
  h1: string;
}

export const SURAT_PAGES_SEO: Record<string, PageSeoConfig> = {
  home: {
    key: 'home',
    name: 'Home / All Services',
    url: 'https://sastafone.in/',
    metaTitle: 'Sastafone Surat – Doorstep Mobile Repair, Sell & Buy Certified Phones',
    metaDescription:
      'सूरत में Sastafone Certified Technician Network द्वारा डोरस्टेप फोन रिपेयर पिकअप व डिलीवरी (₹199 विज़िट टोकन), पुराना फोन बेचें और 6 माह वारंटी फोन खरीदें।',
    metaDescriptionEn:
      'Doorstep mobile repair pickup & delivery in Surat with ₹199 visit fee (adjusted in bill), sell old phone for instant payment, and buy quality-checked phones with 6-month warranty.',
    targetKeywords: [
      'sastafone surat',
      'doorstep mobile repair surat',
      'mobile repair surat',
      'sell old phone surat',
      'second hand mobile surat'
    ],
    h1: 'सूरत में डोरस्टेप मोबाइल रिपेयरिंग, पुराना फोन बेचें व सर्टिफाइड फोन खरीदें'
  },
  sell: {
    key: 'sell',
    name: 'Sell Old Phone',
    url: 'https://sastafone.in/sell-phone',
    metaTitle: 'Sell Old Phone in Surat – Free Doorstep Pickup & Instant Payment',
    metaDescription:
      'सूरत में अपना पुराना या डेड स्मार्टफोन Sastafone पर बेचें। मॉडल और कंडीशन चुनकर भाव देखें, डोरस्टेप पिकअप बुक करें और तुरंत UPI/बैंक भुगतान पाएं।',
    metaDescriptionEn:
      'Sell your old or dead smartphone in Surat on Sastafone. Check valuation, schedule doorstep pickup across Surat, and receive instant UPI or bank payout after inspection.',
    targetKeywords: [
      'sell old phone surat',
      'purana phone beche surat',
      'used phone buyer surat',
      'cash for mobile surat'
    ],
    h1: 'सूरत में पुराना फोन बेचें – डोरस्टेप पिकअप व तुरंत UPI/बैंक भुगतान'
  },
  buy: {
    key: 'buy',
    name: 'Buy Quality-Checked Phones',
    url: 'https://sastafone.in/buy-phones',
    metaTitle: 'Buy Quality-Checked Used Phones in Surat – 6 Month Warranty',
    metaDescription:
      'सूरत में Sastafone से क्वालिटी-चेक्ड सेकंड-हैंड iPhone, Samsung व OnePlus स्मार्टफोन खरीदें। पारदर्शी ग्रेडिंग, GST इनवॉइस और 6 महीने की वारंटी।',
    metaDescriptionEn:
      'Buy quality-checked pre-owned smartphones in Surat with transparent grading, invoice, and 6-month Sastafone warranty.',
    targetKeywords: [
      'buy second hand phone surat',
      'used iphone surat',
      'quality checked phone surat'
    ],
    h1: 'सर्टिफाइड सेकंड-हैंड मोबाइल खरीदें – क्वालिटी-चेक्ड व 6 महीने वारंटी'
  },
  repair: {
    key: 'repair',
    name: 'Doorstep Mobile Repair',
    url: 'https://sastafone.in/repair',
    metaTitle: 'Doorstep Mobile Repair in Surat – ₹199 Visit Fee | Sastafone',
    metaDescription:
      'सूरत में ₹199 विज़िट टोकन पर डोरस्टेप पिकअप और डिलीवरी मोबाइल रिपेयर। फाइनल बिल में ₹199 एडजस्ट, ₹1000+ पर 6 माह वारंटी, 2 घंटे डिलीवरी लक्ष्य।',
    metaDescriptionEn:
      'Doorstep pickup & delivery mobile repair in Surat by Sastafone Certified Technician Network. ₹199 visit fee adjusted in final bill, 6-month warranty on ₹1000+ bills.',
    targetKeywords: [
      'doorstep mobile repair surat',
      'mobile screen repair surat',
      'phone battery replacement surat',
      'sastafone repair'
    ],
    h1: 'डोरस्टेप मोबाइल रिपेयर सूरत – पिकअप, पारदर्शी QC कोट और 2 घंटे डिलीवरी लक्ष्य'
  }
};

export function applyPageSeo(tabKey: string, lang: 'hi' | 'en' = 'hi') {
  const config = SURAT_PAGES_SEO[tabKey] || SURAT_PAGES_SEO.home;
  document.title = config.metaTitle;
  const metaDescTag = document.querySelector('meta[name="description"]');
  const descriptionContent = lang === 'en' ? config.metaDescriptionEn : config.metaDescription;
  if (metaDescTag) metaDescTag.setAttribute('content', descriptionContent);

  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (ogTitleTag) ogTitleTag.setAttribute('content', config.metaTitle);

  const ogDescTag = document.querySelector('meta[property="og:description"]');
  if (ogDescTag) ogDescTag.setAttribute('content', descriptionContent);

  const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitleTag) twitterTitleTag.setAttribute('content', config.metaTitle);

  const twitterDescTag = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescTag) twitterDescTag.setAttribute('content', descriptionContent);

  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) canonicalTag.setAttribute('href', config.url);
}
