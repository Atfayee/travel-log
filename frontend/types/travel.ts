export type City = {
  id: number;
  name: string;
  country: string | null;
};

export type Place = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  city_id: number;
};

export type Trip = {
  id: number;
  city_id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  budget: number | null;
  travel_style: string | null;

  cover_image_url:
    | string
    | null;
};

export type Visit = {
  id: number;
  place_id: number;
  trip_id: number;

  day_number: number | null;
  order_index: number | null;

  cost: number | null;
  expense_category: string | null;

  rating: number | null;
  note: string | null;

  visited_at: string | null;
  duration: string | null;

  recommended: boolean | null;
  photo_url: string | null;
};

export type VisitMoveDirection =
  | "up"
  | "down";

export type TripVisit = Visit & {
  place: Place;
};

export type TripSummary = {
  trip_id: number;
  budget: number | null;
  total_cost: number;
  remaining_budget: number | null;
  visit_count: number;
};

export type ExpenseCategoryItem = {
  category: string;
  total: number;
};

export type ExpenseBreakdown = {
  trip_id: number;
  total_cost: number;
  categories: ExpenseCategoryItem[];
};

export type PlaceSearchResult = {
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
  category: string | null;
};

export type CreateTripInput = {
  city_id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  budget: number | null;
  travel_style: string | null;
  cover_image_url:
  | string
  | null;
};

export type UpdateTripInput = {
  title?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  budget?: number | null;
  travel_style?: string | null;
  cover_image_url?:
  | string
  | null;
};

export type CreateVisitInput = {
  place_id: number;
  trip_id: number;

  day_number: number;
  order_index: number;

  cost: number | null;
  expense_category: string | null;

  rating: number | null;
  note: string | null;

  visited_at: string | null;
  duration: string | null;

  recommended: boolean | null;
  photo_url: string | null;
};

export type CreateVisitWithPlaceInput = {
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;

  day_number: number;
  order_index: number;

  cost: number | null;
  expense_category: string | null;

  rating: number | null;
  note: string | null;

  visited_at: string | null;
  duration: string | null;

  recommended: boolean | null;
  photo_url: string | null;
};

export type UpdateVisitInput = {
  day_number?: number | null;
  order_index?: number | null;

  cost?: number | null;
  expense_category?: string | null;

  rating?: number | null;
  note?: string | null;

  visited_at?: string | null;
  duration?: string | null;

  recommended?: boolean | null;
  photo_url?: string | null;
};

export type TripOverview = {
  trip_id: number;
  day_count: number;
  place_count: number;
  total_cost: number;
  average_rating: number | null;
  recommended_count: number;
  rated_visit_count: number;
  recommendation_rate: number | null;
};


export type ImageUploadResponse = {
  url: string;
};

export type TripCard = {
  id: number;

  city_id: number;

  title: string;

  start_date:
    | string
    | null;

  end_date:
    | string
    | null;

  description:
    | string
    | null;

  budget:
    | number
    | null;

  travel_style:
    | string
    | null;

  cover_image_url:
    | string
    | null;

  day_count: number;

  place_count: number;

  total_cost: number;
};

export type TripSearchResult = {
  id: number;

  city_id: number;

  title: string;

  start_date:
    | string
    | null;

  end_date:
    | string
    | null;

  description:
    | string
    | null;

  budget:
    | number
    | null;

  travel_style:
    | string
    | null;

  cover_image_url:
    | string
    | null;

  day_count: number;

  place_count: number;

  total_cost: number;

  average_rating:
    | number
    | null;
};

export type CityTripFilters = {
  q: string;

  travelStyle: string;

  maxBudget:
    | number
    | null;

  sort:
    | "latest"
    | "cost"
    | "rating";
};
