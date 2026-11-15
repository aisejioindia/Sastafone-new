import React from 'react';
import { SeoHead } from './SeoHead';
import { BookOpen, Calendar, ArrowRight, User } from 'lucide-react';

export const BlogPlaceholderPage: React.FC = () => {
  const articles = [
    {
      title: 'सूरत में स्मार्टफोन की बैटरी लाइफ कैसे बढ़ाएं?',
      excerpt: 'सूरत के गर्म मौसम में फोन हीटिंग और बैटरी ड्रेन से बचने के 5 आसान और असरदार टिप्स।',
      date: '28 Feb 2026',
      readTime: '3 मिनट'
    },
    {
      title: 'पुराना मोबाइल बेचने से पहले डेटा कैसे सुरक्षित मिटाएं?',
      excerpt: 'फैक्ट्री रीसेट करने का सही तरीका और अपना पर्सनल डेटा व अकाउंट्स पूरी तरह हटाने की गाइड।',
      date: '24 Feb 2026',
      readTime: '4 मिनट'
    },
    {
      title: 'ओरिजिनल बनाम फर्स्ट कॉपी स्क्रीन: क्या अंतर है?',
      excerpt: 'डिस्प्ले बदलते समय सही पार्ट की पहचान कैसे करें और वारंटी का क्या महत्व है।',
      date: '18 Feb 2026',
      readTime: '5 मिनट'
    }
  ];

  return (
    <div className="bg-white min-h-screen py-8">
      <SeoHead
        title="ब्लॉग व टिप्स – मोबाइल केयर व गाइड | Sastafone Surat"
        description="सूरत वासियों के लिए स्मार्टफोन रिपेयरिंग, बैटरी केयर, फोन सेलिंग टिप्स और टेक गाइड।"
        canonicalPath="/blog"
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sastafone नॉलेज हब</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight mb-2">
            स्मार्टफोन केयर व गाइड (Blog)
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
            अपने मोबाइल को लंबे समय तक नया रखने और स्मार्ट तरीके से बेचने की उपयोगी टिप्स।
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {articles.map((art, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-red-200 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                  <Calendar className="w-3 h-3 text-[#D5151B]" />
                  <span>{art.date}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>
                <h2 className="text-sm font-bold text-[#132032] mb-2 leading-snug">
                  {art.title}
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {art.excerpt}
                </p>
              </div>

              <span className="text-xs font-bold text-[#D5151B] flex items-center gap-1">
                पूरा पढ़ें <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
