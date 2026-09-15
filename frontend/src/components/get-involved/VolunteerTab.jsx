import { useEffect, useState } from 'react';
import { Users, ArrowRight, X, CheckCircle2, Clock, Zap, Award, Star, Medal, Heart, Trophy, Upload } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import SignInGate from './SignInGate';
import { VOLUNTEER_ROLES, AVAILABILITY_OPTIONS, STATUS_LABEL, STATUS_PIPELINE } from './roles';

const STATUS_STYLE = {
  PENDING: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800',
  APPROVED: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  ACTIVE: 'text-success bg-success-bg border-success/30',
  COMPLETED: 'text-primary bg-accent border-border',
  REJECTED: 'text-muted-foreground bg-muted border-border',
};
const STATUS_ICON = { PENDING: Clock, APPROVED: CheckCircle2, ACTIVE: Zap, COMPLETED: Award, REJECTED: X };

function openCertificate(application, t) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <!doctype html><html><head><title>${t('Certificate of Volunteer Service', 'Cheti cha Huduma ya Kujitolea')}</title>
    <style>
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f7eef1;}
      .cert{border:10px solid #7A1F3D;padding:56px;max-width:640px;text-align:center;background:#fff;}
      h1{color:#7A1F3D;font-size:28px;margin-bottom:4px;letter-spacing:1px;text-transform:uppercase;}
      .name{font-size:32px;margin:24px 0;color:#170F13;border-bottom:2px solid #7A1F3D;display:inline-block;padding-bottom:8px;}
      .role{font-size:16px;color:#555;margin-bottom:24px;}
      .date{font-size:13px;color:#888;margin-top:32px;}
      button{margin-top:32px;padding:10px 24px;background:#7A1F3D;color:#fff;border:none;border-radius:999px;font-size:14px;cursor:pointer;}
      @media print{button{display:none;}}
    </style></head><body>
      <div class="cert">
        <h1>${t('Certificate of Volunteer Service', 'Cheti cha Huduma ya Kujitolea')}</h1>
        <p>${t('This certifies that', 'Hii inathibitisha kwamba')}</p>
        <div class="name">${application.full_name}</div>
        <p class="role">${t('completed volunteer service as', 'amekamilisha huduma ya kujitolea kama')} <strong>${application.role}</strong> ${t('with CerviBloom', 'na CerviBloom')}</p>
        <p class="date">${t('Issued', 'Imetolewa')} ${new Date().toLocaleDateString()}</p>
        <button onclick="window.print()">${t('Print / Save as PDF', 'Chapisha / Hifadhi kama PDF')}</button>
      </div>
    </body></html>
  `);
  win.document.close();
}

function RoleCard({ role, t, onApply }) {
  return (
    <div className="card-base p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className={`tag-service text-xs ${role.category === 'MEDICAL' ? 'bg-accent text-primary' : 'bg-success-bg text-success'}`}>
          {t(role.requirement.en, role.requirement.sw)}
        </span>
      </div>
      <h3 className="font-heading font-semibold text-foreground">{t(role.title.en, role.title.sw)}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t(role.description.en, role.description.sw)}</p>
      <p className="text-xs text-muted-foreground">{t('Commitment:', 'Muda:')} {t(role.commitment.en, role.commitment.sw)}</p>
      <button onClick={() => onApply(role)} className="btn-primary text-sm justify-center mt-1">
        {t('Apply for Role', 'Omba Nafasi')} <ArrowRight size={14} />
      </button>
    </div>
  );
}

function ApplyModal({ role, t, user, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    phone: user?.phone_number || '',
    county: user?.county || '',
    availability: '',
    skills: '',
    motivation: '',
    credentials_file: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = new FormData();
      data.append('role', role.title.en);
      data.append('category', role.category);
      data.append('full_name', form.full_name);
      data.append('phone', form.phone);
      data.append('county', form.county);
      data.append('availability', form.availability);
      data.append('skills', form.skills);
      data.append('motivation', form.motivation);
      if (form.credentials_file) data.append('credentials_file', form.credentials_file);
      await client.post('/volunteer-applications/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : t('Could not submit your application.', 'Imeshindwa kuwasilisha ombi lako.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-base w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t('Apply', 'Omba')}</p>
            <h3 className="font-heading font-bold text-lg text-foreground">{t(role.title.en, role.title.sw)}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        {!user ? (
          <SignInGate
            t={t}
            title={t('Sign in to Apply', 'Ingia ili Kuomba')}
            body={t(
              'Create an account or sign in to apply for volunteer roles, track your application status, and earn recognition for your service.',
              'Fungua akaunti au ingia ili kuomba nafasi za kujitolea, kufuatilia hali ya maombi yako, na kupata utambuzi wa huduma yako.'
            )}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="error-box">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('Full Name', 'Jina Kamili')}</label>
                <input type="text" className="input-field" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('Phone Number', 'Nambari ya Simu')}</label>
                <input type="tel" className="input-field" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('County', 'Kaunti')}</label>
              <input type="text" className="input-field" required value={form.county} onChange={(e) => set('county', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Availability', 'Upatikanaji')}</label>
              <select className="input-field" required value={form.availability} onChange={(e) => set('availability', e.target.value)}>
                <option value="">{t('Select availability', 'Chagua upatikanaji')}</option>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.en, opt.sw)}</option>
                ))}
              </select>
            </div>
            {role.category === 'MEDICAL' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('Professional Credentials (optional)', 'Vyeti vya Kitaalamu (hiari)')}
                </label>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground cursor-pointer hover:border-primary transition-colors">
                  <Upload size={15} />
                  {form.credentials_file ? form.credentials_file.name : t('Upload a file (e.g. KMPDC license)', 'Pakia faili (mfano leseni ya KMPDC)')}
                  <input type="file" className="hidden" onChange={(e) => set('credentials_file', e.target.files?.[0] || null)} />
                </label>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Relevant Skills or Experience (optional)', 'Ujuzi au Uzoefu (hiari)')}</label>
              <textarea className="input-field resize-none" rows={2} value={form.skills} onChange={(e) => set('skills', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('Why do you want to volunteer?', 'Kwa nini unataka kujitolea?')}</label>
              <textarea className="input-field resize-none" rows={3} required value={form.motivation} onChange={(e) => set('motivation', e.target.value)} />
            </div>
            <button type="submit" disabled={busy} className="btn-primary justify-center">
              {busy ? t('Submitting...', 'Inawasilisha...') : t('Submit Application', 'Wasilisha Ombi')} <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VolunteerTab({ t }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ volunteer_count: 0, county_count: 0 });
  const [selectedCategory, setSelectedCategory] = useState('MEDICAL');
  const [applyingRole, setApplyingRole] = useState(null);
  const [view, setView] = useState('browse');
  const [applications, setApplications] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    client.get('/volunteer-applications/stats/').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  function loadApplications() {
    if (!user) return;
    client.get('/volunteer-applications/').then((res) => setApplications(res.data)).catch(() => {});
  }
  useEffect(() => { loadApplications(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmitted() {
    setApplyingRole(null);
    setSubmitted(true);
    loadApplications();
  }

  const roles = VOLUNTEER_ROLES.filter((r) => r.category === selectedCategory);

  const badges = [
    { id: 'first-step', icon: Star, earned: applications.length >= 1, name: t('First Step', 'Hatua ya Kwanza'), desc: t('Submitted your first application', 'Umewasilisha ombi lako la kwanza') },
    { id: 'community-champion', icon: Medal, earned: applications.length >= 3, name: t('Community Champion', 'Bingwa wa Jamii'), desc: t('Applied for 3 or more roles', 'Umeomba nafasi 3 au zaidi') },
    { id: 'health-advocate', icon: Heart, earned: applications.some((a) => a.category === 'MEDICAL' && ['ACTIVE', 'COMPLETED'].includes(a.status)), name: t('Health Advocate', 'Mtetezi wa Afya'), desc: t('Active in a medical support role', 'Unafanya kazi katika nafasi ya kimatibabu') },
    { id: 'active-volunteer', icon: Trophy, earned: applications.some((a) => ['ACTIVE', 'COMPLETED'].includes(a.status)), name: t('Active Volunteer', 'Mjitoleaji Anayefanya Kazi'), desc: t('Approved into an active role', 'Umeidhinishwa kwa nafasi inayofanya kazi') },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="card-base p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              {t('Volunteer with CerviBloom', 'Jitolee na CerviBloom')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                `${stats.volunteer_count} volunteer${stats.volunteer_count === 1 ? '' : 's'} engaged across ${stats.county_count} count${stats.county_count === 1 ? 'y' : 'ies'} so far. Join our network helping raise cervical cancer awareness across Kenya.`,
                `Wajitoleaji ${stats.volunteer_count} wameshiriki katika kaunti ${stats.county_count} hadi sasa. Jiunge na mtandao wetu wa kuhamasisha kuhusu saratani ya mlango wa kizazi Kenya nzima.`
              )}
            </p>
          </div>
        </div>
      </div>

      {user && (
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {[
            { id: 'browse', label: t('Browse Roles', 'Vinjari Nafasi') },
            { id: 'tracker', label: t('My Volunteering', 'Kujitolea Kwangu') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${view === item.id ? 'bg-card text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {(!user || view === 'browse') && (
        <>
          {submitted && (
            <div className="card-base p-5 flex items-center gap-3 border-success/30">
              <CheckCircle2 size={20} className="text-success shrink-0" />
              <p className="text-sm text-foreground">
                {t('Application submitted! Track its status under "My Volunteering".', 'Ombi limewasilishwa! Fuatilia hali yake chini ya "Kujitolea Kwangu".')}
              </p>
              <button onClick={() => setSubmitted(false)} className="ml-auto text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
          )}

          <div className="flex gap-2">
            {[
              { id: 'MEDICAL', label: t('Clinical & Medical', 'Kimatibabu') },
              { id: 'NON_MEDICAL', label: t('Community & Outreach', 'Jamii na Uhamasishaji') },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary bg-card'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} t={t} onApply={setApplyingRole} />
            ))}
          </div>
        </>
      )}

      {user && view === 'tracker' && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">{t('My Applications', 'Maombi Yangu')}</h3>
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('No applications yet. Browse roles above to get started.', 'Hakuna maombi bado. Vinjari nafasi hapo juu kuanza.')}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {applications.map((app) => {
                  const StatusIcon = STATUS_ICON[app.status];
                  const pipelineIndex = STATUS_PIPELINE.indexOf(app.status);
                  return (
                    <div key={app.id} className="card-base p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{app.role}</p>
                          <p className="text-xs text-muted-foreground">{t('Applied:', 'Iliombwa:')} {new Date(app.submitted_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${STATUS_STYLE[app.status]}`}>
                          <StatusIcon size={11} />
                          {t(STATUS_LABEL[app.status].en, STATUS_LABEL[app.status].sw)}
                        </span>
                      </div>

                      {app.status !== 'REJECTED' && (
                        <div className="flex items-center gap-1 mb-1">
                          {STATUS_PIPELINE.map((step, i) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i <= pipelineIndex ? 'bg-primary' : 'bg-border'}`} />
                              {i < STATUS_PIPELINE.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < pipelineIndex ? 'bg-primary' : 'bg-border'}`} />}
                            </div>
                          ))}
                        </div>
                      )}

                      {app.status === 'COMPLETED' && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                          <Award size={14} className="text-primary" />
                          <span className="text-xs text-primary font-medium">{t('Certificate available', 'Cheti kinapatikana')}</span>
                          <button onClick={() => openCertificate(app, t)} className="ml-auto text-xs btn-outline py-1 px-3">
                            {t('View Certificate', 'Tazama Cheti')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">{t('My Badges', 'Beji Zangu')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.id} className={`card-base p-4 text-center ${!badge.earned ? 'opacity-40' : ''}`}>
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-2">
                      <BadgeIcon size={20} className="text-primary" />
                    </div>
                    <p className="font-semibold text-xs text-foreground mb-0.5">{badge.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{badge.desc}</p>
                    {!badge.earned && <p className="text-xs text-muted-foreground mt-1 font-medium">{t('Locked', 'Imefungwa')}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {applyingRole && (
        <ApplyModal role={applyingRole} t={t} user={user} onClose={() => setApplyingRole(null)} onSubmitted={handleSubmitted} />
      )}
    </div>
  );
}
