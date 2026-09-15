"use client";

import dynamic from "next/dynamic";

import TripForm from "./TripForm";
import VisitForm from "./VisitForm";
import BudgetSummary from "./BudgetSummary";
import ExpenseBreakdown from "./ExpenseBreakdown";
import TripOverviewCards from "./TripOverviewCards";
import ImageUploader from "./ImageUploader";

import type {
  Place,
  Trip,
  TripVisit,
  TripSummary,
  ExpenseBreakdown as ExpenseBreakdownType,
  PlaceSearchResult,
  UpdateTripInput,
  CreateVisitInput,
  VisitMoveDirection,
  CreateVisitWithPlaceInput,
  UpdateVisitInput,
  TripOverview,
} from "../types/travel";

import {
  categoryLabels,
  travelStyleLabels,
} from "../lib/constants";
import {
  getImageUrl,
} from "../lib/imageUrl";

const TravelMap = dynamic(
  () => import("./TravelMap"),
  {
    ssr: false,
  }
);

type TripDetailProps = {
  trip: Trip;

  cityName: string;

  places: Place[];

  tripVisits: TripVisit[];

  summary: TripSummary | null;

  breakdown: ExpenseBreakdownType | null;

  actionError: string | null;

  showEditForm: boolean;

  showVisitForm: boolean;

  editingVisit: TripVisit | null;

  editingTrip: boolean;

  creatingVisit: boolean;

  updatingVisit: boolean;

  deletingTrip: boolean;

  deletingVisitId: number | null;

  movingVisitId:
  number | null;

  movingDayVisitId:
  number | null;

  overview: TripOverview;

  onUpdateVisitPhoto: (
    visit: TripVisit,
    url: string
  ) => Promise<void>;

  onUpdateCoverImage: (
    url: string
  ) => Promise<void>;

  onMoveVisitToDay: (
    visit: TripVisit,
    targetDay: number
  ) => void;

  onMoveVisit: (
    visit: TripVisit,
    direction: VisitMoveDirection
  ) => void;

  onBack: () => void;

  onOpenPlace: (
    place: Place
  ) => void;

  onOpenEdit: () => void;

  onCancelEdit: () => void;

  onUpdateTrip: (
    data: UpdateTripInput
  ) => Promise<void>;

  onDeleteTrip: () => void;

  onOpenVisitForm: () => void;

  onCancelVisitForm: () => void;

  onSearchPlaces: (
    query: string
  ) => Promise<
    PlaceSearchResult[]
  >;

  onCreateExistingVisit: (
    data: CreateVisitInput
  ) => Promise<void>;

  onCreateNewVisit: (
    data: CreateVisitWithPlaceInput
  ) => Promise<void>;

  onEditVisit: (
    visit: TripVisit
  ) => void;

  onCancelEditVisit: () => void;

  onUpdateVisit: (
    data: UpdateVisitInput
  ) => Promise<void>;

  onDeleteVisit: (
    visit: TripVisit
  ) => void;
};

export default function TripDetail({
  trip,
  cityName,
  places,
  tripVisits,
  summary,
  breakdown,
  actionError,
  showEditForm,
  showVisitForm,
  editingVisit,
  movingVisitId,
  movingDayVisitId,
  editingTrip,
  creatingVisit,
  updatingVisit,
  deletingTrip,
  deletingVisitId,
  overview,
  onUpdateVisitPhoto,
  onUpdateCoverImage,
  onBack,
  onOpenPlace,
  onOpenEdit,
  onCancelEdit,
  onUpdateTrip,
  onDeleteTrip,
  onMoveVisit,
  onMoveVisitToDay,
  onOpenVisitForm,
  onCancelVisitForm,
  onSearchPlaces,
  onCreateExistingVisit,
  onCreateNewVisit,
  onEditVisit,
  onCancelEditVisit,
  onUpdateVisit,
  onDeleteVisit,
}: TripDetailProps) {
  /*
  =========================
  Group Visits By Day
  =========================
  */

  const dayNumbers = Array.from(
    new Set(
      tripVisits.map(
        (visit) =>
          visit.day_number ?? 1
      )
    )
  ).sort(
    (a, b) => a - b
  );

  const maxDay =
    dayNumbers.length > 0
      ? Math.max(
        ...dayNumbers
      )
      : 1;

  /*
  =========================
  Places Used By Trip
  =========================
  */

  const tripPlaces = Array.from(
    new Map(
      tripVisits.map(
        (visit) => [
          visit.place.id,
          visit.place,
        ]
      )
    ).values()
  );

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
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← 返回 {cityName}
        </button>

        {/*
        =========================
        Header
        =========================
        */}
        <ImageUploader
          showPreview={false}
          currentUrl={
            trip.cover_image_url
          }
          label={
            trip.cover_image_url
              ? "更换封面"
              : "上传封面"
          }
          onUploaded={
            onUpdateCoverImage
          }
        />

        <section className="mt-8">
          <p className="text-sm font-medium text-gray-400">
            Overview
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            旅行概览
          </h2>

          <div className="mt-5">
            <TripOverviewCards
              overview={overview}
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
          {trip.cover_image_url && (
            <img
              src={
                getImageUrl(
                  trip.cover_image_url
                ) ?? ""
              }
              alt={trip.title}
              className="mb-8 h-72 w-full rounded-2xl object-cover"
            />
          )}
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Trip · {cityName}
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {trip.title}
              </h1>

              {(trip.start_date ||
                trip.end_date) && (
                  <p className="mt-3 text-gray-500">
                    {trip.start_date ??
                      "未设置日期"}

                    {" → "}

                    {trip.end_date ??
                      "未设置日期"}
                  </p>
                )}

              {trip.travel_style && (
                <p className="mt-2 text-sm text-gray-500">
                  旅行类型：
                  {travelStyleLabels[
                    trip.travel_style
                  ] ??
                    trip.travel_style}
                </p>
              )}

              {trip.description && (
                <p className="mt-5 max-w-3xl leading-7 text-gray-600">
                  {trip.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onOpenVisitForm}
                className="rounded-xl bg-black px-4 py-2 text-white"
              >
                + 添加地点
              </button>

              <button
                type="button"
                onClick={onOpenEdit}
                className="rounded-xl border px-4 py-2 hover:bg-gray-50"
              >
                编辑旅行
              </button>

              <button
                type="button"
                onClick={onDeleteTrip}
                disabled={deletingTrip}
                className="rounded-xl border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingTrip
                  ? "删除中..."
                  : "删除旅行"}
              </button>
            </div>
          </div>
        </section>

        {/*
        =========================
        Action Error
        =========================
        */}

        {actionError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/*
        =========================
        Trip Edit Form
        =========================
        */}

        {showEditForm && (
          <div className="mt-6">
            <TripForm
              mode="edit"
              cityId={trip.city_id}
              initialTrip={trip}
              submitting={editingTrip}
              onUpdate={onUpdateTrip}
              onCancel={onCancelEdit}
            />
          </div>
        )}

        {/*
        =========================
        Create Visit Form
        =========================
        */}

        {showVisitForm && (
          <div className="mt-6">
            <VisitForm
              mode="create"
              tripId={trip.id}
              cityName={cityName}
              places={places}
              submitting={creatingVisit}
              onSearchPlaces={onSearchPlaces}
              onCreateExisting={
                onCreateExistingVisit
              }
              onCreateNew={
                onCreateNewVisit
              }
              onCancel={
                onCancelVisitForm
              }
            />
          </div>
        )}

        {/*
        =========================
        Statistics
        =========================
        */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {summary && (
            <BudgetSummary
              summary={summary}
            />
          )}

          {breakdown && (
            <ExpenseBreakdown
              breakdown={breakdown}
            />
          )}
        </div>

        {/*
        =========================
        Route
        =========================
        */}

        <section className="mt-10">
          <div>
            <p className="text-sm font-medium text-gray-400">
              Itinerary
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              行程路线
            </h2>
          </div>

          {tripVisits.length === 0 ? (
            <div className="mt-6 rounded-3xl border bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                这个 Trip 暂时还没有旅行记录。
              </p>

              <button
                type="button"
                onClick={
                  onOpenVisitForm
                }
                className="mt-5 rounded-xl bg-black px-5 py-2.5 text-white"
              >
                添加第一个地点
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {dayNumbers.map(
                (dayNumber) => {
                  const visits =
                    tripVisits
                      .filter(
                        (visit) =>
                          (
                            visit.day_number ??
                            1
                          ) ===
                          dayNumber
                      )
                      .sort(
                        (a, b) =>
                          (
                            a.order_index ??
                            999
                          ) -
                          (
                            b.order_index ??
                            999
                          )
                      );

                  const movingThisDay =
                    visits.some(
                      (item) =>
                        item.id ===
                        movingVisitId
                    );
                  return (
                    <section
                      key={
                        dayNumber
                      }
                    >
                      <h3 className="text-xl font-bold">
                        Day {dayNumber}
                      </h3>

                      <div className="mt-4 space-y-4">
                        {visits.map(
                          (visit) => (
                            <article
                              key={
                                visit.id
                              }
                              className="rounded-2xl border bg-white p-5 shadow-sm"
                            >
                              {/*
                              =========================
                              Visit Header
                              =========================
                              */}

                              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenPlace(
                                      visit.place
                                    )
                                  }
                                  className="text-left"
                                >
                                  <p className="text-xs font-medium text-gray-400">
                                    Stop{" "}
                                    {visit.order_index ??
                                      "-"}
                                  </p>

                                  <h4 className="mt-1 text-xl font-bold hover:underline">
                                    {
                                      visit.place
                                        .name
                                    }
                                  </h4>

                                  <p className="mt-1 text-sm text-gray-500">
                                    {visit.place
                                      .category ??
                                      "未分类"}
                                  </p>
                                </button>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onMoveVisit(
                                        visit,
                                        "up"
                                      )
                                    }
                                    disabled={
                                      movingThisDay ||
                                      visits[0]?.id ===
                                      visit.id
                                    }
                                    title="向上移动"
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    ↑
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onMoveVisit(
                                        visit,
                                        "down"
                                      )
                                    }
                                    disabled={
                                      movingThisDay ||
                                      visits[
                                        visits.length - 1
                                      ]?.id ===
                                      visit.id
                                    }
                                    title="向下移动"
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    ↓
                                  </button>

                                  <select
                                    value={
                                      visit.day_number ??
                                      1
                                    }
                                    disabled={
                                      movingDayVisitId ===
                                      visit.id
                                    }
                                    onChange={(event) => {
                                      const targetDay =
                                        Number(
                                          event.target.value
                                        );

                                      onMoveVisitToDay(
                                        visit,
                                        targetDay
                                      );
                                    }}
                                    className="rounded-lg border px-2 py-1.5 text-sm disabled:opacity-50"
                                  >
                                    {Array.from(
                                      {
                                        length:
                                          maxDay,
                                      },
                                      (
                                        _,
                                        index
                                      ) => {
                                        const day =
                                          index + 1;

                                        return (
                                          <option
                                            key={day}
                                            value={day}
                                          >
                                            Day {day}
                                          </option>
                                        );
                                      }
                                    )}

                                    <option
                                      value={
                                        maxDay + 1
                                      }
                                    >
                                      + 新建 Day{" "}
                                      {maxDay + 1}
                                    </option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onEditVisit(
                                        visit
                                      )
                                    }
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                                  >
                                    {editingVisit?.id ===
                                      visit.id
                                      ? "正在编辑"
                                      : "编辑"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onDeleteVisit(
                                        visit
                                      )
                                    }
                                    disabled={
                                      deletingVisitId ===
                                      visit.id
                                    }
                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingVisitId ===
                                      visit.id
                                      ? "删除中..."
                                      : "删除"}
                                  </button>
                                </div>
                              </div>

                              {/*
                              =========================
                              Visit Metadata
                              =========================
                              */}

                              <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                                {visit.visited_at && (
                                  <div>
                                    <p className="text-xs text-gray-400">
                                      日期
                                    </p>

                                    <p className="mt-1">
                                      {
                                        visit.visited_at
                                      }
                                    </p>
                                  </div>
                                )}

                                {visit.duration && (
                                  <div>
                                    <p className="text-xs text-gray-400">
                                      停留
                                    </p>

                                    <p className="mt-1">
                                      {
                                        visit.duration
                                      }
                                    </p>
                                  </div>
                                )}

                                {visit.rating !==
                                  null && (
                                    <div>
                                      <p className="text-xs text-gray-400">
                                        评分
                                      </p>

                                      <p className="mt-1">
                                        ⭐{" "}
                                        {
                                          visit.rating
                                        }
                                        /5
                                      </p>
                                    </div>
                                  )}

                                {visit.cost !==
                                  null && (
                                    <div>
                                      <p className="text-xs text-gray-400">
                                        花费
                                      </p>

                                      <p className="mt-1">
                                        ¥
                                        {
                                          visit.cost
                                        }

                                        {visit.expense_category && (
                                          <span className="ml-2 text-gray-400">
                                            {categoryLabels[
                                              visit
                                                .expense_category
                                            ] ??
                                              visit
                                                .expense_category}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  )}
                              </div>

                              {/*
                              =========================
                              Recommendation
                              =========================
                              */}

                              {visit.recommended !==
                                null && (
                                  <p className="mt-4 text-sm">
                                    {visit.recommended
                                      ? "👍 推荐"
                                      : "不特别推荐"}
                                  </p>
                                )}

                              {/*
                              =========================
                              Note
                              =========================
                              */}

                              {visit.note && (
                                <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                                  {
                                    visit.note
                                  }
                                </p>
                              )}
                              <div className="mt-5">
                                <ImageUploader
                                  showPreview={false}
                                  currentUrl={
                                    visit.photo_url
                                  }
                                  label={
                                    visit.photo_url
                                      ? "更换照片"
                                      : "添加照片"
                                  }
                                  onUploaded={(
                                    url
                                  ) =>
                                    onUpdateVisitPhoto(
                                      visit,
                                      url
                                    )
                                  }
                                />
                              </div>

                              {/*
                              =========================
                              Photo
                              =========================
                              */}

                              {visit.photo_url && (
                                <img
                                  src={
                                    getImageUrl(
                                      visit.photo_url
                                    ) ?? ""
                                  }
                                  alt={
                                    visit.place.name
                                  }
                                  className="mt-4 max-h-80 w-full rounded-xl object-cover"
                                />
                              )}

                              {/*
                              =========================
                              Inline Visit Edit Form
                              =========================
                              */}

                              {editingVisit?.id ===
                                visit.id && (
                                  <div className="mt-6 border-t pt-6">
                                    <VisitForm
                                      mode="edit"
                                      tripId={
                                        trip.id
                                      }
                                      cityName={
                                        cityName
                                      }
                                      places={
                                        places
                                      }
                                      initialVisit={
                                        editingVisit
                                      }
                                      submitting={
                                        updatingVisit
                                      }
                                      onUpdate={
                                        onUpdateVisit
                                      }
                                      onCancel={
                                        onCancelEditVisit
                                      }
                                    />
                                  </div>
                                )}
                            </article>
                          )
                        )}
                      </div>
                    </section>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/*
        =========================
        Map
        =========================
        */}

        <section className="mt-12">
          <p className="text-sm font-medium text-gray-400">
            Map
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            路线地图
          </h2>

          <div className="mt-6">
            <TravelMap
              places={tripPlaces}
              onPlaceClick={onOpenPlace}
            />
          </div>
        </section>

      </div>
    </main>
  );
}
