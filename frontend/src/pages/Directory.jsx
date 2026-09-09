import { useEffect, useState } from 'react';
import client from '../api/client';

const STOCK_LABELS = {
  IN_STOCK: 'In stock',
  LOW_STOCK: 'Low stock',
  OUT_OF_STOCK: 'Out of stock',
};

function StockTag({ label, status }) {
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
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/facilities/').then(res => setFacilities(res.data))
      .catch(() => setError('Could not load facilities. Is the backend running and are you logged in?'));
  }, []);

  const counties = [...new Set(facilities.map(f => f.county))].sort();
  const filtered = facilities.filter(f =>
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.county.toLowerCase().includes(search.toLowerCase())) &&
    (!county || f.county === county)
  );

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Screening Centers</h2>
        <p>Real public facilities offering cervical cancer screening services.</p>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}
      <div className="directory-controls">
        <input type="text" placeholder="Search by name or county..." style={{ flex: 1 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <select value={county} onChange={e => setCounty(e.target.value)}>
          <option value="">All counties</option>
          {counties.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filtered.map(f => (
        <div className="facility-card" key={f.id}>
          <div>
            <div className="fname">{f.name}</div>
            <div className="fmeta">{f.county} County</div>
            <div style={{ marginTop: 8 }}>
              {f.services?.split(',').map(s => <span className="tag" key={s}>{s.trim()}</span>)}
              {f.is_wics_site && <span className="tag">WICS site</span>}
              <StockTag label="HPV vaccine" status={f.hpv_vaccine_stock} />
              <StockTag label="Pap kits" status={f.pap_smear_kit_stock} />
            </div>
          </div>
          <a className="btn btn-outline" href={f.latitude && f.longitude ? `https://www.google.com/maps?q=${f.latitude},${f.longitude}` : '#'} target="_blank" rel="noreferrer">
            Get directions
          </a>
        </div>
      ))}
      {filtered.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No facilities yet — add them via the Django admin, or run the seed script.
        </p>
      )}
      <p style={{ maxWidth: 640, margin: '24px auto 0', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
        Seed data compiled from WHO Africa and Kenya Ministry of Health public reporting on the National Cervical Cancer Elimination Action Plan and the Women's Integrated Cancer Services (WICS) project.
      </p>
    </div>
  );
}
