import { useEffect, useRef, useState } from 'react';
import { Bell, CalendarCheck, Calendar, Syringe, Stethoscope, X } from 'lucide-react';
import client from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_ICON = {
  SCREENING: Stethoscope,
  APPOINTMENT: CalendarCheck,
  EVENT: Calendar,
  VACCINE: Syringe,
};

export default function NotificationBell() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const wrapperRef = useRef(null);

  function load() {
    client.get('/notifications/').then((res) => { setItems(res.data); setLoaded(true); }).catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function dismiss(key) {
    setItems((prev) => prev.filter((n) => n.key !== key));
    try {
      await client.post('/notifications/dismiss/', { key });
    } catch {
      load();
    }
  }

  function toggleOpen() {
    setOpen((v) => {
      if (!v) load();
      return !v;
    });
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="relative w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors duration-150"
        onClick={toggleOpen}
        title={t('Notifications', 'Arifa')}
        aria-label={t('Notifications', 'Arifa')}
      >
        <Bell size={16} />
        {loaded && items.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] card-base p-0 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-heading font-semibold text-sm text-foreground">{t('Notifications', 'Arifa')}</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                {t("You're all caught up.", 'Umepitia yote.')}
              </p>
            ) : (
              items.map((n) => {
                const Icon = CATEGORY_ICON[n.category] || Bell;
                return (
                  <div key={n.key} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    <button
                      onClick={() => dismiss(n.key)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      aria-label={t('Dismiss', 'Ondoa')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
