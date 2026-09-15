"use client";

import dynamic from "next/dynamic";

import TripForm from "./TripForm";
import TripCard from "./TripCard";
import SearchFilters from "./SearchFilters";

import type {
  City,
  Place,
  TripCard as TripCardType,
  CreateTripInput,
  CityTripFilters,
} from "../types/travel";

/*
TravelMap 用 Leaflet。

Leaflet 依赖浏览器环境，
所以关闭 SSR。
*/

const TravelMap =
  dynamic(
    () =>
      import(
        "./TravelMap"
      ),
    {
      ssr: false,
    }
  );

type CityDetailProps = {
  city: City;

  places: Place[];

  trips:
  TripCardType[];

  actionError:
  string | null;

  showCreateForm:
  boolean;

  creatingTrip:
  boolean;

  initialFilters:
  CityTripFilters;

  onBack:
  () => void;

  onOpenTrip: (
    trip: TripCardType
  ) => void;

  onOpenPlace: (place: Place) => void;

  onOpenCreateTrip:
  () => void;

  onCancelCreateTrip:
  () => void;

  onCreateTrip: (
    data: CreateTripInput
  ) => Promise<void>;
};

export default function CityDetail({
  city,
  places,
  trips,
  actionError,
  showCreateForm,
  creatingTrip,
  initialFilters,
  onBack,
  onOpenTrip,
  onOpenPlace,
  onOpenCreateTrip,
  onCancelCreateTrip,
  onCreateTrip,
}: CityDetailProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/*
        =========================
        Back
        =========================
        */}

        <button
          type="button"
          onClick={
            onBack
          }
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← 返回首页
        </button>

        {/*
        =========================
        City Header
        =========================
        */}

        <section className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-gray-400">
                City
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {
                  city.name
                }
              </h1>

              {city.country && (
                <p className="mt-2 text-gray-500">
                  {
                    city.country
                  }
                </p>
              )}

              <p className="mt-5 text-sm text-gray-500">
                {
                  trips.length
                }{" "}
                个旅行记录

                {" · "}

                {
                  places.length
                }{" "}
                个地点
              </p>
            </div>

            <button
              type="button"
              onClick={
                onOpenCreateTrip
              }
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + 新建旅行
            </button>
          </div>
        </section>

        <section className="mt-8">
          <SearchFilters
            initialFilters={
              initialFilters
            }
          />
        </section>

        {/*
        =========================
        Action Error
        =========================
        */}

        {actionError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {
              actionError
            }
          </div>
        )}

        {/*
        =========================
        Create Trip Form
        =========================
        */}

        {showCreateForm && (
          <section className="mt-6">
            <TripForm
              mode="create"
              cityId={
                city.id
              }
              submitting={
                creatingTrip
              }
              onCreate={
                onCreateTrip
              }
              onCancel={
                onCancelCreateTrip
              }
            />
          </section>
        )}

        {/*
        =========================
        Trips
        =========================
        */}

        <section className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Trips
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                旅行记录
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                找到 {trips.length} 个结果
              </p>
            </div>

            {trips.length >
              0 && (
                <p className="text-sm text-gray-400">
                  {
                    trips.length
                  }{" "}
                  Trips
                </p>
              )}
          </div>

          {trips.length ===
            0 ? (
            <div className="mt-6 rounded-3xl border bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">
                这个城市还没有旅行记录。
              </p>

              <button
                type="button"
                onClick={
                  onOpenCreateTrip
                }
                className="mt-5 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                创建第一个 Trip
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {trips.map(
                (
                  trip
                ) => (
                  <TripCard
                    key={
                      trip.id
                    }
                    trip={
                      trip
                    }
                    onClick={() =>
                      onOpenTrip(
                        trip
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/*
        =========================
        Places
        =========================
        */}

        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Places
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                去过的地点
              </h2>
            </div>

            <p className="text-sm text-gray-400">
              {
                places.length
              }{" "}
              个地点
            </p>
          </div>

          {places.length ===
            0 ? (
            <div className="mt-6 rounded-3xl border bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                暂时还没有地点记录。
              </p>

              <p className="mt-2 text-sm text-gray-400">
                创建 Trip
                后，可以在 Trip
                页面添加地点。
              </p>
            </div>
          ) : (
            <>
              {/*
              =========================
              Place Cards
              =========================
              */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {places.map(
                  (
                    place
                  ) => (
                    <div
                      key={
                        place.id
                      }
                      className="rounded-2xl border bg-white p-5 shadow-sm"
                    >
                      <p className="text-xs font-medium text-gray-400">
                        {
                          place.category ??
                          "Place"
                        }
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {
                          place.name
                        }
                      </h3>

                      <p className="mt-3 text-xs text-gray-400">
                        {place.latitude.toFixed(
                          4
                        )}
                        ,{" "}
                        {place.longitude.toFixed(
                          4
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/*
              =========================
              Map
              =========================
              */}

              <div className="mt-10">
                <p className="text-sm font-medium text-gray-400">
                  Map
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  城市地图
                </h3>

                <div className="mt-5 overflow-hidden rounded-3xl border bg-white shadow-sm">
                  <TravelMap
                    onPlaceClick={onOpenPlace}
                    places={
                      places
                    }
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
