import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { VOLUNTEER_ROLES } from '../components/get-involved/roles';

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

/* --------------------------------- Overview -------------------------------- */

const VOL_STATUS_ORDER = ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'];
const VOL_STATUS_LABEL = { PENDING: 'Submitted', APPROVED: 'Approved', ACTIVE: 'Active', COMPLETED: 'Completed', REJECTED: 'Not selected' };
const APPT_STATUS_ORDER = ['PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED'];
const APPT_STATUS_LABEL = { PENDING: 'Pending', CONFIRMED: 'Confirmed', DECLINED: 'Declined', COMPLETED: 'Completed' };

function StatCard({ label, value, sub }) {
  return (
    <div className="panel" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusBreakdown({ title, order, labels, counts }) {
  const total = order.reduce((sum, k) => sum + (counts[k] || 0), 0);
  return (
    <div className="panel">
      <h3>{title}</h3>
      {total === 0 ? (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No records yet.</p>
      ) : (
        order.map((key) => {
          const count = counts[key] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{labels[key]}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-alt)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 999 }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [volCounts, setVolCounts] = useState({});
  const [apptCounts, setApptCounts] = useState({});
  const [donationTotal, setDonationTotal] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [pendingStories, setPendingStories] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [facilityCount, setFacilityCount] = useState(0);

  useEffect(() => {
    Promise.all([
      client.get('/volunteer-applications/'),
      client.get('/donations/'),
      client.get('/appointment-requests/'),
      client.get('/blog-posts/'),
      client.get('/events/'),
      client.get('/facilities/'),
    ]).then(([vol, don, appt, blog, events, facilities]) => {
      const vc = {};
      vol.data.forEach((v) => { vc[v.status] = (vc[v.status] || 0) + 1; });
      setVolCounts(vc);

      const ac = {};
      appt.data.forEach((a) => { ac[a.status] = (ac[a.status] || 0) + 1; });
      setApptCounts(ac);

      setDonationTotal(don.data.reduce((sum, d) => sum + Number(d.amount_kes), 0));
      setDonationCount(don.data.length);

      setPendingStories(blog.data.filter((b) => b.status === 'PENDING').length);

      const now = new Date();
      setUpcomingEvents(events.data.filter((e) => new Date(e.start_date) >= now).length);

      setFacilityCount(facilities.data.length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Loading overview…</p>;

  const volTotal = Object.values(volCounts).reduce((a, b) => a + b, 0);
  const apptTotal = Object.values(apptCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total raised" value={`KES ${donationTotal.toLocaleString()}`} sub={`${donationCount} donation${donationCount === 1 ? '' : 's'}`} />
        <StatCard label="Volunteer applications" value={volTotal} sub={`${volCounts.PENDING || 0} awaiting review`} />
        <StatCard label="Appointment requests" value={apptTotal} sub={`${apptCounts.PENDING || 0} awaiting response`} />
        <StatCard label="Stories awaiting review" value={pendingStories} />
        <StatCard label="Upcoming events" value={upcomingEvents} />
        <StatCard label="Screening facilities" value={facilityCount} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <StatusBreakdown title="Volunteers by status" order={VOL_STATUS_ORDER} labels={VOL_STATUS_LABEL} counts={volCounts} />
        <StatusBreakdown title="Appointments by status" order={APPT_STATUS_ORDER} labels={APPT_STATUS_LABEL} counts={apptCounts} />
      </div>
    </div>
  );
}

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
const FACILITY_TYPES = ['PUBLIC', 'PRIVATE', 'NGO', 'HEALTH_CENTRE'];

const BLANK_FACILITY = {
  name: '', county: '', address: '', services: '', services_sw: '',
  latitude: '', longitude: '', source_note: '', is_wics_site: false,
  hpv_vaccine_stock: 'UNKNOWN', pap_smear_kit_stock: 'UNKNOWN',
  facility_type: 'PUBLIC', phone: '', open_days: '', open_hours: '',
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
      facility_type: f.facility_type ?? 'PUBLIC',
      phone: f.phone ?? '', open_days: f.open_days ?? '', open_hours: f.open_hours ?? '',
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
        <label style={{ fontSize: 12 }}>Facility type
          <select style={inputStyle} value={form.facility_type} onChange={(e) => setForm({ ...form, facility_type: e.target.value })}>
            {FACILITY_TYPES.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
          </select>
        </label>
        <input style={inputStyle} placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input style={inputStyle} placeholder="Open days, e.g. Mon - Fri (optional)" value={form.open_days} onChange={(e) => setForm({ ...form, open_days: e.target.value })} />
        <input style={inputStyle} placeholder="Open hours, e.g. 8:00 AM - 5:00 PM (optional)" value={form.open_hours} onChange={(e) => setForm({ ...form, open_hours: e.target.value })} />
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

/* -------------------------- Appointment requests --------------------------- */

const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED'];

function AppointmentsTab() {
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');

  const load = useCallback(() => {
    client.get('/appointment-requests/').then((r) => {
      setRows(r.data);
      setNotes(Object.fromEntries(r.data.map((a) => [a.id, a.admin_note || ''])));
    }).catch(() => setError('Could not load appointment requests.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(id, status) {
    setError('');
    try {
      await client.patch(`/appointment-requests/${id}/status/`, { status, admin_note: notes[id] ?? '' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update status.');
    }
  }

  async function saveNote(id, currentStatus) {
    setError('');
    try {
      await client.patch(`/appointment-requests/${id}/status/`, { status: currentStatus, admin_note: notes[id] ?? '' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save note.');
    }
  }

  return (
    <div className="panel">
      <h3>Appointment requests</h3>
      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
        These are requests, not confirmed bookings. Contact the patient or facility to confirm, then mark the status here.
      </p>
      {error && <div className="error-box">{error}</div>}
      {rows.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No appointment requests yet.</p>}
      {rows.length > 0 && (
        <Table columns={['Patient', 'Facility', 'Preferred', 'Reason', 'Note', 'Requested', 'Status']}>
          {rows.map((a) => (
            <tr key={a.id}>
              <td style={cellStyle}>{a.patient_username}</td>
              <td style={{ ...cellStyle, maxWidth: 180 }}>{a.facility_name}</td>
              <td style={cellStyle}>{a.preferred_date}{a.preferred_time ? `, ${a.preferred_time}` : ''}</td>
              <td style={{ ...cellStyle, maxWidth: 180 }}>{a.reason || '—'}</td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    style={{ ...inputStyle, width: 140 }}
                    placeholder="e.g. Confirmed 10am"
                    value={notes[a.id] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                  />
                  <button className="btn btn-outline" style={{ padding: '5px 8px', fontSize: 12 }} onClick={() => saveNote(a.id, a.status)}>Save</button>
                </div>
              </td>
              <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleDateString()}</td>
              <td style={cellStyle}>
                <select
                  style={{ ...inputStyle, width: 'auto' }}
                  value={a.status}
                  onChange={(e) => changeStatus(a.id, e.target.value)}
                >
                  {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

/* -------------------------- Volunteer applications --------------------------- */

const STATUSES = ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'];

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
        <Table columns={['Volunteer', 'Role', 'Category', 'County', 'Motivation', 'Credentials', 'Submitted', 'Status']}>
          {rows.map((a) => (
            <tr key={a.id}>
              <td style={cellStyle}>{a.volunteer_username}<br /><span style={{ color: 'var(--text-secondary)' }}>{a.full_name} · {a.phone}</span></td>
              <td style={cellStyle}>{a.role}</td>
              <td style={cellStyle}>{a.category === 'MEDICAL' ? 'Clinical & Medical' : 'Community & Outreach'}</td>
              <td style={cellStyle}>{a.county}</td>
              <td style={{ ...cellStyle, maxWidth: 260 }}>{a.motivation}{a.skills && <><br /><span style={{ color: 'var(--text-secondary)' }}>Skills: {a.skills}</span></>}</td>
              <td style={cellStyle}>
                {a.credentials_file ? <a href={a.credentials_file} target="_blank" rel="noreferrer">View file</a> : '—'}
              </td>
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

/* ---------------------------- Survivor Blog posts ---------------------------- */

const BLOG_STATUSES = ['PENDING', 'PUBLISHED', 'REJECTED'];

function BlogTab() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    client.get('/blog-posts/').then((r) => setRows(r.data)).catch(() => setError('Could not load blog posts.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(id, status) {
    setError('');
    try {
      await client.patch(`/blog-posts/${id}/status/`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update status.');
    }
  }

  return (
    <div className="panel">
      <h3>Survivor Blog posts</h3>
      {error && <div className="error-box">{error}</div>}
      {rows.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No posts yet.</p>}
      {rows.length > 0 && (
        <Table columns={['Author', 'Title', 'Story', 'Submitted', 'Status']}>
          {rows.map((p) => (
            <tr key={p.id}>
              <td style={cellStyle}>{p.author_username}</td>
              <td style={{ ...cellStyle, maxWidth: 180 }}>{p.title}</td>
              <td style={{ ...cellStyle, maxWidth: 320, color: 'var(--text-secondary)' }}>{p.body}</td>
              <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>{new Date(p.created_at).toLocaleDateString()}</td>
              <td style={cellStyle}>
                <select
                  style={{ ...inputStyle, width: 'auto' }}
                  value={p.status}
                  onChange={(e) => changeStatus(p.id, e.target.value)}
                >
                  {BLOG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

/* -------------------------------- Articles -------------------------------- */

const ARTICLE_CATEGORIES = ['PREVENTION', 'SCREENING', 'VACCINATION', 'TREATMENT', 'RESEARCH', 'WELLBEING', 'GENERAL'];

const BLANK_ARTICLE = {
  title: '', summary: '', body: '', title_sw: '', summary_sw: '', body_sw: '',
  source_name: '', source_url: '', order: 0, category: 'GENERAL',
};

function ArticlesTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(BLANK_ARTICLE);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    client.get('/articles/').then((r) => setRows(r.data)).catch(() => setError('Could not load articles.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(a) {
    setEditingId(a.id);
    setForm({
      title: a.title, summary: a.summary, body: a.body,
      title_sw: a.title_sw ?? '', summary_sw: a.summary_sw ?? '', body_sw: a.body_sw ?? '',
      source_name: a.source_name ?? '', source_url: a.source_url ?? '', order: a.order,
      category: a.category ?? 'GENERAL',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(BLANK_ARTICLE); }

  async function save(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editingId) await client.put(`/articles/${editingId}/`, payload);
      else await client.post('/articles/', payload);
      resetForm(); load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this article?')) return;
    try { await client.delete(`/articles/${id}/`); load(); }
    catch { setError('Delete failed.'); }
  }

  return (
    <div className="panel">
      <h3>{editingId ? 'Edit article' : 'Add article'}</h3>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={save} style={{ marginBottom: 18 }}>
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Summary (short teaser)" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={5} placeholder="Body" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Title in Kiswahili (optional)" value={form.title_sw} onChange={(e) => setForm({ ...form, title_sw: e.target.value })} />
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Summary in Kiswahili (optional)" value={form.summary_sw} onChange={(e) => setForm({ ...form, summary_sw: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={5} placeholder="Body in Kiswahili (optional)" value={form.body_sw} onChange={(e) => setForm({ ...form, body_sw: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input style={inputStyle} placeholder="Source name (optional)" value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} />
          <input style={inputStyle} placeholder="Source URL (optional)" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
          <input style={{ ...inputStyle, width: 100 }} type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        </div>
        <select style={{ ...inputStyle, marginBottom: 8 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {ARTICLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Add article'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <Table columns={['#', 'Title', 'Summary', '']}>
        {rows.map((a) => (
          <tr key={a.id}>
            <td style={cellStyle}>{a.order}</td>
            <td style={{ ...cellStyle, maxWidth: 220 }}>{a.title}</td>
            <td style={{ ...cellStyle, maxWidth: 320, color: 'var(--text-secondary)' }}>{a.summary}</td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startEdit(a)}>Edit</button>{' '}
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => remove(a.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* --------------------------------- Events --------------------------------- */

const BLANK_EVENT = {
  title: '', title_sw: '', description: '', description_sw: '',
  location: '', county: '', start_date: '', end_date: '', volunteer_role_ids: [],
};

function EventsTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(BLANK_EVENT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    client.get('/events/').then((r) => setRows(r.data)).catch(() => setError('Could not load events.'));
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(ev) {
    setEditingId(ev.id);
    setForm({
      title: ev.title, title_sw: ev.title_sw ?? '',
      description: ev.description, description_sw: ev.description_sw ?? '',
      location: ev.location, county: ev.county ?? '',
      start_date: ev.start_date ? ev.start_date.slice(0, 16) : '',
      end_date: ev.end_date ? ev.end_date.slice(0, 16) : '',
      volunteer_role_ids: ev.volunteer_role_ids ?? [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(BLANK_EVENT); }

  function toggleRole(id) {
    setForm((prev) => ({
      ...prev,
      volunteer_role_ids: prev.volunteer_role_ids.includes(id)
        ? prev.volunteer_role_ids.filter((r) => r !== id)
        : [...prev.volunteer_role_ids, id],
    }));
  }

  async function save(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = { ...form, end_date: form.end_date || null };
    try {
      if (editingId) await client.put(`/events/${editingId}/`, payload);
      else await client.post('/events/', payload);
      resetForm(); load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this event?')) return;
    try { await client.delete(`/events/${id}/`); load(); }
    catch { setError('Delete failed.'); }
  }

  return (
    <div className="panel">
      <h3>{editingId ? 'Edit event' : 'Add event'}</h3>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={save} style={{ marginBottom: 18 }}>
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={4} placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Title in Kiswahili (optional)" value={form.title_sw} onChange={(e) => setForm({ ...form, title_sw: e.target.value })} />
        <textarea style={{ ...inputStyle, marginBottom: 8 }} rows={4} placeholder="Description in Kiswahili (optional)" value={form.description_sw} onChange={(e) => setForm({ ...form, description_sw: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input style={inputStyle} placeholder="Location (e.g. Kenyatta National Hospital, Nairobi)" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input style={inputStyle} placeholder="County (optional)" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Start date/time</label>
            <input style={inputStyle} type="datetime-local" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>End date/time (optional)</label>
            <input style={inputStyle} type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Volunteer roles needed (optional)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {VOLUNTEER_ROLES.map((role) => (
              <label key={role.id} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={form.volunteer_role_ids.includes(role.id)} onChange={() => toggleRole(role.id)} />
                {role.title.en}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={busy}>{editingId ? 'Save changes' : 'Add event'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <Table columns={['Title', 'When', 'Location', 'RSVPs', '']}>
        {rows.map((ev) => (
          <tr key={ev.id}>
            <td style={{ ...cellStyle, maxWidth: 220 }}>{ev.title}</td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>{new Date(ev.start_date).toLocaleString()}</td>
            <td style={{ ...cellStyle, maxWidth: 200 }}>{ev.location}</td>
            <td style={cellStyle}>{ev.rsvp_count}</td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startEdit(ev)}>Edit</button>{' '}
              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => remove(ev.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function Admin() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Admin console</h2>
        <p>Manage screening facilities, volunteer applications, and Info Hub content.</p>
      </div>
      <div className="tabs" style={{ maxWidth: 900 }}>
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'facilities' ? 'active' : ''} onClick={() => setTab('facilities')}>Facilities</button>
        <button className={tab === 'volunteers' ? 'active' : ''} onClick={() => setTab('volunteers')}>Volunteers</button>
        <button className={tab === 'faqs' ? 'active' : ''} onClick={() => setTab('faqs')}>FAQ</button>
        <button className={tab === 'myths' ? 'active' : ''} onClick={() => setTab('myths')}>Myths</button>
        <button className={tab === 'articles' ? 'active' : ''} onClick={() => setTab('articles')}>Articles</button>
        <button className={tab === 'blog' ? 'active' : ''} onClick={() => setTab('blog')}>Blog</button>
        <button className={tab === 'events' ? 'active' : ''} onClick={() => setTab('events')}>Events</button>
        <button className={tab === 'appointments' ? 'active' : ''} onClick={() => setTab('appointments')}>Appointments</button>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {tab === 'overview' && <OverviewTab />}
        {tab === 'facilities' && <FacilitiesTab />}
        {tab === 'volunteers' && <VolunteersTab />}
        {tab === 'faqs' && <FaqTab />}
        {tab === 'myths' && <MythsTab />}
        {tab === 'articles' && <ArticlesTab />}
        {tab === 'blog' && <BlogTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'appointments' && <AppointmentsTab />}
      </div>
    </div>
  );
}
