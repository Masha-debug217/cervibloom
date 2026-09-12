import { useEffect, useState } from 'react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

function StockTag({ label, status, t }) {
  const STOCK_LABELS = { IN_STOCK: t('stock_in'), LOW_STOCK: t('stock_low'), OUT_OF_STOCK: t('stock_out') };
  if (!status || status === 'UNKNOWN' || !STOCK_LABELS[status]) return null;
  const strong = status === 'OUT_OF_STOCK' || status === 'LOW_STOCK';
  return (
    <span
      className="tag"
      style={strong ? { background: 'transparent', border: '1px solid var(--primary)' } : undefined}
    >
      {label}: {STOCK_LABELS[status]}
    </span>
  );
}

export default function Directory() {
  const { language, t } = useLanguage();
  const sw = language === 'sw';
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/facilities/').then(res => setFacilities(res.data))
      .catch(() => setError(t('directory_error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counties = [...new Set(facilities.map(f => f.county))].sort();
  const filtered = facilities.filter(f =>
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.county.toLowerCase().includes(search.toLowerCase())) &&
    (!county || f.county === county)
  );

  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('directory_title')}</h2>
        <p>{t('directory_sub')}</p>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}
      <div className="directory-controls">
        <input type="text" placeholder={t('directory_search_placeholder')} style={{ flex: 1 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <select value={county} onChange={e => setCounty(e.target.value)}>
          <option value="">{t('directory_all_counties')}</option>
          {counties.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filtered.map(f => {
        const services = (sw && f.services_sw) || f.services;
        return (
          <div className="facility-card" key={f.id}>
            <div>
              <div className="fname">{f.name}</div>
              <div className="fmeta">{f.county} {t('directory_county_suffix')}</div>
              <div style={{ marginTop: 8 }}>
                {services?.split(',').map(s => <span className="tag" key={s}>{s.trim()}</span>)}
                {f.is_wics_site && <span className="tag">{t('directory_wics_tag')}</span>}
                <StockTag label={t('directory_stock_vaccine')} status={f.hpv_vaccine_stock} t={t} />
                <StockTag label={t('directory_stock_pap')} status={f.pap_smear_kit_stock} t={t} />
              </div>
            </div>
            <a className="btn btn-outline" href={f.latitude && f.longitude ? `https://www.google.com/maps?q=${f.latitude},${f.longitude}` : '#'} target="_blank" rel="noreferrer">
              {t('directory_get_directions')}
            </a>
          </div>
        );
      })}
      {filtered.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('directory_empty')}
        </p>
      )}
      <p style={{ maxWidth: 640, margin: '24px auto 0', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
        {t('directory_source_note')}
      </p>
    </div>
  );
}
