import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check, Shield, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KENYAN_COUNTIES } from '../../constants/counties';

function destinationFor(role) {
  return role === 'ADMIN' ? '/admin' : '/dashboard';
}

function passwordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = { 1: ['Weak', 'Dhaifu'], 2: ['Fair', 'Wastani'], 3: ['Good', 'Nzuri'], 4: ['Strong', 'Imara'], 5: ['Very Strong', 'Imara Sana'] };
  const bucket = Math.min(score, 5) || 1;
  return { score: bucket, label: labels[bucket] };
}

const strengthColor = { 1: 'bg-red-500', 2: 'bg-yellow-500', 3: 'bg-yellow-400', 4: 'bg-success', 5: 'bg-success' };
const strengthText = { 1: 'text-red-600', 2: 'text-yellow-600', 3: 'text-yellow-600', 4: 'text-success', 5: 'text-success' };

export default function SignUpForm({ t, language, setLanguage, onSwitchToSignIn }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched1, setTouched1] = useState(false);
  const [touched2, setTouched2] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', county: '', dateOfBirth: '',
    password: '', confirmPassword: '', consentData: false, consentTerms: false, consentHealth: false,
    lastScreeningYear: '', hpvVaccineDoses: '', preferredLanguage: language === 'sw' ? 'SW' : 'EN',
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const step1Errors = {
    firstName: touched1 && !form.firstName ? t('Required', 'Inahitajika') : '',
    lastName: touched1 && !form.lastName ? t('Required', 'Inahitajika') : '',
    username: touched1 && !form.username ? t('Required', 'Inahitajika') : '',
    email: touched1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? t('Enter a valid email address', 'Ingiza anwani halali ya barua pepe') : '',
    phone: touched1 && !form.phone ? t('Required', 'Inahitajika') : '',
    county: touched1 && !form.county ? t('Select your county', 'Chagua kaunti yako') : '',
    dateOfBirth: touched1 && !form.dateOfBirth ? t('Required', 'Inahitajika') : '',
  };
  const step1Valid = !Object.values(step1Errors).some(Boolean);

  const passwordMismatch = form.confirmPassword && form.confirmPassword !== form.password;
  const step2Errors = {
    password: touched2 && form.password.length < 8 ? t('Minimum 8 characters', 'Angalau herufi 8') : '',
    confirmPassword: touched2 && passwordMismatch ? t('Passwords do not match', 'Nenosiri hazifanani') : '',
    consents: touched2 && !(form.consentData && form.consentTerms && form.consentHealth) ? t('Please accept all consents to continue.', 'Tafadhali kubali idhini zote kuendelea.') : '',
  };
  const step2Valid = form.password.length >= 8 && !passwordMismatch && form.consentData && form.consentTerms && form.consentHealth;

  const strength = passwordStrength(form.password);

  function onStep1Submit(e) {
    e.preventDefault();
    setTouched1(true);
    if (!step1Valid) return;
    setStep(2);
  }

  function onStep2Submit(e) {
    e.preventDefault();
    setTouched2(true);
    if (!step2Valid) return;
    setStep(3);
  }

  async function onStep3Submit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const phoneDigits = form.phone.replace(/\D/g, '');
      await register({
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.username,
        email: form.email,
        phone_number: phoneDigits ? `+254${phoneDigits}` : '',
        county: form.county,
        date_of_birth: form.dateOfBirth,
        password: form.password,
        last_screening_year: form.lastScreeningYear,
        hpv_vaccine_doses: form.hpvVaccineDoses,
        preferred_language: form.preferredLanguage,
      });
      if (form.preferredLanguage && form.preferredLanguage.toLowerCase() !== language) {
        setLanguage(form.preferredLanguage.toLowerCase());
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : t('Registration failed.', 'Usajili umeshindwa.'));
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  }

  function goToDashboard() {
    navigate(destinationFor('USER'));
  }

  const stepLabels = t(['Personal Details', 'Security & Consent', 'Health Profile'], ['Maelezo Binafsi', 'Usalama na Idhini', 'Wasifu wa Afya']);

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          {t('Welcome to CerviBloom!', 'Karibu CerviBloom!')}
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          {t(
            `Your account has been created, ${form.firstName || 'there'}. Your health journey starts now.`,
            `Akaunti yako imefunguliwa, ${form.firstName || ''}. Safari yako ya afya inaanza sasa.`
          )}
        </p>

        <div className="flex flex-col gap-3 text-left mb-8 p-4 rounded-xl bg-accent border border-border">
          {[
            { icon: Heart, text: t('Your health profile is saved, so the Symptom Navigator and Screening Directory are ready when you need them.', 'Wasifu wako wa afya umehifadhiwa, hivyo Kiongozi cha Dalili na Orodha ya Uchunguzi viko tayari.') },
            { icon: Shield, text: t('Your password is encrypted and never stored in plain text.', 'Nenosiri lako limesimbwa na halijawahi kuhifadhiwa waziwazi.') },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-2.5">
                <Icon size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={goToDashboard} className="btn-primary w-full py-3 text-sm">
          {t('Go to my Dashboard', 'Nenda kwenye Dashibodi yangu')}
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-1">
          {t('Create your account', 'Fungua akaunti yako')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('Free access to all CerviBloom features.', 'Ufikiaji wa bure wa vipengele vyote vya CerviBloom.')}
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="flex items-center gap-0 mb-8">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-semibold transition-all ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}>
                {step > s ? <Check size={12} /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>
                {stepLabels[s - 1]}
              </span>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 mx-3 transition-all ${step > s ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={onStep1Submit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('First name', 'Jina la kwanza')}</label>
              <input type="text" className="input-field" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              {step1Errors.firstName && <p className="mt-1 text-xs text-red-600">{step1Errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Last name', 'Jina la ukoo')}</label>
              <input type="text" className="input-field" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              {step1Errors.lastName && <p className="mt-1 text-xs text-red-600">{step1Errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Username', 'Jina la mtumiaji')}</label>
            <input type="text" className="input-field" value={form.username} onChange={(e) => set('username', e.target.value)} />
            {step1Errors.username && <p className="mt-1 text-xs text-red-600">{step1Errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Email address', 'Anwani ya barua pepe')}</label>
            <input type="email" className="input-field" placeholder="amina@example.co.ke" value={form.email} onChange={(e) => set('email', e.target.value)} />
            {step1Errors.email && <p className="mt-1 text-xs text-red-600">{step1Errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Phone number', 'Nambari ya simu')}</label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-xl bg-muted border border-border text-sm text-muted-foreground font-medium shrink-0">+254</div>
              <input type="tel" className="input-field flex-1" placeholder="712 345 678" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            {step1Errors.phone && <p className="mt-1 text-xs text-red-600">{step1Errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('County', 'Kaunti')}</label>
              <select className="input-field" value={form.county} onChange={(e) => set('county', e.target.value)}>
                <option value="">{t('Select county', 'Chagua kaunti')}</option>
                {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {step1Errors.county && <p className="mt-1 text-xs text-red-600">{step1Errors.county}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Date of birth', 'Tarehe ya kuzaliwa')}</label>
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              {step1Errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{step1Errors.dateOfBirth}</p>}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-sm mt-2">
            {t('Continue', 'Endelea')}
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onStep2Submit} className="flex flex-col gap-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Create password', 'Unda nenosiri')}</label>
            <p className="text-xs text-muted-foreground mb-2">{t('At least 8 characters.', 'Angalau herufi 8.')}</p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field !pr-11"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strengthColor[strength.score] : 'bg-border'}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strengthText[strength.score]}`}>{t(...strength.label)}</p>
              </div>
            )}
            {step2Errors.password && <p className="mt-1 text-xs text-red-600">{step2Errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Confirm password', 'Thibitisha nenosiri')}</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="input-field !pr-11"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {step2Errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{step2Errors.confirmPassword}</p>}
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-accent border border-border">
            <div className="flex items-start gap-2.5">
              <Shield size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs font-heading font-semibold text-primary">{t('Health & Privacy Consent', 'Idhini ya Afya na Faragha')}</p>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-primary shrink-0" checked={form.consentData} onChange={(e) => set('consentData', e.target.checked)} />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {t('I consent to CerviBloom securely storing my health profile data.', 'Nakubali CerviBloom kuhifadhi kwa usalama data yangu ya afya.')}
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-primary shrink-0" checked={form.consentTerms} onChange={(e) => set('consentTerms', e.target.checked)} />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {t('I agree to the Terms & Conditions and Privacy Policy.', 'Nakubaliana na Masharti na Sera ya Faragha.')}
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-primary shrink-0" checked={form.consentHealth} onChange={(e) => set('consentHealth', e.target.checked)} />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {t('I understand that CerviBloom provides health education only and is not a substitute for professional medical advice.', 'Naelewa kwamba CerviBloom hutoa elimu ya afya tu na si mbadala wa ushauri wa kitaalamu wa matibabu.')}
              </span>
            </label>
            {step2Errors.consents && <p className="text-xs text-red-600">{step2Errors.consents}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3 text-sm justify-center">
              <ArrowLeft size={16} />
              {t('Back', 'Rudi')}
            </button>
            <button type="submit" className="btn-primary flex-1 py-3 text-sm justify-center">
              {t('Continue', 'Endelea')}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={onStep3Submit} className="flex flex-col gap-5" noValidate>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent border border-border">
            <Heart size={14} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('This helps us tailor what you see. All fields are optional.', 'Hii inatusaidia kubinafsisha unachokiona. Sehemu zote ni za hiari.')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('Last cervical screening (approximate year)', 'Uchunguzi wa mwisho wa shingo ya kizazi (mwaka wa karibu)')}
            </label>
            <select className="input-field" value={form.lastScreeningYear} onChange={(e) => set('lastScreeningYear', e.target.value)}>
              <option value="">{t('Select year or never screened', 'Chagua mwaka au haujawahi kuchunguzwa')}</option>
              <option value="never">{t('Never been screened', 'Sijawahi kuchunguzwa')}</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
              <option value="before2015">{t('Before 2015', 'Kabla ya 2015')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('HPV vaccine doses received', 'Dozi za chanjo ya HPV zilizopokelewa')}</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '0', label: t('None', 'Hakuna') },
                { value: '1', label: t('1 dose', 'Dozi 1') },
                { value: '2', label: t('2 doses', 'Dozi 2') },
                { value: 'unsure', label: t('Not sure', 'Sijui') },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-colors ${form.hpvVaccineDoses === opt.value ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary'}`}
                >
                  <input type="radio" name="hpvVaccineDoses" value={opt.value} className="sr-only" checked={form.hpvVaccineDoses === opt.value} onChange={(e) => set('hpvVaccineDoses', e.target.value)} />
                  <span className="text-xs font-medium text-foreground text-center leading-tight">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Preferred app language', 'Lugha unayopendelea ya programu')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: 'EN', label: 'English' }, { value: 'SW', label: 'Kiswahili' }].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${form.preferredLanguage === opt.value ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary'}`}
                >
                  <input type="radio" name="preferredLanguage" value={opt.value} className="w-4 h-4 accent-primary" checked={form.preferredLanguage === opt.value} onChange={(e) => set('preferredLanguage', e.target.value)} />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1 py-3 text-sm justify-center">
              <ArrowLeft size={16} />
              {t('Back', 'Rudi')}
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 text-sm justify-center">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  {t('Create Account', 'Fungua Akaunti')}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('Already have an account?', 'Una akaunti tayari?')}{' '}
        <button type="button" onClick={onSwitchToSignIn} className="text-primary font-semibold hover:underline">
          {t('Sign in', 'Ingia')}
        </button>
      </p>
    </div>
  );
}
