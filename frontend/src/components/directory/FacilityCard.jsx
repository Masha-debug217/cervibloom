import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TYPE_LABEL = {
  PUBLIC: { en: 'Public Hospital', sw: 'Hospitali ya Umma' },
  PRIVATE: { en: 'Private Clinic', sw: 'Kliniki ya Kibinafsi' },
  NGO: { en: 'NGO Clinic', sw: 'Kliniki ya NGO' },
  HEALTH_CENTRE: { en: 'Health Centre', sw: 'Kituo cha Afya' },
};

export default function FacilityCard({ facility }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const services = ((sw && facility.services_sw) || facility.services || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  const mapsUrl = facility.latitude && facility.longitude
    ? `https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent(`${facility.name}, ${facility.county}`)}`;

  const typeInfo = TYPE_LABEL[facility.facility_type];
  const typeLabel = typeInfo ? t(typeInfo.en, typeInfo.sw) : facility.facility_type;

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

      <div className="flex gap-2 mt-auto pt-2 border-t border-border">
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
    </div>
  );
}
