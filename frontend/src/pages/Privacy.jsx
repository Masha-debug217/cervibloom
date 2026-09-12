import { useLanguage } from '../context/LanguageContext';

const SECTION_KEYS = [1, 2, 3, 4, 5, 6].map(n => ({
  titleKey: `privacy_s${n}_title`,
  bodyKey: `privacy_s${n}_body`,
}));

export default function Privacy() {
  const { t } = useLanguage();
  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('privacy_title')}</h2>
        <p>{t('privacy_sub')}</p>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {SECTION_KEYS.map(s => (
          <div key={s.titleKey} style={{ marginBottom: 22 }}>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>{t(s.titleKey)}</h3>
            <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{t(s.bodyKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
