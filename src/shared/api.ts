import type {
  District,
  Homestay,
  Hub,
  ImageKey,
  LocalEvent,
  MarketplaceSnapshot,
  ProviderOffer,
  ProviderProfile,
  ProviderRole,
  RequestType,
  StayInquiry,
  TripRequest,
} from '../types';
import { createInitialStore } from './seedData';

const LOCAL_STORAGE_KEY = 'meghaguide_marketplace_v1';

function makeLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getLocalStore(): MarketplaceSnapshot {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as MarketplaceSnapshot;
    }
  } catch {
    // ignore storage read error and initialize fresh
  }
  const initial = createInitialStore();
  saveLocalStore(initial);
  return initial;
}

function saveLocalStore(store: MarketplaceSnapshot): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage quota errors
  }
}

async function tryApi<T>(
  url: string,
  init: RequestInit | undefined,
  fallbackFn: () => T
): Promise<T> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    if (res.status >= 400 && res.status < 500 && contentType.includes('application/json')) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || 'Request failed.');
    }
  } catch (err) {
    if (err instanceof Error && err.message !== 'Failed to fetch' && !err.message.includes('NetworkError')) {
      throw err;
    }
  }
  return fallbackFn();
}

export async function fetchMarketplaceSnapshot(): Promise<MarketplaceSnapshot> {
  return tryApi<MarketplaceSnapshot>('/api/marketplace', undefined, () => getLocalStore());
}

export async function createTripRequest(payload: {
  touristName: string;
  touristContact: string;
  requestType: RequestType;
  origin: string;
  destination: string;
  travelDate: string;
  durationDays: number;
  groupSize: number;
  budgetMaxInr: number;
  notes: string;
}): Promise<TripRequest> {
  return tryApi<TripRequest>(
    '/api/requests',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => {
      const store = getLocalStore();
      const created: TripRequest = {
        id: makeLocalId('req'),
        touristName: payload.touristName.trim(),
        touristContact: payload.touristContact.trim(),
        requestType: payload.requestType,
        origin: payload.origin.trim(),
        destination: payload.destination.trim(),
        travelDate: payload.travelDate,
        durationDays: Math.max(1, Number(payload.durationDays) || 1),
        groupSize: Math.max(1, Number(payload.groupSize) || 2),
        budgetMaxInr: Math.max(500, Number(payload.budgetMaxInr) || 5000),
        notes: payload.notes.trim(),
        status: 'Open',
        acceptedOfferId: null,
        createdAt: new Date().toISOString(),
      };
      store.requests.unshift(created);
      saveLocalStore(store);
      return created;
    }
  );
}

export async function rsvpToEvent(eventId: string): Promise<LocalEvent> {
  return tryApi<LocalEvent>(`/api/events/${eventId}/rsvp`, { method: 'POST' }, () => {
    const store = getLocalStore();
    const event = store.events.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found.');
    if (event.attendeesCount >= event.capacity) throw new Error('This event has reached capacity.');
    event.attendeesCount += 1;
    saveLocalStore(store);
    return event;
  });
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
  return tryApi<StayInquiry>(
    `/api/homestays/${homestayId}/inquire`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => {
      const store = getLocalStore();
      const homestay = store.homestays.find((h) => h.id === homestayId);
      if (!homestay) throw new Error('Homestay not found.');
      const created: StayInquiry = {
        id: makeLocalId('inq'),
        homestayId: homestay.id,
        homestayName: homestay.name,
        guestName: payload.guestName.trim(),
        guestContact: payload.guestContact.trim(),
        checkInDate: payload.checkInDate,
        nights: Math.max(1, Number(payload.nights) || 2),
        guests: Math.max(1, Number(payload.guests) || 2),
        note: payload.note.trim(),
        status: 'Requested',
        createdAt: new Date().toISOString(),
      };
      store.inquiries.unshift(created);
      saveLocalStore(store);
      return created;
    }
  );
}

export async function acceptProviderOffer(requestId: string, offerId: string): Promise<void> {
  await tryApi(
    `/api/requests/${requestId}/accept-offer`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId }),
    },
    () => {
      const store = getLocalStore();
      const targetRequest = store.requests.find((r) => r.id === requestId);
      if (!targetRequest) throw new Error('Trip request not found.');
      const targetOffer = store.offers.find((o) => o.id === offerId && o.requestId === requestId);
      if (!targetOffer) throw new Error('Offer not found.');
      targetRequest.status = 'Accepted';
      targetRequest.acceptedOfferId = targetOffer.id;
      store.offers = store.offers.map((offer) =>
        offer.requestId === requestId
          ? { ...offer, status: offer.id === targetOffer.id ? 'Selected' : 'Declined' }
          : offer
      );
      saveLocalStore(store);
      return { ok: true };
    }
  );
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
  await tryApi(
    `/api/requests/${requestId}/offers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => {
      const store = getLocalStore();
      const targetRequest = store.requests.find((r) => r.id === requestId);
      if (!targetRequest) throw new Error('Trip request not found.');
      const provider = store.providers.find((p) => p.id === payload.providerId);
      if (!provider) throw new Error('Provider not found.');
      const created: ProviderOffer = {
        id: makeLocalId('offer'),
        requestId,
        providerId: provider.id,
        providerName: provider.name,
        providerRole: provider.role,
        providerRating: provider.rating,
        providerTrips: provider.completedTrips,
        vehicleOrGear: payload.vehicleOrGear,
        languages: provider.languages,
        quotedPriceInr: Math.round(payload.quotedPriceInr),
        includesFuelOrPermits: payload.includesFuelOrPermits,
        includedStops: payload.includedStops,
        message: payload.message,
        estimatedPickupTime: payload.estimatedPickupTime,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      store.offers.unshift(created);
      saveLocalStore(store);
      return created;
    }
  );
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
  return tryApi<ProviderProfile>(
    '/api/providers',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => {
      const store = getLocalStore();
      const created: ProviderProfile = {
        id: makeLocalId('prov'),
        name: payload.name.trim(),
        role: payload.role,
        baseHub: payload.baseHub,
        languages: payload.languages,
        vehicle: payload.vehicle,
        specialties: payload.specialties,
        yearsExperience: payload.yearsExperience,
        rating: 4.9,
        completedTrips: 12,
        dailyRateEstimateInr: payload.dailyRateEstimateInr,
        verifiedLocal: true,
        bio: payload.bio,
      };
      store.providers.unshift(created);
      saveLocalStore(store);
      return created;
    }
  );
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
  return tryApi<Homestay>(
    '/api/homestays',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => {
      const store = getLocalStore();
      const created: Homestay = {
        id: makeLocalId('stay'),
        name: payload.name.trim(),
        hostName: payload.hostName.trim(),
        district: payload.district,
        hub: payload.hub,
        village: payload.village.trim(),
        pricePerNightInr: payload.pricePerNightInr,
        maxGuests: payload.maxGuests,
        roomsAvailable: payload.roomsAvailable,
        rating: 4.9,
        reviewCount: 1,
        amenities: payload.amenities,
        mealsIncluded: payload.mealsIncluded,
        description: payload.description,
        imageKey: payload.imageKey,
      };
      store.homestays.unshift(created);
      saveLocalStore(store);
      return created;
    }
  );
}

export async function confirmStayInquiry(inquiryId: string): Promise<StayInquiry> {
  return tryApi<StayInquiry>(`/api/inquiries/${inquiryId}/confirm`, { method: 'POST' }, () => {
    const store = getLocalStore();
    const inquiry = store.inquiries.find((i) => i.id === inquiryId);
    if (!inquiry) throw new Error('Inquiry not found.');
    inquiry.status = 'Confirmed';
    saveLocalStore(store);
    return inquiry;
  });
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
  return tryApi<LocalEvent>(
    '/api/events',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => {
      const store = getLocalStore();
      const created: LocalEvent = {
        id: makeLocalId('evt'),
        title: payload.title.trim(),
        organizerName: payload.organizerName.trim(),
        district: payload.district,
        venue: payload.venue.trim(),
        startDate: payload.startDate,
        dateLabel: payload.dateLabel,
        category: payload.category,
        ticketPriceInr: payload.ticketPriceInr,
        capacity: payload.capacity,
        attendeesCount: 1,
        description: payload.description,
        imageKey: payload.imageKey,
      };
      store.events.unshift(created);
      saveLocalStore(store);
      return created;
    }
  );
}
