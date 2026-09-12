import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('about_title')}</h2>
        <p>{t('about_sub')}</p>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto', fontSize: 15, lineHeight: 1.75, color: 'var(--text)' }}>
        <p>{t('about_p1')}</p>
        <p>{t('about_p2')}</p>
        <p>{t('about_p3')}</p>
        <p>{t('about_p4')}</p>
      </div>
    </div>
  );
}
