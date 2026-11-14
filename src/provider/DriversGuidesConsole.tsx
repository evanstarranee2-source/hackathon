import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type {
  Hub,
  ProviderOffer,
  ProviderProfile,
  ProviderRole,
  TripRequest,
} from '../types';

interface DriversGuidesConsoleProps {
  providers: ProviderProfile[];
  requests: TripRequest[];
  offers: ProviderOffer[];
  onSubmitOffer: (
    requestId: string,
    payload: {
      providerId: string;
      quotedPriceInr: number;
      includesFuelOrPermits: boolean;
      includedStops: string[];
      estimatedPickupTime: string;
      message: string;
      vehicleOrGear: string;
    }
  ) => Promise<void>;
  onCreateProvider: (payload: {
    name: string;
    role: ProviderRole;
    baseHub: Hub;
    vehicle: string | null;
    languages: string[];
    specialties: string[];
    yearsExperience: number;
    dailyRateEstimateInr: number;
    bio: string;
  }) => Promise<ProviderProfile>;
  onNotify: (msg: string) => void;
  onError: (msg: string) => void;
  onInspectRequestInTouristView: (requestId: string) => void;
}

export function DriversGuidesConsole({
  providers,
  requests,
  offers,
  onSubmitOffer,
  onCreateProvider,
  onNotify,
  onError,
  onInspectRequestInTouristView,
}: DriversGuidesConsoleProps) {
  const [activeProviderId, setActiveProviderId] = useState<string>(providers[0]?.id || '');
  const [quotingRequestId, setQuotingRequestId] = useState<string | null>(null);
  const [quotedPrice, setQuotedPrice] = useState(5200);
  const [pickupTime, setPickupTime] = useState('07:00 AM');
  const [includesFuel, setIncludesFuel] = useState(true);
  const [stopsText, setStopsText] = useState('Umiam Lake, Mawkdok Viewpoint, Nohkalikai Falls');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerBusy, setOfferBusy] = useState(false);

  const [showNewProviderForm, setShowNewProviderForm] = useState(false);
  const [provName, setProvName] = useState('');
  const [provRole, setProvRole] = useState<ProviderRole>('Driver & Guide');
  const [provHub, setProvHub] = useState<Hub>('Shillong');
  const [provVehicle, setProvVehicle] = useState('Toyota Innova (6-seater)');
  const [provRate, setProvRate] = useState(3500);
  const [provYears, setProvYears] = useState(5);
  const [provBio, setProvBio] = useState('');

  const openRequests = requests.filter((r) => r.status === 'Open');
  const activeProvider = providers.find((p) => p.id === activeProviderId) || providers[0];

  async function handleSendOffer(e: React.FormEvent, reqId: string) {
    e.preventDefault();
    if (!activeProvider) return;
    onError('');
    setOfferBusy(true);
    try {
      await onSubmitOffer(reqId, {
        providerId: activeProvider.id,
        quotedPriceInr: quotedPrice,
        includesFuelOrPermits: includesFuel,
        includedStops: stopsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        estimatedPickupTime: pickupTime,
        message: offerMessage || `Available with ${activeProvider.vehicle || 'full local guide support'}.`,
        vehicleOrGear: activeProvider.vehicle || 'Certified Trekking & Safety Gear',
      });
      setQuotingRequestId(null);
      setOfferMessage('');
      onNotify(`Offer submitted by ${activeProvider.name}. Tourists can now compare it in Trip Requests.`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to submit offer.');
    } finally {
      setOfferBusy(false);
    }
  }

  async function handleRegisterProvider(e: React.FormEvent) {
    e.preventDefault();
    onError('');
    try {
      const created = await onCreateProvider({
        name: provName,
        role: provRole,
        baseHub: provHub,
        vehicle: provRole === 'Guide' ? null : provVehicle,
        languages: ['Khasi', 'English', 'Hindi'],
        specialties: [`${provHub} scenic circuits`, 'Local homestay transfers'],
        yearsExperience: provYears,
        dailyRateEstimateInr: provRate,
        bio: provBio || `Local ${provRole.toLowerCase()} operating from ${provHub}.`,
      });
      setActiveProviderId(created.id);
      setShowNewProviderForm(false);
      setProvName('');
      setProvBio('');
      onNotify(`Registered ${created.name} as a local ${created.role}. You can now quote open requests.`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not create provider profile.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8E5] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="acting-provider" className="text-xs font-semibold text-[#3A4A44]">
            Acting as Provider:
          </label>
          <select
            id="acting-provider"
            value={activeProvider?.id || ''}
            onChange={(e) => setActiveProviderId(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role} · {p.baseHub})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowNewProviderForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#14533C] border border-[#14533C]/30 rounded-lg hover:bg-[#14533C]/5 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          {showNewProviderForm ? 'Close Registration' : 'Register New Driver / Guide'}
        </button>
      </div>

      {showNewProviderForm && (
        <form onSubmit={handleRegisterProvider} className="bg-white border border-[#E2E8E5] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#131D19]">
            Register Local Driver or Guide Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Full Name</label>
              <input
                type="text"
                value={provName}
                onChange={(e) => setProvName(e.target.value)}
                placeholder="e.g. Bah Wanbor Nongrum"
                className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Role</label>
              <select
                value={provRole}
                onChange={(e) => setProvRole(e.target.value as ProviderRole)}
                className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg bg-white"
              >
                <option value="Driver & Guide">Driver &amp; Guide</option>
                <option value="Driver">Driver</option>
                <option value="Guide">Guide</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Base Hub</label>
              <select
                value={provHub}
                onChange={(e) => setProvHub(e.target.value as Hub)}
                className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg bg-white"
              >
                <option value="Shillong">Shillong</option>
                <option value="Sohra">Sohra</option>
                <option value="Dawki">Dawki</option>
                <option value="Jowai">Jowai</option>
                <option value="Tura">Tura</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {provRole !== 'Guide' && (
              <div>
                <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Vehicle Model</label>
                <input
                  type="text"
                  value={provVehicle}
                  onChange={(e) => setProvVehicle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Daily Estimate (₹)</label>
              <input
                type="number"
                min={800}
                value={provRate}
                onChange={(e) => setProvRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Years Experience</label>
              <input
                type="number"
                min={1}
                value={provYears}
                onChange={(e) => setProvYears(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-1.5">Short Bio</label>
            <textarea
              rows={2}
              value={provBio}
              onChange={(e) => setProvBio(e.target.value)}
              placeholder="Routes you know best, trekking certifications, or vehicle comfort details..."
              className="w-full px-3.5 py-2 text-sm border border-[#D4DDD8] rounded-lg"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg"
            >
              Save Provider Profile
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-[#131D19]">
          Open Tourist Trip Requests ({openRequests.length})
        </h2>

        {openRequests.length === 0 ? (
          <div className="bg-white border border-[#E2E8E5] rounded-xl p-8 text-center text-sm text-[#52635D]">
            All current tourist trip requests have confirmed offers.
          </div>
        ) : (
          <div className="space-y-4">
            {openRequests.map((req) => {
              const existingOffer = offers.find(
                (o) => o.requestId === req.id && o.providerId === activeProvider?.id
              );
              const isQuoting = quotingRequestId === req.id;
              const totalOffers = offers.filter((o) => o.requestId === req.id).length;

              return (
                <article key={req.id} className="bg-white border border-[#E2E8E5] rounded-xl p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#52635D]">
                        {req.requestType} · {req.travelDate} · {req.durationDays}d · {req.groupSize} travelers · Tourist: {req.touristName}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#131D19] mt-1">
                        {req.origin} → {req.destination}
                      </h3>
                      {req.notes && <p className="text-sm text-[#465650] mt-2">{req.notes}</p>}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#52635D]">Tourist Budget</div>
                      <div className="font-mono text-base font-semibold text-[#131D19] tabular-nums">
                        ₹{req.budgetMaxInr.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => onInspectRequestInTouristView(req.id)}
                        className="text-xs font-semibold text-[#14533C] hover:underline mt-1"
                      >
                        View {totalOffers} {totalOffers === 1 ? 'offer' : 'offers'} →
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8E5] flex flex-wrap items-center justify-between gap-3">
                    {existingOffer ? (
                      <span className="text-xs font-medium text-[#14533C]">
                        You already submitted a quote of ₹{existingOffer.quotedPriceInr.toLocaleString('en-IN')} as {activeProvider?.name}.
                      </span>
                    ) : (
                      <span className="text-xs text-[#52635D]">
                        Quoting as <strong>{activeProvider?.name}</strong> ({activeProvider?.role})
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setQuotingRequestId(isQuoting ? null : req.id);
                        setQuotedPrice(Math.max(1200, Math.round(req.budgetMaxInr * 0.85)));
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg whitespace-nowrap"
                    >
                      {isQuoting ? 'Cancel Quote' : existingOffer ? 'Submit Another Quote' : 'Send Offer'}
                    </button>
                  </div>

                  {isQuoting && (
                    <form
                      onSubmit={(e) => handleSendOffer(e, req.id)}
                      className="pt-4 border-t border-[#E2E8E5] space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#3A4A44] mb-1">
                            Quoted Price (₹)
                          </label>
                          <input
                            type="number"
                            min={300}
                            step={100}
                            value={quotedPrice}
                            onChange={(e) => setQuotedPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#3A4A44] mb-1">
                            Pickup Time
                          </label>
                          <input
                            type="text"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono border border-[#D4DDD8] rounded-lg"
                            required
                          />
                        </div>
                        <div className="flex items-end pb-2">
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#131D19] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includesFuel}
                              onChange={(e) => setIncludesFuel(e.target.checked)}
                              className="w-4 h-4 accent-[#14533C]"
                            />
                            Fuel, tolls &amp; permits included
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3A4A44] mb-1">
                          Included Stops (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={stopsText}
                          onChange={(e) => setStopsText(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3A4A44] mb-1">
                          Message to {req.touristName}
                        </label>
                        <textarea
                          rows={2}
                          value={offerMessage}
                          onChange={(e) => setOfferMessage(e.target.value)}
                          placeholder="Explain your vehicle comfort, local route timing, or trail experience..."
                          className="w-full px-3 py-2 text-sm border border-[#D4DDD8] rounded-lg"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={offerBusy}
                          className="px-5 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg disabled:opacity-60"
                        >
                          {offerBusy ? 'Sending...' : 'Publish Offer to Tourist'}
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
