import React, { useState } from 'react';
import type {
  ProviderOffer,
  ProviderProfile,
  TripRequest,
} from '../types';

interface DriversGuidesConsoleProps {
  providers: ProviderProfile[];
  defaultProviderId?: string;
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
  onNotify: (msg: string) => void;
  onError: (msg: string) => void;
}

export function DriversGuidesConsole({
  providers,
  defaultProviderId,
  requests,
  offers,
  onSubmitOffer,
  onNotify,
  onError,
}: DriversGuidesConsoleProps) {
  const [quotingRequestId, setQuotingRequestId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    defaultProviderId || providers[0]?.id || ''
  );
  const [quotedPrice, setQuotedPrice] = useState(5200);
  const [pickupTime, setPickupTime] = useState('07:00 AM');
  const [includesFuel, setIncludesFuel] = useState(true);
  const [stopsText, setStopsText] = useState('Umiam Lake, Mawkdok Viewpoint, Nohkalikai Falls');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerBusy, setOfferBusy] = useState(false);

  const openRequests = requests.filter((r) => r.status === 'Open');
  const quoteProvider =
    providers.find((p) => p.id === (selectedProviderId || defaultProviderId)) || providers[0];

  async function handleSendOffer(e: React.FormEvent, reqId: string) {
    e.preventDefault();
    if (!quoteProvider) return;
    onError('');
    setOfferBusy(true);
    try {
      await onSubmitOffer(reqId, {
        providerId: quoteProvider.id,
        quotedPriceInr: quotedPrice,
        includesFuelOrPermits: includesFuel,
        includedStops: stopsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        estimatedPickupTime: pickupTime,
        message: offerMessage || `Available with ${quoteProvider.vehicle || 'full local guide support'}.`,
        vehicleOrGear: quoteProvider.vehicle || 'Certified Trekking & Safety Gear',
      });
      setQuotingRequestId(null);
      setOfferMessage('');
      onNotify(`Offer submitted by ${quoteProvider.name}. Tourists can now compare it in Trip Requests.`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to submit offer.');
    } finally {
      setOfferBusy(false);
    }
  }

  return (
    <div className="space-y-6">
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
                      <div className="text-xs font-mono tabular-nums text-[#52635D] mt-1">
                        {totalOffers} {totalOffers === 1 ? 'offer' : 'offers'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8E5] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#52635D]">
                      {totalOffers > 0
                        ? `${totalOffers} ${totalOffers === 1 ? 'quote' : 'quotes'} received from local providers`
                        : 'Open for driver & guide quotes'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isQuoting && defaultProviderId) {
                          setSelectedProviderId(defaultProviderId);
                        }
                        setQuotingRequestId(isQuoting ? null : req.id);
                        setQuotedPrice(Math.max(1200, Math.round(req.budgetMaxInr * 0.85)));
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg whitespace-nowrap"
                    >
                      {isQuoting ? 'Cancel Quote' : 'Send Offer'}
                    </button>
                  </div>

                  {isQuoting && (
                    <form
                      onSubmit={(e) => handleSendOffer(e, req.id)}
                      className="pt-4 border-t border-[#E2E8E5] space-y-4"
                    >
                      <div>
                        <label
                          htmlFor={`offer-provider-${req.id}`}
                          className="block text-xs font-semibold text-[#3A4A44] mb-1"
                        >
                          Provider Profile
                        </label>
                        <select
                          id={`offer-provider-${req.id}`}
                          value={quoteProvider?.id || ''}
                          onChange={(e) => setSelectedProviderId(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                          required
                        >
                          {providers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.role} · {p.baseHub})
                            </option>
                          ))}
                        </select>
                      </div>

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
