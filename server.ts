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

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'meghaguide-store.json');

function createInitialStore(): MarketplaceSnapshot {
  return {
    places: [
      {
        id: 'place-nongriat',
        name: 'Umshiang Double-Decker Living Root Bridge',
        district: 'East Khasi Hills',
        nearestHub: 'Sohra',
        category: 'Living Root Bridge',
        bestSeason: 'Oct – Apr',
        trekDuration: '3.5 hrs round trip',
        entryFeeInr: 50,
        summary:
          'Woven over centuries by Khasi villagers from Ficus elastica aerial roots across the Umshiang stream, reached via 3,500 stone steps from Tyrna.',
        highlights: [
          'Two-tier living bio-engineering structure',
          'Optional hike onward to Rainbow Falls',
          'Guided village trail etiquette',
        ],
        imageKey: 'root_bridge',
      },
      {
        id: 'place-dawki',
        name: 'Umngot River & Shnongpdeng Gorge',
        district: 'West Jaintia Hills',
        nearestHub: 'Dawki',
        category: 'River & Canyon',
        bestSeason: 'Nov – Mar',
        trekDuration: 'Half-day river circuit',
        entryFeeInr: 0,
        summary:
          'Glass-clear emerald waters along the Jaintia-Khasi border where traditional wooden country boats glide over river cobbles and limestone cliffs.',
        highlights: [
          'Early-morning country boat rides before 9 AM',
          'Shnongpdeng suspension bridge & riverside camps',
          'Mawlynnong cleanest village detour',
        ],
        imageKey: 'dawki_river',
      },
      {
        id: 'place-nohkalikai',
        name: 'Nohkalikai Falls & Sohra Plateau Rim',
        district: 'East Khasi Hills',
        nearestHub: 'Sohra',
        category: 'Waterfall',
        bestSeason: 'Jun – Nov',
        trekDuration: '1 hr rim walk',
        entryFeeInr: 30,
        summary:
          'India’s tallest plunge waterfall dropping 340 meters off the Sohra plateau into a turquoise canyon pool shrouded in drifting Khasi hill clouds.',
        highlights: [
          'Panoramic cliffside viewpoint & pine trail',
          'Dainthlen & Wei Sawdong falls nearby',
          'Morning mist clearing window 7:30 – 10:00 AM',
        ],
        imageKey: 'nohkalikai',
      },
      {
        id: 'place-mawphlang',
        name: 'Mawphlang Sacred Grove & David Scott Trail',
        district: 'East Khasi Hills',
        nearestHub: 'Shillong',
        category: 'Sacred Grove & Cave',
        bestSeason: 'Year-round',
        trekDuration: '2 – 4 hrs guided walk',
        entryFeeInr: 100,
        summary:
          'Protected for centuries under Khasi customary law where not a leaf or twig may be removed, adjoining the historic 16 km mule track toward Ladmawphlang.',
        highlights: [
          'Ancient Rudraksha & oak canopy biodiversity',
          'Monoliths & sacred altar clearings',
          'Mandatory local Khasi village guide',
        ],
        imageKey: 'hero_clouds',
      },
      {
        id: 'place-krangshuri',
        name: 'Krang Shuri Waterfall & Jaintia Hills',
        district: 'West Jaintia Hills',
        nearestHub: 'Jowai',
        category: 'Waterfall',
        bestSeason: 'Oct – May',
        trekDuration: '45 min stone trail',
        entryFeeInr: 50,
        summary:
          'Electric-blue lagoon framed by curved sandstone ledges and forest canopy near Amlarem, ideal for swimming with local life-jacket rentals.',
        highlights: [
          'Walk-behind waterfall alcove',
          'Phe Phe Falls 20 minutes north',
          'Nartiang monoliths cultural stopover',
        ],
        imageKey: 'nohkalikai',
      },
      {
        id: 'place-siju',
        name: 'Siju Limestone Cave & Simsang Valley',
        district: 'West Garo Hills',
        nearestHub: 'Tura',
        category: 'Sacred Grove & Cave',
        bestSeason: 'Nov – Mar',
        trekDuration: '2.5 hrs cave trek',
        entryFeeInr: 100,
        summary:
          'One of the longest river caves in the Indian subcontinent carved into Garo Hills limestone, featuring stalactite chambers and crystal subterranean streams.',
        highlights: [
          'Headlamp-equipped guided cave exploration',
          'Simsang river hanging bridge crossing',
          'Nokrek Biosphere Reserve birding route',
        ],
        imageKey: 'root_bridge',
      },
    ],
    events: [
      {
        id: 'evt-wangala',
        title: 'Wangala Hundred Drums Harvest Gathering',
        organizerName: 'A·chik Cultural Heritage Collective',
        district: 'West Garo Hills',
        venue: 'Asanang Grounds, near Tura',
        dateLabel: 'Nov 20 – Nov 22',
        startDate: '2026-11-20',
        category: 'Cultural Festival',
        ticketPriceInr: 250,
        capacity: 180,
        attendeesCount: 114,
        description:
          'Three days of traditional Dama drum ensembles, bamboo-craft demonstrations, smoked millet cuisine, and harvest dances hosted by Garo village troupes.',
        imageKey: 'wangala_festival',
      },
      {
        id: 'evt-shillong-folk',
        title: 'Laitkor Pine Ridge Acoustic & Loom Evening',
        organizerName: 'Khasi Hills Crafts & Sound Guild',
        district: 'East Khasi Hills',
        venue: 'Laitkor Timber Courtyard, Shillong',
        dateLabel: 'Nov 28',
        startDate: '2026-11-28',
        category: 'Music & Arts',
        ticketPriceInr: 450,
        capacity: 75,
        attendeesCount: 48,
        description:
          'Intimate sunset performance featuring Duitara string folk ballads, Eri silk weaving showcase, and local Sohra orange tea service.',
        imageKey: 'khasi_cottage',
      },
      {
        id: 'evt-nongriat-clean',
        title: 'Sohra Canyon Sunrise Trail & Village Market',
        organizerName: 'Tyrna Eco-Guides Association',
        district: 'East Khasi Hills',
        venue: 'Tyrna Trailhead to Nongriat',
        dateLabel: 'Dec 5',
        startDate: '2026-12-05',
        category: 'Trail & Eco',
        ticketPriceInr: 0,
        capacity: 40,
        attendeesCount: 27,
        description:
          'Guided early-morning ridge walk with local botanists followed by a weekly farm market serving wild honey, bay leaves, and red rice.',
        imageKey: 'root_bridge',
      },
    ],
    homestays: [
      {
        id: 'stay-pine-retreat',
        name: 'The Pine Retreat Stone Cottage',
        hostName: 'Kong Marylin Syiem',
        district: 'East Khasi Hills',
        hub: 'Shillong',
        village: 'Upper Laitkor Ridge',
        pricePerNightInr: 3400,
        maxGuests: 4,
        roomsAvailable: 3,
        rating: 4.9,
        reviewCount: 64,
        amenities: ['Wood-burning hearth', 'Private valley veranda', 'Hot water', 'Wi-Fi'],
        mealsIncluded: 'Home-cooked Khasi breakfast included; dinner on request',
        description:
          'Built from dressed Khasi granite and seasoned pine overlooking the misty Laitkor valley, 18 minutes from Police Bazar yet silent after dusk.',
        imageKey: 'khasi_cottage',
      },
      {
        id: 'stay-sohra-mist',
        name: 'Ksan Cloud-Rim Homestay',
        hostName: 'Bah Donbor Nongkhlaw',
        district: 'East Khasi Hills',
        hub: 'Sohra',
        village: 'Saitsohpen, Sohra',
        pricePerNightInr: 2600,
        maxGuests: 5,
        roomsAvailable: 4,
        rating: 4.8,
        reviewCount: 41,
        amenities: ['Rain-shelter porch', 'Parking for SUVs', 'Packed trek lunches', 'Solar backup'],
        mealsIncluded: 'Breakfast & Sohra ginger tea included',
        description:
          'Family-run stone homestay minutes from Nohkalikai Road, ideal base for early-morning Tyrna root bridge treks and Wei Sawdong visits.',
        imageKey: 'nohkalikai',
      },
      {
        id: 'stay-dawki-bamboo',
        name: 'Umngot Bamboo Deck Stay',
        hostName: 'Ibanri Khonglah',
        district: 'West Jaintia Hills',
        hub: 'Dawki',
        village: 'Shnongpdeng Riverside',
        pricePerNightInr: 2200,
        maxGuests: 3,
        roomsAvailable: 5,
        rating: 4.7,
        reviewCount: 53,
        amenities: ['River view deck', 'Kayak & boat coordination', 'Bonfire pit', 'Local breakfast'],
        mealsIncluded: 'Morning Pnar rice-cake & tea included',
        description:
          'Elevated bamboo cabins above the emerald Umngot bend with direct morning access to quiet country boatmen before day-trippers arrive.',
        imageKey: 'dawki_river',
      },
    ],
    providers: [
      {
        id: 'prov-bantei',
        name: 'Bantei Kharkongor',
        role: 'Driver & Guide',
        baseHub: 'Shillong',
        languages: ['Khasi', 'English', 'Hindi'],
        vehicle: 'Toyota Innova Crysta (6-seater)',
        specialties: ['Sohra waterfalls', 'Dawki-Mawlynnong loop', 'Guwahati Airport transfers'],
        yearsExperience: 9,
        rating: 4.9,
        completedTrips: 218,
        dailyRateEstimateInr: 3800,
        verifiedLocal: true,
        bio: 'Born in Shillong with 9 years navigating steep Sohra hairpin bends and off-beat Jaintia waterfall roads safely in fog and rain.',
      },
      {
        id: 'prov-daphi',
        name: 'Daphisha Lyngdoh',
        role: 'Guide',
        baseHub: 'Sohra',
        languages: ['Khasi', 'English'],
        vehicle: null,
        specialties: ['Nongriat & Rainbow Falls trek', 'Mawmluh cave geology', 'Khasi oral folklore'],
        yearsExperience: 7,
        rating: 5.0,
        completedTrips: 164,
        dailyRateEstimateInr: 1800,
        verifiedLocal: true,
        bio: 'Certified Sohra wilderness and living-root-bridge specialist guiding multi-village ridge hikes with deep knowledge of local flora.',
      },
      {
        id: 'prov-riki',
        name: 'Riki Sangma',
        role: 'Driver & Guide',
        baseHub: 'Tura',
        languages: ['Garo', 'English', 'Hindi', 'Assamese'],
        vehicle: 'Mahindra Scorpio 4x4 (7-seater)',
        specialties: ['Siju Caves & Balpakram', 'Nokrek trail access', 'Garo cultural circuits'],
        yearsExperience: 11,
        rating: 4.8,
        completedTrips: 142,
        dailyRateEstimateInr: 4200,
        verifiedLocal: true,
        bio: 'Garo Hills overland driver-guide equipped with high-clearance 4x4 transport for Siju, Wari Chora, and Balpakram plateau routes.',
      },
      {
        id: 'prov-pynshai',
        name: 'Pynshai Marbaniang',
        role: 'Driver',
        baseHub: 'Shillong',
        languages: ['Khasi', 'Hindi', 'English'],
        vehicle: 'Maruti Suzuki Ertiga (6-seater)',
        specialties: ['Family itineraries', 'Laitlum sunrise', 'Krang Shuri & Dawki'],
        yearsExperience: 6,
        rating: 4.8,
        completedTrips: 129,
        dailyRateEstimateInr: 3200,
        verifiedLocal: true,
        bio: 'Calm, punctual highway and hill driver focused on comfortable multi-day family trips with flexible village lunch stops.',
      },
    ],
    requests: [
      {
        id: 'req-sohra-loop',
        touristName: 'Ananya & Vikram Nair',
        touristContact: 'ananya.nair@example.com',
        requestType: 'Ride & Guide',
        origin: 'Shillong (Laitumkhrah)',
        destination: 'Sohra, Tyrna Root Bridge & Wei Sawdong',
        travelDate: '2026-11-24',
        durationDays: 2,
        groupSize: 4,
        budgetMaxInr: 9000,
        notes: 'Prefer early 6:30 AM departure to beat mist at Nohkalikai. Need luggage space for 4 cabin bags and guidance on the Tyrna trail.',
        status: 'Open',
        acceptedOfferId: null,
        createdAt: '2026-11-13T09:15:00.000Z',
      },
      {
        id: 'req-dawki-day',
        touristName: 'Rohan Deshmukh',
        touristContact: 'rohan.d@example.com',
        requestType: 'Ride',
        origin: 'Guwahati Airport (GAU)',
        destination: 'Mawlynnong & Shnongpdeng (Dawki)',
        travelDate: '2026-11-29',
        durationDays: 1,
        groupSize: 2,
        budgetMaxInr: 4500,
        notes: 'Flight lands at 8:15 AM. Looking for direct transfer to Mawlynnong and evening drop at Umngot riverside stay.',
        status: 'Open',
        acceptedOfferId: null,
        createdAt: '2026-11-13T11:40:00.000Z',
      },
    ],
    offers: [
      {
        id: 'offer-101',
        requestId: 'req-sohra-loop',
        providerId: 'prov-bantei',
        providerName: 'Bantei Kharkongor',
        providerRole: 'Driver & Guide',
        providerRating: 4.9,
        providerTrips: 218,
        vehicleOrGear: 'Toyota Innova Crysta (6-seater)',
        languages: ['Khasi', 'English', 'Hindi'],
        quotedPriceInr: 7800,
        includesFuelOrPermits: true,
        includedStops: ['Mawkdok Valley', 'Nohkalikai Falls', 'Wei Sawdong', 'Tyrna Drop-off'],
        message: 'I live in Upper Shillong and can pick you up at 6:30 AM sharp. Fuel, toll, and driver night allowance at Sohra included.',
        estimatedPickupTime: '06:30 AM',
        status: 'Pending',
        createdAt: '2026-11-13T09:42:00.000Z',
      },
      {
        id: 'offer-102',
        requestId: 'req-sohra-loop',
        providerId: 'prov-pynshai',
        providerName: 'Pynshai Marbaniang',
        providerRole: 'Driver',
        providerRating: 4.8,
        providerTrips: 129,
        vehicleOrGear: 'Maruti Suzuki Ertiga (6-seater)',
        languages: ['Khasi', 'Hindi', 'English'],
        quotedPriceInr: 6900,
        includesFuelOrPermits: true,
        includedStops: ['Elephant Falls', 'Nohkalikai Falls', 'Tyrna Trailhead'],
        message: 'Clean 6-seater Ertiga with roof carrier for bags. I can introduce a certified Tyrna village guide at the trailhead.',
        estimatedPickupTime: '06:45 AM',
        status: 'Pending',
        createdAt: '2026-11-13T10:10:00.000Z',
      },
      {
        id: 'offer-103',
        requestId: 'req-sohra-loop',
        providerId: 'prov-daphi',
        providerName: 'Daphisha Lyngdoh',
        providerRole: 'Guide',
        providerRating: 5.0,
        providerTrips: 164,
        vehicleOrGear: 'Trek poles, waterproof dry-bags & first-aid kit',
        languages: ['Khasi', 'English'],
        quotedPriceInr: 3400,
        includesFuelOrPermits: false,
        includedStops: ['Tyrna to Nongriat', 'Rainbow Falls Extension', 'Local Khasi Lunch'],
        message: 'Guide-only quote for both days in Sohra & Nongriat. Happy to coordinate with your driver on timing so you catch clear valley views.',
        estimatedPickupTime: '08:00 AM at Sohra',
        status: 'Pending',
        createdAt: '2026-11-13T10:35:00.000Z',
      },
      {
        id: 'offer-104',
        requestId: 'req-dawki-day',
        providerId: 'prov-pynshai',
        providerName: 'Pynshai Marbaniang',
        providerRole: 'Driver',
        providerRating: 4.8,
        providerTrips: 129,
        vehicleOrGear: 'Maruti Suzuki Ertiga (6-seater)',
        languages: ['Khasi', 'Hindi', 'English'],
        quotedPriceInr: 4100,
        includesFuelOrPermits: true,
        includedStops: ['Umiam Lake Viewpoint', 'Mawlynnong Village', 'Shnongpdeng Drop'],
        message: 'Will wait at Guwahati Airport arrivals gate by 8:30 AM. All fuel and Assam-Meghalaya highway tolls covered.',
        estimatedPickupTime: '08:30 AM at GAU',
        status: 'Pending',
        createdAt: '2026-11-13T12:05:00.000Z',
      },
    ],
    inquiries: [
      {
        id: 'inq-1',
        homestayId: 'stay-pine-retreat',
        homestayName: 'The Pine Retreat Stone Cottage',
        guestName: 'Meera Krishnan',
        guestContact: 'meera.k@example.com',
        checkInDate: '2026-12-02',
        nights: 3,
        guests: 2,
        note: 'Arriving late afternoon from Cherrapunji; would love traditional Khasi dinner on the first night.',
        status: 'Requested',
        createdAt: '2026-11-13T14:20:00.000Z',
      },
    ],
  };
}

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

    app.get(['/provider', '/provider.html', '/provider/*'], async (req, res, next) => {
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
    app.use(express.static(distDir));
    app.get(['/provider', '/provider.html', '/provider/*'], (_req, res) => {
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
