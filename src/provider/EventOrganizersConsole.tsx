import React, { useState } from 'react';
import type { District, ImageKey, LocalEvent } from '../types';

interface EventOrganizersConsoleProps {
  events: LocalEvent[];
  onCreateEvent: (payload: {
    title: string;
    organizerName: string;
    district: District;
    venue: string;
    startDate: string;
    dateLabel: string;
    category: LocalEvent['category'];
    ticketPriceInr: number;
    capacity: number;
    description: string;
    imageKey: ImageKey;
  }) => Promise<LocalEvent>;
  onNotify: (msg: string) => void;
  onError: (msg: string) => void;
}

export function EventOrganizersConsole({
  events,
  onCreateEvent,
  onNotify,
  onError,
}: EventOrganizersConsoleProps) {
  const [evtTitle, setEvtTitle] = useState('');
  const [evtOrg, setEvtOrg] = useState('');
  const [evtDistrict, setEvtDistrict] = useState<District>('East Khasi Hills');
  const [evtVenue, setEvtVenue] = useState('');
  const [evtDate, setEvtDate] = useState('2026-12-12');
  const [evtCategory, setEvtCategory] = useState<LocalEvent['category']>('Cultural Festival');
  const [evtPrice, setEvtPrice] = useState(200);
  const [evtCap, setEvtCap] = useState(60);
  const [evtDesc, setEvtDesc] = useState('');

  async function handlePublishEvent(e: React.FormEvent) {
    e.preventDefault();
    onError('');
    try {
      const created = await onCreateEvent({
        title: evtTitle,
        organizerName: evtOrg,
        district: evtDistrict,
        venue: evtVenue,
        startDate: evtDate,
        dateLabel: evtDate,
        category: evtCategory,
        ticketPriceInr: evtPrice,
        capacity: evtCap,
        description: evtDesc || 'Local Meghalaya cultural event open to visitors.',
        imageKey: 'wangala_festival',
      });
      setEvtTitle('');
      setEvtOrg('');
      setEvtVenue('');
      setEvtDesc('');
      onNotify(`Published event "${created.title}" to Tourist Discover.`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not publish event.');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-4">
        <h2 className="font-display text-xl font-semibold text-[#131D19]">
          Published Events ({events.length})
        </h2>
        <div className="space-y-3">
          {events.map((ev) => (
            <article key={ev.id} className="bg-white border border-[#E2E8E5] rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs text-[#52635D]">
                <span>{ev.category} · {ev.district}</span>
                <span className="font-mono tabular-nums">{ev.dateLabel}</span>
              </div>
              <h3 className="font-display text-base font-semibold text-[#131D19]">{ev.title}</h3>
              <div className="text-xs text-[#52635D]">
                {ev.organizerName} · {ev.venue}
              </div>
              <div className="pt-2 border-t border-[#E2E8E5] flex items-center justify-between text-xs font-mono tabular-nums text-[#3A4A44]">
                <span>{ev.ticketPriceInr === 0 ? 'Free' : `₹${ev.ticketPriceInr}`}</span>
                <span>{ev.attendeesCount} / {ev.capacity} reserved</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7 bg-white border border-[#E2E8E5] rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#131D19]">
            Publish a Local Event, Festival, or Guided Walk
          </h2>
          <p className="text-sm text-[#52635D] mt-1">
            Community organizers can list gatherings on Discover so visitors can reserve spots ahead of time.
          </p>
        </div>

        <form onSubmit={handlePublishEvent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Event Title</label>
              <input
                type="text"
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                placeholder="e.g. Jaintia Handloom & Folk Night"
                className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Organizer / Collective</label>
              <input
                type="text"
                value={evtOrg}
                onChange={(e) => setEvtOrg(e.target.value)}
                placeholder="e.g. Jowai Artisans Guild"
                className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">District</label>
              <select
                value={evtDistrict}
                onChange={(e) => setEvtDistrict(e.target.value as District)}
                className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg bg-white"
              >
                <option value="East Khasi Hills">East Khasi Hills</option>
                <option value="West Jaintia Hills">West Jaintia Hills</option>
                <option value="West Garo Hills">West Garo Hills</option>
                <option value="Ri-Bhoi">Ri-Bhoi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Category</label>
              <select
                value={evtCategory}
                onChange={(e) => setEvtCategory(e.target.value as LocalEvent['category'])}
                className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg bg-white"
              >
                <option value="Cultural Festival">Cultural Festival</option>
                <option value="Music & Arts">Music &amp; Arts</option>
                <option value="Trail & Eco">Trail &amp; Eco</option>
                <option value="Village Market">Village Market</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Date</label>
              <input
                type="date"
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-[#D4DDD8] rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Venue</label>
              <input
                type="text"
                value={evtVenue}
                onChange={(e) => setEvtVenue(e.target.value)}
                placeholder="Town hall, ridge, or village ground"
                className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Ticket (₹, 0 = Free)</label>
              <input
                type="number"
                min={0}
                value={evtPrice}
                onChange={(e) => setEvtPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Capacity</label>
              <input
                type="number"
                min={10}
                value={evtCap}
                onChange={(e) => setEvtCap(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Event Description</label>
            <textarea
              rows={3}
              value={evtDesc}
              onChange={(e) => setEvtDesc(e.target.value)}
              placeholder="Share what visitors will experience—music, food, crafts, or guided trails..."
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg"
          >
            Publish Event to Discover
          </button>
        </form>
      </div>
    </div>
  );
}
