"use client";

import { getImageUrl } from "../lib/imageUrl";

import type {
  Place,
  Visit,
} from "../types/travel";

import {
  categoryLabels,
} from "../lib/constants";

type PlaceDetailProps = {
  place: Place;

  cityName?: string;

  visits: Visit[];



  onBack: () => void;
};

export default function PlaceDetail({
  place,
  cityName,
  visits,

  onBack,
}: PlaceDetailProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={onBack}
          className="mb-6 text-sm font-medium text-gray-500 hover:text-black"
        >
          ← 返回
        </button>



        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            {cityName ??
              "地点详情"}
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {place.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
            {place.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {place.category}
              </span>
            )}

            <span>
              纬度{" "}
              {place.latitude}
            </span>

            <span>
              经度{" "}
              {place.longitude}
            </span>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-bold">
            旅行记录
          </h2>





          <div className="space-y-5">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                {visit.photo_url && (
                  <img
                    src={
                      getImageUrl(visit.photo_url) ?? ""
                    }
                    alt="旅行照片"
                    className="mb-5 h-64 w-full rounded-xl object-cover"
                  />
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {visit.visited_at && (
                    <span>
                      📅{" "}
                      {
                        visit.visited_at
                      }
                    </span>
                  )}

                  {visit.duration && (
                    <span>
                      ⏱{" "}
                      {
                        visit.duration
                      }
                    </span>
                  )}

                  {visit.rating !==
                    null && (
                      <span>
                        ⭐{" "}
                        {
                          visit.rating
                        }
                      </span>
                    )}

                  {visit.cost !==
                    null && (
                      <span>
                        ¥
                        {
                          visit.cost
                        }
                      </span>
                    )}

                  {visit.expense_category && (
                    <span>
                      {categoryLabels[
                        visit.expense_category
                      ] ??
                        visit.expense_category}
                    </span>
                  )}

                  {visit.recommended ===
                    true && (
                      <span>
                        👍 推荐
                      </span>
                    )}

                  {visit.recommended ===
                    false && (
                      <span>
                        🤷 不推荐
                      </span>
                    )}
                </div>

                {visit.note && (
                  <p className="mt-4 leading-7 text-gray-700">
                    {visit.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
