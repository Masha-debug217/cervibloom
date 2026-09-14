import React, { useEffect, useState } from 'react';
import { XCircle, CheckCircle2, RotateCcw, Lightbulb } from 'lucide-react';
import client from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_LABEL = {
  GENERAL: { en: 'General', sw: 'Jumla' },
  VACCINE: { en: 'Vaccine', sw: 'Chanjo' },
  SCREENING: { en: 'Screening', sw: 'Uchunguzi' },
  TRANSMISSION: { en: 'Transmission', sw: 'Maambukizi' },
  TREATMENT: { en: 'Treatment', sw: 'Matibabu' },
};

export default function MythVsFact() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);
  const [myths, setMyths] = useState([]);
  const [flippedIds, setFlippedIds] = useState(new Set());

  useEffect(() => {
    client.get('/myths/').then(res => setMyths(res.data)).catch(() => {});
  }, []);

  function toggleFlip(id) {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (myths.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center shrink-0">
            <Lightbulb size={18} className="text-primary" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground">{t('Myths vs Facts', 'Hadithi Potofu na Ukweli')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('Tap each card to reveal the fact behind common misconceptions about cervical cancer.', 'Gonga kila kadi kugundua ukweli nyuma ya dhana potofu za kawaida kuhusu saratani ya shingo ya kizazi.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myths.map((item) => {
          const isFlipped = flippedIds.has(item.id);
          const myth = (sw && item.myth_sw) || item.myth;
          const fact = (sw && item.fact_sw) || item.fact;
          const categoryLabel = CATEGORY_LABEL[item.category] ? t(CATEGORY_LABEL[item.category].en, CATEGORY_LABEL[item.category].sw) : item.category;
          return (
            <button
              key={item.id}
              onClick={() => toggleFlip(item.id)}
              className="relative h-52 text-left focus:outline-none focus:ring-2 focus:ring-ring rounded-lg"
              aria-label={t(`Tap to reveal fact about: ${myth}`, `Gonga kugundua ukweli kuhusu: ${myth}`)}
            >
              <div className="w-full h-full" style={{ perspective: '1000px' }}>
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <div className="absolute inset-0 card-base p-5 flex flex-col gap-3 bg-card" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="tag-service bg-accent text-accent-foreground text-xs">{categoryLabel}</span>
                      <XCircle size={18} className="text-rose-pink shrink-0" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-xs font-semibold text-rose-pink uppercase tracking-wider">{t('Myth', 'Hadithi Potofu')}</span>
                      <p className="font-heading font-semibold text-sm text-foreground leading-snug">{myth}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                      <RotateCcw size={12} />
                      <span>{t('Tap to see the fact', 'Gonga kuona ukweli')}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 card-base p-5 flex flex-col gap-3 border-primary bg-card" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="tag-service bg-success-bg text-success text-xs">{categoryLabel}</span>
                      <CheckCircle2 size={18} className="text-success shrink-0" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                      <span className="text-xs font-semibold text-success uppercase tracking-wider">{t('Fact', 'Ukweli')}</span>
                      <p className="text-xs text-foreground leading-relaxed overflow-hidden line-clamp-5">{fact}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                      <RotateCcw size={12} />
                      <span>{t('Tap to see the myth', 'Gonga kuona hadithi potofu')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t('All facts are sourced from WHO, Ministry of Health Kenya, and Kenya Community Health Strategy guidance.', 'Ukweli wote unatoka miongozo ya WHO, Wizara ya Afya Kenya, na Mkakati wa Afya ya Jamii Kenya.')}
      </p>
    </div>
  );
}
