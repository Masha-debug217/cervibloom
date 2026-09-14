import React from 'react';
import { BookOpen, Search, Stethoscope, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const steps = [
  {
    id: 'step-1',
    icon: BookOpen,
    stepEn: 'Step 1',
    stepSw: 'Hatua ya 1',
    titleEn: 'Learn & Understand',
    titleSw: 'Jifunza na Elewa',
    descEn: 'Explore our Info Hub for plain-language explanations of cervical cancer: what it is, risk factors, prevention, and signs to watch for.',
    descSw: 'Chunguza Taarifa yetu kwa maelezo rahisi kuhusu saratani ya shingo ya kizazi: ni nini, sababu za hatari, kinga, na dalili za kuzingatia.',
  },
  {
    id: 'step-2',
    icon: Search,
    stepEn: 'Step 2',
    stepSw: 'Hatua ya 2',
    titleEn: 'Find a Facility',
    titleSw: 'Tafuta Kituo',
    descEn: 'Search our directory of verified screening centres across Kenya. Filter by county and see vaccine and screening kit availability.',
    descSw: 'Tafuta orodha yetu ya vituo vya uchunguzi vilivyothibitishwa kote Kenya. Chuja kwa kaunti na uone upatikanaji wa chanjo na vifaa vya uchunguzi.',
  },
  {
    // Real feature. The mockup's original "Book Your Appointment" step
    // describes a booking flow that doesn't exist yet in this app; this
    // maps the same step slot to the Symptom Navigator, which does.
    id: 'step-3',
    icon: Stethoscope,
    stepEn: 'Step 3',
    stepSw: 'Hatua ya 3',
    titleEn: 'Check Your Symptoms',
    titleSw: 'Angalia Dalili Zako',
    descEn: 'Use the Symptom Navigator for a short guided check-in, and get a clear next step: keep monitoring, discuss at your next visit, or seek care soon.',
    descSw: 'Tumia Kiongozi cha Dalili kwa maswali mafupi yanayokuongoza, na upate hatua wazi ijayo: endelea kufuatilia, zungumza wakati wa ziara yako ijayo, au tafuta huduma haraka.',
  },
  {
    id: 'step-4',
    icon: Users,
    stepEn: 'Step 4',
    stepSw: 'Hatua ya 4',
    titleEn: 'Get Support',
    titleSw: 'Pata Msaada',
    descEn: 'Apply to volunteer, support a partner organization, or read stories from other women on their own screening and recovery journeys.',
    descSw: 'Omba kujitolea, saidia shirika mshirika, au soma hadithi za wanawake wengine katika safari zao za uchunguzi na kupona.',
  },
];

export default function HowItWorksSection() {
  const { language } = useLanguage();
  const t = (en, sw) => (language === 'sw' ? sw : en);

  return (
    <section className="section-padding bg-secondary border-y border-border">
      <div className="container-base">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            {t('Simple Steps', 'Hatua Rahisi')}
          </span>
          <h2 className="font-heading font-bold text-3xl xl:text-4xl text-foreground text-balance">
            {t('How CerviBloom Works', 'Jinsi CerviBloom Inavyofanya Kazi')}
          </h2>
          <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
            {t(
              'From learning to screening, we guide you through every step of your cervical health journey.',
              'Kutoka kujifunza hadi kupimwa, tunakuongoza katika kila hatua ya safari yako ya afya ya shingo ya kizazi.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="card-base p-6 flex flex-col gap-4 hover:border-primary transition-colors duration-200 group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors duration-200">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <span className="font-heading font-bold text-3xl text-border tabular-nums">0{index + 1}</span>
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t(step.stepEn, step.stepSw)}</span>
                <h3 className="font-heading font-semibold text-base text-foreground">{t(step.titleEn, step.titleSw)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descEn, step.descSw)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
