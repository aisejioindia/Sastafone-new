import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(templatePath, 'utf8');
const BASE_URL = 'https://sastafone.in';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

const SURAT_AREAS = [
  { slug: 'adajan', name: 'Adajan', hindi: 'अडाजण' },
  { slug: 'vesu', name: 'Vesu', hindi: 'वेसु' },
  { slug: 'pal', name: 'Pal', hindi: 'पाल' },
  { slug: 'varachha', name: 'Varachha', hindi: 'वराछा' },
  { slug: 'katargam', name: 'Katargam', hindi: 'कतारगाम' },
  { slug: 'rander', name: 'Rander', hindi: 'रांदेर' },
  { slug: 'piplod', name: 'Piplod', hindi: 'पिपलोद' },
  { slug: 'citylight', name: 'Citylight', hindi: 'सिटीलाइट' },
  { slug: 'ghod-dod-road', name: 'Ghod Dod Road', hindi: 'घोड़ दौड़ रोड' },
  { slug: 'althan', name: 'Althan', hindi: 'अलथान' },
  { slug: 'athwa', name: 'Athwa', hindi: 'अठवा' },
  { slug: 'udhna', name: 'Udhna', hindi: 'उधना' },
  { slug: 'dindoli', name: 'Dindoli', hindi: 'डिंडोली' },
  { slug: 'vip-road', name: 'VIP Road', hindi: 'वीआईपी रोड' },
  { slug: 'nanpura', name: 'Nanpura', hindi: 'नानपुरा' },
  { slug: 'majura-gate', name: 'Majura Gate', hindi: 'मजूरा गेट' },
  { slug: 'bhatar', name: 'Bhatar', hindi: 'भटार' },
  { slug: 'amroli', name: 'Amroli', hindi: 'अमरोली' },
  { slug: 'mota-varachha', name: 'Mota Varachha', hindi: 'मोटा वराछा' },
  { slug: 'jahangirpura', name: 'Jahangirpura', hindi: 'जहांगीरपुरा' },
  { slug: 'dumas-road', name: 'Dumas Road', hindi: 'डुमस रोड' }
];

const STATIC_ROUTES = [
  {
    route: '/repair',
    title: 'Doorstep Mobile Repair in Surat – ₹199 Visit Fee | Sastafone',
    description:
      'सूरत में ₹199 विज़िट टोकन पर डोरस्टेप पिकअप और डिलीवरी मोबाइल रिपेयर। फाइनल बिल में ₹199 एडजस्ट, ₹1000+ पर 6 माह वारंटी, 2 घंटे डिलीवरी लक्ष्य।'
  },
  {
    route: '/repair/book',
    title: 'Book Mobile Repair Pickup in Surat – ₹199 Visit Fee | Sastafone',
    description:
      'मॉडल चुनें, लाइव रिपेयर खर्च देखें और सूरत में 60-मिनट डोरस्टेप पिकअप स्लॉट बुक करें। Sastafone Certified Technician Network।'
  },
  {
    route: '/sell-phone',
    title: 'Sell Old Phone in Surat – Free Doorstep Pickup & Instant Payment | Sastafone',
    description:
      'सूरत में अपना पुराना या डेड स्मार्टफोन बेचें। पारदर्शी ऑनलाइन वैल्यू देखें, डोरस्टेप पिकअप बुक करें और तुरंत UPI/बैंक भुगतान पाएं।'
  },
  {
    route: '/buy-phones',
    title: 'Buy Quality-Checked Used Phones in Surat – 6 Month Warranty | Sastafone',
    description:
      'सूरत में Sastafone से क्वालिटी-चेक्ड सेकंड-हैंड iPhone, Samsung व OnePlus खरीदें। 32-पॉइंट QC और 6 महीने वारंटी।'
  },
  {
    route: '/warranty',
    title: 'Sastafone 6-Month Repair Warranty & Claim Verification | Sastafone Surat',
    description:
      'Sastafone रिपेयर पर ₹1,000+ बिल पर 6 महीने की वारंटी की शर्तें और ऑनलाइन वारंटी वेरिफिकेशन व क्लेम।'
  },
  {
    route: '/contact',
    title: 'Contact Sastafone Surat – Doorstep Mobile Repair & Support Map',
    description:
      'Sastafone सूरत से संपर्क करें: कॉल, WhatsApp, ईमेल (support@sastafone.in), कार्य समय (9:00 AM – 9:30 PM) और Google Maps लोकेशन।'
  },
  {
    route: '/terms',
    title: 'Terms & Conditions | Sastafone Surat',
    description:
      'Sastafone Surat डोरस्टेप मोबाइल रिपेयर, पुराना फोन बेचने और सर्टिफाइड फोन खरीदने के नियम एवं शर्तें।'
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | Sastafone Surat',
    description:
      'Sastafone Surat ग्राहक डेटा सुरक्षा और प्राइवेसी नीति — फोन पते, फोटो और बुकिंग डेटा की सुरक्षा।'
  },
  {
    route: '/refund-policy',
    title: 'Refund & Warranty Policy | Sastafone Surat',
    description:
      'Sastafone Surat ₹199 विज़िट टोकन एडजस्टमेंट, QC बाद ₹99 रिफंड नियम और ₹1000+ बिल पर 6 माह वारंटी शर्तें।'
  },
  {
    route: '/mobile-repair-surat',
    title: 'Mobile Repair in Surat – Screen, Battery & Motherboard Doorstep Pickup | Sastafone',
    description:
      'सूरत में डोरस्टेप मोबाइल रिपेयरिंग: iPhone, Samsung, OnePlus, Vivo, Oppo और Xiaomi स्क्रीन व बैटरी रिप्लेसमेंट 6 माह वारंटी के साथ।'
  },
  {
    route: '/sell-old-phone-surat',
    title: 'Sell Old Phone in Surat – Best Price & Instant UPI Cash | Sastafone',
    description:
      'सूरत में पुराना मोबाइल फोन बेचकर तुरंत नकद या UPI भुगतान पाएं। घर बैठे फ्री पिकअप और ऑन-साइट निरीक्षण।'
  },
  {
    route: '/blog',
    title: 'Sastafone Mobile Care & Repair Guides | Surat',
    description:
      'स्मार्टफोन बैटरी केयर, स्क्रीन प्रोटेक्शन और पुराने फोन बेचने से पहले डेटा बैकअप करने के उपयोगी गाइड।'
  },
  ...SURAT_AREAS.map((area) => ({
    route: `/areas/${area.slug}`,
    title: `Doorstep Mobile Repair in ${area.name}, Surat (${area.hindi}) | Sastafone`,
    description: `${area.hindi} (${area.name}, सूरत) में Sastafone Certified Technician Network द्वारा डोरस्टेप मोबाइल रिपेयर पिकअप व डिलीवरी। ₹199 विज़िट टोकन और ₹1000+ बिल पर 6 माह वारंटी।`
  }))
];

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildRouteHtml(html, { route, title, description }) {
  const canonicalUrl = `${BASE_URL}${route}`;
  const safeTitle = escapeAttr(title);
  const safeDesc = escapeAttr(description);
  const safeUrl = escapeAttr(canonicalUrl);
  const safeOgImg = escapeAttr(OG_IMAGE);

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeUrl}" />`
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${safeUrl}" />`
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  out = out.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${safeOgImg}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${safeOgImg}" />`
  );

  return out;
}

let generatedCount = 0;
for (const entry of STATIC_ROUTES) {
  const cleanRel = entry.route.replace(/^\/+/, '');
  const targetDir = path.join(distDir, cleanRel);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetFile, buildRouteHtml(templateHtml, entry), 'utf8');
  generatedCount += 1;
}

console.log(`Prerendered ${generatedCount} static SEO route HTML files into dist/.`);
