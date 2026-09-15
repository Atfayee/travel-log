import type {
  City,
  Place,
  Visit,
  Trip,
  TripVisit,
  TripSummary,
  ExpenseBreakdown,
  TripOverview,
  TripCard,
  TripSearchResult
} from "../types/travel";

import {
  ApiError,
} from "./errors";

const API_URL =
  process.env.API_URL ??
  "http://127.0.0.1:8000";

async function serverRequest<T>(
  path: string
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}${path}`,

      {
        /*
          开发阶段：
          每次都请求最新数据。
        */
        cache: "no-store",
      }
    );

  if (!response.ok) {
    let message =
      `Request failed: ${response.status}`;

    let detail: unknown =
      null;

    try {
      const data =
        await response.json();

      detail =
        data.detail;

      if (data.detail) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(
              data.detail
            );
      }
    } catch {
      // response may not be JSON
    }

    throw new ApiError(
      response.status,
      message,
      detail
    );
  }

  return response.json();
}

export function getTripServer(
  tripId: number
): Promise<Trip> {
  return serverRequest<Trip>(
    `/trips/${tripId}`
  );
}

export function getPlaceServer(
  placeId: number
): Promise<Place> {
  return serverRequest<Place>(
    `/places/${placeId}`
  );
}

export function getPlaceVisitsServer(
  placeId: number
): Promise<Visit[]> {
  return serverRequest<Visit[]>(
    `/places/${placeId}/visits`
  );
}

export function getCityServer(
  cityId: number
): Promise<City> {
  return serverRequest<City>(
    `/cities/${cityId}`
  );
}

export function getCitiesServer(
): Promise<City[]> {
  return serverRequest<
    City[]
  >(
    "/cities"
  );
}

export function getCityPlacesServer(
  cityId: number
): Promise<Place[]> {
  return serverRequest<Place[]>(
    `/cities/${cityId}/places`
  );
}

export function getCityTripsServer(
  cityId: number
): Promise<Trip[]> {
  return serverRequest<Trip[]>(
    `/cities/${cityId}/trips`
  );
}

export function getTripVisitsServer(
  tripId: number
): Promise<TripVisit[]> {
  return serverRequest<
    TripVisit[]
  >(
    `/trips/${tripId}/visits`
  );
}

export function getTripSummaryServer(
  tripId: number
): Promise<TripSummary> {
  return serverRequest<
    TripSummary
  >(
    `/trips/${tripId}/summary`
  );
}

export function getExpenseBreakdownServer(
  tripId: number
): Promise<ExpenseBreakdown> {
  return serverRequest<
    ExpenseBreakdown
  >(
    `/trips/${tripId}/expense-breakdown`
  );
}

export function getTripOverviewServer(
  tripId: number
): Promise<TripOverview> {
  return serverRequest<TripOverview>(
    `/trips/${tripId}/overview`
  );
}

export function getCityTripCardsServer(
  cityId: number
): Promise<TripCard[]> {
  return serverRequest<
    TripCard[]
  >(
    `/cities/${cityId}/trip-cards`
  );
}

export type TripSearchParams = {
  q?: string;

  travelStyle?: string;

  maxBudget?: number;

  sort?:
  | "latest"
  | "cost"
  | "rating";
};

export async function searchCityTripsServer(
  cityId: number,
  params: TripSearchParams
): Promise<
  TripSearchResult[]
> {
  const searchParams =
    new URLSearchParams();

  if (params.q) {
    searchParams.set(
      "q",
      params.q
    );
  }

  if (
    params.travelStyle
  ) {
    searchParams.set(
      "travel_style",
      params.travelStyle
    );
  }

  if (
    params.maxBudget !==
    undefined
  ) {
    searchParams.set(
      "max_budget",
      String(
        params.maxBudget
      )
    );
  }

  if (params.sort) {
    searchParams.set(
      "sort",
      params.sort
    );
  }

  const queryString =
    searchParams.toString();

  return serverRequest<
    TripSearchResult[]
  >(
    `/cities/${cityId}/trip-search${queryString
      ? `?${queryString}`
      : ""
    }`
  );
}
