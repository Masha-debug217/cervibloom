import { Link } from 'react-router-dom';
import { Heart, Shield, ExternalLink, AlertTriangle, Eye, Database, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const stats = [
  { stat: '5,000+', en: 'Kenyan women die from cervical cancer every year', sw: 'Wanawake wa Kenya wanaofariki kwa saratani ya mlango wa kizazi kila mwaka', source: 'WHO / Globocan' },
  { stat: '80%', en: 'of cases in Kenya are diagnosed at a late stage', sw: 'ya kesi nchini Kenya hugunduliwa katika hatua za marehemu', source: 'Kenya MOH' },
  { stat: '99%', en: 'of cases are caused by HPV, a preventable virus', sw: 'ya kesi zinasababishwa na HPV, virusi inayoweza kuzuiwa', source: 'WHO' },
  { stat: '47', en: 'counties in Kenya, most still underserved for screening', sw: 'kaunti nchini Kenya, nyingi bado hazina huduma za kutosha za uchunguzi', source: 'Kenya MOH' },
];

const principles = [
  {
    icon: Database,
    en: { title: 'Facility Data From Public Records', desc: 'Every facility in our Screening Directory comes from public WHO Africa and Kenya Ministry of Health reporting, not crowd-sourced or user-submitted listings. Always call ahead to confirm current availability.' },
    sw: { title: 'Data ya Vituo Kutoka Rekodi za Umma', desc: 'Kila kituo katika Orodha yetu ya Uchunguzi kinatoka kwenye ripoti za umma za WHO Africa na Wizara ya Afya Kenya, si maeneo yaliyowasilishwa na watumiaji. Daima piga simu mapema kuthibitisha upatikanaji wa sasa.' },
  },
  {
    icon: Shield,
    en: { title: 'Rule-Based Guidance, Not AI Diagnosis', desc: "Our Symptom Navigator walks through WHO's published warning-sign criteria with a deterministic set of questions, not a machine learning model. It never guesses, and the same answers always produce the same result." },
    sw: { title: 'Mwongozo wa Sheria, Si Utambuzi wa AI', desc: 'Kiongozi chetu cha Dalili kinapitia vigezo vya dalili za onyo vilivyochapishwa na WHO kwa maswali yaliyoainishwa, si mfano wa kujifunza kwa mashine. Hakibashiri, na majibu sawa huzaa matokeo sawa kila wakati.' },
  },
  {
    icon: Eye,
    en: { title: 'Transparent Content Sourcing', desc: 'Health education content on CerviBloom is grounded in guidance published by WHO, the Kenya Ministry of Health, and community health strategy documents, not written or reviewed by CerviBloom staff as if it were original medical advice.' },
    sw: { title: 'Uwazi wa Vyanzo vya Maudhui', desc: 'Maudhui ya elimu ya afya kwenye CerviBloom yanategemea mwongozo uliochapishwa na WHO, Wizara ya Afya Kenya, na hati za mkakati wa afya ya jamii, sio kuandikwa au kuhakikiwa na wafanyakazi wa CerviBloom kama ushauri asili wa kimatibabu.' },
  },
  {
    icon: AlertTriangle,
    en: { title: 'No Diagnostic Claims', desc: 'CerviBloom does not diagnose, prescribe, or replace clinical care. Every tool on this platform is a preliminary guide meant to support, not substitute, a conversation with a qualified healthcare provider.' },
    sw: { title: 'Hakuna Madai ya Utambuzi', desc: 'CerviBloom haitambui, haiagizi, wala haibadilishi huduma ya kliniki. Kila zana kwenye jukwaa hili ni mwongozo wa awali wa kusaidia, si kubadilisha, mazungumzo na mtoa huduma wa afya aliyehitimu.' },
  },
];

const guidanceSources = ['World Health Organization (WHO)', 'Ministry of Health Kenya', "Kenya Community Health Strategy (KCHS)"];

const citations = [
  { org: 'World Health Organization (WHO)', title: 'Cervical Cancer, Key Facts', url: 'https://www.who.int/news-room/fact-sheets/detail/cervical-cancer' },
  { org: 'IARC / WHO', title: 'Global Cancer Observatory, Kenya Profile', url: 'https://gco.iarc.fr' },
  { org: 'Ministry of Health Kenya', title: 'Public health guidance and reporting', url: 'https://www.health.go.ke' },
];

export default function About() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  return (
    <>
      <section className="section-padding border-b border-border">
        <div className="container-base">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-primary text-xs font-semibold mb-6">
              <Heart size={12} className="fill-primary" />
              {t('Our Mission', 'Dhamira Yetu')}
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight mb-6">
              {t(
                'Cervical cancer is preventable. Every Kenyan woman deserves to know that.',
                'Saratani ya mlango wa kizazi inaweza kuzuiwa. Kila mwanamke wa Kenya anastahili kujua hilo.'
              )}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t(
                'CerviBloom exists to close the information and access gap between Kenyan women and life-saving cervical cancer screening, using plain-English guidance, a real screening facility directory, and a supportive community.',
                'CerviBloom ipo kufunga pengo la habari na ufikiaji kati ya wanawake wa Kenya na uchunguzi wa saratani ya mlango wa kizazi unaookoa maisha, kwa kutumia mwongozo rahisi kuelewa, orodha halisi ya vituo vya uchunguzi, na jamii ya kusaidiana.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding border-b border-border">
        <div className="container-base">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                {t('The Problem', 'Tatizo')}
              </h2>
              <div className="flex flex-col gap-4 text-muted-foreground text-sm leading-relaxed">
                <p>
                  {t(
                    'Cervical cancer is one of the most common cancers among Kenyan women, yet it is also one of the most preventable. The gap is not biological, it is structural.',
                    'Saratani ya mlango wa kizazi ni moja ya saratani za kawaida zaidi kati ya wanawake wa Kenya, lakini pia ni moja ya zinazoweza kuzuiwa zaidi. Pengo si la kibiolojia, ni la kimuundo.'
                  )}
                </p>
                <p>
                  {t(
                    'Many women lack access to clear information about warning signs, screening locations, and HPV vaccination, and misinformation often spreads faster than reliable guidance. Screening facilities exist across Kenya, but they can be hard to find.',
                    'Wanawake wengi hawana ufikiaji wa habari sahihi kuhusu dalili za onyo, maeneo ya uchunguzi, na chanjo ya HPV, na habari potofu mara nyingi zinasambaa haraka kuliko mwongozo wa kuaminika. Vituo vya uchunguzi vipo kote Kenya, lakini vinaweza kuwa vigumu kupata.'
                  )}
                </p>
                <p>
                  {t(
                    'CerviBloom brings these pieces together in one place: education grounded in public health guidance, a directory of real screening facilities, a guided symptom check-in, and a way for volunteers and donors to support the work.',
                    'CerviBloom inaunganisha vipande hivi mahali pamoja: elimu inayotegemea mwongozo wa afya ya umma, orodha ya vituo halisi vya uchunguzi, kiongozi cha dalili, na njia ya watu kujitolea na kuchangia kusaidia kazi hii.'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((item) => (
                <div key={item.stat} className="card-base p-5">
                  <p className="font-heading font-bold text-2xl text-primary mb-1">{item.stat}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(item.en, item.sw)}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2 uppercase tracking-wide">{item.source}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-b border-border bg-secondary">
        <div className="container-base">
          <div className="max-w-xl mb-10">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
              {t('Our Approach', 'Mbinu Yetu')}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                'CerviBloom is built on four principles that shape everything we publish and build.',
                'CerviBloom imejengwa juu ya kanuni nne zinazoongoza kila kitu tunachochapisha na kujenga.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {principles.map((p) => {
              const Icon = p.icon;
              const copy = sw ? p.sw : p.en;
              return (
                <div key={copy.title} className="card-base p-6">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">{copy.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{copy.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding border-b border-border">
        <div className="container-base">
          <div className="max-w-xl mb-8">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
              {t('Guidance We Follow', 'Mwongozo Tunaozingatia')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t(
                "CerviBloom is an independent platform. It is not affiliated with, endorsed by, or a partner of any of the organizations below; its content and facility data simply follow guidance these organizations publish.",
                'CerviBloom ni jukwaa huru. Halihusiani, halijaidhinishwa, wala si mshirika wa mashirika yaliyoorodheshwa hapa chini; maudhui yake na data ya vituo yanategemea tu mwongozo unaochapishwa na mashirika haya.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {guidanceSources.map((source) => (
              <span key={source} className="tag-service bg-muted text-muted-foreground text-sm">{source}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base">
          <div className="max-w-2xl">
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">
              {t('Sources', 'Vyanzo')}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {t(
                'A starting point for the public health information referenced on this platform.',
                'Sehemu ya kuanzia kwa taarifa za afya ya umma zinazorejelewa kwenye jukwaa hili.'
              )}
            </p>
            <div className="flex flex-col gap-3">
              {citations.map((c, i) => (
                <div key={c.title} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{c.org}</p>
                    <p className="text-sm text-foreground mb-1">{c.title}</p>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      {t('Visit source', 'Tembelea chanzo')} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-xl bg-accent border border-border">
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {t('Have a question about our content or data?', 'Una swali kuhusu maudhui au data yetu?')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t(
                  'We welcome feedback, including from healthcare professionals.',
                  'Tunakaribisha maoni, ikiwemo kutoka kwa wataalamu wa afya.'
                )}
              </p>
              <Link to="/contact" className="btn-primary text-sm py-2.5 px-5">
                {t('Contact Us', 'Wasiliana Nasi')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
