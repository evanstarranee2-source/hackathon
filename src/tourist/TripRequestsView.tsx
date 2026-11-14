import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, CheckCircle2, Clock, Plus, Star } from 'lucide-react';
import type { ProviderOffer, RequestType, TripRequest } from '../types';

interface TripRequestsViewProps {
  requests: TripRequest[];
  offers: ProviderOffer[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onOpenRequestModal: (destination?: string, requestType?: RequestType) => void;
  onAcceptOffer: (requestId: string, offerId: string) => Promise<void>;
  onSwitchToProviderHub: () => void;
}

type SortKey = 'price_asc' | 'rating_desc' | 'trips_desc';

export function TripRequestsView({
  requests,
  offers,
  selectedRequestId,
  onSelectRequest,
  onOpenRequestModal,
  onAcceptOffer,
  onSwitchToProviderHub,
}: TripRequestsViewProps) {
  const [sortBy, setSortBy] = useState<SortKey>('price_asc');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRequestId && requests.length > 0) {
      onSelectRequest(requests[0].id);
    }
  }, [requests, selectedRequestId, onSelectRequest]);

  const activeRequest = useMemo(() => {
    return requests.find((r) => r.id === selectedRequestId) || requests[0] || null;
  }, [requests, selectedRequestId]);

  const requestOffers = useMemo(() => {
    if (!activeRequest) return [];
    const list = offers.filter((o) => o.requestId === activeRequest.id);
    return [...list].sort((a, b) => {
      if (a.status === 'Selected') return -1;
      if (b.status === 'Selected') return 1;
      if (sortBy === 'price_asc') return a.quotedPriceInr - b.quotedPriceInr;
      if (sortBy === 'rating_desc') return b.providerRating - a.providerRating;
      return b.providerTrips - a.providerTrips;
    });
  }, [offers, activeRequest, sortBy]);

  async function handleAccept(requestId: string, offerId: string) {
    setActionError(null);
    setAcceptingId(offerId);
    try {
      await onAcceptOffer(requestId, offerId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to select offer.');
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8E5] pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#131D19]">
            Trip Requests &amp; Offer Comparison
          </h1>
          <p className="text-sm text-[#52635D] mt-1">
            Post what you need, compare competing quotes from local drivers and guides, and choose the best fit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenRequestModal('', 'Ride & Guide')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post New Trip Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="border border-[#E2E8E5] bg-white rounded-xl p-12 text-center space-y-4">
          <p className="text-sm text-[#52635D]">No trip requests have been posted yet.</p>
          <button
            type="button"
            onClick={() => onOpenRequestModal('', 'Ride & Guide')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg"
          >
            Create First Trip Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Request List Sidebar */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-[#52635D] px-1">
              Active Tourist Requests ({requests.length})
            </div>
            <div className="space-y-2.5">
              {requests.map((req) => {
                const count = offers.filter((o) => o.requestId === req.id).length;
                const isSelected = activeRequest?.id === req.id;
                return (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => onSelectRequest(req.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-white border-[#14533C] ring-1 ring-[#14533C]'
                        : 'bg-white border-[#E2E8E5] hover:border-[#BCC9C3]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#52635D]">
                        {req.requestType} · {req.durationDays}d · {req.groupSize} pax
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          req.status === 'Accepted' ? 'text-[#14533C]' : 'text-[#B45309]'
                        }`}
                      >
                        {req.status === 'Accepted' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {req.status}
                      </span>
                    </div>

                    <div className="font-display text-base font-semibold text-[#131D19] mt-1.5 leading-snug">
                      {req.origin} → {req.destination}
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E2E8E5] flex items-center justify-between text-xs text-[#52635D]">
                      <span>By {req.touristName}</span>
                      <span className="font-mono tabular-nums font-medium text-[#131D19]">
                        {count} {count === 1 ? 'offer' : 'offers'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Selected Request & Offer Comparison Panel */}
          {activeRequest && (
            <section className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-[#52635D]">
                      {activeRequest.requestType} · Travel Date:{' '}
                      <span className="font-mono tabular-nums text-[#131D19]">
                        {activeRequest.travelDate}
                      </span>{' '}
                      · Posted by {activeRequest.touristName}
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-[#131D19]">
                      {activeRequest.origin} → {activeRequest.destination}
                    </h2>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs text-[#52635D]">Target Budget</div>
                    <div className="text-lg font-semibold text-[#131D19]">
                      ₹{activeRequest.budgetMaxInr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {activeRequest.notes && (
                  <p className="text-sm text-[#465650] leading-relaxed">{activeRequest.notes}</p>
                )}

                <div className="pt-3 border-t border-[#E2E8E5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#52635D]">
                  <span className="font-mono tabular-nums">
                    Duration: {activeRequest.durationDays} day(s) · Group: {activeRequest.groupSize} travelers
                  </span>
                  {activeRequest.status === 'Open' && (
                    <button
                      type="button"
                      onClick={onSwitchToProviderHub}
                      className="font-semibold text-[#14533C] hover:underline"
                    >
                      Are you a local driver/guide? Quote this trip in Provider Hub →
                    </button>
                  )}
                </div>
              </div>

              {actionError && (
                <div className="p-3 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                  {actionError}
                </div>
              )}

              {/* Offer Comparison Section */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-[#131D19]">
                    Compare Local Offers ({requestOffers.length})
                  </h3>

                  <div className="flex items-center gap-2 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#52635D]" />
                    <label htmlFor="offer-sort" className="text-[#52635D]">
                      Sort by:
                    </label>
                    <select
                      id="offer-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortKey)}
                      className="px-2.5 py-1.5 bg-white border border-[#D4DDD8] rounded-lg font-medium text-[#131D19] focus:outline-none focus:border-[#14533C]"
                    >
                      <option value="price_asc">Lowest Price</option>
                      <option value="rating_desc">Highest Rating</option>
                      <option value="trips_desc">Most Completed Trips</option>
                    </select>
                  </div>
                </div>

                {requestOffers.length === 0 ? (
                  <div className="bg-white border border-[#E2E8E5] rounded-xl p-8 text-center space-y-3">
                    <p className="text-sm text-[#52635D]">
                      Waiting for local drivers and guides to respond to this trip request.
                    </p>
                    <button
                      type="button"
                      onClick={onSwitchToProviderHub}
                      className="px-4 py-2 text-xs font-semibold text-[#14533C] border border-[#14533C]/30 rounded-lg hover:bg-[#14533C]/5"
                    >
                      Submit an Offer as a Local Provider
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Side-by-Side Comparison Matrix */}
                    <div className="bg-white border border-[#E2E8E5] rounded-xl overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E2E8E5] bg-[#FAFCFB] text-[#52635D]">
                            <th className="py-3 px-4 font-semibold">Provider</th>
                            <th className="py-3 px-4 font-semibold">Role &amp; Vehicle / Gear</th>
                            <th className="py-3 px-4 font-semibold">Fuel &amp; Permits</th>
                            <th className="py-3 px-4 font-semibold">Pickup</th>
                            <th className="py-3 px-4 font-semibold text-right">Rating</th>
                            <th className="py-3 px-4 font-semibold text-right">Quote</th>
                            <th className="py-3 px-4 font-semibold text-right">Decision</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8E5]">
                          {requestOffers.map((offer) => {
                            const withinBudget = offer.quotedPriceInr <= activeRequest.budgetMaxInr;
                            const isChosen = offer.status === 'Selected';
                            const isDeclined = offer.status === 'Declined';

                            return (
                              <tr
                                key={offer.id}
                                className={isChosen ? 'bg-[#EDF5F1]/60' : 'hover:bg-[#FAFCFB]'}
                              >
                                <td className="py-3.5 px-4 font-semibold text-[#131D19] whitespace-nowrap">
                                  {offer.providerName}
                                </td>
                                <td className="py-3.5 px-4 text-[#465650]">
                                  <div>{offer.providerRole}</div>
                                  <div className="text-[#52635D]">{offer.vehicleOrGear}</div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap text-[#465650]">
                                  {offer.includesFuelOrPermits ? 'Included' : 'Not included'}
                                </td>
                                <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap text-[#465650]">
                                  {offer.estimatedPickupTime}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#131D19]">
                                    <Star className="w-3 h-3 fill-[#B45309] text-[#B45309]" />
                                    {offer.providerRating.toFixed(1)}
                                  </span>
                                  <span className="text-[#52635D] ml-1">({offer.providerTrips})</span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                                  <div className="font-semibold text-sm text-[#131D19]">
                                    ₹{offer.quotedPriceInr.toLocaleString('en-IN')}
                                  </div>
                                  <div className={withinBudget ? 'text-[#14533C]' : 'text-[#B45309]'}>
                                    {withinBudget ? 'Within budget' : 'Above target'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  {isChosen ? (
                                    <span className="inline-flex items-center gap-1 font-semibold text-[#14533C]">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Chosen
                                    </span>
                                  ) : isDeclined || activeRequest.status !== 'Open' ? (
                                    <span className="text-[#6B7C75]">Closed</span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={acceptingId === offer.id}
                                      onClick={() => handleAccept(activeRequest.id, offer.id)}
                                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-md transition-colors disabled:opacity-60"
                                    >
                                      {acceptingId === offer.id ? 'Selecting...' : 'Choose Offer'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Detailed Provider Notes & Included Stops */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requestOffers.map((offer) => {
                        const isChosen = offer.status === 'Selected';
                        return (
                          <article
                            key={offer.id}
                            className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                              isChosen
                                ? 'bg-[#EDF5F1]/50 border-[#14533C]'
                                : 'bg-white border-[#E2E8E5]'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-[#52635D]">
                                  {offer.providerRole} · {offer.languages.join(', ')}
                                </span>
                                <span className="font-mono text-sm font-semibold text-[#131D19] tabular-nums">
                                  ₹{offer.quotedPriceInr.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <h4 className="font-display text-lg font-semibold text-[#131D19]">
                                {offer.providerName}
                              </h4>
                              <p className="text-sm text-[#465650] leading-relaxed">{offer.message}</p>
                              {offer.includedStops.length > 0 && (
                                <div className="pt-2 border-t border-[#E2E8E5] text-xs text-[#465650]">
                                  <span className="font-semibold text-[#131D19]">Included stops:</span>{' '}
                                  {offer.includedStops.join(' → ')}
                                </div>
                              )}
                            </div>

                            {isChosen ? (
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14533C]">
                                <CheckCircle2 className="w-4 h-4" />
                                Confirmed for this trip
                              </div>
                            ) : activeRequest.status === 'Open' ? (
                              <button
                                type="button"
                                disabled={acceptingId === offer.id}
                                onClick={() => handleAccept(activeRequest.id, offer.id)}
                                className="w-full py-2 text-xs font-semibold text-[#14533C] border border-[#14533C] hover:bg-[#14533C] hover:text-white rounded-lg transition-colors"
                              >
                                {acceptingId === offer.id ? 'Confirming...' : `Choose ${offer.providerName}`}
                              </button>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
