import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import EducationTopics from '../components/infohub/EducationTopics';
import FAQAccordion from '../components/infohub/FAQAccordion';
import MythVsFact from '../components/infohub/MythVsFact';

const QUICK_NAV = [
  { id: 'nav-topics', href: '#topics', en: 'Topics', sw: 'Mada' },
  { id: 'nav-faq', href: '#faq', en: 'FAQ', sw: 'Maswali' },
  { id: 'nav-myths', href: '#myths', en: 'Myths vs Facts', sw: 'Hadithi Potofu na Ukweli' },
  { id: 'nav-articles', href: '#articles', en: 'Articles', sw: 'Makala' },
];

export default function InfoHub() {
  const { language, t } = useLanguage();
  const bi = (en, sw) => (language === 'sw' ? sw : en);
  const [searchQuery, setSearchQuery] = useState('');

  // The dedicated keyword search below (separate from the topic filter
  // above) hits the backend's rule-based FAQ search, unchanged from before.
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(null);
  const [searching, setSearching] = useState(false);
  const [openId, setOpenId] = useState(null);

  async function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await client.get('/faqs/search/', { params: { q: query, lang: language } });
      setSearch(res.data);
    } catch {
      setSearch({ results: [], suggestion: t('infohub_search_unavailable') });
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="bg-background">
      <div className="bg-secondary border-b border-border">
        <div className="container-base py-12">
          <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              {bi('Health Education', 'Elimu ya Afya')}
            </span>
            <h1 className="font-heading font-bold text-3xl xl:text-4xl text-foreground text-balance">
              {bi('Understanding Cervical Cancer', 'Kuelewa Saratani ya Shingo ya Kizazi')}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {bi(
                'Plain-language, verified health information sourced from WHO and the Ministry of Health Kenya. Not a substitute for professional medical advice.',
                'Taarifa za afya zilizo wazi na zilizothibitishwa, zikitoka WHO na Wizara ya Afya Kenya. Si mbadala wa ushauri wa kitaalamu wa kimatibabu.'
              )}
            </p>

            <div className="relative w-full max-w-md mt-2">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={bi('Search topics, symptoms, treatments...', 'Tafuta mada, dalili, matibabu...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border sticky top-16 z-20">
        <div className="container-base">
          <div className="flex gap-1 overflow-x-auto py-3">
            {QUICK_NAV.map((item) => (
              <a key={item.id} href={item.href} className="shrink-0 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-150">
                {bi(item.en, item.sw)}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container-base py-12 flex flex-col gap-16">
        <section id="topics">
          <EducationTopics searchQuery={searchQuery} />
        </section>

        <section id="faq" className="flex flex-col gap-8">
          <FAQAccordion />

          <div className="max-w-md mx-auto w-full flex flex-col gap-2">
            <form onSubmit={runSearch} className="flex gap-2">
              <input
                type="text"
                placeholder={t('infohub_search_placeholder')}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 !px-4 !py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="btn-primary text-sm" disabled={searching || !query.trim()}>
                {searching ? t('infohub_search_button_busy') : t('infohub_search_button')}
              </button>
            </form>
            <p className="text-center text-xs text-muted-foreground">{t('infohub_search_note')}</p>

            {search && (
              <div className="flex flex-col gap-2 mt-2">
                {search.results?.map(f => {
                  const question = (language === 'sw' && f.question_sw) || f.question;
                  const answer = (language === 'sw' && f.answer_sw) || f.answer;
                  const isOpen = openId === `s-${f.id}`;
                  return (
                    <div key={`s-${f.id}`} className={`card-base overflow-hidden ${isOpen ? 'border-primary' : ''}`}>
                      <button onClick={() => setOpenId(isOpen ? null : `s-${f.id}`)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                        <span className="text-sm font-semibold text-foreground">{question}</span>
                      </button>
                      {isOpen && <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>}
                    </div>
                  );
                })}
                {search.suggestion && (
                  <div className="p-4 rounded-xl bg-secondary border border-border text-sm text-muted-foreground">
                    {search.suggestion}{' '}
                    <Link to="/directory" className="text-primary font-semibold">{t('infohub_open_directory')}</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section id="myths">
          <MythVsFact />
        </section>

        <section id="articles">
          <div className="card-base p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center shrink-0">
                <BookOpen size={22} className="text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-heading font-semibold text-base text-foreground">{bi('Read In-Depth Articles', 'Soma Makala ya Kina')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {bi(
                    'Explore our library of verified articles on cervical cancer prevention, screening science, and survivor stories.',
                    'Chunguza maktaba yetu ya makala zilizothibitishwa kuhusu kuzuia saratani ya shingo ya kizazi, sayansi ya uchunguzi, na hadithi za manusura.'
                  )}
                </p>
              </div>
            </div>
            <Link to="/articles" className="btn-primary shrink-0 text-sm">
              {bi('Browse Articles', 'Vinjari Makala')}
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <div className="p-4 rounded-xl bg-accent border border-border">
          <p className="text-xs text-accent-foreground text-center leading-relaxed">
            <span className="font-semibold">{bi('Medical Disclaimer: ', 'Kanusho la Kimatibabu: ')}</span>
            {bi(
              'All information on this page is for educational purposes only and is sourced from WHO, MOH Kenya, and KCHS. It does not constitute medical advice or diagnosis. If you have symptoms or concerns, please consult a qualified healthcare provider.',
              'Taarifa zote kwenye ukurasa huu ni kwa madhumuni ya elimu tu na zinatoka WHO, MOH Kenya, na KCHS. Hazijawakilishi ushauri wa kimatibabu au utambuzi. Ikiwa una dalili au wasiwasi, tafadhali wasiliana na mtoa huduma wa afya aliyehitimu.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
