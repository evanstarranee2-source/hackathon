export type District =
  | 'East Khasi Hills'
  | 'West Jaintia Hills'
  | 'West Garo Hills'
  | 'Ri-Bhoi'
  | 'South West Khasi Hills';

export type Hub = 'Shillong' | 'Sohra' | 'Dawki' | 'Jowai' | 'Tura';

export type ImageKey =
  | 'hero_clouds'
  | 'root_bridge'
  | 'dawki_river'
  | 'nohkalikai'
  | 'khasi_cottage'
  | 'wangala_festival';

export interface Place {
  id: string;
  name: string;
  district: District;
  nearestHub: Hub;
  category: 'Living Root Bridge' | 'Waterfall' | 'River & Canyon' | 'Sacred Grove & Cave';
  bestSeason: string;
  trekDuration: string;
  entryFeeInr: number;
  summary: string;
  highlights: string[];
  imageKey: ImageKey;
  addedBy?: string;
}

export interface LocalEvent {
  id: string;
  title: string;
  organizerName: string;
  district: District;
  venue: string;
  dateLabel: string;
  startDate: string;
  category: 'Cultural Festival' | 'Music & Arts' | 'Trail & Eco' | 'Village Market';
  ticketPriceInr: number;
  capacity: number;
  attendeesCount: number;
  description: string;
  imageKey: ImageKey;
}

export interface Homestay {
  id: string;
  name: string;
  hostName: string;
  district: District;
  hub: Hub;
  village: string;
  pricePerNightInr: number;
  maxGuests: number;
  roomsAvailable: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  mealsIncluded: string;
  description: string;
  imageKey: ImageKey;
}

export type ProviderRole = 'Driver' | 'Guide' | 'Driver & Guide';

export interface ProviderProfile {
  id: string;
  name: string;
  role: ProviderRole;
  baseHub: Hub;
  languages: string[];
  vehicle: string | null;
  specialties: string[];
  yearsExperience: number;
  rating: number;
  completedTrips: number;
  dailyRateEstimateInr: number;
  verifiedLocal: boolean;
  bio: string;
}

export type RequestType = 'Ride' | 'Guide' | 'Ride & Guide';

export interface TripRequest {
  id: string;
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
  status: 'Open' | 'Accepted' | 'Completed';
  acceptedOfferId: string | null;
  createdAt: string;
}

export interface ProviderOffer {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerRole: ProviderRole;
  providerRating: number;
  providerTrips: number;
  vehicleOrGear: string;
  languages: string[];
  quotedPriceInr: number;
  includesFuelOrPermits: boolean;
  includedStops: string[];
  message: string;
  estimatedPickupTime: string;
  status: 'Pending' | 'Selected' | 'Declined';
  createdAt: string;
}

export interface StayInquiry {
  id: string;
  homestayId: string;
  homestayName: string;
  guestName: string;
  guestContact: string;
  checkInDate: string;
  nights: number;
  guests: number;
  note: string;
  status: 'Requested' | 'Confirmed';
  createdAt: string;
}

export interface MarketplaceSnapshot {
  places: Place[];
  events: LocalEvent[];
  homestays: Homestay[];
  providers: ProviderProfile[];
  requests: TripRequest[];
  offers: ProviderOffer[];
  inquiries: StayInquiry[];
}
