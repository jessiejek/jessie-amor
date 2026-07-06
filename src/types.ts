export type ExpenseCategory = "Transport" | "Accommodation" | "Food" | "Sightseeing" | "Other";
export type PaymentMethod = "Cash" | "Debit" | "Credit Card";
export type ExpenseCurrency = string;
export type SyncStatus = "synced" | "pending";
export type DiaryEntryType =
  | "Food"
  | "Landmark"
  | "Hotel"
  | "Transport"
  | "Shopping"
  | "Moment"
  | "Other";

export interface Expense {
  id: string;
  day: number; // e.g., 12, 13, 14
  category: ExpenseCategory;
  item: string;
  amount: number;
  paidWith: PaymentMethod;
  originalAmount?: number;
  originalCurrency?: ExpenseCurrency;
  receiptPath?: string; // Supabase Storage path for the receipt photo
  receiptUrl?: string; // local data: URL before upload, signed URL after
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  createdAt?: string;
  syncStatus?: SyncStatus;
}

export type ItineraryItemType = "transport" | "accommodation" | "sightseeing" | "food" | "general";

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  type: ItineraryItemType;
  description: string;
  estimatedCost?: string;
  costValue?: number; // numerical for calculations
  isCreditCard?: boolean;
  duration?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  syncStatus?: SyncStatus;
}

export interface DayPlan {
  day: number;
  dateStr: string; // e.g., "July 12"
  title: string;
  budgetRange: string;
  costMin: number;
  costMax: number;
  badge: string; // e.g., "WALK-ONLY DAY"
  items: ItineraryItem[];
  images?: {
    title: string;
    url: string;
    label: string;
  }[];
}

export interface TravelNote {
  id: string;
  title: string;
  content: string;
  category: "Rule" | "Requirement" | "General";
  createdAt: string;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  syncStatus?: SyncStatus;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  syncStatus?: SyncStatus;
}

export interface DiaryEntry {
  id: string;
  title: string;
  description: string;
  type: DiaryEntryType;
  rating: number;
  dateVisited: string;
  locationName: string;
  cityOrCountry?: string;
  tags: string[];
  wouldRevisit: boolean;
  photoPath?: string;
  photoUrl?: string;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  createdAt: string;
  updatedAt?: string;
  syncStatus?: SyncStatus;
}

export interface CurrentUserInfo {
  userId: string;
  email: string;
  isAdmin: boolean;
}

// Per-user settings for trip view preferences
export interface UserTripSettings {
  id: string;
  userId: string;
  tripKey: string;
  baseCurrency: string;
  currencies: string[];
  travelDates: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTripSettingsRow {
  id: string;
  user_id: string;
  trip_key: string;
  base_currency: string;
  currencies: string[];
  travel_dates: string[];
  created_at?: string;
  updated_at: string;
}

export function settingsToRow(settings: UserTripSettings): UserTripSettingsRow {
  return {
    id: settings.id,
    user_id: settings.userId,
    trip_key: settings.tripKey,
    base_currency: settings.baseCurrency,
    currencies: settings.currencies,
    travel_dates: settings.travelDates,
    created_at: settings.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export function rowToSettings(row: UserTripSettingsRow): UserTripSettings {
  return {
    id: row.id,
    userId: row.user_id,
    tripKey: row.trip_key,
    baseCurrency: row.base_currency,
    currencies: row.currencies,
    travelDates: row.travel_dates,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TripHotel {
  hotel: string;
  location: string;
  checkIn: string;
  checkOut: string;
}

export interface PdfItineraryItem {
  time: string;
  title: string;
  // Optional Itinerary+ spreadsheet columns. Left blank, these don't show
  // up anywhere — the PDF only ever reads time/title, so the immigration
  // document is unaffected by any of this.
  destination?: string;
  fees?: string;
  ootdJessie?: string;
  ootdAmor?: string;
}

export interface PdfItineraryDay {
  day: number;
  title: string;
  items: PdfItineraryItem[];
}

export interface PdfFlightLeg {
  label: string;
  dateTime: string;
  airport: string;
}

export interface TripProfile {
  id: string;
  tripKey: string;
  documentTitle: string;
  traveler1: string;
  traveler2: string;
  purpose: string;
  duration: string;
  route: string;
  flightLegs: PdfFlightLeg[];
  hotels: TripHotel[];
  itineraryDays: PdfItineraryDay[];
  updatedAt?: string;
}

export interface TripProfileRow {
  id: string;
  trip_key: string;
  document_title: string;
  traveler_1: string;
  traveler_2: string;
  purpose: string;
  duration: string;
  route: string;
  flight_legs: PdfFlightLeg[] | null;
  hotels: TripHotel[];
  itinerary_days: PdfItineraryDay[] | null;
  updated_at?: string;
}

export function profileToRow(p: TripProfile): TripProfileRow {
  return {
    id: p.id,
    trip_key: p.tripKey,
    document_title: p.documentTitle,
    traveler_1: p.traveler1,
    traveler_2: p.traveler2,
    purpose: p.purpose,
    duration: p.duration,
    route: p.route,
    flight_legs: p.flightLegs,
    hotels: p.hotels,
    itinerary_days: p.itineraryDays,
    updated_at: new Date().toISOString(),
  };
}

export function rowToProfile(row: TripProfileRow): TripProfile {
  return {
    id: row.id,
    tripKey: row.trip_key,
    documentTitle: row.document_title,
    traveler1: row.traveler_1,
    traveler2: row.traveler_2,
    purpose: row.purpose,
    duration: row.duration,
    route: row.route,
    flightLegs: row.flight_legs ?? [],
    hotels: row.hotels,
    itineraryDays: row.itinerary_days ?? [],
    updatedAt: row.updated_at,
  };
}
