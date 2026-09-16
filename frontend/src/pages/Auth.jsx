import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function Auth() {
  const { language, setLanguage } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const [mode, setMode] = useState('signin');
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('cervibloom-theme', next);
  }

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
        <div className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 bg-primary p-12 text-primary-foreground overflow-y-auto">
          <div>
            <h1 className="font-heading font-bold text-3xl leading-tight mb-3">
              {t('Your Cervical Health Journey Starts Here', 'Safari Yako ya Afya ya Mlango wa Kizazi Inaanza Hapa')}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              {t(
                'Screening facilities, WHO-based guidance, and your own health tracking, all in one place.',
                'Vituo vya uchunguzi, mwongozo unaotegemea WHO, na ufuatiliaji wa afya yako, yote mahali pamoja.'
              )}
            </p>
          </div>

          <p className="text-white/40 text-xs">
            {t('Content grounded in guidance from WHO, Ministry of Health Kenya, and KCHS.', 'Maudhui yanategemea mwongozo kutoka WHO, Wizara ya Afya Kenya, na KCHS.')}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md">
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
