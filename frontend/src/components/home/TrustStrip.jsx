import React from 'react';
import { ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const trustBadges = [
  {
    id: 'trust-who', shortName: 'WHO',
    nameEn: 'World Health Organization', nameSw: 'Shirika la Afya Duniani',
    descEn: 'Global health guidelines & cervical cancer data', descSw: 'Miongozo ya kimataifa ya afya na data ya saratani ya shingo ya kizazi',
    url: 'https://www.who.int', colorClass: 'bg-info-bg text-info',
  },
  {
    id: 'trust-moh', shortName: 'MOH',
    nameEn: 'Ministry of Health Kenya', nameSw: 'Wizara ya Afya Kenya',
    descEn: 'National health policy & facility registry', descSw: 'Sera ya kitaifa ya afya na orodha ya vituo',
    url: 'https://www.health.go.ke', colorClass: 'bg-success-bg text-success',
  },
  {
    id: 'trust-kchs', shortName: 'KCHS',
    nameEn: 'Kenya Community Health Strategy', nameSw: 'Mkakati wa Afya ya Jamii Kenya',
    descEn: 'Community screening programme data', descSw: 'Data ya mpango wa uchunguzi wa jamii',
    url: 'https://www.health.go.ke', colorClass: 'bg-warning-bg text-warning',
  },
  {
    id: 'trust-iarc', shortName: 'IARC',
    nameEn: 'IARC / Global Cancer Observatory', nameSw: 'IARC / Global Cancer Observatory',
    descEn: 'Cancer incidence & mortality statistics', descSw: 'Takwimu za visa na vifo vya saratani',
    url: 'https://gco.iarc.fr', colorClass: 'bg-accent text-accent-foreground',
  },
];

// Rewritten from the original mockup copy to describe what this app
// actually does: the content is grounded in public WHO/MOH guidance, not
// literally authored or reviewed by clinicians, and facility data is
// compiled from public reporting rather than a live registry integration.
// Claiming otherwise on a live health platform would be misleading.
const principles = [
  {
    id: 'principle-1',
    en: 'Health content is grounded in established WHO and Kenya MOH public guidance, and reviewed for accuracy before publishing.',
    sw: 'Maudhui ya afya yanategemea miongozo iliyowekwa ya WHO na Wizara ya Afya Kenya, na huangaliwa kwa usahihi kabla ya kuchapishwa.',
  },
  {
    id: 'principle-2',
    en: 'Facility information is compiled from public Ministry of Health Kenya and WHO Africa reporting.',
    sw: 'Taarifa za vituo zimekusanywa kutoka ripoti za umma za Wizara ya Afya Kenya na WHO Africa.',
  },
  {
    id: 'principle-3',
    en: 'CerviBloom does not provide diagnoses. All symptom guidance is rule-based and clearly labeled as preliminary information only.',
    sw: 'CerviBloom haitoi utambuzi. Mwongozo wote wa dalili unategemea kanuni zilizowekwa na umeandikwa wazi kama taarifa ya awali pekee.',
  },
];

export default function TrustStrip() {
  const { language } = useLanguage();
  const t = (en, sw) => (language === 'sw' ? sw : en);

  return (
    <section className="section-padding bg-secondary border-t border-border">
      <div className="container-base">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <ShieldCheck size={22} className="text-primary" />
            </div>
            <h2 className="font-heading font-bold text-2xl xl:text-3xl text-foreground">
              {t('Trusted Sources & Transparency', 'Vyanzo Vinavyoaminika na Uwazi')}
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              {t(
                'Every piece of health information on CerviBloom traces back to a named public health authority. We are transparent about where our data comes from.',
                'Kila taarifa ya afya kwenye CerviBloom inatokana na mamlaka ya afya ya umma iliyotajwa wazi. Tunaonyesha uwazi kuhusu data yetu inatoka wapi.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <a
                key={badge.id}
                href={badge.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-base p-5 flex flex-col gap-3 hover:border-primary transition-colors duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold font-heading ${badge.colorClass}`}>{badge.shortName}</div>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors duration-150" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-heading font-semibold text-sm text-foreground leading-snug">{t(badge.nameEn, badge.nameSw)}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(badge.descEn, badge.descSw)}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="card-base p-6 flex flex-col gap-4">
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
              {t('Our Content Principles', 'Kanuni Zetu za Maudhui')}
            </h3>
            <div className="flex flex-col gap-3">
              {principles.map((p) => (
                <div key={p.id} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(p.en, p.sw)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
