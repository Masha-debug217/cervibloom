import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, MapPin, ChevronDown, Filter } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import FacilityCard from '../components/directory/FacilityCard';

export default function Directory() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const t = (en, swText) => (sw ? swText : en);

  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);

  useEffect(() => {
    client.get('/facilities/').then((res) => setFacilities(res.data))
      .catch(() => setError(t('Could not load facilities. Is the backend running?', 'Imeshindwa kupakia vituo. Je, seva ya nyuma inafanya kazi?')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counties = useMemo(
    () => [...new Set(facilities.map((f) => f.county))].sort(),
    [facilities]
  );
  const serviceOptions = useMemo(() => {
    const set = new Set();
    facilities.forEach((f) => (f.services || '').split(',').forEach((s) => { const v = s.trim(); if (v) set.add(v); }));
    return [...set].sort();
  }, [facilities]);

  function toggleService(svc) {
    setSelectedServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  }
  function clearFilters() {
    setSearchQuery(''); setSelectedCounty(''); setSelectedServices([]);
  }

  const filtered = useMemo(() => {
    return facilities.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q
        || f.name.toLowerCase().includes(q)
        || f.county.toLowerCase().includes(q)
        || (f.address || '').toLowerCase().includes(q);
      const matchesCounty = !selectedCounty || f.county === selectedCounty;
      const facilityServices = (f.services || '').split(',').map((s) => s.trim());
      const matchesServices = selectedServices.length === 0
        || selectedServices.every((svc) => facilityServices.includes(svc));
      return matchesSearch && matchesCounty && matchesServices;
    });
  }, [facilities, searchQuery, selectedCounty, selectedServices]);

  const hasActiveFilters = !!searchQuery || !!selectedCounty || selectedServices.length > 0;

  return (
    <div className="bg-background">
      <div className="bg-secondary border-b border-border">
        <div className="container-base py-10">
          <div className="flex flex-col gap-2 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              {t('Screening Directory', 'Orodha ya Uchunguzi')}
            </span>
            <h1 className="font-heading font-bold text-3xl xl:text-4xl text-foreground">
              {t('Find a Screening Facility Near You', 'Pata Kituo cha Uchunguzi Karibu Nawe')}
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
              {t(
                `Browse ${facilities.length} cervical cancer screening centres across ${counties.length} Kenyan counties.`,
                `Vinjari vituo ${facilities.length} vya uchunguzi wa saratani ya shingo ya kizazi katika kaunti ${counties.length} za Kenya.`
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={t('Search by facility name, county, or address...', 'Tafuta kwa jina la kituo, kaunti, au anwani...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full !pl-10 !pr-4 !py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                  <X size={12} className="text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="relative sm:w-56">
              <button
                onClick={() => setCountyOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground hover:border-primary transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground shrink-0" />
                  <span className={selectedCounty ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedCounty || t('All Counties', 'Kaunti Zote')}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-150 ${countyOpen ? 'rotate-180' : ''}`} />
              </button>
              {countyOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 card-base shadow-lg max-h-60 overflow-y-auto">
                  <button onClick={() => { setSelectedCounty(''); setCountyOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
                    {t('All Counties', 'Kaunti Zote')}
                  </button>
                  {counties.map((county) => (
                    <button
                      key={county}
                      onClick={() => { setSelectedCounty(county); setCountyOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCounty === county ? 'bg-accent text-primary font-medium' : 'text-foreground hover:bg-muted'}`}
                    >
                      {county}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${showFilters || selectedServices.length > 0 ? 'border-primary bg-accent text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'}`}
            >
              <SlidersHorizontal size={15} />
              {t('Services', 'Huduma')}
              {selectedServices.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center tabular-nums">
                  {selectedServices.length}
                </span>
              )}
            </button>
          </div>

          {showFilters && serviceOptions.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-border bg-card animate-slide-up">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('Filter by Service Type', 'Chuja kwa Aina ya Huduma')}
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((svc) => (
                  <button
                    key={svc}
                    onClick={() => toggleService(svc)}
                    className={`tag-service cursor-pointer border transition-all duration-150 ${selectedServices.includes(svc) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'}`}
                  >
                    {svc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t(`Showing ${filtered.length} of ${facilities.length} facilities`, `Inaonyesha ${filtered.length} kati ya ${facilities.length} vituo`)}
              </p>
              <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                <X size={12} />
                {t('Clear all filters', 'Futa vichujio vyote')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-base py-10">
        {error && <div className="error-box max-w-lg mx-auto">{error}</div>}

        {!error && facilities.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {t('No facilities yet. Add them in the Django admin, or run the seed script.', 'Hakuna vituo bado. Viongeze kwenye msimamizi wa Django, au uendeshe script ya kupanda data.')}
          </p>
        )}

        {facilities.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <MapPin size={24} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-semibold text-base text-foreground">{t('No facilities found', 'Hakuna vituo vilivyopatikana')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{t('Try adjusting your search or filters.', 'Jaribu kurekebisha utafutaji au vichujio vyako.')}</p>
            </div>
            <button onClick={clearFilters} className="btn-outline text-sm py-2.5 px-5">
              <X size={14} />
              {t('Clear filters', 'Futa vichujio')}
            </button>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span>{' '}
                {t(filtered.length === 1 ? 'facility found' : 'facilities found', filtered.length === 1 ? 'kituo kimepatikana' : 'vituo vimepatikana')}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter size={12} />
                <span>{t('Sorted alphabetically', 'Imepangwa kialfabeti')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
            </div>

            <div className="mt-10 p-4 rounded-xl bg-muted border border-border">
              <p className="text-xs text-muted-foreground text-center">
                {t(
                  'Facility data is compiled from WHO Africa and Kenya Ministry of Health public reporting on the National Cervical Cancer Elimination Action Plan and the Women\'s Integrated Cancer Services (WICS) project. Always call ahead to confirm current availability.',
                  'Data ya vituo imekusanywa kutoka ripoti za umma za WHO Africa na Wizara ya Afya Kenya kuhusu Mpango wa Kitaifa wa Kutokomeza Saratani ya Shingo ya Kizazi na mradi wa Women\'s Integrated Cancer Services (WICS). Daima piga simu mapema kuthibitisha upatikanaji wa sasa.'
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
