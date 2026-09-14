import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Clock, ExternalLink, ArrowLeft, Tag, Search, Globe, Heart, ChevronRight } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_LABEL = {
  PREVENTION: { en: 'Prevention', sw: 'Kinga' },
  SCREENING: { en: 'Screening', sw: 'Uchunguzi' },
  VACCINATION: { en: 'Vaccination', sw: 'Chanjo' },
  TREATMENT: { en: 'Treatment', sw: 'Matibabu' },
  RESEARCH: { en: 'Research', sw: 'Utafiti' },
  WELLBEING: { en: 'Wellbeing', sw: 'Ustawi' },
  GENERAL: { en: 'General', sw: 'Jumla' },
};

const CATEGORY_GRADIENT = {
  PREVENTION: 'from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20',
  SCREENING: 'from-purple-100 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/20',
  VACCINATION: 'from-green-100 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/20',
  TREATMENT: 'from-blue-100 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/20',
  RESEARCH: 'from-orange-100 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/20',
  WELLBEING: 'from-teal-100 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/20',
  GENERAL: 'from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20',
};

function readingMinutes(body) {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso, sw) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(sw ? 'sw-KE' : 'en-KE', { month: 'short', year: 'numeric' });
}

function renderBody(body) {
  return body.split('\n').map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
  });
}

function ArticleCard({ article, text, isBookmarked, canBookmark, busy, onToggleBookmark, onRead, sw, t }) {
  const gradient = CATEGORY_GRADIENT[article.category] || CATEGORY_GRADIENT.GENERAL;
  const categoryLabel = CATEGORY_LABEL[article.category] ? t(CATEGORY_LABEL[article.category].en, CATEGORY_LABEL[article.category].sw) : article.category;
  return (
    <div className="card-base overflow-hidden flex flex-col group">
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <div className="w-12 h-12 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center">
          <Heart size={22} className="text-primary fill-primary/30" />
        </div>
        {canBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id); }}
            disabled={busy}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isBookmarked ? 'bg-primary text-white' : 'bg-white/80 dark:bg-card/80 text-muted-foreground hover:bg-primary hover:text-white'
            }`}
            aria-label={isBookmarked ? t('Remove bookmark', 'Ondoa alama') : t('Bookmark article', 'Weka alama')}
          >
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-primary border border-border">
            <Tag size={10} />
            {categoryLabel}
          </span>
        </div>

        <h3 className="font-heading font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {text.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
          {text.summary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {readingMinutes(text.body)} {t('min read', 'dak kusoma')}
            </span>
            <span>{formatDate(article.created_at, sw)}</span>
          </div>
          <button onClick={() => onRead(article)} className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
            {t('Read', 'Soma')} <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleReadingView({ article, text, isBookmarked, canBookmark, busy, onToggleBookmark, onBack, sw, t }) {
  const gradient = CATEGORY_GRADIENT[article.category] || CATEGORY_GRADIENT.GENERAL;
  const categoryLabel = CATEGORY_LABEL[article.category] ? t(CATEGORY_LABEL[article.category].en, CATEGORY_LABEL[article.category].sw) : article.category;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} />
        {t('Back to Articles', 'Rudi kwa Makala')}
      </button>

      <div className={`h-40 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
        <div className="w-16 h-16 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center">
          <Heart size={28} className="text-primary fill-primary/30" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-primary border border-border">
          <Tag size={10} />
          {categoryLabel}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} />
          {readingMinutes(text.body)} {t('min read', 'dak kusoma')}
        </span>
        <span className="text-xs text-muted-foreground">{formatDate(article.created_at, sw)}</span>
      </div>

      <h1 className="font-heading font-bold text-2xl text-foreground leading-tight mb-2">{text.title}</h1>
      {article.source_name && (
        <p className="text-sm text-muted-foreground mb-1">{t('Source:', 'Chanzo:')} {article.source_name}</p>
      )}

      <div className="flex items-center gap-3 mt-4 mb-8 pb-6 border-b border-border flex-wrap">
        {canBookmark && (
          <button
            onClick={() => onToggleBookmark(article.id)}
            disabled={busy}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              isBookmarked ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            {isBookmarked ? t('Saved', 'Imehifadhiwa') : t('Save Article', 'Hifadhi Makala')}
          </button>
        )}
        {article.source_url && (
          <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-all">
            <ExternalLink size={14} />
            {t('View Original', 'Tazama Asili')}
          </a>
        )}
      </div>

      <div className="flex flex-col gap-1">{renderBody(text.body)}</div>

      {article.source_name && (
        <div className="mt-10 p-4 rounded-xl bg-muted border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{t('Source:', 'Chanzo:')}</strong>{' '}
            {t(
              `This article is grounded in guidance from ${article.source_name}. CerviBloom does not author original medical content.`,
              `Makala hii inategemea mwongozo kutoka ${article.source_name}. CerviBloom haitengenezi maudhui ya kimatibabu asili.`
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Articles() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const [tab, setTab] = useState('all');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticleId, setReadingArticleId] = useState(null);
  const readingArticle = articles.find((a) => a.id === readingArticleId) || null;

  const load = useCallback(() => {
    setError('');
    if (tab === 'saved' && !user) {
      setArticles([]);
      return;
    }
    const endpoint = tab === 'saved' ? '/articles/bookmarked/' : '/articles/';
    client.get(endpoint).then((res) => setArticles(res.data))
      .catch(() => setError(t('Could not load articles.', 'Imeshindwa kupakia makala.')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  useEffect(() => { load(); }, [load]);

  async function toggleBookmark(id) {
    setBusyId(id);
    try {
      const res = await client.post(`/articles/${id}/toggle_bookmark/`);
      if (tab === 'saved' && !res.data.is_bookmarked) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (readingArticleId === id) setReadingArticleId(null);
      } else {
        setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_bookmarked: res.data.is_bookmarked } : a)));
      }
    } catch {
      setError(t('Could not save that bookmark.', 'Imeshindwa kuhifadhi alama hiyo.'));
    } finally {
      setBusyId(null);
    }
  }

  const articleText = (a) => ({
    title: (sw && a.title_sw) || a.title,
    summary: (sw && a.summary_sw) || a.summary,
    body: (sw && a.body_sw) || a.body,
  });

  const categories = ['All', ...Object.keys(CATEGORY_LABEL)];
  const filtered = articles.filter((a) => {
    const text = articleText(a);
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || text.title.toLowerCase().includes(q) || text.summary.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  if (readingArticle) {
    return (
      <div className="section-padding">
        <div className="container-base">
          <ArticleReadingView
            article={readingArticle}
            text={articleText(readingArticle)}
            isBookmarked={!!readingArticle.is_bookmarked}
            canBookmark={!!user}
            busy={busyId === readingArticle.id}
            onToggleBookmark={toggleBookmark}
            onBack={() => setReadingArticleId(null)}
            sw={sw}
            t={t}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-base">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/info-hub" className="hover:text-primary transition-colors">{t('Info Hub', 'Kituo cha Habari')}</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{t('Articles', 'Makala')}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            {t('HPV & Cervical Cancer Articles', 'Makala za HPV na Saratani ya Mlango wa Kizazi')}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {t('Longer-form articles grounded in public health guidance. Sign in to save articles and read them later.', 'Makala za kina zinazotegemea mwongozo wa afya ya umma. Ingia ili kuhifadhi makala na kuzisoma baadaye.')}
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
          {[{ id: 'all', label: t('All Articles', 'Makala Zote') }, { id: 'saved', label: t(`Saved`, `Zilizohifadhiwa`) }].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === tabItem.id ? 'bg-card text-primary border border-border' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tabItem.id === 'saved' ? <BookmarkCheck size={14} /> : null}
              {tabItem.label}
            </button>
          ))}
        </div>

        {error && <div className="error-box max-w-lg mb-6">{error}</div>}

        {tab === 'saved' && !user ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            {t('Sign in to see and save articles.', 'Ingia ili kuona na kuhifadhi makala.')}{' '}
            <Link to="/auth" className="text-primary font-semibold hover:underline">{t('Sign In', 'Ingia')}</Link>
          </p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('Search articles...', 'Tafuta makala...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full !pl-9 !pr-4 !py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                      selectedCategory === cat ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary bg-card'
                    }`}
                  >
                    {cat === 'All' ? t('All', 'Zote') : t(CATEGORY_LABEL[cat].en, CATEGORY_LABEL[cat].sw)}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'saved' && articles.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Bookmark size={22} className="text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  {t('No saved articles yet', 'Hakuna makala zilizohifadhiwa bado')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('Bookmark articles to save them here for easy access later.', 'Weka alama za makala kuzihifadhi hapa kwa upatikanaji rahisi baadaye.')}
                </p>
                <button onClick={() => setTab('all')} className="btn-primary text-sm py-2.5 px-6">
                  {t('Browse Articles', 'Vinjari Makala')} <ChevronRight size={14} />
                </button>
              </div>
            )}

            {tab === 'all' && articles.length === 0 && !error && (
              <p className="text-center text-sm text-muted-foreground py-16">
                {t('No articles yet. Add them in the Django admin.', 'Hakuna makala bado. Ziongeze kwenye msimamizi wa Django.')}
              </p>
            )}

            {filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    text={articleText(article)}
                    isBookmarked={!!article.is_bookmarked}
                    canBookmark={!!user}
                    busy={busyId === article.id}
                    onToggleBookmark={toggleBookmark}
                    onRead={(a) => setReadingArticleId(a.id)}
                    sw={sw}
                    t={t}
                  />
                ))}
              </div>
            )}

            {filtered.length === 0 && articles.length > 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">
                  {t('No articles match your search.', 'Hakuna makala zinazolingana na utafutaji wako.')}
                </p>
              </div>
            )}

            <div className="mt-10 p-4 rounded-xl bg-muted border border-border flex items-start gap-3">
              <Globe size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{t('About these articles:', 'Kuhusu makala hizi:')}</strong>{' '}
                {t(
                  'Articles are grounded in public health guidance, with the source named at the top of each one. CerviBloom does not author original medical content.',
                  'Makala zinategemea mwongozo wa afya ya umma, huku chanzo kikitajwa juu ya kila moja. CerviBloom haitengenezi maudhui ya kimatibabu asili.'
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
