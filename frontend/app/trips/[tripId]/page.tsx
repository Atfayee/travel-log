import {
  notFound,
} from "next/navigation";

import TripPageClient from "../../../components/TripPageClient";

import {
  getTripServer,
  getCityServer,
  getCityPlacesServer,
  getTripVisitsServer,
  getTripSummaryServer,
  getExpenseBreakdownServer,
  getTripOverviewServer,
} from "../../../lib/server-api";

import {
  ApiError,
} from "../../../lib/errors";

type TripPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripPage({
  params,
}: TripPageProps) {
  /*
    新版本 Next.js App Router 中，
    params 可以是 Promise。

    所以：
  */

  const {
    tripId: tripIdString,
  } = await params;

  const tripId =
    Number(
      tripIdString
    );

  if (
    !Number.isFinite(
      tripId
    )
  ) {
    notFound();
  }

  try {
    /*
      第一步：
      必须先拿 Trip，
      因为我们需要 city_id。
    */

    const trip =
      await getTripServer(
        tripId
      );

    /*
      第二步：
      剩余数据没有互相依赖，
      所以并行请求。
    */

    const [
      city,
      places,
      tripVisits,
      summary,
      breakdown,
      overview,
    ] =
      await Promise.all([
        getCityServer(
          trip.city_id
        ),

        getCityPlacesServer(
          trip.city_id
        ),

        getTripVisitsServer(
          tripId
        ),

        getTripSummaryServer(
          tripId
        ),

        getExpenseBreakdownServer(
          tripId
        ),
        getTripOverviewServer(
          tripId
        ),
      ]);

    /*
      Server Component
      把初始数据传给 Client Component。
    */

    return (
      <TripPageClient
        initialTrip={trip}
        city={city}
        initialPlaces={places}
        initialTripVisits={tripVisits}
        initialSummary={summary}
        initialBreakdown={breakdown}
        initialOverview={overview}
      />
    );
  } catch (error) {
    /*
      Trip 不存在：
      真正进入 Next.js 404。
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
      其他错误不要吞掉。

      例如：
      FastAPI 挂了
      500
      网络异常

      直接 throw，
      交给 error.tsx。
    */

    throw error;
  }
}