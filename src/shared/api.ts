import type {
  District,
  Homestay,
  Hub,
  ImageKey,
  LocalEvent,
  MarketplaceSnapshot,
  ProviderProfile,
  ProviderRole,
  StayInquiry,
} from '../types';

async function parseJsonOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || fallbackMessage);
  }
  return (await res.json()) as T;
}

export async function fetchMarketplaceSnapshot(): Promise<MarketplaceSnapshot> {
  const res = await fetch('/api/marketplace');
  return parseJsonOrThrow<MarketplaceSnapshot>(res, 'Failed to load MeghaGuide data.');
}

export async function rsvpToEvent(eventId: string): Promise<LocalEvent> {
  const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST' });
  return parseJsonOrThrow<LocalEvent>(res, 'Could not reserve event spot.');
}

export async function submitStayInquiry(
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
  const res = await fetch(`/api/homestays/${homestayId}/inquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<StayInquiry>(res, 'Could not send stay inquiry.');
}

export async function acceptProviderOffer(requestId: string, offerId: string): Promise<void> {
  const res = await fetch(`/api/requests/${requestId}/accept-offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId }),
  });
  await parseJsonOrThrow(res, 'Could not confirm offer.');
}

export async function submitProviderOffer(
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
): Promise<void> {
  const res = await fetch(`/api/requests/${requestId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseJsonOrThrow(res, 'Could not submit offer.');
}

export async function createProviderProfile(payload: {
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
  const res = await fetch('/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<ProviderProfile>(res, 'Could not register provider.');
}

export async function createHomestayListing(payload: {
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
  const res = await fetch('/api/homestays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<Homestay>(res, 'Could not publish homestay.');
}

export async function confirmStayInquiry(inquiryId: string): Promise<StayInquiry> {
  const res = await fetch(`/api/inquiries/${inquiryId}/confirm`, { method: 'POST' });
  return parseJsonOrThrow<StayInquiry>(res, 'Could not confirm stay inquiry.');
}

export async function createLocalEvent(payload: {
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
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<LocalEvent>(res, 'Could not publish event.');
}
