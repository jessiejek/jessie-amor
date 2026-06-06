export type ExpenseCategory = "Transport" | "Accommodation" | "Food" | "Sightseeing" | "Other";
export type PaymentMethod = "Cash" | "Debit" | "Credit Card";
export type ExpenseCurrency = "RM" | "PHP" | "SGD";

export interface Expense {
  id: string;
  day: number; // e.g., 12, 13, 14
  category: ExpenseCategory;
  item: string;
  amount: number;
  paidWith: PaymentMethod;
  originalAmount?: number;
  originalCurrency?: ExpenseCurrency;
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
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}
