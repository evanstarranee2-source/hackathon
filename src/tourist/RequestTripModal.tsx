import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createTripRequest } from '../shared/api';
import type { RequestType, TripRequest } from '../types';

interface RequestTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
  initialRequestType?: RequestType;
  initialOrigin?: string;
  onCreated: (created: TripRequest) => void;
}

export function RequestTripModal({
  isOpen,
  onClose,
  initialDestination = '',
  initialRequestType = 'Ride & Guide',
  initialOrigin = 'Shillong (Police Bazar)',
  onCreated,
}: RequestTripModalProps) {
  const [touristName, setTouristName] = useState('');
  const [touristContact, setTouristContact] = useState('');
  const [requestType, setRequestType] = useState<RequestType>(initialRequestType);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [travelDate, setTravelDate] = useState('2026-11-26');
  const [durationDays, setDurationDays] = useState(2);
  const [groupSize, setGroupSize] = useState(2);
  const [budgetMaxInr, setBudgetMaxInr] = useState(7500);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDestination(initialDestination);
      setRequestType(initialRequestType);
      setOrigin(initialOrigin || 'Shillong (Police Bazar)');
      setError(null);
    }
  }, [isOpen, initialDestination, initialRequestType, initialOrigin]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!touristName.trim() || !origin.trim() || !destination.trim() || !travelDate) {
      setError('Please complete your name, pickup point, destination, and travel date.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createTripRequest({
        touristName,
        touristContact,
        requestType,
        origin,
        destination,
        travelDate,
        durationDays,
        groupSize,
        budgetMaxInr,
        notes,
      });
      setTouristName('');
      setTouristContact('');
      setNotes('');
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-trip-title"
    >
      <div className="w-full max-w-2xl bg-white border border-[#E2E8E5] rounded-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E5]">
          <div>
            <h2 id="request-trip-title" className="font-display text-xl font-semibold text-[#131D19]">
              Request a Ride or Local Guide
            </h2>
            <p className="text-sm text-[#52635D] mt-0.5">
              Local Meghalaya drivers and guides will send competing quotes you can compare side by side.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#52635D] hover:text-[#131D19] rounded-lg hover:bg-[#F2F5F3] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-2">
              Service Needed
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F2F5F3] rounded-lg">
              {(['Ride', 'Guide', 'Ride & Guide'] as RequestType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRequestType(type)}
                  className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    requestType === type
                      ? 'bg-white text-[#14533C] shadow-xs'
                      : 'text-[#52635D] hover:text-[#131D19]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-name" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Your Name
              </label>
              <input
                id="req-name"
                type="text"
                value={touristName}
                onChange={(e) => setTouristName(e.target.value)}
                placeholder="e.g. Kabir & Aditi"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                required
              />
            </div>
            <div>
              <label htmlFor="req-contact" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Email or Phone (for confirmed provider)
              </label>
              <input
                id="req-contact"
                type="text"
                value={touristContact}
                onChange={(e) => setTouristContact(e.target.value)}
                placeholder="e.g. kabir@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-origin" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Pickup Hub / Starting Point
              </label>
              <input
                id="req-origin"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Shillong, Guwahati Airport, Sohra..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                required
              />
            </div>
            <div>
              <label htmlFor="req-dest" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Destination / Circuit
              </label>
              <input
                id="req-dest"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Nongriat Root Bridge, Dawki, Krang Shuri..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="req-date" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Start Date
              </label>
              <input
                id="req-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-mono bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                required
              />
            </div>
            <div>
              <label htmlFor="req-days" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Days
              </label>
              <input
                id="req-days"
                type="number"
                min={1}
                max={21}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              />
            </div>
            <div>
              <label htmlFor="req-group" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Travelers
              </label>
              <input
                id="req-group"
                type="number"
                min={1}
                max={16}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              />
            </div>
            <div>
              <label htmlFor="req-budget" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Target Max (₹)
              </label>
              <input
                id="req-budget"
                type="number"
                min={500}
                step={100}
                value={budgetMaxInr}
                onChange={(e) => setBudgetMaxInr(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="req-notes" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
              Trip Notes (luggage, preferred pace, language, or stops)
            </label>
            <textarea
              id="req-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Early morning start preferred, hoping to stop at Mawkdok valley and a local Khasi lunch spot."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#52635D] hover:text-[#131D19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {submitting ? 'Publishing...' : 'Post Request for Offers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
