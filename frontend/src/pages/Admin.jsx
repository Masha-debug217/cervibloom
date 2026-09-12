import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

/*
 * Minimal admin console. Intentionally plain: functional CRUD tables that
 * reuse the tokens/classes already defined in theme.css (no new stylesheet).
 * Route guarding (ProtectedRoute + role===ADMIN) is done in App.jsx.
 */

const cellStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  fontSize: 13.5,
  verticalAlign: 'top',
};
const headStyle = { ...cellStyle, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'left' };
const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--surface-alt)',
  color: 'var(--text)', fontFamily: 'Inter', fontSize: 13,
};

function Table({ columns, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr>{columns.map((c) => <th key={c} style={headStyle}>{c}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------- Facilities ------------------------------ */

const STOCK_OPTIONS = ['UNKNOWN', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'];

const BLANK_FACILITY = {
  name: '', county: '', address: '', services: '', services_sw: '',
  latitude: '', longitude: '', source_note: '', is_wics_site: false,
  hpv_vaccine_stock: 'UNKNOWN', pap_smear_kit_stock: 'UNKNOWN',
};

function FacilitiesTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(BLANK_FACILITY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    client.get('/facilities/').then((r) => setRows(r.data)).catch(() => setError('Could not load facilities.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(f) {
    setEditingId(f.id);
    setForm({
      name: f.name ?? '', county: f.county ?? '', address: f.address ?? '',
      services: f.services ?? '', services_sw: f.services_sw ?? '',
      latitude: f.latitude ?? '', longitude: f.longitude ?? '',
      source_note: f.source_note ?? '', is_wics_site: !!f.is_wics_site,
      hpv_vaccine_stock: f.hpv_vaccine_stock ?? 'UNKNOWN',
      pap_smear_kit_stock: f.pap_smear_kit_stock ?? 'UNKNOWN',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(BLANK_FACILITY); }

  async function save(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = {
      ...form,
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
    };
    try {
      if (editingId) await client.put(`/facilities/${editingId}/`, payload);
      else await client.post('/facilities/', payload);
      resetForm(); load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this facility?')) return;
    try { await client.delete(`/facilities/${id}/`); load(); }
    catch { setError('Delete failed.'); }
  }

  return (
    <div className="panel">
      <h3>{editingId ? 'Edit facility' : 'Add facility'}</h3>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 18 }}>
        <input style={inputStyle} placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={inputStyle} placeholder="County" required value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
        <input style={inputStyle} placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input style={inputStyle} placeholder="Services (comma-separated)" required value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />
        <input style={inputStyle} placeholder="Services in Kiswahili (optional)" value={form.services_sw} onChange={(e) => setForm({ ...form, services_sw: e.target.value })} />
        <input style={inputStyle} placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <input style={inputStyle} placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        <input style={inputStyle} placeholder="Source note" value={form.source_note} onChange={(e) => setForm({ ...form, source_note: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={form.is_wics_site} onChange={(e) => setForm({ ...form, is_wics_site: e.target.checked })} />
          WICS project site
        </label>
        <label style={{ fontSize: 12 }}>HPV vaccine stock
          <select style={inputStyle} value={form.hpv_vaccine_stock} onChange={(e) => setForm({ ...form, hpv_vaccine_stock: e.target.value })}>
            {STOCK_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12 }}>Pap smear kit stock
          <select style={inputStyle} value={form.pap_smear_kit_stock} onChange={(e) => setForm({ ...form, pap_smear_kit_stock: e.target.value })}>
            {STOCK_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Add facility'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <Table columns={['Name', 'County', 'Services', 'WICS', '']}>
        {rows.map((f) => (
          <tr key={f.id}>
            <td style={cellStyle}>{f.name}</td>
            <td style={cellStyle}>{f.county}</td>
            <td style={cellStyle}>{f.services}</td>
            <td style={cellStyle}>{f.is_wics_site ? 'Yes' : 'No'}</td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startEdit(f)}>Edit</button>{' '}
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => remove(f.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* -------------------------- Volunteer applications --------------------------- */

const STATUSES = ['PENDING', 'CONTACTED', 'ACCEPTED'];

function VolunteersTab() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    client.get('/volunteer-applications/').then((r) => setRows(r.data)).catch(() => setError('Could not load applications.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(id, status) {
    setError('');
    try {
      await client.patch(`/volunteer-applications/${id}/status/`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update status.');
    }
  }

  return (
    <div className="panel">
      <h3>Volunteer applications</h3>
      {error && <div className="error-box">{error}</div>}
      {rows.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No applications yet.</p>}
      {rows.length > 0 && (
        <Table columns={['Volunteer', 'County', 'Message', 'Submitted', 'Status']}>
          {rows.map((a) => (
            <tr key={a.id}>
              <td style={cellStyle}>{a.volunteer_username}</td>
              <td style={cellStyle}>{a.volunteer_county || 'Not given'}</td>
              <td style={{ ...cellStyle, maxWidth: 320 }}>{a.message}</td>
              <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>{new Date(a.submitted_at).toLocaleDateString()}</td>
              <td style={cellStyle}>
                <select
                  style={{ ...inputStyle, width: 'auto' }}
                  value={a.status}
                  onChange={(e) => changeStatus(a.id, e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

/* ------------------------------- FAQ items ------------------------------- */

const BLANK_FAQ = { question: '', answer: '', question_sw: '', answer_sw: '', order: 0 };

function FaqTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(BLANK_FAQ);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    client.get('/faqs/').then((r) => setRows(r.data)).catch(() => setError('Could not load FAQ items.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(f) {
    setEditingId(f.id);
    setForm({
      question: f.question, answer: f.answer,
      question_sw: f.question_sw ?? '', answer_sw: f.answer_sw ?? '',
      order: f.order,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(BLANK_FAQ); }

  async function save(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editingId) await client.put(`/faqs/${editingId}/`, payload);
      else await client.post('/faqs/', payload);
      resetForm(); load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this FAQ item?')) return;
    try { await client.delete(`/faqs/${id}/`); load(); }
    catch { setError('Delete failed.'); }
  }

  return (
    <div className="panel">
      <h3>{editingId ? 'Edit FAQ item' : 'Add FAQ item'}</h3>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={save} style={{ marginBottom: 18 }}>
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Question" required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={3} placeholder="Answer" required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Question in Kiswahili (optional)" value={form.question_sw} onChange={(e) => setForm({ ...form, question_sw: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={3} placeholder="Answer in Kiswahili (optional)" value={form.answer_sw} onChange={(e) => setForm({ ...form, answer_sw: e.target.value })} />
        <input style={{ ...inputStyle, width: 120, marginBottom: 8 }} type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Add FAQ item'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <Table columns={['#', 'Question', 'Answer', '']}>
        {rows.map((f) => (
          <tr key={f.id}>
            <td style={cellStyle}>{f.order}</td>
            <td style={{ ...cellStyle, maxWidth: 240 }}>{f.question}</td>
            <td style={{ ...cellStyle, maxWidth: 360, color: 'var(--text-secondary)' }}>{f.answer}</td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startEdit(f)}>Edit</button>{' '}
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => remove(f.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ------------------------------ Myth vs Fact ----------------------------- */

const MYTH_CATEGORIES = ['GENERAL', 'VACCINE', 'SCREENING', 'TRANSMISSION', 'TREATMENT'];
const BLANK_MYTH = { myth: '', fact: '', myth_sw: '', fact_sw: '', category: 'GENERAL', order: 0 };

function MythsTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(BLANK_MYTH);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    client.get('/myths/').then((r) => setRows(r.data)).catch(() => setError('Could not load myth cards.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(m) {
    setEditingId(m.id);
    setForm({
      myth: m.myth, fact: m.fact,
      myth_sw: m.myth_sw ?? '', fact_sw: m.fact_sw ?? '',
      category: m.category, order: m.order,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(BLANK_MYTH); }

  async function save(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editingId) await client.put(`/myths/${editingId}/`, payload);
      else await client.post('/myths/', payload);
      resetForm(); load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this myth card?')) return;
    try { await client.delete(`/myths/${id}/`); load(); }
    catch { setError('Delete failed.'); }
  }

  return (
    <div className="panel">
      <h3>{editingId ? 'Edit myth card' : 'Add myth card'}</h3>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={save} style={{ marginBottom: 18 }}>
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Myth (the false belief)" required value={form.myth} onChange={(e) => setForm({ ...form, myth: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={3} placeholder="Fact (the correction)" required value={form.fact} onChange={(e) => setForm({ ...form, fact: e.target.value })} />
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Myth in Kiswahili (optional)" value={form.myth_sw} onChange={(e) => setForm({ ...form, myth_sw: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={3} placeholder="Fact in Kiswahili (optional)" value={form.fact_sw} onChange={(e) => setForm({ ...form, fact_sw: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select style={{ ...inputStyle, width: 'auto' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {MYTH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={{ ...inputStyle, width: 120 }} type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Add myth card'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <Table columns={['#', 'Myth', 'Fact', 'Category', '']}>
        {rows.map((m) => (
          <tr key={m.id}>
            <td style={cellStyle}>{m.order}</td>
            <td style={{ ...cellStyle, maxWidth: 220 }}>{m.myth}</td>
            <td style={{ ...cellStyle, maxWidth: 320, color: 'var(--text-secondary)' }}>{m.fact}</td>
            <td style={cellStyle}>{m.category}</td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startEdit(m)}>Edit</button>{' '}
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => remove(m.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function Admin() {
  const [tab, setTab] = useState('facilities');

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Admin console</h2>
        <p>Manage screening facilities, volunteer applications, and Info Hub content.</p>
      </div>
      <div className="tabs" style={{ maxWidth: 640 }}>
        <button className={tab === 'facilities' ? 'active' : ''} onClick={() => setTab('facilities')}>Facilities</button>
        <button className={tab === 'volunteers' ? 'active' : ''} onClick={() => setTab('volunteers')}>Volunteers</button>
        <button className={tab === 'faqs' ? 'active' : ''} onClick={() => setTab('faqs')}>FAQ</button>
        <button className={tab === 'myths' ? 'active' : ''} onClick={() => setTab('myths')}>Myths</button>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {tab === 'facilities' && <FacilitiesTab />}
        {tab === 'volunteers' && <VolunteersTab />}
        {tab === 'faqs' && <FaqTab />}
        {tab === 'myths' && <MythsTab />}
      </div>
    </div>
  );
}
