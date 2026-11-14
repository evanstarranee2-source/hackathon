import { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Check, MapPin, Search, X } from 'lucide-react';
import { MediaImage } from '../shared/MediaImage';
import type { District, LocalEvent, Place, RequestType } from '../types';

interface DiscoverViewProps {
  places: Place[];
  events: LocalEvent[];
  openRequestCount: number;
  onOpenRequestModal: (destination?: string, requestType?: RequestType) => void;
  onGoToRequests: () => void;
  onGoToStays: () => void;
  onRsvpEvent: (eventId: string) => Promise<void>;
  rsvpedEventIds: string[];
}

const DISTRICTS: ('All' | District)[] = [
  'All',
  'East Khasi Hills',
  'West Jaintia Hills',
  'West Garo Hills',
];

export function DiscoverView({
  places,
  events,
  openRequestCount,
  onOpenRequestModal,
  onGoToRequests,
  onGoToStays,
  onRsvpEvent,
  rsvpedEventIds,
}: DiscoverViewProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<'All' | District>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [rsvpBusyId, setRsvpBusyId] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return places.filter((p) => {
      const matchesDistrict = selectedDistrict === 'All' || p.district === selectedDistrict;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nearestHub.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q);
      return matchesDistrict && matchesQuery;
    });
  }, [places, selectedDistrict, searchQuery]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => selectedDistrict === 'All' || ev.district === selectedDistrict);
  }, [events, selectedDistrict]);

  async function handleRsvp(eventId: string) {
    setRsvpError(null);
    setRsvpBusyId(eventId);
    try {
      await onRsvpEvent(eventId);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : 'Unable to reserve spot.');
    } finally {
      setRsvpBusyId(null);
    }
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-0 border border-[#E2E8E5] bg-white rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className="text-xs font-medium tracking-wide text-[#52635D]">
                Meghalaya Local Travel Network · Khasi, Jaintia &amp; Garo Hills
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#131D19] leading-[1.1] text-balance">
                Plan Meghalaya directly with local drivers, guides, and hosts.
              </h1>
              <p className="text-base text-[#465650] leading-relaxed max-w-xl">
                Discover living root bridges, waterfalls, and community festivals, explore family-run homestays, or post a trip request to compare transparent quotes from verified local providers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenRequestModal('', 'Ride & Guide')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Request a Ride or Guide
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onGoToRequests}
                className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-[#131D19] hover:text-[#14533C] transition-colors whitespace-nowrap shrink-0"
              >
                Compare {openRequestCount} Open Requests
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-[420px]">
            <MediaImage
              imageKey="hero_clouds"
              alt="Morning mist drifting across the green Khasi Hills ridge and waterfall valleys in Meghalaya"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/35 to-transparent text-white">
              <p className="text-xs font-medium text-white/85">
                Sohra Plateau &amp; East Khasi Hills · Best morning clearing 07:00 – 10:00 AM
              </p>
            </div>
          </div>
        </div>

        {/* Full-width 4-column regional strip below Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8E5] divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8E5] bg-[#FAFCFB]">
          <div className="px-6 py-4">
            <div className="font-mono text-lg font-semibold text-[#131D19] tabular-nums">5 Hubs</div>
            <div className="text-xs text-[#52635D] mt-0.5">Shillong, Sohra, Dawki, Jowai, Tura</div>
          </div>
          <div className="px-6 py-4">
            <div className="font-mono text-lg font-semibold text-[#131D19] tabular-nums">Direct Quotes</div>
            <div className="text-xs text-[#52635D] mt-0.5">Compare local driver &amp; guide offers</div>
          </div>
          <div className="px-6 py-4">
            <div className="font-mono text-lg font-semibold text-[#131D19] tabular-nums">Local Hosts</div>
            <div className="text-xs text-[#52635D] mt-0.5">Stone cottages &amp; riverside homestays</div>
          </div>
          <div className="px-6 py-4">
            <div className="font-mono text-lg font-semibold text-[#131D19] tabular-nums">0% Markup</div>
            <div className="text-xs text-[#52635D] mt-0.5">100% of quoted fare goes to locals</div>
          </div>
        </div>
      </section>

      {/* Places Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E8E5] pb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#131D19]">
              Places Across Meghalaya
            </h2>
            <p className="text-sm text-[#52635D] mt-1">
              Curated waterfalls, living root bridges, caves, and river gorges with realistic trail durations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7C75] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Dawki, Sohra, caves..."
                aria-label="Search places in Meghalaya"
                className="pl-9 pr-3.5 py-2 text-sm bg-white border border-[#D4DDD8] rounded-lg w-full sm:w-56 focus:outline-none focus:border-[#14533C]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#EDF2EF] rounded-lg overflow-x-auto">
              {DISTRICTS.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setSelectedDistrict(dist)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedDistrict === dist
                      ? 'bg-white text-[#14533C] shadow-xs'
                      : 'text-[#52635D] hover:text-[#131D19]'
                  }`}
                >
                  {dist === 'All' ? 'All Districts' : dist}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="border border-[#E2E8E5] bg-white rounded-xl p-10 text-center space-y-3">
            <p className="text-sm text-[#52635D]">No places match your current filter or search term.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDistrict('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-[#14533C] border border-[#14533C]/30 rounded-lg hover:bg-[#14533C]/5 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <article
                key={place.id}
                className="bg-white border border-[#E2E8E5] rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#BCC9C3]"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden bg-[#E7EEEA]">
                    <MediaImage
                      imageKey={place.imageKey}
                      alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#52635D] truncate">
                      <span>{place.district}</span>
                      <span aria-hidden="true">·</span>
                      <span>{place.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{place.trekDuration}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#131D19] leading-snug">
                      {place.name}
                    </h3>
                    <p className="text-sm text-[#465650] leading-relaxed line-clamp-3">
                      {place.summary}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-[#E2E8E5] flex items-center justify-between gap-3">
                  <span className="text-xs font-mono tabular-nums text-[#3A4A44]">
                    {place.entryFeeInr === 0 ? 'Free entry' : `₹${place.entryFeeInr} entry`} · Hub: {place.nearestHub}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className="text-xs font-semibold text-[#131D19] hover:text-[#14533C] transition-colors whitespace-nowrap"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenRequestModal(place.name, 'Ride & Guide')}
                      className="text-xs font-semibold text-[#14533C] hover:underline whitespace-nowrap"
                    >
                      Request Trip
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Events Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8E5] pb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#131D19]">
              Local Events &amp; Cultural Gatherings
            </h2>
            <p className="text-sm text-[#52635D] mt-1">
              Community-hosted harvest festivals, acoustic evenings, and seasonal village trail walks.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToStays}
            className="text-sm font-semibold text-[#14533C] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Explore Nearby Homestays →
          </button>
        </div>

        {rsvpError && (
          <div className="p-3 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
            {rsvpError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isReserved = rsvpedEventIds.includes(ev.id);
            const spotsLeft = Math.max(0, ev.capacity - ev.attendeesCount);
            return (
              <article
                key={ev.id}
                className="bg-white border border-[#E2E8E5] rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden bg-[#E7EEEA]">
                    <MediaImage
                      imageKey={ev.imageKey}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#52635D]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono tabular-nums">{ev.dateLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ev.category}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#131D19] leading-snug">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-[#52635D]">
                      Hosted by {ev.organizerName} · {ev.venue}
                    </p>
                    <p className="text-sm text-[#465650] leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-[#E2E8E5] flex items-center justify-between gap-3">
                  <div className="text-xs text-[#3A4A44] font-mono tabular-nums">
                    {ev.ticketPriceInr === 0 ? 'Free RSVP' : `₹${ev.ticketPriceInr}`} · {spotsLeft} spots left
                  </div>
                  <button
                    type="button"
                    disabled={isReserved || spotsLeft === 0 || rsvpBusyId === ev.id}
                    onClick={() => handleRsvp(ev.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      isReserved
                        ? 'bg-[#E6F0EC] text-[#14533C] cursor-default'
                        : 'bg-[#14533C] text-white hover:bg-[#0E3F2D] disabled:opacity-50'
                    }`}
                  >
                    {isReserved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Spot Reserved
                      </>
                    ) : rsvpBusyId === ev.id ? (
                      'Reserving...'
                    ) : spotsLeft === 0 ? (
                      'Full'
                    ) : (
                      'Reserve Spot'
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Place Detail Modal */}
      {selectedPlace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="place-detail-title"
        >
          <div className="w-full max-w-2xl bg-white border border-[#E2E8E5] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-60 bg-[#E7EEEA] shrink-0">
              <MediaImage
                imageKey={selectedPlace.imageKey}
                alt={selectedPlace.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedPlace(null)}
                aria-label="Close place details"
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/90 text-[#131D19] hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#52635D]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedPlace.district}</span>
                  <span aria-hidden="true">·</span>
                  <span>Nearest Hub: {selectedPlace.nearestHub}</span>
                  <span aria-hidden="true">·</span>
                  <span>Best Season: {selectedPlace.bestSeason}</span>
                </div>
                <h3 id="place-detail-title" className="font-display text-2xl font-semibold text-[#131D19] mt-1.5">
                  {selectedPlace.name}
                </h3>
              </div>

              <p className="text-sm text-[#465650] leading-relaxed">{selectedPlace.summary}</p>

              <div className="border-t border-[#E2E8E5] pt-4">
                <h4 className="text-xs font-semibold text-[#3A4A44] mb-2.5">Trail &amp; Visit Notes</h4>
                <ul className="space-y-1.5 text-sm text-[#465650]">
                  {selectedPlace.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#14533C] font-semibold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#E2E8E5] pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono tabular-nums text-[#52635D]">
                  Duration: {selectedPlace.trekDuration} · Entry:{' '}
                  {selectedPlace.entryFeeInr === 0 ? 'Free' : `₹${selectedPlace.entryFeeInr}`}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const name = selectedPlace.name;
                    setSelectedPlace(null);
                    onOpenRequestModal(name, 'Ride & Guide');
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap"
                >
                  Request Driver / Guide for Here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
