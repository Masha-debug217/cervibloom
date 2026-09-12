import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const FEATURES = [
  { to: '/info-hub', titleKey: 'home_feature_infohub_title', descKey: 'home_feature_infohub_desc' },
  { to: '/directory', titleKey: 'home_feature_directory_title', descKey: 'home_feature_directory_desc' },
  { to: '/dashboard', titleKey: 'home_feature_navigator_title', descKey: 'home_feature_navigator_desc' },
  { to: '/volunteer', titleKey: 'home_feature_volunteer_title', descKey: 'home_feature_volunteer_desc' },
];

const STEPS = [
  { n: '1', titleKey: 'home_step1_title', descKey: 'home_step1_desc' },
  { n: '2', titleKey: 'home_step2_title', descKey: 'home_step2_desc' },
  { n: '3', titleKey: 'home_step3_title', descKey: 'home_step3_desc' },
];

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="page container">
      <div className="hero">
        <h1>{t('home_hero_title')}</h1>
        <p>{t('home_hero_body')}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/info-hub">{t('home_hero_cta_learn')}</Link>
          <Link className="btn btn-outline" to="/directory">{t('home_hero_cta_find')}</Link>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="num">#1</div><div className="lbl">{t('home_stat1_lbl')}</div></div>
        <div className="stat-card"><div className="num">90%+</div><div className="lbl">{t('home_stat2_lbl')}</div></div>
        <div className="stat-card"><div className="num">47</div><div className="lbl">{t('home_stat3_lbl')}</div></div>
      </div>

      <div className="section-head" style={{ marginTop: 72 }}>
        <h2>{t('home_features_title')}</h2>
        <p>{t('home_features_sub')}</p>
      </div>
      <div className="card-grid" style={{ maxWidth: 700 }}>
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="role-card" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="role-icon">●</div>
            <h3>{t(f.titleKey)}</h3>
            <p>{t(f.descKey)}</p>
          </Link>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 72 }}>
        <h2>{t('home_how_title')}</h2>
        <p>{t('home_how_sub')}</p>
      </div>
      <div style={{ display: 'flex', gap: 24, maxWidth: 900, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
        {STEPS.map(s => (
          <div key={s.n} style={{ flex: '1 1 220px', textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              fontFamily: 'Poppins', fontWeight: 700,
            }}>{s.n}</div>
            <h3 style={{ fontSize: 15, margin: '0 0 6px' }}>{t(s.titleKey)}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{t(s.descKey)}</p>
          </div>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 72, marginBottom: 20 }}>
        <h2>{t('home_cta_title')}</h2>
        <p>{t('home_cta_body')}</p>
      </div>
      <div className="hero-actions">
        <Link className="btn btn-primary" to="/auth">{t('home_cta_create')}</Link>
        <Link className="btn btn-outline" to="/info-hub">{t('home_cta_browse')}</Link>
      </div>
    </div>
  );
}
