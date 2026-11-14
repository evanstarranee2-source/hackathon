import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { DiscoverView } from './DiscoverView';
import { ProvidersDirectoryView } from './ProvidersDirectoryView';
import { RequestTripModal } from './RequestTripModal';
import { StaysView } from './StaysView';
import { TripRequestsView } from './TripRequestsView';
import {
  acceptProviderOffer,
  rsvpToEvent,
  submitStayInquiry,
} from '../shared/api';
import type {
  MarketplaceSnapshot,
  RequestType,
  StayInquiry,
  TripRequest,
} from '../types';

export type TouristSection = 'discover' | 'stays' | 'providers' | 'requests';

interface TouristPortalProps {
  data: MarketplaceSnapshot;
  section: TouristSection;
  onChangeSection: (section: TouristSection) => void;
  selectedRequestId: string | null;
  onSelectRequest: (id: string | null) => void;
  onRefresh: () => Promise<void>;
}

const TOURIST_NAV: { id: TouristSection; label: string }[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'stays', label: 'Stays' },
  { id: 'providers', label: 'Drivers & Guides' },
  { id: 'requests', label: 'Trip Requests' },
];

export function TouristPortal({
  data,
  section,
  onChangeSection,
  selectedRequestId,
  onSelectRequest,
  onRefresh,
}: TouristPortalProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<string[]>([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState<{
    destination: string;
    requestType: RequestType;
    origin: string;
  }>({
    destination: '',
    requestType: 'Ride & Guide',
    origin: 'Shillong (Police Bazar)',
  });

  function openRequestModal(
    destination = '',
    requestType: RequestType = 'Ride & Guide',
    origin = 'Shillong (Police Bazar)'
  ) {
    setModalPrefill({ destination, requestType, origin });
    setRequestModalOpen(true);
  }

  function handleNavigate(next: TouristSection) {
    onChangeSection(next);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleRsvpEvent(eventId: string) {
    await rsvpToEvent(eventId);
    setRsvpedEventIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
    await onRefresh();
  }

  async function handleStayInquiry(
    homestayId: string,
    payload: {
      guestName: string;
      guestContact: string;
      checkInDate: string;
      nights: number;
      guests: number;
      note: string;
    }
  ): Promise<StayInquiry> {
    const created = await submitStayInquiry(homestayId, payload);
    await onRefresh();
    return created;
  }

  async function handleAcceptOffer(requestId: string, offerId: string) {
    await acceptProviderOffer(requestId, offerId);
    await onRefresh();
  }

  function handleTripCreated(created: TripRequest) {
    void onRefresh();
    onSelectRequest(created.id);
    onChangeSection('requests');
  }

  const openRequestCount = data.requests.filter((r) => r.status === 'Open').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-[#131D19]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E2E8E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => handleNavigate('discover')}
            className="font-display text-xl font-bold tracking-tight text-[#131D19] whitespace-nowrap shrink-0 text-left"
          >
            MeghaGuide
          </button>

          <nav className="hidden md:flex items-center gap-7" aria-label="Tourist Navigation">
            {TOURIST_NAV.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    active
                      ? 'text-[#14533C] border-[#14533C]'
                      : 'text-[#52635D] border-transparent hover:text-[#131D19]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openRequestModal('', 'Ride & Guide')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Request Trip
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 text-[#52635D] hover:text-[#131D19] rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[#E2E8E5] bg-white px-4 py-3 flex flex-col gap-1">
            {TOURIST_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
                  section === item.id
                    ? 'bg-[#EDF5F1] text-[#14533C]'
                    : 'text-[#465650] hover:bg-[#F2F5F3]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {section === 'discover' && (
          <DiscoverView
            places={data.places}
            events={data.events}
            openRequestCount={openRequestCount}
            onOpenRequestModal={(dest, type) => openRequestModal(dest, type)}
            onGoToRequests={() => handleNavigate('requests')}
            onGoToStays={() => handleNavigate('stays')}
            onRsvpEvent={handleRsvpEvent}
            rsvpedEventIds={rsvpedEventIds}
          />
        )}

        {section === 'stays' && (
          <StaysView homestays={data.homestays} onSubmitInquiry={handleStayInquiry} />
        )}

        {section === 'providers' && (
          <ProvidersDirectoryView
            providers={data.providers}
            onInviteQuote={(dest, type, orig) => openRequestModal(dest, type, orig)}
          />
        )}

        {section === 'requests' && (
          <TripRequestsView
            requests={data.requests}
            offers={data.offers}
            selectedRequestId={selectedRequestId}
            onSelectRequest={(id) => onSelectRequest(id)}
            onOpenRequestModal={(dest, type) => openRequestModal(dest, type)}
            onAcceptOffer={handleAcceptOffer}
          />
        )}
      </main>

      <footer className="border-t border-[#E2E8E5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#52635D]">
          <div className="space-y-1">
            <div className="font-display text-base font-semibold text-[#131D19]">MeghaGuide</div>
            <div>Visitor website for places, events, homestays, and trip requests across Meghalaya.</div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {TOURIST_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className="hover:text-[#131D19] transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <RequestTripModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        initialDestination={modalPrefill.destination}
        initialRequestType={modalPrefill.requestType}
        initialOrigin={modalPrefill.origin}
        onCreated={handleTripCreated}
      />
    </div>
  );
}
