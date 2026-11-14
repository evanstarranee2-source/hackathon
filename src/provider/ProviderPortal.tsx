import { useState } from 'react';
import { CheckCircle2, Menu, X } from 'lucide-react';
import { DriversGuidesConsole } from './DriversGuidesConsole';
import { EventOrganizersConsole } from './EventOrganizersConsole';
import { HomestayHostsConsole } from './HomestayHostsConsole';
import {
  confirmStayInquiry,
  createHomestayListing,
  createLocalEvent,
  createProviderProfile,
  submitProviderOffer,
} from '../shared/api';
import type {
  District,
  Homestay,
  Hub,
  ImageKey,
  LocalEvent,
  MarketplaceSnapshot,
  ProviderProfile,
  ProviderRole,
} from '../types';

export type ProviderSection = 'drivers_guides' | 'homestay_hosts' | 'event_organizers';

interface ProviderPortalProps {
  data: MarketplaceSnapshot;
  onRefresh: () => Promise<void>;
}

const PROVIDER_NAV: { id: ProviderSection; label: string }[] = [
  { id: 'drivers_guides', label: 'Drivers & Guides' },
  { id: 'homestay_hosts', label: 'Homestay Hosts' },
  { id: 'event_organizers', label: 'Event Organizers' },
];

export function ProviderPortal({
  data,
  onRefresh,
}: ProviderPortalProps) {
  const [section, setSection] = useState<ProviderSection>('drivers_guides');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleNavigate(next: ProviderSection) {
    setSection(next);
    setMobileMenuOpen(false);
    setFeedback(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmitOffer(
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
  ) {
    await submitProviderOffer(requestId, payload);
    await onRefresh();
  }

  async function handleCreateProvider(payload: {
    name: string;
    role: ProviderRole;
    baseHub: Hub;
    vehicle: string | null;
    languages: string[];
    specialties: string[];
    yearsExperience: number;
    dailyRateEstimateInr: number;
    bio: string;
  }): Promise<ProviderProfile> {
    const created = await createProviderProfile(payload);
    await onRefresh();
    return created;
  }

  async function handleCreateHomestay(payload: {
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
  }): Promise<Homestay> {
    const created = await createHomestayListing(payload);
    await onRefresh();
    return created;
  }

  async function handleConfirmInquiry(inquiryId: string) {
    await confirmStayInquiry(inquiryId);
    await onRefresh();
    setFeedback('Stay inquiry confirmed.');
  }

  async function handleCreateEvent(payload: {
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
  }): Promise<LocalEvent> {
    const created = await createLocalEvent(payload);
    await onRefresh();
    return created;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-[#131D19]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E2E8E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => handleNavigate('drivers_guides')}
            className="font-display text-xl font-bold tracking-tight text-[#131D19] whitespace-nowrap shrink-0 text-left"
          >
            MeghaGuide Partner
          </button>

          <nav className="hidden md:flex items-center gap-7" aria-label="Provider Navigation">
            {PROVIDER_NAV.map((item) => {
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
              onClick={() => void onRefresh()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Refresh Requests
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 text-[#52635D] hover:text-[#131D19] rounded-lg"
              aria-label="Toggle provider navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[#E2E8E5] bg-white px-4 py-3 flex flex-col gap-1">
            {PROVIDER_NAV.map((item) => (
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="border-b border-[#E2E8E5] pb-5">
          <p className="text-xs font-medium text-[#52635D]">Local Provider Website</p>
          <h1 className="font-display text-3xl font-semibold text-[#131D19] mt-1">
            {section === 'drivers_guides'
              ? 'Drivers & Guides Dispatch'
              : section === 'homestay_hosts'
                ? 'Homestay Host Desk'
                : 'Event Organizer Desk'}
          </h1>
          <p className="text-sm text-[#52635D] mt-1">
            Respond directly to tourist trip requests, manage homestay inquiries, or publish community events across Meghalaya.
          </p>
        </div>

        {feedback && (
          <div className="flex items-center justify-between gap-4 p-4 bg-[#EDF5F1] border border-[#C6DED2] rounded-xl text-sm text-[#14533C]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs font-semibold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#991B1B]">
            {error}
          </div>
        )}

        {section === 'drivers_guides' && (
          <DriversGuidesConsole
            providers={data.providers}
            requests={data.requests}
            offers={data.offers}
            onSubmitOffer={handleSubmitOffer}
            onCreateProvider={handleCreateProvider}
            onNotify={(msg) => setFeedback(msg || null)}
            onError={(msg) => setError(msg || null)}
          />
        )}

        {section === 'homestay_hosts' && (
          <HomestayHostsConsole
            homestays={data.homestays}
            inquiries={data.inquiries}
            onCreateHomestay={handleCreateHomestay}
            onConfirmInquiry={handleConfirmInquiry}
            onNotify={(msg) => setFeedback(msg || null)}
            onError={(msg) => setError(msg || null)}
          />
        )}

        {section === 'event_organizers' && (
          <EventOrganizersConsole
            events={data.events}
            onCreateEvent={handleCreateEvent}
            onNotify={(msg) => setFeedback(msg || null)}
            onError={(msg) => setError(msg || null)}
          />
        )}
      </main>

      <footer className="border-t border-[#E2E8E5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#52635D]">
          <div className="space-y-1">
            <div className="font-display text-base font-semibold text-[#131D19]">MeghaGuide Partner</div>
            <div>Provider website for Meghalaya drivers, guides, homestay hosts, and event organizers.</div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {PROVIDER_NAV.map((item) => (
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
    </div>
  );
}
