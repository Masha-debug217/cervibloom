import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import client from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function FAQAccordion() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    client.get('/faqs/').then(res => setFaqs(res.data))
      .catch(() => setError(t('Could not load FAQs. Is the backend running?', 'Imeshindwa kupakia maswali. Je, seva ya nyuma inafanya kazi?')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center shrink-0">
            <HelpCircle size={18} className="text-primary" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground">
            {t('Frequently Asked Questions', 'Maswali Yanayoulizwa Mara kwa Mara')}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('Answers to common questions about cervical cancer, screening, and the HPV vaccine.', 'Majibu ya maswali ya kawaida kuhusu saratani ya shingo ya kizazi, uchunguzi, na chanjo ya HPV.')}
        </p>
      </div>

      {error && <p className="text-sm text-warning">{error}</p>}
      {!error && faqs.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('No FAQs yet. Add them in the Django admin panel.', 'Hakuna maswali bado. Yaongeze kwenye paneli ya msimamizi ya Django.')}</p>
      )}

      <div className="flex flex-col gap-2">
        {faqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          const question = (sw && faq.question_sw) || faq.question;
          const answer = (sw && faq.answer_sw) || faq.answer;
          return (
            <div key={faq.id} className={`card-base overflow-hidden transition-colors duration-200 ${isOpen ? 'border-primary' : 'hover:border-primary/40'}`}>
              <button onClick={() => setOpenId(isOpen ? null : faq.id)} className="w-full flex items-start gap-4 p-5 text-left">
                <span className="font-heading font-bold text-sm text-primary/40 tabular-nums shrink-0 mt-0.5 w-6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-heading font-semibold text-sm text-foreground leading-snug">{question}</span>
                <ChevronDown size={16} className={`text-muted-foreground shrink-0 transition-transform duration-300 mt-0.5 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-border animate-slide-up">
                  <p className="pt-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
