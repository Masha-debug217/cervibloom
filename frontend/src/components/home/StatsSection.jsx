import React from 'react';
import { AlertTriangle, TrendingUp, Heart, MapPin, FileText, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function StatsSection({ facilityCount, countyCount }) {
  const { language } = useLanguage();
  const t = (en, sw) => (language === 'sw' ? sw : en);

  const stats = [
    {
      id: 'stat-1', icon: AlertTriangle, value: '5,765',
      labelEn: 'New cases diagnosed annually in Kenya', labelSw: 'Visa vipya vinavyogunduliwa kila mwaka Kenya',
      sourceEn: 'WHO, 2023', sourceSw: 'WHO, 2023',
    },
    {
      id: 'stat-2', icon: TrendingUp, value: '#2',
      labelEn: 'Most common cancer among Kenyan women', labelSw: 'Saratani ya pili kwa wingi miongoni mwa wanawake wa Kenya',
      sourceEn: 'MOH Kenya, 2022', sourceSw: 'Wizara ya Afya Kenya, 2022',
    },
    {
      id: 'stat-3', icon: Heart, value: '85%',
      labelEn: 'Of cases are preventable through screening & vaccination', labelSw: 'Ya visa vinazuilika kupitia uchunguzi na chanjo',
      sourceEn: 'KCHS, 2021', sourceSw: 'KCHS, 2021',
    },
    {
      // Real facility count, not the mockup's fixed "290+".
      id: 'stat-4', icon: MapPin, value: `${facilityCount}+`,
      labelEn: 'Verified screening facilities in the Directory', labelSw: 'Vituo vya uchunguzi vilivyothibitishwa kwenye Orodha',
      sourceEn: 'CerviBloom Directory', sourceSw: 'Orodha ya CerviBloom',
    },
    {
      // Real county count, not the mockup's fixed "47".
      id: 'stat-5', icon: Globe, value: `${countyCount}`,
      labelEn: 'Kenyan counties with a listed facility', labelSw: 'Kaunti za Kenya zenye kituo kilichoorodheshwa',
      sourceEn: 'CerviBloom Directory', sourceSw: 'Orodha ya CerviBloom',
    },
    {
      // Replaces the mockup's "18,400+ Women reached" - not a metric this
      // app actually tracks. Swapped for a real, evergreen platform fact.
      id: 'stat-6', icon: FileText, value: '2',
      labelEn: 'Languages supported: English and Kiswahili', labelSw: 'Lugha zinazotumika: Kiingereza na Kiswahili',
      sourceEn: 'CerviBloom Platform', sourceSw: 'Jukwaa la CerviBloom',
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-base">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            {t('Why This Matters', 'Kwa Nini Hii Ni Muhimu')}
          </span>
          <h2 className="font-heading font-bold text-3xl xl:text-4xl text-foreground text-balance">
            {t('The Reality of Cervical Cancer in Kenya', 'Hali Halisi ya Saratani ya Shingo ya Kizazi Kenya')}
          </h2>
          <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
            {t(
              'Cervical cancer is a significant public health challenge in Kenya, and one of the most preventable cancers when it is caught early.',
              'Saratani ya shingo ya kizazi ni changamoto kubwa ya afya ya umma nchini Kenya, na ni miongoni mwa saratani zinazozuilika zaidi zikigunduliwa mapema.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="card-base p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-heading font-bold text-3xl tabular-nums text-primary">{stat.value}</span>
                  <p className="text-sm text-foreground leading-snug font-medium">{t(stat.labelEn, stat.labelSw)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-auto">
                  {t('Source:', 'Chanzo:')} {t(stat.sourceEn, stat.sourceSw)}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          {t(
            'Statistics are sourced from WHO, the Kenya Ministry of Health (MOH), and the Kenya Community Health Strategy (KCHS). Data reflects the latest publicly available reports.',
            'Takwimu zimetolewa na WHO, Wizara ya Afya Kenya (MOH), na Mkakati wa Afya ya Jamii Kenya (KCHS). Data inaonyesha ripoti za hivi karibuni zinazopatikana hadharani.'
          )}
        </p>
      </div>
    </section>
  );
}
