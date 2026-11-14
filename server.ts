import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type {
  Homestay,
  LocalEvent,
  MarketplaceSnapshot,
  Place,
  ProviderOffer,
  ProviderProfile,
  StayInquiry,
  TripRequest,
} from './src/types.ts';

import { createInitialStore } from './src/shared/seedData.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'meghaguide-store.json');

function loadStore(): MarketplaceSnapshot {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw) as MarketplaceSnapshot;
  } catch {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveStore(store: MarketplaceSnapshot): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  let store = loadStore();

  // Health & full marketplace snapshot
  app.get('/api/marketplace', (_req, res) => {
    res.json(store);
  });

  // Tourist: Create a ride or guide request
  app.post('/api/requests', (req, res) => {
    const body = req.body as Partial<TripRequest>;
    if (!body.touristName?.trim() || !body.origin?.trim() || !body.destination?.trim() || !body.travelDate) {
      res.status(400).json({ error: 'Name, origin, destination, and travel date are required.' });
      return;
    }

    const created: TripRequest = {
      id: makeId('req'),
      touristName: body.touristName.trim().slice(0, 80),
      touristContact: (body.touristContact || '').trim().slice(0, 100),
      requestType: body.requestType || 'Ride & Guide',
      origin: body.origin.trim().slice(0, 100),
      destination: body.destination.trim().slice(0, 140),
      travelDate: body.travelDate,
      durationDays: Math.max(1, Math.min(21, Number(body.durationDays) || 1)),
      groupSize: Math.max(1, Math.min(16, Number(body.groupSize) || 2)),
      budgetMaxInr: Math.max(500, Math.min(250000, Number(body.budgetMaxInr) || 5000)),
      notes: (body.notes || '').trim().slice(0, 600),
      status: 'Open',
      acceptedOfferId: null,
      createdAt: new Date().toISOString(),
    };

    store.requests.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  // Provider: Submit an offer on an open trip request
  app.post('/api/requests/:requestId/offers', (req, res) => {
    const { requestId } = req.params;
    const targetRequest = store.requests.find((r) => r.id === requestId);
    if (!targetRequest) {
      res.status(404).json({ error: 'Trip request not found.' });
      return;
    }
    if (targetRequest.status !== 'Open') {
      res.status(400).json({ error: 'This trip request already has a selected offer.' });
      return;
    }

    const body = req.body as Partial<ProviderOffer>;
    const provider = store.providers.find((p) => p.id === body.providerId);
    if (!provider) {
      res.status(400).json({ error: 'Valid local provider profile is required.' });
      return;
    }

    const quotedPrice = Number(body.quotedPriceInr);
    if (!Number.isFinite(quotedPrice) || quotedPrice < 300) {
      res.status(400).json({ error: 'Quoted price must be at least ₹300.' });
      return;
    }

    const created: ProviderOffer = {
      id: makeId('offer'),
      requestId,
      providerId: provider.id,
      providerName: provider.name,
      providerRole: provider.role,
      providerRating: provider.rating,
      providerTrips: provider.completedTrips,
      vehicleOrGear: (body.vehicleOrGear || provider.vehicle || 'Certified Trekking Gear & First-Aid').trim().slice(0, 120),
      languages: provider.languages,
      quotedPriceInr: Math.round(quotedPrice),
      includesFuelOrPermits: Boolean(body.includesFuelOrPermits),
      includedStops: Array.isArray(body.includedStops)
        ? body.includedStops.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
        : [],
      message: (body.message || '').trim().slice(0, 500),
      estimatedPickupTime: (body.estimatedPickupTime || '07:00 AM').trim().slice(0, 60),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    store.offers.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  // Tourist: Choose/accept a specific provider offer
  app.post('/api/requests/:requestId/accept-offer', (req, res) => {
    const { requestId } = req.params;
    const { offerId } = req.body as { offerId?: string };

    const targetRequest = store.requests.find((r) => r.id === requestId);
    if (!targetRequest) {
      res.status(404).json({ error: 'Trip request not found.' });
      return;
    }

    const targetOffer = store.offers.find((o) => o.id === offerId && o.requestId === requestId);
    if (!targetOffer) {
      res.status(404).json({ error: 'Offer not found for this trip request.' });
      return;
    }

    targetRequest.status = 'Accepted';
    targetRequest.acceptedOfferId = targetOffer.id;

    store.offers = store.offers.map((offer) => {
      if (offer.requestId !== requestId) return offer;
      return {
        ...offer,
        status: offer.id === targetOffer.id ? 'Selected' : 'Declined',
      };
    });

    saveStore(store);
    res.json({ request: targetRequest, offers: store.offers.filter((o) => o.requestId === requestId) });
  });

  // Local Provider: Register a new driver or guide profile
  app.post('/api/providers', (req, res) => {
    const body = req.body as Partial<ProviderProfile>;
    if (!body.name?.trim() || !body.baseHub) {
      res.status(400).json({ error: 'Provider name and base hub are required.' });
      return;
    }

    const created: ProviderProfile = {
      id: makeId('prov'),
      name: body.name.trim().slice(0, 80),
      role: body.role || 'Driver & Guide',
      baseHub: body.baseHub,
      languages: Array.isArray(body.languages) && body.languages.length > 0 ? body.languages.slice(0, 5) : ['Khasi', 'English'],
      vehicle: body.vehicle?.trim() ? body.vehicle.trim().slice(0, 100) : null,
      specialties: Array.isArray(body.specialties) && body.specialties.length > 0 ? body.specialties.slice(0, 5) : ['Local sightseeing'],
      yearsExperience: Math.max(1, Math.min(40, Number(body.yearsExperience) || 3)),
      rating: 4.9,
      completedTrips: 12,
      dailyRateEstimateInr: Math.max(800, Math.min(25000, Number(body.dailyRateEstimateInr) || 3000)),
      verifiedLocal: true,
      bio: (body.bio || 'Local Meghalaya tourism specialist welcoming visitors.').trim().slice(0, 320),
    };

    store.providers.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  // Homestay Owner: Publish a new homestay
  app.post('/api/homestays', (req, res) => {
    const body = req.body as Partial<Homestay>;
    if (!body.name?.trim() || !body.hostName?.trim() || !body.village?.trim()) {
      res.status(400).json({ error: 'Homestay name, host name, and village are required.' });
      return;
    }

    const created: Homestay = {
      id: makeId('stay'),
      name: body.name.trim().slice(0, 90),
      hostName: body.hostName.trim().slice(0, 80),
      district: body.district || 'East Khasi Hills',
      hub: body.hub || 'Shillong',
      village: body.village.trim().slice(0, 80),
      pricePerNightInr: Math.max(600, Math.min(50000, Number(body.pricePerNightInr) || 2400)),
      maxGuests: Math.max(1, Math.min(12, Number(body.maxGuests) || 4)),
      roomsAvailable: Math.max(1, Math.min(10, Number(body.roomsAvailable) || 2)),
      rating: 4.9,
      reviewCount: 1,
      amenities: Array.isArray(body.amenities) && body.amenities.length > 0 ? body.amenities.slice(0, 6) : ['Home-cooked meals', 'Hot water', 'Local trail tips'],
      mealsIncluded: (body.mealsIncluded || 'Local breakfast included').trim().slice(0, 120),
      description: (body.description || 'Warm family-hosted stay in the Meghalaya hills.').trim().slice(0, 400),
      imageKey: body.imageKey || 'khasi_cottage',
    };

    store.homestays.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  // Tourist: Send a stay inquiry to a homestay host
  app.post('/api/homestays/:id/inquire', (req, res) => {
    const { id } = req.params;
    const homestay = store.homestays.find((h) => h.id === id);
    if (!homestay) {
      res.status(404).json({ error: 'Homestay not found.' });
      return;
    }

    const body = req.body as Partial<StayInquiry>;
    if (!body.guestName?.trim() || !body.checkInDate) {
      res.status(400).json({ error: 'Guest name and check-in date are required.' });
      return;
    }

    const created: StayInquiry = {
      id: makeId('inq'),
      homestayId: homestay.id,
      homestayName: homestay.name,
      guestName: body.guestName.trim().slice(0, 80),
      guestContact: (body.guestContact || '').trim().slice(0, 100),
      checkInDate: body.checkInDate,
      nights: Math.max(1, Math.min(30, Number(body.nights) || 2)),
      guests: Math.max(1, Math.min(homestay.maxGuests, Number(body.guests) || 2)),
      note: (body.note || '').trim().slice(0, 400),
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };

    store.inquiries.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  // Homestay Owner: Confirm a stay inquiry
  app.post('/api/inquiries/:id/confirm', (req, res) => {
    const inquiry = store.inquiries.find((i) => i.id === req.params.id);
    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    inquiry.status = 'Confirmed';
    saveStore(store);
    res.json(inquiry);
  });

  // Event Organizer: Publish a new event
  app.post('/api/events', (req, res) => {
    const body = req.body as Partial<LocalEvent>;
    if (!body.title?.trim() || !body.organizerName?.trim() || !body.venue?.trim() || !body.startDate) {
      res.status(400).json({ error: 'Title, organizer name, venue, and date are required.' });
      return;
    }

    const created: LocalEvent = {
      id: makeId('evt'),
      title: body.title.trim().slice(0, 100),
      organizerName: body.organizerName.trim().slice(0, 80),
      district: body.district || 'East Khasi Hills',
      venue: body.venue.trim().slice(0, 100),
      dateLabel: body.dateLabel?.trim() || body.startDate,
      startDate: body.startDate,
      category: body.category || 'Cultural Festival',
      ticketPriceInr: Math.max(0, Math.min(10000, Number(body.ticketPriceInr) || 0)),
      capacity: Math.max(10, Math.min(2000, Number(body.capacity) || 80)),
      attendeesCount: 1,
      description: (body.description || 'Community-hosted cultural gathering in Meghalaya.').trim().slice(0, 450),
      imageKey: body.imageKey || 'wangala_festival',
    };

    store.events.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  // Tourist: Reserve a spot at a local event
  app.post('/api/events/:id/rsvp', (req, res) => {
    const event = store.events.find((e) => e.id === req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    if (event.attendeesCount >= event.capacity) {
      res.status(400).json({ error: 'This event has reached capacity.' });
      return;
    }
    event.attendeesCount += 1;
    saveStore(store);
    res.json(event);
  });

  // Optional: Publish a new place recommendation
  app.post('/api/places', (req, res) => {
    const body = req.body as Partial<Place>;
    if (!body.name?.trim() || !body.summary?.trim()) {
      res.status(400).json({ error: 'Place name and summary are required.' });
      return;
    }

    const created: Place = {
      id: makeId('place'),
      name: body.name.trim().slice(0, 100),
      district: body.district || 'East Khasi Hills',
      nearestHub: body.nearestHub || 'Shillong',
      category: body.category || 'Waterfall',
      bestSeason: (body.bestSeason || 'Oct – Apr').trim().slice(0, 40),
      trekDuration: (body.trekDuration || '1.5 hrs').trim().slice(0, 40),
      entryFeeInr: Math.max(0, Math.min(2000, Number(body.entryFeeInr) || 0)),
      summary: body.summary.trim().slice(0, 400),
      highlights: Array.isArray(body.highlights) && body.highlights.length > 0 ? body.highlights.slice(0, 4) : ['Local trail access'],
      imageKey: body.imageKey || 'hero_clouds',
      addedBy: body.addedBy?.trim().slice(0, 60),
    };

    store.places.unshift(created);
    saveStore(store);
    res.status(201).json(created);
  });

  const distDir = path.join(process.cwd(), 'dist');
  const isProd =
    process.env.NODE_ENV === 'production' &&
    fs.existsSync(path.join(distDir, 'index.html')) &&
    fs.existsSync(path.join(distDir, 'provider.html'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get(['/provider', '/provider.html', '/provider/*', '/hackathon/provider', '/hackathon/provider.html'], async (req, res, next) => {
      try {
        const htmlPath = path.join(process.cwd(), 'provider.html');
        const rawHtml = fs.readFileSync(htmlPath, 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
      } catch (err) {
        next(err);
      }
    });

    app.get('*', async (req, res, next) => {
      try {
        const htmlPath = path.join(process.cwd(), 'index.html');
        const rawHtml = fs.readFileSync(htmlPath, 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use('/hackathon', express.static(distDir));
    app.use(express.static(distDir));
    app.get(['/provider', '/provider.html', '/provider/*', '/hackathon/provider', '/hackathon/provider.html'], (_req, res) => {
      res.sendFile(path.join(distDir, 'provider.html'));
    });
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MeghaGuide servers listening on http://0.0.0.0:${PORT} (Tourist: /, Provider: /provider)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MeghaGuide server:', err);
  process.exit(1);
});
