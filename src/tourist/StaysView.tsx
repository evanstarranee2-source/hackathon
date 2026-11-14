import React, { useMemo, useState } from 'react';
import { CheckCircle2, Star, Users, X } from 'lucide-react';
import { MediaImage } from '../shared/MediaImage';
import type { Homestay, Hub, StayInquiry } from '../types';

interface StaysViewProps {
  homestays: Homestay[];
  onSubmitInquiry: (
    homestayId: string,
    payload: {
      guestName: string;
      guestContact: string;
      checkInDate: string;
      nights: number;
      guests: number;
      note: string;
    }
  ) => Promise<StayInquiry>;
}

const HUBS: ('All' | Hub)[] = ['All', 'Shillong', 'Sohra', 'Dawki', 'Jowai', 'Tura'];

export function StaysView({ homestays, onSubmitInquiry }: StaysViewProps) {
  const [selectedHub, setSelectedHub] = useState<'All' | Hub>('All');
  const [maxRate, setMaxRate] = useState<number>(6000);
  const [activeStay, setActiveStay] = useState<Homestay | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-11-28');
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedStayName, setConfirmedStayName] = useState<string | null>(null);

  const filteredStays = useMemo(() => {
    return homestays.filter((stay) => {
      const matchesHub = selectedHub === 'All' || stay.hub === selectedHub;
      const matchesBudget = stay.pricePerNightInr <= maxRate;
      return matchesHub && matchesBudget;
    });
  }, [homestays, selectedHub, maxRate]);

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeStay) return;
    setError(null);
    if (!guestName.trim() || !checkInDate) {
      setError('Please enter your name and preferred check-in date.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitInquiry(activeStay.id, {
        guestName,
        guestContact,
        checkInDate,
        nights,
        guests,
        note,
      });
      setConfirmedStayName(activeStay.name);
      setActiveStay(null);
      setGuestName('');
      setGuestContact('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send stay inquiry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E2E8E5] pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#131D19]">
            Explore Local Homestays
          </h1>
          <p className="text-sm text-[#52635D] mt-1">
            Family-run cottages, stone lodges, and riverside decks hosted directly by Meghalaya residents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#EDF2EF] rounded-lg overflow-x-auto">
            {HUBS.map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedHub === hub
                    ? 'bg-white text-[#14533C] shadow-xs'
                    : 'text-[#52635D] hover:text-[#131D19]'
                }`}
              >
                {hub === 'All' ? 'All Hubs' : hub}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-[#3A4A44] font-medium">
            <span className="whitespace-nowrap">Max nightly:</span>
            <span className="font-mono tabular-nums font-semibold text-[#131D19]">₹{maxRate}</span>
            <input
              type="range"
              min={1500}
              max={6000}
              step={200}
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-24 accent-[#14533C]"
            />
          </label>
        </div>
      </div>

      {confirmedStayName && (
        <div className="flex items-center justify-between gap-4 p-4 bg-[#EDF5F1] border border-[#C6DED2] rounded-xl text-sm text-[#14533C]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Inquiry sent to the host of <strong>{confirmedStayName}</strong>. They will review your dates and confirm shortly.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmedStayName(null)}
            className="text-xs font-semibold hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {filteredStays.length === 0 ? (
        <div className="border border-[#E2E8E5] bg-white rounded-xl p-10 text-center space-y-3">
          <p className="text-sm text-[#52635D]">No homestays match the selected hub or nightly budget.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedHub('All');
              setMaxRate(6000);
            }}
            className="px-4 py-2 text-xs font-semibold text-[#14533C] border border-[#14533C]/30 rounded-lg hover:bg-[#14533C]/5"
          >
            Show All Homestays
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStays.map((stay) => (
            <article
              key={stay.id}
              className="bg-white border border-[#E2E8E5] rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] overflow-hidden bg-[#E7EEEA]">
                  <MediaImage
                    imageKey={stay.imageKey}
                    alt={stay.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#52635D]">
                    <span className="truncate">
                      {stay.village} · {stay.hub}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[#131D19] shrink-0">
                      <Star className="w-3.5 h-3.5 fill-[#B45309] text-[#B45309]" />
                      {stay.rating.toFixed(1)} ({stay.reviewCount})
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#131D19] leading-snug">
                      {stay.name}
                    </h2>
                    <p className="text-xs text-[#52635D] mt-0.5">Hosted by {stay.hostName}</p>
                  </div>

                  <p className="text-sm text-[#465650] leading-relaxed">{stay.description}</p>

                  <div className="pt-2 border-t border-[#E2E8E5] space-y-1.5 text-xs text-[#465650]">
                    <div>
                      <span className="font-semibold text-[#131D19]">Meals:</span> {stay.mealsIncluded}
                    </div>
                    <div className="text-[#52635D]">{stay.amenities.join(' · ')}</div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-[#E2E8E5] flex items-center justify-between gap-3 bg-[#FAFCFB]">
                <div>
                  <div className="font-mono text-base font-semibold text-[#131D19] tabular-nums">
                    ₹{stay.pricePerNightInr.toLocaleString('en-IN')}
                    <span className="text-xs font-sans font-normal text-[#52635D]"> / night</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#52635D] font-mono tabular-nums">
                    <Users className="w-3 h-3" />
                    Up to {stay.maxGuests} guests · {stay.roomsAvailable} rooms
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStay(stay);
                    setGuests(Math.min(2, stay.maxGuests));
                    setError(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Request Stay
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Stay Inquiry Modal */}
      {activeStay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stay-inquiry-title"
        >
          <div className="w-full max-w-lg bg-white border border-[#E2E8E5] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E5]">
              <div>
                <h2 id="stay-inquiry-title" className="font-display text-lg font-semibold text-[#131D19]">
                  Request Stay at {activeStay.name}
                </h2>
                <p className="text-xs text-[#52635D] mt-0.5">
                  Host: {activeStay.hostName} · ₹{activeStay.pricePerNightInr.toLocaleString('en-IN')}/night
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveStay(null)}
                aria-label="Close stay inquiry modal"
                className="p-2 text-[#52635D] hover:text-[#131D19] rounded-lg hover:bg-[#F2F5F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stay-guest" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                    Guest Name
                  </label>
                  <input
                    id="stay-guest"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stay-contact" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                    Phone or Email
                  </label>
                  <input
                    id="stay-contact"
                    type="text"
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    placeholder="Contact for host reply"
                    className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="stay-checkin" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                    Check-in
                  </label>
                  <input
                    id="stay-checkin"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stay-nights" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                    Nights
                  </label>
                  <input
                    id="stay-nights"
                    type="number"
                    min={1}
                    max={30}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                  />
                </div>
                <div>
                  <label htmlFor="stay-guests" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                    Guests
                  </label>
                  <input
                    id="stay-guests"
                    type="number"
                    min={1}
                    max={activeStay.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stay-note" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                  Message for {activeStay.hostName}
                </label>
                <textarea
                  id="stay-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Arrival timing, meal preference, or parking request..."
                  className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                />
              </div>

              <div className="p-3 bg-[#FAFCFB] border border-[#E2E8E5] rounded-lg flex items-center justify-between text-xs">
                <span className="text-[#52635D]">Estimated total ({nights} nights)</span>
                <span className="font-mono font-semibold text-sm text-[#131D19] tabular-nums">
                  ₹{(activeStay.pricePerNightInr * nights).toLocaleString('en-IN')}
                </span>
              </div>

              {error && (
                <div className="p-3 text-xs text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStay(null)}
                  className="px-4 py-2 text-sm font-medium text-[#52635D] hover:text-[#131D19]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Stay Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
