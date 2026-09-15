import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle2, ChevronDown } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VOLUNTEER_ROLES } from '../components/get-involved/roles';

const ROLE_TITLE = Object.fromEntries(VOLUNTEER_ROLES.map((r) => [r.id, r.title]));

function formatRange(startIso, endIso, sw) {
  const locale = sw ? 'sw-KE' : 'en-KE';
  const start = new Date(startIso);
  const dateStr = start.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const startTime = start.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  if (!endIso) return `${dateStr}, ${startTime}`;
  const end = new Date(endIso);
  const endTime = end.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  return `${dateStr}, ${startTime} to ${endTime}`;
}

function EventCard({ event, t, sw, busy, onToggleRsvp }) {
  const [expanded, setExpanded] = useState(false);
  const description = (sw && event.description_sw) || event.description;
  const title = (sw && event.title_sw) || event.title;
  const roles = event.volunteer_role_ids || [];

  return (
    <div className="card-base p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <Calendar size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground leading-snug">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{formatRange(event.start_date, event.end_date, sw)}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin size={13} className="shrink-0 mt-0.5 text-primary" />
        <span>{event.location}{event.county ? `, ${event.county}` : ''}</span>
      </div>

      {roles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {roles.map((id) => {
            const roleTitle = ROLE_TITLE[id];
            if (!roleTitle) return null;
            return (
              <span key={id} className="tag-service bg-accent text-primary text-xs">
                {t(roleTitle.en, roleTitle.sw)}
              </span>
            );
          })}
        </div>
      )}

      <div>
        <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{description}</p>
        {description.length > 100 && (
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
            {expanded ? t('Show less', 'Onyesha kidogo') : t('Read more', 'Soma zaidi')}
            <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users size={13} />
          {t(`${event.rsvp_count} going`, `${event.rsvp_count} wanahudhuria`)}
        </span>
        <button
          onClick={() => onToggleRsvp(event)}
          disabled={busy}
          className={event.is_rsvped ? 'btn-outline text-xs py-2 px-4' : 'btn-primary text-xs py-2 px-4'}
        >
          {event.is_rsvped ? (
            <>
              <CheckCircle2 size={13} />
              {t("You're Going", 'Unahudhuria')}
            </>
          ) : (
            t("I'm Going", 'Nitahudhuria')
          )}
        </button>
      </div>
    </div>
  );
}

export default function Events() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    client.get('/events/').then((res) => setEvents(res.data))
      .catch(() => setError(t('Could not load events.', 'Imeshindwa kupakia matukio.')));
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleRsvp(event) {
    if (!user) {
      navigate('/auth', { state: { from: '/events' } });
      return;
    }
    setBusyId(event.id);
    setError('');
    try {
      const res = await client.post(`/events/${event.id}/toggle_rsvp/`);
      setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, is_rsvped: res.data.is_rsvped, rsvp_count: res.data.rsvp_count } : e)));
    } catch {
      setError(t('Could not update your RSVP. Please try again.', 'Imeshindwa kusasisha RSVP yako. Tafadhali jaribu tena.'));
    } finally {
      setBusyId(null);
    }
  }

  const now = new Date();
  const filtered = events
    .filter((e) => (filter === 'upcoming' ? new Date(e.start_date) >= now : new Date(e.start_date) < now))
    .sort((a, b) => (filter === 'upcoming' ? new Date(a.start_date) - new Date(b.start_date) : new Date(b.start_date) - new Date(a.start_date)));

  return (
    <div className="section-padding">
      <div className="container-base">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            {t('Events', 'Matukio')}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {t(
              'Cervical cancer awareness events across Kenya. Sign in to RSVP; some events list volunteer roles they could use help with.',
              'Matukio ya uhamasishaji wa saratani ya mlango wa kizazi Kenya nzima. Ingia ili kuweka RSVP; matukio mengine yanaorodhesha nafasi za kujitolea zinazohitajika.'
            )}
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
          {[
            { id: 'upcoming', label: t('Upcoming', 'Yajayo') },
            { id: 'past', label: t('Past', 'Yaliyopita') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === item.id ? 'bg-card text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && <div className="error-box max-w-lg mb-6">{error}</div>}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Calendar size={24} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-semibold text-base text-foreground">
                {filter === 'upcoming'
                  ? t('No upcoming events yet', 'Hakuna matukio yajayo bado')
                  : t('No past events', 'Hakuna matukio yaliyopita')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {filter === 'upcoming'
                  ? t('Check back soon, or volunteer to help organize one.', 'Rudi hivi karibuni, au jitolee kusaidia kupanga moja.')
                  : t('Events will appear here once they\'ve happened.', 'Matukio yataonekana hapa yakishatokea.')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                t={t}
                sw={sw}
                busy={busyId === event.id}
                onToggleRsvp={toggleRsvp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
