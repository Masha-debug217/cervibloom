import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, User as UserIcon, ShieldCheck } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { KENYAN_COUNTIES } from '../constants/counties';

// Strips a stored "+254712345678" number down to the local digits the
// "+254" prefix input in this form (and SignUpForm) expects to display.
function localDigits(phoneNumber) {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/^\+254/, '').replace(/\D/g, '');
}

function fieldsFromUser(user) {
  if (!user) return null;
  return {
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email || '',
    phone: localDigits(user.phone_number),
    county: user.county || '',
    dateOfBirth: user.date_of_birth || '',
    lastScreeningYear: user.last_screening_year || '',
    hpvVaccineDoses: user.hpv_vaccine_doses || '',
    preferredLanguage: user.preferred_language || '',
  };
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const [form, setForm] = useState(() => fieldsFromUser(user));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    setForm(fieldsFromUser(user));
  }, [user]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  if (!form) {
    return (
      <div className="section-padding">
        <div className="container-base max-w-2xl">{t('Loading…', 'Inapakia…')}</div>
      </div>
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const phoneDigits = form.phone.replace(/\D/g, '');
      await updateProfile({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone_number: phoneDigits ? `+254${phoneDigits}` : '',
        county: form.county,
        date_of_birth: form.dateOfBirth || null,
        last_screening_year: form.lastScreeningYear,
        hpv_vaccine_doses: form.hpvVaccineDoses,
        preferred_language: form.preferredLanguage,
      });
      if (form.preferredLanguage && form.preferredLanguage.toLowerCase() !== language) {
        setLanguage(form.preferredLanguage.toLowerCase());
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err.response?.data ? JSON.stringify(err.response.data) : t('Could not save your changes.', 'Imeshindwa kuhifadhi mabadiliko yako.'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwError('');
    setPwSaved(false);
    if (pw.next.length < 8) {
      setPwError(t('New password must be at least 8 characters.', 'Nenosiri jipya lazima liwe na angalau herufi 8.'));
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError(t('New passwords do not match.', 'Manenosiri mapya hayafanani.'));
      return;
    }
    setPwSaving(true);
    try {
      await client.post('/auth/change-password/', {
        current_password: pw.current,
        new_password: pw.next,
      });
      setPw({ current: '', next: '', confirm: '' });
      setPwSaved(true);
    } catch (err) {
      setPwError(err.response?.data?.current_password?.[0] || t('Could not change your password.', 'Imeshindwa kubadilisha nenosiri lako.'));
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="section-padding">
      <div className="container-base max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            {t('My Profile', 'Wasifu Wangu')}
          </h1>
          <p className="text-muted-foreground">
            {t('Manage your account details and health profile.', 'Simamia maelezo ya akaunti yako na wasifu wa afya.')}
          </p>
        </div>

        <div className="card-base p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
            <UserIcon size={20} className="text-primary" />
          </div>
          <div>
            <div className="font-heading font-semibold text-foreground">{user.username}</div>
            <div className="text-xs text-muted-foreground">
              {user.role === 'ADMIN' ? t('Admin account', 'Akaunti ya Msimamizi') : t('User account', 'Akaunti ya Mtumiaji')}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="card-base p-5 flex flex-col gap-4 mb-6">
          <h2 className="font-heading font-semibold text-foreground">{t('Personal details', 'Maelezo binafsi')}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('First name', 'Jina la kwanza')}</label>
              <input type="text" className="input-field" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Last name', 'Jina la ukoo')}</label>
              <input type="text" className="input-field" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Email address', 'Anwani ya barua pepe')}</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Phone number', 'Nambari ya simu')}</label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-xl bg-muted border border-border text-sm text-muted-foreground font-medium shrink-0">+254</div>
              <input type="tel" className="input-field flex-1" placeholder="712 345 678" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('County', 'Kaunti')}</label>
              <select className="input-field" value={form.county} onChange={(e) => set('county', e.target.value)}>
                <option value="">{t('Select county', 'Chagua kaunti')}</option>
                {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Date of birth', 'Tarehe ya kuzaliwa')}</label>
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </div>
          </div>

          <h2 className="font-heading font-semibold text-foreground mt-2">{t('Health profile', 'Wasifu wa Afya')}</h2>
          <p className="text-xs text-muted-foreground -mt-2">
            {t('Self-reported and optional. Only you can see this.', 'Umejiripoti mwenyewe na si lazima. Wewe pekee ndiye unaweza kuona hii.')}
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('Last cervical screening (approximate year)', 'Uchunguzi wa mwisho wa shingo ya kizazi (mwaka wa karibu)')}
            </label>
            <select className="input-field" value={form.lastScreeningYear} onChange={(e) => set('lastScreeningYear', e.target.value)}>
              <option value="">{t('Not set', 'Haijawekwa')}</option>
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

          <h2 className="font-heading font-semibold text-foreground mt-2">{t('Preferences', 'Mapendeleo')}</h2>

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

          {saveError && <div className="error-box">{saveError}</div>}
          {saved && (
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <CheckCircle2 size={16} />
              {t('Profile updated.', 'Wasifu umesasishwa.')}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary py-3 text-sm justify-center">
            {saving ? <Loader2 size={16} className="animate-spin" /> : t('Save changes', 'Hifadhi mabadiliko')}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="card-base p-5 flex flex-col gap-4">
          <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            {t('Change password', 'Badilisha nenosiri')}
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('Current password', 'Nenosiri la sasa')}</label>
            <input
              type={showPw ? 'text' : 'password'}
              className="input-field"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('New password', 'Nenosiri jipya')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field !pr-11"
                  value={pw.next}
                  onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Confirm new password', 'Thibitisha nenosiri jipya')}</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
          </div>

          {pwError && <div className="error-box">{pwError}</div>}
          {pwSaved && (
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <CheckCircle2 size={16} />
              {t('Password changed.', 'Nenosiri limebadilishwa.')}
            </div>
          )}

          <button type="submit" disabled={pwSaving} className="btn-outline py-3 text-sm justify-center">
            {pwSaving ? <Loader2 size={16} className="animate-spin" /> : t('Update password', 'Sasisha nenosiri')}
          </button>
        </form>
      </div>
    </div>
  );
}
