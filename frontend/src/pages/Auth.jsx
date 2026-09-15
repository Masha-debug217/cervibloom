import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, AtSign, Lock, User, Phone, Mail, MapPin, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Admin accounts are deliberately NOT offered here - they are created with
// `manage.py createsuperuser` (see backend/README.md). Open registration
// always creates a plain User account (there is no role to pick), and the
// API has no writable `role` field for a client to set.
function destinationFor(role) {
  return role === 'ADMIN' ? '/admin' : '/dashboard';
}

function passwordStrengthOf(p) {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

export default function Auth() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('register');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', county: '', phone: '',
    password: '', confirmPassword: '', agreeTerms: false, agreeHealth: false,
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function switchMode(next) {
    setMode(next);
    setStep(1);
    setError('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await login(loginForm.username, loginForm.password);
      navigate(destinationFor(u?.role));
    } catch {
      setError(t('Incorrect username or password.', 'Jina la mtumiaji au nywila si sahihi.'));
    } finally { setBusy(false); }
  }

  function handleStep1(e) {
    e.preventDefault();
    setStep(2);
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('Passwords do not match.', 'Nywila hazilingani.'));
      return;
    }
    setError(''); setBusy(true);
    try {
      const u = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.fullName,
        phone_number: form.phone,
        county: form.county,
      });
      navigate(destinationFor(u?.role));
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : t('Registration failed.', 'Usajili umeshindwa.'));
    } finally { setBusy(false); }
  }

  const strength = passwordStrengthOf(form.password);
  const strengthLabel = ['', t('Weak', 'Dhaifu'), t('Fair', 'Wastani'), t('Good', 'Nzuri'), t('Strong', 'Imara')][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength];

  return (
    <div className="section-padding flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent mb-4">
            <Heart size={24} className="text-primary fill-primary" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
            {mode === 'login' ? t('Welcome back', 'Karibu tena') : t('Create your account', 'Unda akaunti yako')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login'
              ? t('Sign in to access your CerviBloom account', 'Ingia ili kufikia akaunti yako ya CerviBloom')
              : t('Track symptoms, get screening guidance, find care nearby, volunteer, and donate, all from one account.', 'Fuatilia dalili, pata mwongozo wa uchunguzi, tafuta huduma karibu, jitolee, na uchangie, yote kutoka akaunti moja.')}
          </p>
        </div>

        {error && <div className="error-box mb-5">{error}</div>}

        {mode === 'register' && (
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step > 1 ? 'bg-primary border-primary text-primary-foreground' : step === 1 ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                {step > 1 ? <CheckCircle2 size={14} /> : '1'}
              </div>
              <span className="text-xs font-medium">{t('Your Info', 'Taarifa Zako')}</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step === 2 ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                2
              </div>
              <span className="text-xs font-medium">{t('Security', 'Usalama')}</span>
            </div>
          </div>
        )}

        <div className="card-base p-8">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Username', 'Jina la mtumiaji')}</label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Password', 'Nywila')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full !pl-10 !pr-11 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('Trouble signing in? Email', 'Una shida kuingia? Tuma barua pepe')} <a href="mailto:cervibloom@gmail.com" className="text-primary hover:underline">cervibloom@gmail.com</a>
                </p>
              </div>

              <button type="submit" disabled={busy} className="btn-primary w-full justify-center mt-1">
                {busy ? t('Signing in...', 'Inaingia...') : t('Sign In', 'Ingia')}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : step === 1 ? (
            <form onSubmit={handleStep1} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Full name', 'Jina kamili')}</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Jane Wanjiku"
                    className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Username', 'Jina la mtumiaji')}</label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Email address', 'Anwani ya barua pepe')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('County', 'Kaunti')} <span className="text-muted-foreground font-normal">({t('optional', 'hiari')})</span></label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.county}
                    onChange={(e) => handleChange('county', e.target.value)}
                    placeholder="Nairobi"
                    className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t('Phone number', 'Nambari ya simu')}{' '}
                  <span className="text-muted-foreground font-normal">({t('optional', 'hiari')})</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-1">
                {t('Continue', 'Endelea')}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Create password', 'Unda nywila')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={t('Min. 8 characters', 'Angalau herufi 8')}
                    className="w-full !pl-10 !pr-11 !py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-border'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{t('Confirm password', 'Thibitisha nywila')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder={t('Re-enter your password', 'Ingiza tena nywila yako')}
                    className={`w-full !pl-10 !pr-11 !py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${form.confirmPassword && form.confirmPassword !== form.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p className="text-xs text-red-500">{t('Passwords do not match', 'Nywila hazilingani')}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.agreeTerms} onChange={(e) => handleChange('agreeTerms', e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border accent-primary" required />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {t('I agree to the', 'Nakubaliana na')}{' '}
                    <Link to="/terms" className="text-primary hover:underline">{t('Terms & Conditions', 'Masharti')}</Link>
                    {' '}{t('and', 'na')}{' '}
                    <Link to="/privacy" className="text-primary hover:underline">{t('Privacy Policy', 'Sera ya Faragha')}</Link>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.agreeHealth} onChange={(e) => handleChange('agreeHealth', e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border accent-primary" required />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {t('I understand that CerviBloom provides health guidance, not medical diagnosis.', 'Naelewa kwamba CerviBloom hutoa mwongozo wa afya, si utambuzi wa kimatibabu.')}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 justify-center py-3">
                  <ArrowLeft size={16} />
                  {t('Back', 'Rudi')}
                </button>
                <button type="submit" disabled={busy} className="btn-primary flex-1 justify-center">
                  {busy ? t('Creating...', 'Inaunda...') : t('Create Account', 'Unda Akaunti')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'login' ? (
            <>
              {t("Don't have an account?", 'Huna akaunti?')}{' '}
              <button type="button" onClick={() => switchMode('register')} className="text-primary font-semibold hover:underline">
                {t('Create one', 'Unda moja')}
              </button>
            </>
          ) : (
            <>
              {t('Already have an account?', 'Una akaunti tayari?')}{' '}
              <button type="button" onClick={() => switchMode('login')} className="text-primary font-semibold hover:underline">
                {t('Sign in', 'Ingia')}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
