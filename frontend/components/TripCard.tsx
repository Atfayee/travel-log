import type {
  TripCard as TripCardType,
} from "../types/travel";

import {
  getImageUrl,
} from "../lib/imageUrl";

import {
  travelStyleLabels,
} from "../lib/constants";

type TripCardProps = {
  trip:
    TripCardType;

  onClick:
    () => void;
};

export default function TripCard({
  trip,
  onClick,
}: TripCardProps) {
  const imageUrl =
    getImageUrl(
      trip.cover_image_url
    );

  const travelStyle =
    trip.travel_style
      ? (
          travelStyleLabels[
            trip.travel_style
          ] ??
          trip.travel_style
        )
      : null;

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="group w-full overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/*
      =========================
      Cover
      =========================
      */}

      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={
              imageUrl
            }
            alt={
              trip.title
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <p className="text-3xl">
                ✈️
              </p>

              <p className="mt-2 text-sm text-gray-400">
                暂无封面
              </p>
            </div>
          </div>
        )}

        {travelStyle && (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            {
              travelStyle
            }
          </div>
        )}
      </div>

      {/*
      =========================
      Body
      =========================
      */}

      <div className="p-5">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 transition group-hover:text-black">
          {
            trip.title
          }
        </h3>

        {/*
        Dates
        */}

        {(trip.start_date ||
          trip.end_date) && (
          <p className="mt-2 text-sm text-gray-500">
            {trip.start_date ??
              "未设置"}

            {" → "}

            {trip.end_date ??
              "未设置"}
          </p>
        )}

        {/*
        Description
        */}

        {trip.description && (
          <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-gray-500">
            {
              trip.description
            }
          </p>
        )}

        {/*
        Statistics
        */}

        <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
          <div>
            <p className="text-xs text-gray-400">
              天数
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {
                trip.day_count
              }
              <span className="ml-1 text-xs font-normal text-gray-400">
                天
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              地点
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {
                trip.place_count
              }
              <span className="ml-1 text-xs font-normal text-gray-400">
                个
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              花费
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              ¥
              {trip.total_cost.toFixed(
                0
              )}
            </p>
          </div>
        </div>

        {/*
        Budget
        */}

        {trip.budget !==
          null && (
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs">
            <span className="text-gray-400">
              预算
            </span>

            <span className="font-medium text-gray-600">
              ¥
              {trip.budget.toFixed(
                0
              )}
            </span>
          </div>
        )}

        {/*
        Open Indicator
        */}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            查看旅行
          </span>

          <span className="text-lg transition duration-200 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </button>
  );
}