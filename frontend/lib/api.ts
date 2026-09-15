import type {
  City,
  Place,
  Trip,
  TripVisit,
  Visit,
  VisitMoveDirection,
  TripSummary,
  ExpenseBreakdown,
  PlaceSearchResult,
  CreateTripInput,
  UpdateTripInput,
  CreateVisitInput,
  CreateVisitWithPlaceInput,
  UpdateVisitInput,
  TripOverview,
  ImageUploadResponse
} from "../types/travel";

import {
  ApiError,
} from "./errors";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response =
    await fetch(
      url,
      options
    );

  if (!response.ok) {
    let message =
      `Request failed: ${response.status}`;

    let detail:
      unknown = null;

    try {
      const data =
        await response.json();

      detail =
        data.detail;

      if (data.detail) {
        message =
          typeof data.detail ===
            "string"
            ? data.detail
            : JSON.stringify(
              data.detail
            );
      }
    } catch {
      // response body
      // may not be JSON
    }

    throw new ApiError(
      response.status,
      message,
      detail
    );
  }

  if (
    response.status ===
    204
  ) {
    return undefined as T;
  }

  return response.json();
}

/*
=========================
City
=========================
*/

export async function getCities():
  Promise<City[]> {
  return request<City[]>(
    `${API_URL}/cities`
  );
}

export async function getCity(
  cityId: number
): Promise<City> {
  return request<City>(
    `${API_URL}/cities/${cityId}`
  );
}

export async function getCityPlaces(
  cityId: number
): Promise<Place[]> {
  return request<Place[]>(
    `${API_URL}/cities/${cityId}/places`
  );
}

export async function getCityTrips(
  cityId: number
): Promise<Trip[]> {
  return request<Trip[]>(
    `${API_URL}/cities/${cityId}/trips`
  );
}

/*
=========================
Place
=========================
*/

export async function getPlace(
  placeId: number
): Promise<Place> {
  return request<Place>(
    `${API_URL}/places/${placeId}`
  );
}

export async function getPlaceVisits(
  placeId: number
): Promise<Visit[]> {
  return request<Visit[]>(
    `${API_URL}/places/${placeId}/visits`
  );
}

export async function searchPlaces(
  query: string,
  city: string
): Promise<
  PlaceSearchResult[]
> {
  const params =
    new URLSearchParams({
      q: query,
      city,
    });

  return request<
    PlaceSearchResult[]
  >(
    `${API_URL}/places/search?${params.toString()}`
  );
}

/*
=========================
Trip
=========================
*/

export async function getTrip(
  tripId: number
): Promise<Trip> {
  return request<Trip>(
    `${API_URL}/trips/${tripId}`
  );
}

export async function createTrip(
  data: CreateTripInput
): Promise<Trip> {
  return request<Trip>(
    `${API_URL}/trips`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          data
        ),
    }
  );
}

export async function updateTrip(
  tripId: number,
  data: UpdateTripInput
): Promise<Trip> {
  return request<Trip>(
    `${API_URL}/trips/${tripId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          data
        ),
    }
  );
}

export async function deleteTrip(
  tripId: number
): Promise<void> {
  return request<void>(
    `${API_URL}/trips/${tripId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getTripVisits(
  tripId: number
): Promise<
  TripVisit[]
> {
  return request<
    TripVisit[]
  >(
    `${API_URL}/trips/${tripId}/visits`
  );
}

export async function moveVisit(
  visitId: number,
  direction: VisitMoveDirection
): Promise<TripVisit[]> {
  return request<TripVisit[]>(
    `${API_URL}/visits/${visitId}/move`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        direction,
      }),
    }
  );
}

export async function moveVisitToDay(
  visitId: number,
  targetDay: number
): Promise<TripVisit[]> {
  return request<TripVisit[]>(
    `${API_URL}/visits/${visitId}/move-day`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        target_day:
          targetDay,
      }),
    }
  );
}

export async function getTripSummary(
  tripId: number
): Promise<
  TripSummary
> {
  return request<
    TripSummary
  >(
    `${API_URL}/trips/${tripId}/summary`
  );
}

export async function getExpenseBreakdown(
  tripId: number
): Promise<
  ExpenseBreakdown
> {
  return request<
    ExpenseBreakdown
  >(
    `${API_URL}/trips/${tripId}/expense-breakdown`
  );
}

/*
=========================
Visit - Create
=========================
*/

export async function createVisit(
  data:
    CreateVisitInput
): Promise<
  TripVisit
> {
  return request<
    TripVisit
  >(
    `${API_URL}/visits`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          data
        ),
    }
  );
}

export async function createVisitWithPlace(
  tripId: number,
  data:
    CreateVisitWithPlaceInput
): Promise<
  TripVisit
> {
  return request<
    TripVisit
  >(
    `${API_URL}/trips/${tripId}/visits-with-place`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          data
        ),
    }
  );
}

/*
=========================
Visit - Update
=========================
*/

export async function updateVisit(
  visitId: number,
  data:
    UpdateVisitInput
): Promise<
  TripVisit
> {
  return request<
    TripVisit
  >(
    `${API_URL}/visits/${visitId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          data
        ),
    }
  );
}

/*
=========================
Visit - Delete
=========================
*/

export async function deleteVisit(
  visitId: number
): Promise<void> {
  return request<void>(
    `${API_URL}/visits/${visitId}`,
    {
      method: "DELETE",
    }
  );
}
/*
=========================
Trip - Overview
=========================
*/
export async function getTripOverview(
  tripId: number
): Promise<TripOverview> {
  return request<TripOverview>(
    `${API_URL}/trips/${tripId}/overview`
  );
}

/*
=========================
Trip - Upload Cover Image
=========================
*/
export async function uploadImage(
  file: File
): Promise<ImageUploadResponse> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await fetch(
      `${API_URL}/uploads/image`,
      {
        method: "POST",
        body: formData,
      }
    );

  if (!response.ok) {
    let message =
      "Image upload failed";

    try {
      const data =
        await response.json();

      if (data.detail) {
        message =
          data.detail;
      }
    } catch {}

    throw new ApiError(
      response.status,
      message
    );
  }

  return response.json();
}