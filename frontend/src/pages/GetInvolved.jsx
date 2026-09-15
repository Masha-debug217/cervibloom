import { useState } from 'react';
import { Users, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import VolunteerTab from '../components/get-involved/VolunteerTab';
import DonateTab from '../components/get-involved/DonateTab';

export default function GetInvolved() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);
  const [tab, setTab] = useState('volunteer');

  return (
    <div className="section-padding">
      <div className="container-base">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            {t('Get Involved', 'Shiriki')}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {t(
              'Make a difference in the fight against cervical cancer in Kenya. Volunteer your time or support with a donation.',
              'Fanya tofauti katika mapambano dhidi ya saratani ya mlango wa kizazi Kenya. Jitolee muda wako au unga mkono kwa mchango.'
            )}
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
          {[
            { id: 'volunteer', label: t('Volunteer', 'Jitolee'), icon: Users },
            { id: 'donate', label: t('Donate', 'Changia'), icon: Heart },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === item.id ? 'bg-card text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === 'volunteer' ? <VolunteerTab t={t} sw={sw} /> : <DonateTab t={t} sw={sw} />}
      </div>
    </div>
  );
}
