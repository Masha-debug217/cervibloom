import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, BookOpen, Heart, Shield, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection({ facilityCount, countyCount }) {
  const { language } = useLanguage();
  const t = (en, sw) => (language === 'sw' ? sw : en);

  const microStats = [
    { value: `${facilityCount}+`, labelEn: 'Verified Facilities', labelSw: 'Vituo Vilivyothibitishwa' },
    { value: `${countyCount}`, labelEn: 'Counties Covered', labelSw: 'Kaunti Zilizofikiwa' },
    { value: '2', labelEn: 'Languages Supported', labelSw: 'Lugha Zinazotumika' },
  ];

  const healthBars = [
    { pct: 85, labelEn: 'Preventable with screening', labelSw: 'Inazuilika kwa uchunguzi' },
    { pct: 70, labelEn: 'Treatable if caught early', labelSw: 'Inatibika ikigunduliwa mapema' },
    { pct: 95, labelEn: 'HPV vaccine effectiveness', labelSw: 'Ufanisi wa chanjo ya HPV' },
  ];

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent opacity-40 translate-x-1/2 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blush opacity-60 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="container-base section-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-accent border border-border text-primary text-sm font-medium">
              <Shield size={14} className="shrink-0" />
              <span>{t('Trusted Health Information for Kenya', 'Taarifa za Afya Zinazoaminika kwa Kenya')}</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="font-heading text-4xl xl:text-5xl 2xl:text-6xl font-bold text-foreground leading-tight text-balance">
                {t('Cervical Cancer Awareness & Screening', 'Ufahamu na Uchunguzi wa Saratani ya Shingo ya Kizazi')}
                <span className="block text-primary mt-1">{t('Across Kenya', 'Kote Kenya')}</span>
              </h1>
              <p className="text-base xl:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t(
                  'CerviBloom connects you to verified screening facilities, trusted health education, and a supportive community. Take informed steps toward your health.',
                  'CerviBloom inakuunganisha na vituo vya uchunguzi vilivyothibitishwa, elimu ya afya inayoaminika, na jamii inayokuunga mkono. Chukua hatua za busara kuelekea afya yako.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/directory" className="btn-primary">
                <MapPin size={16} />
                {t('Find a Screening Facility', 'Pata Kituo cha Uchunguzi')}
                <ArrowRight size={16} />
              </Link>
              <Link to="/info-hub" className="btn-outline">
                <BookOpen size={16} />
                {t('Learn More', 'Jifunza Zaidi')}
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              {microStats.map((stat) => (
                <div key={`hero-stat-${stat.labelEn}`} className="flex flex-col">
                  <span className="font-heading font-bold text-2xl text-primary tabular-nums">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{t(stat.labelEn, stat.labelSw)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-4 items-end">
            <div className="card-base w-full max-w-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Heart size={22} className="text-primary fill-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-foreground">
                    {t('Your Health Matters', 'Afya Yako ni Muhimu')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('Cervical cancer is preventable', 'Saratani ya shingo ya kizazi inazuilika')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {healthBars.map((item) => (
                  <div key={`hero-bar-${item.pct}`} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t(item.labelEn, item.labelSw)}</span>
                      <span className="font-semibold text-primary tabular-nums">{item.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <div className="card-base flex-1 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-xs text-foreground">
                    {t('Nearest Facility', 'Kituo Kilicho Karibu')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('Search the Directory', 'Tafuta kwenye Orodha')}</p>
                </div>
              </div>
              <div className="card-base flex-1 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center shrink-0">
                  <Globe size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-xs text-foreground">
                    {t('Two Languages', 'Lugha Mbili')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('English & Kiswahili', 'Kiingereza na Kiswahili')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-accent border-y border-border py-3">
        <div className="container-base">
          <p className="text-xs text-center text-accent-foreground">
            <span className="font-semibold">{t('Important: ', 'Muhimu: ')}</span>
            {t(
              'CerviBloom provides health education and facility information only. It does not provide medical diagnoses. Always consult a qualified healthcare provider.',
              'CerviBloom hutoa elimu ya afya na taarifa za vituo pekee. Haitoi utambuzi wa kitabibu. Daima wasiliana na mtoa huduma wa afya aliyehitimu.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
