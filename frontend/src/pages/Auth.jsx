import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Moon, Sun } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function Auth() {
  const { language, setLanguage } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const [mode, setMode] = useState('signin');
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    client.get('/facilities/').then((res) => setFacilities(res.data)).catch(() => {});
  }, []);
  const facilityCount = facilities.length;
  const countyCount = new Set(facilities.map((f) => f.county)).size;

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('cervibloom-theme', next);
  }

  const healthStats = [
    { label: t('Preventable with regular screening', 'Inazuiwa na uchunguzi wa mara kwa mara'), pct: 85 },
    { label: t('Treatable if caught early', 'Inatibiwa ikigunduliwa mapema'), pct: 70 },
    { label: t('HPV vaccine effectiveness', 'Ufanisi wa chanjo ya HPV'), pct: 95 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src="/cervibloomLogo.png" alt="CerviBloom" className="w-8 h-8 rounded-full" />
          <span className="font-heading font-bold text-primary text-base">CerviBloom</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(sw ? 'en' : 'sw')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all text-sm font-medium"
          >
            <Globe size={13} />
            {sw ? 'SW' : 'EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-primary p-12 text-primary-foreground overflow-y-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {t('Trusted Health Information for Kenya', 'Taarifa ya Afya Inayoaminika kwa Kenya')}
            </div>
            <h1 className="font-heading font-bold text-3xl xl:text-4xl leading-tight mb-6">
              {t('Your Cervical Health Journey Starts Here', 'Safari Yako ya Afya ya Mlango wa Kizazi Inaanza Hapa')}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed mb-10">
              {t(
                'Find real screening facilities compiled from public health reporting, get WHO-based symptom guidance, and track your own HPV vaccine and screening history, all in one place.',
                'Pata vituo halisi vya uchunguzi vilivyokusanywa kutoka ripoti za afya ya umma, pata mwongozo wa dalili unaotegemea WHO, na fuatilia historia yako ya chanjo ya HPV na uchunguzi, yote mahali pamoja.'
              )}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { value: String(facilityCount), label: t('Screening Facilities', 'Vituo vya Uchunguzi') },
                { value: String(countyCount), label: t('Counties Covered', 'Kaunti Zilizofunikwa') },
                { value: '2', label: t('Languages Supported', 'Lugha Zinazotumika') },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-heading font-bold text-2xl text-white">{s.value}</p>
                  <p className="text-white/60 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 rounded-2xl p-5">
              <p className="text-white/80 text-xs font-medium mb-4 uppercase tracking-wide">
                {t('Cervical cancer is preventable', 'Saratani ya mlango wa kizazi inaweza kuzuiwa')}
              </p>
              {healthStats.map((item) => (
                <div key={item.label} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/70 text-xs">{item.label}</span>
                    <span className="text-white font-semibold text-xs">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/20">
                    <div className="h-1.5 rounded-full bg-white" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-white/40 text-[10px] mt-3 uppercase tracking-wide">{t('Source: WHO', 'Chanzo: WHO')}</p>
            </div>
          </div>

          <p className="text-white/40 text-xs">
            {t('Content grounded in guidance from WHO, Ministry of Health Kenya, and KCHS.', 'Maudhui yanategemea mwongozo kutoka WHO, Wizara ya Afya Kenya, na KCHS.')}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl mb-8">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-2.5 text-sm font-heading font-semibold rounded-lg transition-all ${mode === 'signin' ? 'bg-card text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('Sign In', 'Ingia')}
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 text-sm font-heading font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-card text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('Create Account', 'Fungua Akaunti')}
              </button>
            </div>

            {mode === 'signin' ? (
              <SignInForm t={t} onSwitchToSignUp={() => setMode('signup')} />
            ) : (
              <SignUpForm t={t} language={language} setLanguage={setLanguage} onSwitchToSignIn={() => setMode('signin')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
