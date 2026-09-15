import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, ExternalLink, Building2, CalendarPlus, X, CheckCircle2 } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const TYPE_LABEL = {
  PUBLIC: { en: 'Public Hospital', sw: 'Hospitali ya Umma' },
  PRIVATE: { en: 'Private Clinic', sw: 'Kliniki ya Kibinafsi' },
  NGO: { en: 'NGO Clinic', sw: 'Kliniki ya NGO' },
  HEALTH_CENTRE: { en: 'Health Centre', sw: 'Kituo cha Afya' },
};

function RequestVisitModal({ facility, t, onClose }) {
  const [form, setForm] = useState({ preferred_date: '', preferred_time: '', reason: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await client.post('/appointment-requests/', {
        facility: facility.id,
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        reason: form.reason,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : t('Could not send your request.', 'Imeshindwa kutuma ombi lako.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-base w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t('Request a Visit', 'Omba Ziara')}</p>
            <h3 className="font-heading font-bold text-lg text-foreground">{facility.name}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <h4 className="font-heading font-semibold text-foreground mb-2">{t('Request Sent', 'Ombi Limetumwa')}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t(
                `This is a request, not a confirmed appointment. ${facility.name} may contact you to confirm a time.`,
                `Hii ni ombi, si miadi iliyothibitishwa. ${facility.name} inaweza kuwasiliana nawe kuthibitisha muda.`
              )}
            </p>
            <button onClick={onClose} className="btn-outline text-sm justify-center">{t('Close', 'Funga')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="error-box">{error}</div>}
            <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-xl bg-muted border border-border">
              {t(
                'This sends your preferred date to the facility as a request. It is not a confirmed booking; the facility may contact you by phone to confirm.',
                'Hii inatuma tarehe unayopendelea kwa kituo kama ombi. Si miadi iliyothibitishwa; kituo kinaweza kuwasiliana nawe kwa simu kuthibitisha.'
              )}
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Preferred Date', 'Tarehe Unayopendelea')}</label>
              <input
                type="date"
                className="input-field"
                required
                value={form.preferred_date}
                onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Preferred Time (optional)', 'Muda Unaopendelea (hiari)')}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t('e.g. Morning, 10:00 AM', 'mfano: Asubuhi, 10:00 AM')}
                value={form.preferred_time}
                onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Reason (optional)', 'Sababu (hiari)')}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t('e.g. Routine screening, Follow-up', 'mfano: Uchunguzi wa kawaida, Ufuatiliaji')}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary justify-center">
              {busy ? t('Sending...', 'Inatuma...') : t('Send Request', 'Tuma Ombi')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function FacilityCard({ facility }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showRequest, setShowRequest] = useState(false);

  const services = ((sw && facility.services_sw) || facility.services || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  const mapsUrl = facility.latitude && facility.longitude
    ? `https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent(`${facility.name}, ${facility.county}`)}`;

  const typeInfo = TYPE_LABEL[facility.facility_type];
  const typeLabel = typeInfo ? t(typeInfo.en, typeInfo.sw) : facility.facility_type;

  function handleRequestVisit() {
    if (!user) {
      navigate('/auth', { state: { from: '/directory' } });
      return;
    }
    setShowRequest(true);
  }

  return (
    <div className="card-base p-5 flex flex-col gap-4 hover:border-primary transition-colors duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="tag-service bg-muted text-muted-foreground text-xs">{typeLabel}</span>
            {facility.is_wics_site && (
              <span className="tag-service bg-success-bg text-success text-xs">{t('WICS site', 'Kituo cha WICS')}</span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-sm text-foreground leading-snug mt-1">{facility.name}</h3>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blush flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-primary" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <MapPin size={13} className="shrink-0 mt-0.5 text-primary" />
          <span>{facility.address ? `${facility.address}, ` : ''}{facility.county} {t('County', 'Kaunti')}</span>
        </div>
        {facility.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone size={13} className="shrink-0 text-primary" />
            <span>{facility.phone}</span>
          </div>
        )}
        {(facility.open_days || facility.open_hours) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={13} className="shrink-0 text-primary" />
            <span>{[facility.open_days, facility.open_hours].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      {services.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('Services', 'Huduma')}</p>
          <div className="flex flex-wrap gap-1.5">
            {services.map((svc) => (
              <span key={svc} className="tag-service bg-accent text-accent-foreground text-xs">{svc}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border">
        <div className="flex gap-2">
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1 text-xs py-2.5">
            <MapPin size={13} />
            {t('Get Directions', 'Pata Mwelekeo')}
            <ExternalLink size={12} />
          </a>
          {facility.phone && (
            <a href={`tel:${facility.phone}`} className="btn-outline text-xs py-2.5 px-4">
              <Phone size={13} />
              {t('Call', 'Piga Simu')}
            </a>
          )}
        </div>
        <button onClick={handleRequestVisit} className="btn-outline text-xs py-2.5 justify-center">
          <CalendarPlus size={13} />
          {t('Request a Screening Visit', 'Omba Ziara ya Uchunguzi')}
        </button>
      </div>

      {showRequest && <RequestVisitModal facility={facility} t={t} onClose={() => setShowRequest(false)} />}
    </div>
  );
}
