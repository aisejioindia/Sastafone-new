import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_NUMBER, SASTAPHONE_PHONE, SURAT_LOCALITIES } from '../data/mockData';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Mail,
  Phone,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatMsg {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'deal' | 'email' | 'repair' | 'sell';
  dealDetails?: {
    topic: string;
    suggestedWaText: string;
    emailSubject: string;
  };
}

const FAQ_DROPDOWN_OPTIONS = [
  {
    id: 'opt-sell',
    label: '📱 पुराना फोन बेचना - सही भाव व इंस्टेंट 2 घंटे में पिकअप कैसे मिलता है?',
    prompt: 'मैं अपना पुराना स्मार्टफोन बेचना चाहता हूँ। Sastaphone Surat पर मुझे अधिकतम भाव कैसे मिलेगा और पिकअप कैसे होगा?'
  },
  {
    id: 'opt-repair',
    label: '🔧 घर बैठे रिपेयरिंग - ₹199 विज़िट टोकन व ₹99 रिफंड पॉलिसी क्या है?',
    prompt: 'सूरत में घर बैठे मोबाइल रिपेयरिंग का क्या प्रोसेस है? ₹199 विज़िट टोकन कैसे एडजस्ट होता है और अगर फोन न बने तो ₹99 रिफंड कैसे मिलता है?'
  },
  {
    id: 'opt-s24',
    label: '⭐ कैमरा / स्क्रीन समस्या - 12% स्पेशल ऑफ (उदा. ₹1,600) व लैब टेस्टिंग',
    prompt: 'मेरे फोन में कैमरा सेंसर ब्लर / स्क्रीन की समस्या है। क्या मुझे 12% छूट और ओरिजिनल पार्ट्स की वारंटी मिलेगी?'
  },
  {
    id: 'opt-buy',
    label: '🛒 6 महीने वारंटी वाले सर्टिफाइड फोन - 32-पॉइंट Pro-Audit क्या है?',
    prompt: 'सस्ताफोन से सर्टिफाइड सेकंड-हैंड फोन खरीदने पर क्या 6 महीने की रिप्लेसमेंट वारंटी और बिल मिलता है?'
  },
  {
    id: 'opt-dead',
    label: '♻️ डेड / टूटा हुआ फोन - ₹600 से ₹1,600 / KG वजन का भाव कैसे मिलता है?',
    prompt: 'मेरे पास पूरी तरह से बंद (डेड) और टूटा हुआ फोन है। इसका किलो के हिसाब से भाव कैसे मिलता है?'
  },
  {
    id: 'opt-bazaar',
    label: '🏷️ सस्ता बाज़ार (P2P मंडी) - बिना कमीशन डायरेक्ट सेलर से डील',
    prompt: 'सस्ता बाज़ार क्या है? ₹99 बायर पास से सेलर का 10-अंकीय नंबर कैसे अनलॉक करते हैं?'
  },
  {
    id: 'opt-localities',
    label: '📍 सूरत कवरेज - कौन-कौन से इलाकों में फ्री विज़िट व लैब पिकअप उपलब्ध है?',
    prompt: 'सूरत में सस्ताफोन की सर्विस किन-किन इलाकों में उपलब्ध है? क्या रिंग रोड, पाल, अडाजण, वेसू में 2 घंटे में पिकअप मिल जाएगा?'
  },
  {
    id: 'opt-owner-deal',
    label: '📧 डायरेक्ट ईमेल सपोर्ट - support@sastafone.in पर लिखित सवाल व समाधान',
    prompt: 'मुझे सीधे support@sastafone.in पर अपना प्रश्न पूछना है या डील कन्फर्म करनी है। मैं डायरेक्ट ईमेल कैसे भेजूँ?'
  }
];

export const SuratSupportChatBot: React.FC = () => {
  const { selectedLocality, setActiveTab, orders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveChatTab] = useState<'chat' | 'email_ticket'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState('');

  // Email Ticket Form state
  const [emailName, setEmailName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // OpenRouter Custom API Key (built-in configuration)
  const openRouterKey = ((import.meta as any).env?.VITE_OPENROUTER_API_KEY as string) || localStorage.getItem('sastafone_openrouter_key') || 'sk-C6UfRDd2royoDuFCUHkaBdPYwIUvDVmCFDSiqiDiNRuB8cxw';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `नमस्ते! 🙏 मैं **सस्ताफोन सूरत AI सपोर्ट असिस्टेंट** हूँ।\n\nसूरत वासियों के लिए **पुराना फोन बेचना, घर पर रिपेयर (₹199 विज़िट टोकन), सर्टिफाइड वारंटी फोन या सस्ता बाज़ार** से जुड़ी किसी भी सहायता के लिए मैं 24x7 लाइव उपलब्ध हूँ।\n\nनीचे दिए गए **ड्रॉपडाउन से सवाल चुनें** या अपना सवाल टाइप करें:`,
      timestamp: 'अभी'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // OpenRouter API Caller with Fallback
  const fetchOpenRouterAIResponse = async (userPrompt: string): Promise<string> => {
    const keyToUse = openRouterKey || ((import.meta as any).env?.VITE_OPENROUTER_API_KEY as string);
    if (!keyToUse) {
      return getSmartLocalAIResponse(userPrompt);
    }

    try {
      const systemPrompt = `You are the official AI Support Executive for "Sastaphone Surat" (website: sastafone.in).
Location: Surat, Gujarat (Hubs: Ring Road, Adajan, Pal, Vesu, Katargam, Varachha, etc.).
Official Support Email: support@sastafone.in (Now Active & Primary).
Services & Core Rules:
1. Sell Phone: Live AI valuation (5K low-end, 8K mid-range, 15K high-end logic), 2-hour doorstep pickup with instant UPI/Cash payment.
2. Repair @ Home: ₹199 doorstep inspection token (fully adjusted into final repair bill). If unrepairable, ₹99 instant refund guaranteed.
3. Repair Pricing: Transparent itemized bill. E.g. Samsung S24 Ultra Camera Sensor Blur: ₹699 - ₹1,899 range, special admin quote 12% off (₹1,600) with 6-month warranty.
4. Certified Used Phones: 32-point Pro-Audit tested, 6-month replacement warranty, free Surat doorstep delivery.
5. Dead/Scrap Phones: ₹600 - ₹1,600 / KG weight-based valuation.
6. SastaBazaar: P2P classifieds, ₹99 Buyer Unlock Pass for 10 verified seller contacts, zero commission.
7. Q&A & Support Email Rule: Always guide the user to ask questions or confirm deals directly via email to support@sastafone.in or submit via the in-app Direct Email form.
Respond in clear, friendly, and authoritative Hindi (with English technical terms where helpful). Keep answers structured and actionable.`;

      // Try OpenRouter endpoint first
      let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyToUse}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://sastafone.in',
          'X-Title': 'Sastaphone Surat AI Desk',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      });

      // If OpenRouter rejects (e.g. key is Moonshot Kimi, direct OpenAI, or custom), try Moonshot Kimi then OpenAI
      if (!response.ok && (response.status === 401 || response.status === 404)) {
        // Try Moonshot AI (Kimi AI)
        try {
          const kimiRes = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${keyToUse}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'moonshot-v1-8k',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7
            })
          });
          if (kimiRes.ok) {
            response = kimiRes;
          }
        } catch (eKimi) {
          // ignore and proceed to OpenAI
        }

        // If not Kimi, try standard OpenAI
        if (!response.ok) {
          try {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${keyToUse}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 600
              })
            });
          } catch (e2) {
            // ignore fallback
          }
        }
      }

      if (!response.ok) {
        throw new Error(`AI API HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && typeof content === 'string') {
        return content;
      }
      return getSmartLocalAIResponse(userPrompt);
    } catch (err) {
      console.warn('AI API call error, falling back to local Surat engine:', err);
      return getSmartLocalAIResponse(userPrompt);
    }
  };

  // Local Neural Knowledge-Base Engine (Fast, 100% Reliable, Zero Dependency)
  const getSmartLocalAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('बेचना') || q.includes('sell') || q.includes('buyback') || q.includes('भाव') || q.includes('दाम')) {
      return `📱 **सस्ताफोन सूरत पर पुराना फोन बेचने की पूरी जानकारी:**\n\n1. **लाइव AI इंस्टेंट वैल्यूएशन:** हमारी वेबसाइट पर अपना ब्रांड व मॉडल चुनें। स्क्रीन, बैटरी और बॉडी कंडीशन के आधार पर 100% पारदर्शी भाव स्क्रीन पर दिखेगा।\n2. **2 घंटे में डोरस्टेप पिकअप:** सूरत के किसी भी इलाके (${selectedLocality || 'अडाजण, रिंग रोड, पाल, वेसू'}) में हमारा टेक्नीशियन 2 घंटे में आपके पते पर आकर फोन चेक करेगा।\n3. **ऑन-द-स्पॉट पेमेंट:** फोन हाथ में लेते ही बैंक ट्रांसफर या UPI (GPay/PhonePe/Paytm) से तुरंत पूरा पैसा खाते में!\n\n💡 **विशेषता:** 100% सुरक्षित डेटा वाइप व सरकारी ID डिलीवरी रसीद।\n\nक्या आप अभी अपना फोन बेचना चाहते हैं? नीचे दिए गए बटन से सीधे **support@sastafone.in** पर डायरेक्ट सवाल भेजें या इन-ऐप ईमेल फॉर्म सबमिट करें!`;
    }

    if (q.includes('रिपेयर') || q.includes('repair') || q.includes('टोकन') || q.includes('₹199') || q.includes('खराब') || q.includes('स्क्रीन') || q.includes('डिस्प्ले') || q.includes('कैमरा') || q.includes('बैटरी')) {
      return `🔧 **सस्ताफोन घर बैठे मोबाइल रिपेयरिंग व लैब वारंटी:**\n\n1. **₹199 विज़िट टोकन नियम:** जब टेक्नीशियन आपके घर आकर फोन चेक करता है, तो ₹199 टोकन फाइनल रिपेयरिंग बिल में 100% एडजस्ट (माइनस) हो जाता है (विज़िट बिल्कुल फ्री)! \n2. **₹99 रिफंड गारंटी:** यदि मदरबोर्ड या पार्ट खराबी के कारण फोन रिपेयर नहीं हो सका, तो ₹99 तुरंत आपके खाते में वापस रिफंड होगा।\n3. **10%-12% स्पेशल ऑफ:** BGA लैब द्वारा सैमसंग S24 Ultra, iPhone आदि पर अधिकतम रेट (जैसे ₹1,899) पर 12% ऑफ देकर ₹1,600 जैसा बेस्ट रेट दिया जाता है।\n4. **6 महीने की रिप्लेसमेंट वारंटी:** ओरिजिनल पार्ट्स व जीएसटी इनवॉइस गारंटी।\n\nसीधे सहायता व स्लॉट के लिए नीचे दिए गए बटन से **support@sastafone.in** पर ईमेल भेजें!`;
    }

    if (q.includes('सर्टिफाइड') || q.includes('खरीदना') || q.includes('buy') || q.includes('सेकंड हैंड') || q.includes('used phone')) {
      return `🛒 **सस्ताफोन सर्टिफाइड सेकंड-हैंड स्मार्टफोन डील्स:**\n\n• **32-पॉइंट Pro-Audit जांच:** प्रत्येक फोन का IMEI, 9-पॉइंट टचस्क्रीन, कैमरा ऑटोफोकस, बैटरी हेल्थ (85%+) और मदरबोर्ड LCI मार्कर टेस्टेड होता है।\n• **6 महीने की लिखित वारंटी:** किसी भी हार्डवेयर खराबी पर फ्री सर्विस या पीस-टू-पीस रिप्लेसमेंट।\n• **सूरत में फ्री डिलीवरी:** रिंग रोड, पाल, अडाजण, वेसू, कतारगाम में कैश ऑन डिलीवरी / टेस्ट-एंड-पे सुविधा उपलब्ध।\n\nअभी स्टॉक में iPhone 13, 14, OnePlus 11R और Samsung S23/S24 Ultra भारी छूट पर उपलब्ध हैं!`;
    }

    if (q.includes('डेड') || q.includes('dead') || q.includes('स्क्रैप') || q.includes('scrap') || q.includes('वजन') || q.includes('किलो') || q.includes('kg')) {
      return `♻️ **डेड व पूरी तरह टूटे हुए फोन (स्क्रैप व ई-वेस्ट):**\n\n• **किलो के हिसाब से भाव:** सूरत में डेड स्मार्टफोन का वजन अनुसार **₹600 से ₹1,600 / KG** तक का नकद भाव दिया जाता है।\n• **बिना बिल व बॉक्स:** यदि डेड फोन का बिल नहीं है तो भी वैध आधार कार्ड की कॉपी के साथ पिकअप उपलब्ध है।\n• **सुरक्षित रीसाइक्लिंग:** सभी मदरबोर्ड ICs को पर्यावरण अनुकूल व डेटा-सुरक्षित तरीके से डीकंपोज किया जाता है।`;
    }

    if (q.includes('बाज़ार') || q.includes('bazaar') || q.includes('p2p') || q.includes('मंडी') || q.includes('पास') || q.includes('99')) {
      return `🏷️ **सस्ता बाज़ार (P2P मोबाइल मंडी - सूरत):**\n\n• **जीरो कमीशन:** ग्राहक सीधे ग्राहक को अपना फोन बेच सकता है।\n• **₹99 बायर पास:** केवल ₹99 में सूरत के 10 वेरीफाइड फोन सेलर्स के सीधे मोबाइल नंबर अनलॉक करें और डायरेक्ट कॉल या चैट करें।\n• **सुरक्षित इन-ऐप चैट:** नंबर शेयर किए बिना भी चैट करने की पूरी सुविधा उपलब्ध है।`;
    }

    if (q.includes('इलाके') || q.includes('locality') || q.includes('सूरत') || q.includes('surat') || q.includes('पता') || q.includes('रिंग रोड') || q.includes('अडाजण') || q.includes('पाल')) {
      return `📍 **सूरत फास्टेस्ट 2-घंटे डोरस्टेप कवरेज:**\n\nसस्ताफोन सूरत के सभी प्रमुख इलाकों को कवर करता है:\n• रिंग रोड मोबाइल मार्केट (सेंट्रल लैब)\n• अडाजण, पाल RTO, पाल आरटीओ सर्कल\n• वेसू, वीआईपी रोड, सिटीलाइट, पिपलोद\n• कतारगाम, वराछा, डिंडोली, उधना, सचिन\n\nसूरत में कहीं भी 2 घंटे में फ्री पिकअप और होम डिलीवरी उपलब्ध है!`;
    }

    if (q.includes('ओनर') || q.includes('owner') || q.includes('मालिक') || q.includes('संजय') || q.includes('संपर्क') || q.includes('contact') || q.includes('email') || q.includes('ईमेल')) {
      return `🤝 **सस्ताफोन सूरत अधिकृत संपर्क सूत्र:**\n\n• **आधिकारिक सपोर्ट ईमेल:** **support@sastafone.in** (एक्टिव)\n• **सूरत अधिकृत ओनर:** **संजय प्रजापति (सर्टिफाइड टेक लीड)**\n• **सेंट्रल हब:** रिंग रोड व अडाजण सेंट्रल मोबाइल लैब, सूरत, गुजरात\n• **वेबसाइट:** sastafone.in (100% प्रामाणिक)\n\nसवाल पूछने या लिखित समाधान के लिए नीचे दिए गए डायरेक्ट ईमेल बटन पर क्लिक करें!`;
    }

    // Default intelligent response
    return `नमस्ते! आपके प्रश्न "${query}" के संबंध में:\n\nसस्ताफोन सूरत (sastafone.in) पर हम **पुराना फोन खरीदने/बेचने, 30 मिनट में घर पर रिपेयर करने (₹199 टोकन / ₹99 रिफंड गारंटी), 12% छूट व 6 महीने वारंटी** की संपूर्ण गारंटी देते हैं।\n\nआप सीधे हमारी सपोर्ट टीम को **support@sastafone.in** पर डायरेक्ट ईमेल भेज सकते हैं या नीचे दिए गए फॉर्म से तुरंत सवाल सबमिट कर सकते हैं!`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'अभी'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const botResponse = await fetchOpenRouterAIResponse(query);
      const botMsg: ChatMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: 'अभी',
        actionType: 'deal',
        dealDetails: {
          topic: query.slice(0, 30),
          suggestedWaText: `नमस्ते Sastaphone Surat! मैंने AI सपोर्ट डेस्क पर inquiry की थी: "${query}". मुझे ओनर से सीधी फाइनल डील करनी है।`,
          emailSubject: `Sastaphone Surat Inquiry: ${query.slice(0, 40)}`
        }
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const fallbackText = getSmartLocalAIResponse(query);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: 'अभी',
          actionType: 'deal',
          dealDetails: {
            topic: query.slice(0, 30),
            suggestedWaText: `नमस्ते Sastaphone Surat! मुझे यह डील फाइनल करनी है: "${query}"`,
            emailSubject: `Sastaphone Surat Deal: ${query.slice(0, 40)}`
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFaq(val);
    const found = FAQ_DROPDOWN_OPTIONS.find(o => o.id === val);
    if (found) {
      handleSendMessage(found.prompt);
    }
  };

  const handleOpenEmailFormWithPrompt = (topic: string, details?: string) => {
    setEmailSubject(`[सूरत Q&A] ${topic}`);
    setEmailMessage(
      `विषय: ${topic}\n\nविवरण:\n${details || ''}\n\nसूरत क्षेत्र: ${selectedLocality}\n\nकृपया इस विषय में सहायता व मार्गदर्शन प्रदान करें।`
    );
    setActiveChatTab('email_ticket');
  };

  const handleSendEmailTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailMessage.trim()) return;

    // Prepare mailto link to active support@sastafone.in
    const subject = encodeURIComponent(emailSubject || `Sastaphone Surat Q&A Ticket: ${emailName || 'Surat Resident'}`);
    const body = encodeURIComponent(
      `नमस्ते Sastaphone Surat सपोर्ट टीम!\n\nनाम: ${emailName || 'N/A'}\nफोन: ${emailPhone || 'N/A'}\nसूरत क्षेत्र: ${selectedLocality}\n\nप्रश्न / समस्या विवरण:\n${emailMessage}\n\n---\nSent via Sastaphone Surat Direct Q&A Support (support@sastafone.in)`
    );

    window.open(`mailto:support@sastafone.in?subject=${subject}&body=${body}`, '_blank');
    setEmailSentSuccess(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => {
      setEmailSentSuccess(false);
      setActiveChatTab('chat');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `✓ आपका सवाल **support@sastafone.in** पर सफलता से तैयार कर दिया गया है! हमारी सूरत सपोर्ट टीम 2 घंटे के भीतर आपसे संपर्क करेगी।\n\nविषय: ${emailSubject || 'Q&A सहायता'}`,
          timestamp: 'अभी',
          actionType: 'email',
          dealDetails: {
            topic: emailSubject || 'Support Inquiry',
            suggestedWaText: `ईमेल भेजा गया: ${emailSubject}`,
            emailSubject: emailSubject || 'Support Desk Inquiry'
          }
        }
      ]);
    }, 1800);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `नमस्ते! 🙏 सस्ताफोन सूरत AI सपोर्ट डेस्क रीसेट हो गया है। आप कोई भी नया सवाल पूछ सकते हैं या ड्रॉपडाउन से विषय चुन सकते हैं:`,
        timestamp: 'अभी'
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <aside aria-label="Surat AI Support Desk" className="fixed bottom-5 right-4 sm:right-6 z-40">
          <div className="flex items-center gap-2 group">
            {/* Tooltip on desktop */}
            <div className="hidden sm:flex flex-col items-end bg-slate-950/95 text-white text-xs py-2 px-3.5 rounded-2xl shadow-xl border border-blue-500/30 backdrop-blur-md opacity-95 group-hover:opacity-100 transition-all duration-200">
              <div className="flex items-center gap-1.5 font-black text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>सूरत AI सपोर्ट डेस्क (24x7)</span>
              </div>
              <span className="text-[11px] text-slate-300">
                लाइव चैट • ईमेल <strong className="text-blue-300">support@sastafone.in</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-600/35 hover:scale-110 active:scale-95 transition-all duration-200 relative cursor-pointer border border-red-400/30"
              title="सस्ताफोन सूरत AI सपोर्ट डेस्क खोलें"
            >
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
              <Bot className="w-7 h-7 text-white" />
            </button>
          </div>
        </aside>
      )}

      {/* Expanded Interactive Chat Modal with Mobile Backdrop and Prominent Close */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click to dismiss */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="क्लोज चैट बैकड्रॉप"
          />

          <div className="relative w-full sm:w-[420px] h-[92vh] sm:h-[650px] max-h-[96vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            {/* Mobile-Only Top Dedicated Close Bar */}
            <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-white/10 text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-amber-400">सस्ताफोन सूरत AI डेस्क</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                title="चैट बंद करें"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>बंद करें (Close)</span>
              </button>
            </div>

            {/* Top Main Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center font-bold text-white shadow-md border border-red-400/40 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-sm text-white truncate">सस्ताफोन AI डेस्क</h4>
                    <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase shrink-0">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3 h-3 text-amber-300 shrink-0" />
                    <span className="font-mono text-blue-200 truncate">support@sastafone.in</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveChatTab(activeTab === 'email_ticket' ? 'chat' : 'email_ticket')}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'email_ticket'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="सपोर्ट ईमेल टिकट (support@sastafone.in)"
                >
                  <Mail className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleClearChat}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="चैट रीसेट करें"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 transition-all cursor-pointer ml-1 shadow-sm"
                  title="चैट बंद करें"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">बंद करें</span>
                </button>
              </div>
            </div>

          {/* Subheader Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 text-[11px] font-bold border-b border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveChatTab('chat')}
              className={`py-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-600 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>AI लाइव चैट व Q&A</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChatTab('email_ticket')}
              className={`py-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'email_ticket'
                  ? 'bg-white text-amber-800 border-b-2 border-amber-500 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>लिखित ईमेल (Official)</span>
            </button>
          </div>

          {/* TAB 1: AI LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Dropdown Q&A Selector (User requested) */}
              <div className="p-2.5 bg-blue-50/70 border-b border-blue-200/80 shrink-0 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <label htmlFor="faq-dropdown" className="font-black text-blue-950 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>त्वरित समाधान ड्रॉपडाउन (Q&A Dropdown):</span>
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold">1-क्लिक जवाब</span>
                </div>
                <div className="relative">
                  <select
                    id="faq-dropdown"
                    value={selectedFaq}
                    onChange={handleDropdownSelect}
                    className="w-full text-xs p-2 pr-7 rounded-xl border border-blue-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs appearance-none truncate"
                  >
                    <option value="">-- अपनी समस्या या प्रश्न तुरंत चुनें --</option>
                    {FAQ_DROPDOWN_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
                </div>

                {/* Quick Topic Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-0.5 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('पुराना फोन बेचना है, सूरत में अधिकतम भाव कैसे मिलेगा?')}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 shrink-0 font-bold cursor-pointer"
                  >
                    📱 फोन बेचना
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('घर पर रिपेयरिंग का क्या चार्ज है और ₹199 टोकन कैसे काम करता है?')}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 shrink-0 font-bold cursor-pointer"
                  >
                    🔧 रिपेयर टोकन
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('सर्टिफाइड फोन पर 6 महीने की वारंटी कैसे मिलती है?')}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 shrink-0 font-bold cursor-pointer"
                  >
                    🛒 6M वारंटी
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('डेड और टूटे फोन का ₹600 - ₹1,600 / KG भाव कैसे मिलता है?')}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 shrink-0 font-bold cursor-pointer"
                  >
                    ♻️ स्क्रैप फोन
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('सस्ता बाज़ार में ₹99 पास से सेलर नंबर कैसे अनलॉक करते हैं?')}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 shrink-0 font-bold cursor-pointer"
                  >
                    🏷️ सस्ता बाज़ार
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs bg-slate-50/50">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-1.5 max-w-[90%]">
                      {msg.sender === 'bot' && (
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mb-1">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-2xs ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.text}

                        {/* DIRECT EMAIL Q&A RESOLUTION BUTTONS (REPLACED WHATSAPP REDIRECT AS REQUESTED BY USER) */}
                        {msg.actionType === 'deal' && msg.dealDetails && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <span>डायरेक्ट ईमेल सहायता (support@sastafone.in):</span>
                              </span>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                                एक्टिव ईमेल
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              {/* 1. Direct Mailto Compose to support@sastafone.in */}
                              <a
                                href={`mailto:support@sastafone.in?subject=${encodeURIComponent(
                                  msg.dealDetails.emailSubject
                                )}&body=${encodeURIComponent(
                                  `नमस्ते Sastaphone Surat सपोर्ट टीम!\n\nमेरा प्रश्न / विषय: ${msg.dealDetails.topic}\n\nविवरण:\n${msg.dealDetails.suggestedWaText}\n\nसूरत क्षेत्र: ${selectedLocality}\n\n---\nSent via Sastaphone Surat Direct Q&A Support (support@sastafone.in)`
                                )}`}
                                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center justify-between shadow-xs transition-all cursor-pointer group"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Mail className="w-4 h-4 fill-white text-blue-600" />
                                  <span>support@sastafone.in पर डायरेक्ट सवाल भेजें</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                              </a>

                              {/* 2. In-App Direct Q&A Form Ticket */}
                              <button
                                type="button"
                                onClick={() => handleOpenEmailFormWithPrompt(msg.dealDetails!.topic, msg.dealDetails!.suggestedWaText)}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-[11px] font-bold flex items-center justify-between transition-colors border border-amber-300 cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Send className="w-3.5 h-3.5 text-amber-700" />
                                  <span>✍️ सीधे इन-ऐप ईमेल फॉर्म से सवाल दर्ज करें</span>
                                </span>
                                <span className="text-[10px] text-amber-700 font-bold">फॉर्म खोलें →</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-slate-500 font-medium ml-1">
                        सूरत AI डेस्क सोच रहा है...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="सूरत मोबाइल भाव, रिपेयरिंग या समस्या पूछें..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                    title="भेजें"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
                  <span>सपोर्ट: support@sastafone.in</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    100% सुरक्षित सूरत हब
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL EMAIL TICKET TO support@sastafone.in */}
          {activeTab === 'email_ticket' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-blue-950 text-xs">
                    <Mail className="w-4 h-4 text-blue-700" />
                    <span>आधिकारिक सपोर्ट ईमेल: support@sastafone.in</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    ✓ एक्टिव ईमेल
                  </span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  सीधे आधिकारिक ईमेल <strong className="font-mono text-blue-800">support@sastafone.in</strong> पर अपना सवाल, रिपेयरिंग विवरण, इनवॉइस या बाय-बैक पूछताछ दर्ज करें:
                </p>
              </div>

              {emailSentSuccess ? (
                <div className="p-6 text-center rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl shadow-md">
                    ✓
                  </div>
                  <h5 className="font-black text-emerald-950 text-sm">ईमेल सफलतापूर्वक तैयार हुआ!</h5>
                  <p className="text-xs text-emerald-800">
                    आपका ईमेल <strong>support@sastafone.in</strong> के लिए खोल दिया गया है। हमारी टीम 2 घंटे के भीतर जवाब देगी।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendEmailTicket} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">आपका नाम:</label>
                    <input
                      type="text"
                      required
                      value={emailName}
                      onChange={e => setEmailName(e.target.value)}
                      placeholder="उदा. राहुल पटेल"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">मोबाइल नंबर (सूरत):</label>
                    <input
                      type="tel"
                      required
                      value={emailPhone}
                      onChange={e => setEmailPhone(e.target.value)}
                      placeholder="9825012345"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">विषय (Subject / Q&A टॉपिक):</label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="उदा. पुराना iPhone 13 बेचना है / S24 कैमरा रिपेयर"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      सवाल या विस्तृत समस्या (Question Details):
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={emailMessage}
                      onChange={e => setEmailMessage(e.target.value)}
                      placeholder="फोन मॉडल, खराबी, सूरत का पता या आवश्यक सवाल विस्तार से लिखें..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>support@sastafone.in पर डायरेक्ट सवाल भेजें</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  </>
);
};