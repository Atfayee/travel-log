import {
  notFound,
} from "next/navigation";

import PlacePageClient from "../../../components/PlacePageClient";

import {
  getPlaceServer,
  getCityServer,
  getPlaceVisitsServer,
} from "../../../lib/server-api";

import {
  ApiError,
} from "../../../lib/errors";

type PlacePageProps = {
  params: Promise<{
    placeId: string;
  }>;

  searchParams: Promise<{
    tripId?: string;
  }>;
};

export default async function PlacePage({
  params,
  searchParams,
}: PlacePageProps) {
  const {
    placeId:
      placeIdString,
  } =
    await params;

  const {
    tripId:
      fromTripId,
  } =
    await searchParams;

  const placeId =
    Number(
      placeIdString
    );

  /*
    /places/abc
    直接进入 404。
  */
  if (
    !Number.isFinite(
      placeId
    )
  ) {
    notFound();
  }

  try {
    /*
      第一步：
      先拿 Place。

      因为 City 查询需要：
      place.city_id
    */
    const place =
      await getPlaceServer(
        placeId
      );

    /*
      第二步：
      City 和 Visits
      互不依赖，可以并行。
    */
    const [
      city,
      visits,
    ] =
      await Promise.all([
        getCityServer(
          place.city_id
        ),

        getPlaceVisitsServer(
          placeId
        ),
      ]);

    return (
      <PlacePageClient
        place={
          place
        }

        city={
          city
        }

        visits={
          visits
        }

        fromTripId={
          fromTripId ??
          null
        }
      />
    );
  } catch (error) {
    /*
      Place 不存在，
      或者它依赖的 City 不存在，
      都进入 404。
    */
    if (
      error instanceof
        ApiError &&
      error.status ===
        404
    ) {
      notFound();
    }

    /*
      网络失败 / 500
      交给 error.tsx。
    */
    throw error;
  }
}