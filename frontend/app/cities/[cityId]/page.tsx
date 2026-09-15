import {
  notFound,
} from "next/navigation";

import CityPageClient from "../../../components/CityPageClient";

import {
  getCityServer,
  getCityPlacesServer,
  searchCityTripsServer,
} from "../../../lib/server-api";

import {
  ApiError,
} from "../../../lib/errors";

type CityPageProps = {
  params: Promise<{
    cityId: string;
  }>;

  searchParams: Promise<{
    q?: string;

    style?: string;

    maxBudget?: string;

    sort?: string;
  }>;
};

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps) {
  const {
    cityId:
      cityIdString,
  } = await params;

  const filters =
    await searchParams;

  const cityId = Number(
    cityIdString
  );

  if (
    !Number.isFinite(
      cityId
    )
  ) {
    notFound();
  }

  /*
  -------------------------
  Parse URL filters
  -------------------------
  */

  const q =
    filters.q?.trim() ??
    "";

  const travelStyle =
    filters.style ??
    "";

  const parsedBudget =
    filters.maxBudget
      ? Number(
          filters.maxBudget
        )
      : undefined;

  const maxBudget =
    parsedBudget !==
      undefined &&
    Number.isFinite(
      parsedBudget
    )
      ? parsedBudget
      : undefined;

  const sort:
    | "latest"
    | "cost"
    | "rating" =
    filters.sort ===
      "cost" ||
    filters.sort ===
      "rating"
      ? filters.sort
      : "latest";

  try {
    const [
      city,
      places,
      trips,
    ] = await Promise.all([
      getCityServer(
        cityId
      ),

      getCityPlacesServer(
        cityId
      ),

      searchCityTripsServer(
        cityId,
        {
          q:
            q ||
            undefined,

          travelStyle:
            travelStyle ||
            undefined,

          maxBudget,

          sort,
        }
      ),
    ]);

    return (
      <CityPageClient
        city={city}
        initialPlaces={
          places
        }
        initialTrips={
          trips
        }
        initialFilters={{
          q,
          travelStyle,
          maxBudget:
            maxBudget ??
            null,
          sort,
        }}
      />
    );
  } catch (error) {
    if (
      error instanceof
        ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }
}