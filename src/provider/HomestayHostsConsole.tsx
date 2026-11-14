import React, { useState } from 'react';
import type { District, Homestay, Hub, ImageKey, StayInquiry } from '../types';

interface HomestayHostsConsoleProps {
  homestays: Homestay[];
  inquiries: StayInquiry[];
  onCreateHomestay: (payload: {
    name: string;
    hostName: string;
    district: District;
    hub: Hub;
    village: string;
    pricePerNightInr: number;
    maxGuests: number;
    roomsAvailable: number;
    mealsIncluded: string;
    amenities: string[];
    description: string;
    imageKey: ImageKey;
  }) => Promise<Homestay>;
  onConfirmInquiry: (inquiryId: string) => Promise<void>;
  onNotify: (msg: string) => void;
  onError: (msg: string) => void;
}

export function HomestayHostsConsole({
  homestays,
  inquiries,
  onCreateHomestay,
  onConfirmInquiry,
  onNotify,
  onError,
}: HomestayHostsConsoleProps) {
  const [stayName, setStayName] = useState('');
  const [hostName, setHostName] = useState('');
  const [stayHub, setStayHub] = useState<Hub>('Sohra');
  const [stayDistrict, setStayDistrict] = useState<District>('East Khasi Hills');
  const [stayVillage, setStayVillage] = useState('');
  const [stayRate, setStayRate] = useState(2500);
  const [stayGuests, setStayGuests] = useState(4);
  const [stayMeals, setStayMeals] = useState('Khasi breakfast included');
  const [stayDesc, setStayDesc] = useState('');

  async function handlePublishStay(e: React.FormEvent) {
    e.preventDefault();
    onError('');
    try {
      const created = await onCreateHomestay({
        name: stayName,
        hostName,
        district: stayDistrict,
        hub: stayHub,
        village: stayVillage,
        pricePerNightInr: stayRate,
        maxGuests: stayGuests,
        roomsAvailable: 2,
        mealsIncluded: stayMeals,
        amenities: ['Home-cooked local meals', 'Hot water', 'Parking'],
        description: stayDesc || 'Family-run cottage welcoming Meghalaya travelers.',
        imageKey: 'khasi_cottage',
      });
      setStayName('');
      setHostName('');
      setStayVillage('');
      setStayDesc('');
      onNotify(`Published homestay "${created.name}" to the Tourist Stays directory.`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not publish homestay.');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 space-y-6">
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#131D19]">
            Guest Stay Inquiries ({inquiries.length})
          </h2>
          {inquiries.length === 0 ? (
            <div className="bg-white border border-[#E2E8E5] rounded-xl p-8 text-sm text-[#52635D]">
              No stay inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <article key={inq.id} className="bg-white border border-[#E2E8E5] rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#52635D]">
                        {inq.homestayName} · <span className="font-mono tabular-nums">{inq.checkInDate}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[#131D19] mt-0.5">
                        {inq.guestName} ({inq.guests} guests, {inq.nights} nights)
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        inq.status === 'Confirmed' ? 'text-[#14533C]' : 'text-[#B45309]'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  {inq.note && <p className="text-sm text-[#465650]">{inq.note}</p>}
                  <div className="pt-2 border-t border-[#E2E8E5] flex items-center justify-between text-xs text-[#52635D]">
                    <span>{inq.guestContact || 'Contact via MeghaGuide'}</span>
                    {inq.status === 'Requested' && (
                      <button
                        type="button"
                        onClick={() => onConfirmInquiry(inq.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg"
                      >
                        Confirm Stay
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2 border-t border-[#E2E8E5]">
          <h3 className="font-display text-lg font-semibold text-[#131D19]">
            Active Homestay Listings ({homestays.length})
          </h3>
          <div className="space-y-2">
            {homestays.map((stay) => (
              <div
                key={stay.id}
                className="bg-white border border-[#E2E8E5] rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-[#131D19]">{stay.name}</div>
                  <div className="text-[#52635D]">
                    {stay.hostName} · {stay.village} ({stay.hub})
                  </div>
                </div>
                <div className="font-mono tabular-nums font-semibold text-[#131D19] shrink-0">
                  ₹{stay.pricePerNightInr.toLocaleString('en-IN')}/night
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={handlePublishStay}
        className="lg:col-span-6 bg-white border border-[#E2E8E5] rounded-xl p-6 space-y-4"
      >
        <h2 className="font-display text-xl font-semibold text-[#131D19]">
          List a Local Homestay
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Homestay Name</label>
            <input
              type="text"
              value={stayName}
              onChange={(e) => setStayName(e.target.value)}
              placeholder="e.g. Nongbah Bamboo Loft"
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Host Name</label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="e.g. Kong Larisuk"
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">District</label>
            <select
              value={stayDistrict}
              onChange={(e) => setStayDistrict(e.target.value as District)}
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg bg-white"
            >
              <option value="East Khasi Hills">East Khasi Hills</option>
              <option value="West Jaintia Hills">West Jaintia Hills</option>
              <option value="West Garo Hills">West Garo Hills</option>
              <option value="Ri-Bhoi">Ri-Bhoi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Nearest Hub</label>
            <select
              value={stayHub}
              onChange={(e) => setStayHub(e.target.value as Hub)}
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg bg-white"
            >
              <option value="Shillong">Shillong</option>
              <option value="Sohra">Sohra</option>
              <option value="Dawki">Dawki</option>
              <option value="Jowai">Jowai</option>
              <option value="Tura">Tura</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Village / Locality</label>
            <input
              type="text"
              value={stayVillage}
              onChange={(e) => setStayVillage(e.target.value)}
              placeholder="e.g. Mawlynnong"
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Rate / Night (₹)</label>
            <input
              type="number"
              min={600}
              value={stayRate}
              onChange={(e) => setStayRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Max Guests</label>
            <input
              type="number"
              min={1}
              max={12}
              value={stayGuests}
              onChange={(e) => setStayGuests(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Meals Included</label>
            <input
              type="text"
              value={stayMeals}
              onChange={(e) => setStayMeals(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3A4A44] mb-1">Description</label>
          <textarea
            rows={3}
            value={stayDesc}
            onChange={(e) => setStayDesc(e.target.value)}
            placeholder="Describe the cottage views, garden, proximity to trails, and family hospitality..."
            className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg"
        >
          Publish Homestay Listing
        </button>
      </form>
    </div>
  );
}
