import { useEffect, useState } from 'react';
import { Heart, CheckCircle2, Eye, EyeOff, Info, Shield, TrendingUp, Zap } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import SignInGate from './SignInGate';

const DONATION_TIERS = [
  { amount: 500, impact: { en: 'Funds 1 cervical screening test', sw: 'Inagharamia kipimo 1 cha uchunguzi' } },
  { amount: 1500, impact: { en: 'Funds patient transport & follow-up', sw: 'Inagharamia usafiri wa mgonjwa na ufuatiliaji' } },
  { amount: 2500, impact: { en: 'Funds 1 HPV vaccine dose', sw: 'Inagharamia dozi 1 ya chanjo ya HPV' } },
  { amount: 5000, impact: { en: 'Funds screening for 10 women', sw: 'Inagharamia uchunguzi kwa wanawake 10' } },
];

const RANK_STYLE = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-orange-300 text-orange-800',
};

export default function DonateTab({ t }) {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    client.get('/donations/leaderboard/').then((res) => setLeaderboard(res.data)).catch(() => {});
  }, []);

  const finalAmount = customAmount ? parseInt(customAmount, 10) : selectedAmount;

  async function handleDonate(e) {
    e.preventDefault();
    if (!finalAmount || finalAmount < 100) return;
    setError('');
    setBusy(true);
    try {
      await client.post('/donations/', { amount_kes: finalAmount, is_anonymous: isAnonymous });
      setSubmitted(true);
      client.get('/donations/leaderboard/').then((res) => setLeaderboard(res.data)).catch(() => {});
    } catch {
      setError(t('Could not record your donation. Please try again.', 'Imeshindwa kurekodi mchango wako. Tafadhali jaribu tena.'));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="card-base p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <h3 className="font-heading font-bold text-xl text-foreground mb-2">
          {t('Donation Recorded', 'Mchango Umerekodiwa')}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {t('Thank you for your simulated donation of', 'Asante kwa mchango wako wa majaribio wa')} <strong className="text-foreground">KES {finalAmount?.toLocaleString()}</strong>.
        </p>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {t(
            'This is a demonstration feature. No real payment was processed and no money changed hands; the record above only exists in CerviBloom\'s own database.',
            'Hii ni kipengele cha maonyesho. Hakuna malipo halisi yaliyofanywa na hakuna fedha zilizobadilishwa mikono; rekodi hii ipo tu kwenye hazina ya data ya CerviBloom.'
          )}
        </p>
        <button
          onClick={() => { setSubmitted(false); setSelectedAmount(null); setCustomAmount(''); }}
          className="btn-outline text-sm justify-center"
        >
          {t('Make Another Donation', 'Fanya Mchango Mwingine')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card-base p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Heart size={20} className="text-primary fill-primary/30" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              {t('Support Cervical Cancer Awareness', 'Unga Mkono Uhamasishaji wa Saratani ya Mlango wa Kizazi')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                'This is a demonstration donation flow, not a live payment integration yet. Sign in to donate; the anonymous toggle below hides your name from the public leaderboard, not from your own account.',
                'Hii ni onyesho la mchango, si muunganisho halisi wa malipo bado. Ingia ili kuchangia; kitufe cha kutokujulikana chini kinafisha jina lako kwenye orodha ya umma, si kwenye akaunti yako.'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleDonate} className="flex flex-col gap-5">
            {error && <div className="error-box">{error}</div>}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">{t('Select Amount', 'Chagua Kiasi')}</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {DONATION_TIERS.map((tier) => (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => { setSelectedAmount(tier.amount); setCustomAmount(''); }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${selectedAmount === tier.amount && !customAmount ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}`}
                  >
                    <p className="font-heading font-bold text-sm text-foreground mb-0.5">KES {tier.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap size={10} className="text-primary shrink-0" />
                      {t(tier.impact.en, tier.impact.sw)}
                    </p>
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">KES</span>
                <input
                  type="number"
                  placeholder={t('Custom amount (min. 100)', 'Kiasi maalum (kiwango cha chini 100)')}
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  min={100}
                  className="input-field !pl-14"
                />
              </div>
            </div>

            {user ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    {isAnonymous ? <EyeOff size={16} className="text-muted-foreground shrink-0" /> : <Eye size={16} className="text-muted-foreground shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('Donate Anonymously', 'Changia bila Kujulikana')}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAnonymous
                          ? t('Your name will be hidden from the public leaderboard.', 'Jina lako litafichwa kwenye orodha ya umma.')
                          : t('Your name will be visible on the public leaderboard.', 'Jina lako litaonekana kwenye orodha ya umma.')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAnonymous}
                    onClick={() => setIsAnonymous((v) => !v)}
                    className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${isAnonymous ? 'bg-primary' : 'bg-border'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {isAnonymous && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blush border border-border">
                    <Shield size={14} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground leading-relaxed">
                      {t(
                        'Anonymous donation active. Your identity will be completely hidden from the public leaderboard, shown as "Anonymous Supporter" instead.',
                        'Mchango bila kujulikana umewezeshwa. Utambulisho wako utafichwa kabisa kwenye orodha ya umma, utaonekana kama "Mchangiaji Asiyejulikana".'
                      )}
                    </p>
                  </div>
                )}

                <button type="submit" disabled={!finalAmount || finalAmount < 100 || busy} className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {finalAmount
                    ? `${t('Donate', 'Changia')} KES ${finalAmount.toLocaleString()}`
                    : t('Select an amount to continue', 'Chagua kiasi kuendelea')}
                  <Heart size={15} />
                </button>
              </>
            ) : (
              <SignInGate
                t={t}
                title={t('Sign in to Donate', 'Ingia ili Kuchangia')}
                body={t(
                  'Sign in or create an account to complete a donation. This also lets you choose to appear anonymously on the leaderboard.',
                  'Ingia au fungua akaunti ili kukamilisha mchango. Hii pia inakuwezesha kuchagua kutojulikana kwenye orodha.'
                )}
              />
            )}
          </form>

          <div className="mt-6 card-base p-5">
            <h4 className="font-heading font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Info size={15} className="text-primary" />
              {t('About This Donation Flow', 'Kuhusu Kipengele hiki cha Mchango')}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                'This is a demonstration feature: donations here create a record in CerviBloom\'s own database, but no real payment is processed and no money changes hands. A live version of this feature would route funds to real cervical cancer screening and vaccination programs; no such payment relationship exists today.',
                'Hii ni kipengele cha maonyesho: michango hapa inaunda rekodi kwenye hazina ya data ya CerviBloom, lakini hakuna malipo halisi yanayofanywa na hakuna fedha zinazobadilishwa mikono. Toleo halisi la kipengele hiki lingepeleka fedha kwa programu halisi za uchunguzi na chanjo; hakuna uhusiano huo wa malipo uliopo leo.'
              )}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-base p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="font-heading font-semibold text-sm text-foreground">{t('Top Donors', 'Wachangiaji Wakuu')}</h3>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('No donations yet. Be the first!', 'Hakuna michango bado. Kuwa wa kwanza!')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboard.map((donation, i) => {
                  const rank = i + 1;
                  return (
                    <div key={donation.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${rank <= 3 ? 'bg-accent' : ''}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${RANK_STYLE[rank] || 'bg-muted text-muted-foreground'}`}>
                        {rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {donation.donor_display === null ? (
                            <span className="flex items-center gap-1">
                              <Shield size={10} className="text-muted-foreground" />
                              {t('Anonymous Supporter', 'Mchangiaji Asiyejulikana')}
                            </span>
                          ) : donation.donor_display}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(donation.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">KES {Number(donation.amount_kes).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info size={11} className="shrink-0 mt-0.5" />
                {t('Anonymous donors are shown with a shield icon. Amounts are always visible.', 'Wachangiaji wasiojulikana wanaonyeshwa na ikoni ya ngao. Kiasi kinaonekana daima.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
