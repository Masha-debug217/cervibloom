import React, { useState } from 'react';
import { ChevronDown, AlertCircle, Dna, Shield, Stethoscope } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TOPICS = [
  {
    id: 'topic-what',
    icon: AlertCircle,
    colorClass: 'bg-accent text-accent-foreground',
    iconColorClass: 'text-primary',
    titleEn: 'What Is Cervical Cancer?',
    titleSw: 'Saratani ya Shingo ya Kizazi Ni Nini?',
    summaryEn: 'Cervical cancer begins in the cells of the cervix, the lower part of the uterus that connects to the vagina.',
    summarySw: 'Saratani ya shingo ya kizazi huanza katika seli za shingo ya kizazi, sehemu ya chini ya uterasi inayounganika na uke.',
    contentEn: `Cervical cancer is a type of cancer that occurs in the cells of the cervix, the lower part of the uterus that connects to the vagina. The cervix connects the body of the uterus to the vagina (birth canal).

Most cervical cancers are caused by various strains of Human Papillomavirus (HPV), a sexually transmitted infection. When exposed to HPV, a woman's immune system typically prevents the virus from doing harm. In a small group of women, however, the virus survives for years, contributing to the process that causes some cervical cells to become cancer cells.

In Kenya, cervical cancer is the second most common cancer in women and the leading cause of cancer-related deaths among women of reproductive age. It is estimated that over 5,700 women are diagnosed with cervical cancer each year in Kenya.

Early-stage cervical cancer generally produces no signs or symptoms, which is why regular screening is critically important. Screening can detect precancerous changes in the cervix before they develop into cancer.`,
    contentSw: `Saratani ya shingo ya kizazi ni aina ya saratani inayotokea katika seli za shingo ya kizazi, sehemu ya chini ya uterasi inayounganika na uke. Shingo ya kizazi inaunganisha mwili wa uterasi na uke (njia ya kuzaa).

Saratani nyingi za shingo ya kizazi husababishwa na aina mbalimbali za Human Papillomavirus (HPV), maambukizo yanayoenezwa kwa njia ya ngono. Mwili wa mwanamke kwa kawaida huzuia virusi kufanya madhara. Hata hivyo, kwa wanawake wachache, virusi hubaki kwa miaka mingi, na kuchangia mchakato unaosababisha baadhi ya seli za shingo ya kizazi kuwa seli za saratani.

Kenya, saratani ya shingo ya kizazi ni saratani ya pili kwa wingi kwa wanawake na chanzo kikuu cha vifo vinavyohusiana na saratani kwa wanawake wa umri wa kuzaa. Inakadiriwa kuwa wanawake zaidi ya 5,700 wanagundulika na saratani ya shingo ya kizazi kila mwaka Kenya.

Saratani ya shingo ya kizazi katika hatua za awali kwa kawaida haina dalili, ndiyo maana uchunguzi wa kawaida ni muhimu sana. Uchunguzi unaweza kugundua mabadiliko ya kabla ya saratani kabla hayajawa saratani.`,
    tags: ['Definition', 'Prevalence', 'Kenya Statistics'],
  },
  {
    id: 'topic-causes',
    icon: Dna,
    colorClass: 'bg-info-bg text-info',
    iconColorClass: 'text-info',
    titleEn: 'Causes & Risk Factors',
    titleSw: 'Sababu na Sababu za Hatari',
    summaryEn: 'Nearly all cervical cancer cases are linked to infection with Human Papillomavirus (HPV). Other risk factors increase vulnerability.',
    summarySw: 'Karibu visa vyote vya saratani ya shingo ya kizazi vinahusishwa na maambukizo ya Human Papillomavirus (HPV). Sababu zingine za hatari huongeza uwezekano.',
    contentEn: `Nearly all cervical cancers are caused by infection with certain strains of Human Papillomavirus (HPV). HPV is a very common sexually transmitted infection: most people who are sexually active will get HPV at some point, but most infections clear on their own.

Key risk factors include:

• HPV infection, particularly HPV strains 16 and 18, which cause approximately 70% of cervical cancers
• Multiple sexual partners, which increases the chance of HPV exposure
• Early sexual activity, before age 16, which increases risk
• A weakened immune system, including HIV/AIDS, which is highly prevalent in Kenya
• Long-term use of oral contraceptives (5+ years)
• Smoking, which doubles the risk of cervical cancer
• A history of other sexually transmitted infections such as chlamydia, gonorrhoea, or herpes
• Low socioeconomic status, associated with limited access to screening services
• Multiple full-term pregnancies, three or more

In Kenya, the high prevalence of HIV (approximately 4.9% of adults) significantly increases the risk of persistent HPV infection and progression to cervical cancer.`,
    contentSw: `Karibu saratani zote za shingo ya kizazi husababishwa na maambukizo ya aina fulani za Human Papillomavirus (HPV). HPV ni maambukizo ya kawaida sana yanayoenezwa kwa njia ya ngono: watu wengi wanaofanya ngono watapata HPV wakati fulani, lakini maambukizo mengi hupona yenyewe.

Sababu kuu za hatari ni pamoja na:

• Maambukizo ya HPV, hasa aina za HPV 16 na 18, zinazosababisha takriban 70% ya saratani za shingo ya kizazi
• Washirika wengi wa ngono, ambao huongeza nafasi ya kuambukizwa HPV
• Shughuli za ngono mapema, kabla ya umri wa miaka 16, ambazo huongeza hatari
• Mfumo dhaifu wa kinga, ikiwemo VVU/UKIMWI, ambayo ni ya kawaida sana Kenya
• Matumizi ya muda mrefu ya vidonge vya uzazi wa mpango (miaka 5+)
• Uvutaji sigara, unaoongeza mara mbili hatari ya saratani ya shingo ya kizazi
• Historia ya maambukizo mengine ya ngono kama vile klamidia, kisonono, au herpes
• Hali ya chini ya kiuchumi, inayohusishwa na ufikiaji mdogo wa huduma za uchunguzi
• Uzazi mwingi, watatu au zaidi

Kenya, maambukizo ya juu ya VVU (takriban 4.9% ya watu wazima) huongeza sana hatari ya maambukizo ya muda mrefu ya HPV na maendeleo ya saratani ya shingo ya kizazi.`,
    tags: ['HPV', 'HIV/AIDS', 'Risk Factors'],
  },
  {
    id: 'topic-prevention',
    icon: Shield,
    colorClass: 'bg-success-bg text-success',
    iconColorClass: 'text-success',
    titleEn: 'Prevention & Vaccines',
    titleSw: 'Kuzuia na Chanjo',
    summaryEn: 'Cervical cancer is one of the most preventable cancers. HPV vaccination and regular screening are the two most effective prevention strategies.',
    summarySw: 'Saratani ya shingo ya kizazi ni miongoni mwa saratani zinazozuilika zaidi. Chanjo ya HPV na uchunguzi wa kawaida ni mikakati miwili bora zaidi ya kuzuia.',
    contentEn: `Cervical cancer is largely preventable. The two key prevention strategies are:

1. HPV Vaccination
The HPV vaccine protects against the strains of HPV that cause most cervical cancers. In Kenya, the national HPV vaccination programme targets girls aged 10 years as part of the school immunisation programme. The vaccine is most effective when given before a girl becomes sexually active.

Available HPV vaccines in Kenya include:
• Cervarix (2-dose), which protects against HPV types 16 and 18
• Gardasil (2-3 dose), which protects against HPV types 6, 11, 16, and 18
• Gardasil 9, which protects against 9 HPV types

2. Regular Screening
The World Health Organization recommends:
• First screen at age 30 (or age 25 for HIV-positive women)
• Repeat screening every 3-5 years if results are normal
• VIA (Visual Inspection with Acetic Acid), Pap smear, or an HPV DNA test as screening methods

VIA is the most widely available screening method in Kenya's public health facilities and is free at most government hospitals.

Other prevention measures:
• Using condoms consistently reduces HPV transmission risk
• Limiting the number of sexual partners
• Not smoking
• Regular HIV testing and treatment if positive`,
    contentSw: `Saratani ya shingo ya kizazi inaweza kuzuiwa kwa kiasi kikubwa. Mikakati miwili kuu ya kuzuia ni:

1. Chanjo ya HPV
Chanjo ya HPV inalinda dhidi ya aina za HPV zinazosababisha saratani nyingi za shingo ya kizazi. Kenya, mpango wa kitaifa wa chanjo ya HPV unalenga wasichana wa umri wa miaka 10 kama sehemu ya mpango wa chanjo za shule. Chanjo ni bora zaidi inapotolewa kabla msichana hajaanza kushiriki katika ngono.

Chanjo za HPV zinazopatikana Kenya ni pamoja na:
• Cervarix (dozi 2), inayolinda dhidi ya aina za HPV 16 na 18
• Gardasil (dozi 2-3), inayolinda dhidi ya aina za HPV 6, 11, 16, na 18
• Gardasil 9, inayolinda dhidi ya aina 9 za HPV

2. Uchunguzi wa Kawaida
Shirika la Afya Duniani linapendekeza:
• Uchunguzi wa kwanza katika umri wa miaka 30 (au miaka 25 kwa wanawake wenye VVU)
• Uchunguzi wa kurudia kila miaka 3-5 ikiwa matokeo ni ya kawaida
• VIA (Ukaguzi wa Kuona na Asidi ya Asetiki), Pap smear, au kipimo cha DNA ya HPV kama njia za uchunguzi

VIA ni njia ya uchunguzi inayopatikana zaidi katika vituo vya afya vya umma Kenya na ni ya bure katika hospitali nyingi za serikali.

Hatua zingine za kuzuia:
• Kutumia kondomu kwa utaratibu hupunguza hatari ya maambukizo ya HPV
• Kupunguza idadi ya washirika wa ngono
• Kutovuta sigara
• Kupima VVU mara kwa mara na kutibiwa ikiwa umegundulika`,
    tags: ['HPV Vaccine', 'VIA Screening', 'Pap Smear', 'Prevention'],
  },
  {
    id: 'topic-signs',
    icon: Stethoscope,
    colorClass: 'bg-warning-bg text-warning',
    iconColorClass: 'text-warning',
    titleEn: 'Signs, Symptoms & Treatment',
    titleSw: 'Ishara, Dalili na Matibabu',
    summaryEn: 'Early-stage cervical cancer often has no symptoms. Knowing the warning signs and understanding treatment options can save lives.',
    summarySw: 'Saratani ya shingo ya kizazi katika hatua za awali mara nyingi haina dalili. Kujua ishara za onyo na kuelewa chaguzi za matibabu kunaweza kuokoa maisha.',
    contentEn: `Signs and symptoms

Early-stage cervical cancer typically has no symptoms, which is why regular screening is so important. As the cancer advances, symptoms may include:

• Unusual vaginal bleeding, between periods, after sex, or after menopause
• Unusual vaginal discharge that is watery, bloody, or has a strong odour
• Pain in the lower abdomen or pelvis during or after sex
• Painful urination

If you experience any of these symptoms, it does not necessarily mean you have cervical cancer since many other conditions can cause similar symptoms. However, you should see a healthcare provider as soon as possible.

Treatment options

Treatment depends on the stage of cancer and the woman's overall health. Options available in Kenya include:

• Surgery, removal of the cervix (trachelectomy) or uterus (hysterectomy)
• Radiation therapy, available at major referral hospitals including KNH and Moi Teaching Hospital
• Chemotherapy, often combined with radiation (chemoradiation)
• Cryotherapy or LEEP, for early precancerous changes, widely available in Kenya

Precancerous changes (CIN 1, 2, 3) detected through screening are treatable with high success rates. This is why early detection through regular screening is critical.

Key message: cervical cancer, when caught early, is highly treatable. Regular screening saves lives.`,
    contentSw: `Ishara na dalili

Saratani ya shingo ya kizazi katika hatua za awali kwa kawaida haina dalili, ndiyo maana uchunguzi wa kawaida ni muhimu sana. Saratani inapoendelea, dalili zinaweza kujumuisha:

• Kutokwa na damu isiyo ya kawaida ukeni, kati ya hedhi, baada ya ngono, au baada ya kukoma hedhi
• Kutokwa na uchafu usio wa kawaida ukeni wenye maji, damu, au harufu kali
• Maumivu ya chini ya tumbo au nyonga wakati au baada ya ngono
• Maumivu wakati wa kukojoa

Ukipata dalili hizi yoyote, haimaanishi lazima una saratani ya shingo ya kizazi kwa kuwa hali nyingine nyingi zinaweza kusababisha dalili zinazofanana. Hata hivyo, unapaswa kuona mtoa huduma wa afya haraka iwezekanavyo.

Chaguzi za matibabu

Matibabu yanategemea hatua ya saratani na afya ya jumla ya mwanamke. Chaguzi zinazopatikana Kenya ni pamoja na:

• Upasuaji, kuondolewa kwa shingo ya kizazi (trachelectomy) au uterasi (hysterectomy)
• Tiba ya mionzi, inayopatikana katika hospitali kuu za rufaa ikiwemo KNH na Moi Teaching Hospital
• Kemotherapy, mara nyingi ikichanganywa na mionzi (chemoradiation)
• Cryotherapy au LEEP, kwa mabadiliko ya mapema ya kabla ya saratani, yanayopatikana sana Kenya

Mabadiliko ya kabla ya saratani (CIN 1, 2, 3) yanayogunduliwa kupitia uchunguzi yanaweza kutibiwa kwa viwango vya juu vya mafanikio. Ndiyo maana kugundua mapema kupitia uchunguzi wa kawaida ni muhimu.

Ujumbe mkuu: saratani ya shingo ya kizazi, inapogunduliwa mapema, inaweza kutibiwa sana. Uchunguzi wa kawaida huokoa maisha.`,
    tags: ['Symptoms', 'Treatment', 'Surgery', 'Chemotherapy'],
  },
];

export default function EducationTopics({ searchQuery }) {
  const { language } = useLanguage();
  const t = (en, sw) => (language === 'sw' ? sw : en);
  const [expandedId, setExpandedId] = useState(null);

  const filteredTopics = TOPICS.filter((topic) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      topic.titleEn.toLowerCase().includes(q) ||
      topic.titleSw.toLowerCase().includes(q) ||
      topic.contentEn.toLowerCase().includes(q) ||
      topic.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading font-bold text-2xl text-foreground">{t('Health Topics', 'Mada za Afya')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('Tap any topic to expand and read detailed, verified information.', 'Gonga mada yoyote kupanua na kusoma taarifa za kina zilizothibitishwa.')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              {t(`No topics matched "${searchQuery}". Try a different keyword.`, `Hakuna mada zilizolingana na "${searchQuery}". Jaribu neno tofauti.`)}
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const Icon = topic.icon;
            const isExpanded = expandedId === topic.id;
            return (
              <div key={topic.id} className={`card-base overflow-hidden transition-colors duration-200 ${isExpanded ? 'border-primary' : 'hover:border-primary/50'}`}>
                <button onClick={() => setExpandedId(isExpanded ? null : topic.id)} className="w-full flex items-start gap-4 p-5 text-left">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${topic.colorClass}`}>
                    <Icon size={20} className={topic.iconColorClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-heading font-semibold text-sm text-foreground leading-snug">{t(topic.titleEn, topic.titleSw)}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t(topic.summaryEn, topic.summarySw)}</p>
                      </div>
                      <ChevronDown size={18} className={`text-muted-foreground shrink-0 transition-transform duration-300 mt-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {topic.tags.map((tag) => (
                        <span key={`${topic.id}-tag-${tag}`} className="tag-service bg-muted text-muted-foreground text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border animate-slide-up">
                    <p className="pt-4 whitespace-pre-line text-sm text-foreground leading-relaxed">{t(topic.contentEn, topic.contentSw)}</p>
                    <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                      {t(
                        'Source: WHO, Ministry of Health Kenya, KCHS. For medical advice, consult a qualified healthcare provider.',
                        'Chanzo: WHO, Wizara ya Afya Kenya, KCHS. Kwa ushauri wa kimatibabu, wasiliana na mtoa huduma wa afya aliyehitimu.'
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
