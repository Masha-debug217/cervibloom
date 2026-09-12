import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('contact_title')}</h2>
        <p>{t('contact_sub')}</p>
      </div>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3>{t('contact_bug_title')}</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            {t('contact_bug_body')}
          </p>
          <a
            className="btn btn-outline"
            href="https://github.com/Masha-debug217/cervibloom/issues"
            target="_blank"
            rel="noreferrer"
          >
            {t('contact_bug_button')}
          </a>
        </div>
        <div className="panel">
          <h3>{t('contact_medical_title')}</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {t('contact_medical_body_1')}{' '}
            <Link to="/dashboard" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav_dashboard')}</Link>{' '}
            {t('contact_medical_body_2')}{' '}
            <Link to="/directory" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav_directory')}</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
