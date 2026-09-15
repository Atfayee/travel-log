"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  Place,
  TripVisit,
  PlaceSearchResult,
  CreateVisitInput,
  CreateVisitWithPlaceInput,
  UpdateVisitInput,
} from "../types/travel";

type VisitFormMode =
  | "create"
  | "edit";

type PlaceMode =
  | "existing"
  | "new";

type VisitFormProps = {
  mode: VisitFormMode;

  tripId: number;

  cityName: string;

  places: Place[];

  initialVisit?:
    TripVisit | null;

  submitting?: boolean;

  onSearchPlaces?: (
    query: string
  ) => Promise<
    PlaceSearchResult[]
  >;

  onCreateExisting?: (
    data:
      CreateVisitInput
  ) => Promise<void> | void;

  onCreateNew?: (
    data:
      CreateVisitWithPlaceInput
  ) => Promise<void> | void;

  onUpdate?: (
    data:
      UpdateVisitInput
  ) => Promise<void> | void;

  onCancel:
    () => void;
};

export default function VisitForm({
  mode,
  tripId,
  cityName,
  places,
  initialVisit =
    null,
  submitting =
    false,
  onSearchPlaces,
  onCreateExisting,
  onCreateNew,
  onUpdate,
  onCancel,
}: VisitFormProps) {
  const isEdit =
    mode === "edit";

  /*
  =========================
  Place State
  =========================
  */

  const [
    placeMode,
    setPlaceMode,
  ] =
    useState<PlaceMode>(
      places.length > 0
        ? "existing"
        : "new"
    );

  const [
    selectedPlaceId,
    setSelectedPlaceId,
  ] =
    useState<string>(
      places.length > 0
        ? String(
            places[0].id
          )
        : ""
    );

  /*
  =========================
  New Place State
  =========================
  */

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");

  const [
    searchResults,
    setSearchResults,
  ] =
    useState<
      PlaceSearchResult[]
    >([]);

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    searchError,
    setSearchError,
  ] =
    useState<string | null>(
      null
    );

  const [
    newPlaceName,
    setNewPlaceName,
  ] =
    useState("");

  const [
    newPlaceCategory,
    setNewPlaceCategory,
  ] =
    useState("");

  const [
    newLatitude,
    setNewLatitude,
  ] =
    useState<
      number | null
    >(null);

  const [
    newLongitude,
    setNewLongitude,
  ] =
    useState<
      number | null
    >(null);

  /*
  =========================
  Visit State
  =========================
  */

  const [
    dayNumber,
    setDayNumber,
  ] =
    useState(
      initialVisit
        ?.day_number
        ?.toString() ??
        "1"
    );

  const [
    orderIndex,
    setOrderIndex,
  ] =
    useState(
      initialVisit
        ?.order_index
        ?.toString() ??
        "1"
    );

  const [
    cost,
    setCost,
  ] =
    useState(
      initialVisit
        ?.cost
        ?.toString() ??
        ""
    );

  const [
    expenseCategory,
    setExpenseCategory,
  ] =
    useState(
      initialVisit
        ?.expense_category ??
        ""
    );

  const [
    rating,
    setRating,
  ] =
    useState(
      initialVisit
        ?.rating
        ?.toString() ??
        ""
    );

  const [
    note,
    setNote,
  ] =
    useState(
      initialVisit
        ?.note ??
        ""
    );

  const [
    visitedAt,
    setVisitedAt,
  ] =
    useState(
      initialVisit
        ?.visited_at ??
        ""
    );

  const [
    duration,
    setDuration,
  ] =
    useState(
      initialVisit
        ?.duration ??
        ""
    );

  const [
    recommended,
    setRecommended,
  ] =
    useState(
      initialVisit
        ?.recommended ??
        false
    );

  const [
    formError,
    setFormError,
  ] =
    useState<string | null>(
      null
    );

  /*
  =========================
  Sync Edit Visit
  =========================
  */

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialVisit
    ) {
      return;
    }

    setDayNumber(
      initialVisit
        .day_number
        ?.toString() ??
        "1"
    );

    setOrderIndex(
      initialVisit
        .order_index
        ?.toString() ??
        "1"
    );

    setCost(
      initialVisit
        .cost
        ?.toString() ??
        ""
    );

    setExpenseCategory(
      initialVisit
        .expense_category ??
        ""
    );

    setRating(
      initialVisit
        .rating
        ?.toString() ??
        ""
    );

    setNote(
      initialVisit.note ??
        ""
    );

    setVisitedAt(
      initialVisit
        .visited_at ??
        ""
    );

    setDuration(
      initialVisit
        .duration ??
        ""
    );

    setRecommended(
      initialVisit
        .recommended ??
        false
    );

    setFormError(null);
  }, [
    mode,
    initialVisit,
  ]);

  /*
  =========================
  Search Place
  =========================
  */

  async function handleSearch() {
    if (
      !onSearchPlaces
    ) {
      return;
    }

    const query =
      searchQuery.trim();

    if (!query) {
      setSearchError(
        "请输入地点名称。"
      );

      return;
    }

    try {
      setSearching(true);

      setSearchError(
        null
      );

      const results =
        await onSearchPlaces(
          query
        );

      setSearchResults(
        results
      );

      if (
        results.length ===
        0
      ) {
        setSearchError(
          "没有找到匹配地点。"
        );
      }
    } catch (err) {
      console.error(err);

      setSearchError(
        "地点搜索失败，请稍后重试。"
      );
    } finally {
      setSearching(false);
    }
  }

  function handleSelectSearchResult(
    result:
      PlaceSearchResult
  ) {
    setNewPlaceName(
      result.name
    );

    setNewPlaceCategory(
      result.category ??
        ""
    );

    setNewLatitude(
      result.latitude
    );

    setNewLongitude(
      result.longitude
    );

    setSearchResults([]);
  }

  /*
  =========================
  Submit
  =========================
  */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError(
      null
    );

    const parsedDay =
      Number(dayNumber);

    const parsedOrder =
      Number(orderIndex);

    if (
      !Number.isFinite(
        parsedDay
      ) ||
      parsedDay < 1
    ) {
      setFormError(
        "Day 必须大于等于 1。"
      );

      return;
    }

    if (
      !Number.isFinite(
        parsedOrder
      ) ||
      parsedOrder < 1
    ) {
      setFormError(
        "顺序必须大于等于 1。"
      );

      return;
    }

    /*
    =========================
    Edit
    =========================
    */

    if (
      mode === "edit"
    ) {
      if (!onUpdate) {
        setFormError(
          "缺少更新函数。"
        );

        return;
      }

      const payload:
        UpdateVisitInput =
      {
        day_number:
          parsedDay,

        order_index:
          parsedOrder,

        cost:
          cost === ""
            ? null
            : Number(
                cost
              ),

        expense_category:
          expenseCategory ===
          ""
            ? null
            : expenseCategory,

        rating:
          rating === ""
            ? null
            : Number(
                rating
              ),

        note:
          note.trim() ===
          ""
            ? null
            : note.trim(),

        visited_at:
          visitedAt ===
          ""
            ? null
            : visitedAt,

        duration:
          duration.trim() ===
          ""
            ? null
            : duration.trim(),

        recommended,

        photo_url:
          initialVisit
            ?.photo_url ??
          null,
      };

      await onUpdate(
        payload
      );

      return;
    }

    /*
    =========================
    Create - Existing Place
    =========================
    */

    if (
      placeMode ===
      "existing"
    ) {
      if (
        !onCreateExisting
      ) {
        setFormError(
          "缺少创建函数。"
        );

        return;
      }

      const placeId =
        Number(
          selectedPlaceId
        );

      if (
        !Number.isFinite(
          placeId
        )
      ) {
        setFormError(
          "请选择一个地点。"
        );

        return;
      }

      const payload:
        CreateVisitInput =
      {
        place_id:
          placeId,

        trip_id:
          tripId,

        day_number:
          parsedDay,

        order_index:
          parsedOrder,

        cost:
          cost === ""
            ? null
            : Number(
                cost
              ),

        expense_category:
          expenseCategory ===
          ""
            ? null
            : expenseCategory,

        rating:
          rating === ""
            ? null
            : Number(
                rating
              ),

        note:
          note.trim() ===
          ""
            ? null
            : note.trim(),

        visited_at:
          visitedAt ===
          ""
            ? null
            : visitedAt,

        duration:
          duration.trim() ===
          ""
            ? null
            : duration.trim(),

        recommended,

        photo_url:
          null,
      };

      await onCreateExisting(
        payload
      );

      return;
    }

    /*
    =========================
    Create - New Place
    =========================
    */

    if (!onCreateNew) {
      setFormError(
        "缺少创建函数。"
      );

      return;
    }

    if (
      !newPlaceName.trim()
    ) {
      setFormError(
        "请选择或搜索一个地点。"
      );

      return;
    }

    if (
      newLatitude ===
        null ||
      newLongitude ===
        null
    ) {
      setFormError(
        "请通过地点搜索选择一个有效地点。"
      );

      return;
    }

    const payload:
      CreateVisitWithPlaceInput =
    {
      name:
        newPlaceName.trim(),

      latitude:
        newLatitude,

      longitude:
        newLongitude,

      category:
        newPlaceCategory.trim() ===
        ""
          ? null
          : newPlaceCategory.trim(),

      day_number:
        parsedDay,

      order_index:
        parsedOrder,

      cost:
        cost === ""
          ? null
          : Number(
              cost
            ),

      expense_category:
        expenseCategory ===
        ""
          ? null
          : expenseCategory,

      rating:
        rating === ""
          ? null
          : Number(
              rating
            ),

      note:
        note.trim() === ""
          ? null
          : note.trim(),

      visited_at:
        visitedAt === ""
          ? null
          : visitedAt,

      duration:
        duration.trim() ===
        ""
          ? null
          : duration.trim(),

      recommended,

      photo_url:
        null,
    };

    await onCreateNew(
      payload
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-3xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400">
            {isEdit
              ? "Edit Visit"
              : "Add Visit"}
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {isEdit
              ? "编辑旅行记录"
              : "添加旅行记录"}
          </h2>
        </div>

        <button
          type="button"
          onClick={
            onCancel
          }
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
      </div>

      {formError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/*
      =========================
      Edit Place
      =========================
      */}

      {isEdit &&
        initialVisit && (
          <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
            <p className="text-xs text-gray-400">
              地点
            </p>

            <p className="mt-1 font-semibold">
              {
                initialVisit
                  .place
                  .name
              }
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {
                initialVisit
                  .place
                  .category ??
                "未分类"
              }
            </p>
          </div>
        )}

      {/*
      =========================
      Create Place
      =========================
      */}

      {!isEdit && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold">
            地点
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                places.length ===
                0
              }
              onClick={() =>
                setPlaceMode(
                  "existing"
                )
              }
              className={`rounded-xl border px-4 py-2 text-sm ${
                placeMode ===
                "existing"
                  ? "bg-black text-white"
                  : "bg-white"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              已有地点
            </button>

            <button
              type="button"
              onClick={() =>
                setPlaceMode(
                  "new"
                )
              }
              className={`rounded-xl border px-4 py-2 text-sm ${
                placeMode ===
                "new"
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              新地点
            </button>
          </div>

          {placeMode ===
            "existing" && (
            <div className="mt-4">
              {places.length ===
              0 ? (
                <p className="text-sm text-gray-500">
                  当前城市还没有地点，请创建新地点。
                </p>
              ) : (
                <select
                  value={
                    selectedPlaceId
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedPlaceId(
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full rounded-xl border px-3 py-2"
                >
                  {places.map(
                    (
                      place
                    ) => (
                      <option
                        key={
                          place.id
                        }
                        value={
                          place.id
                        }
                      >
                        {
                          place.name
                        }
                      </option>
                    )
                  )}
                </select>
              )}
            </div>
          )}

          {placeMode ===
            "new" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">
                  搜索地点
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    value={
                      searchQuery
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchQuery(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={`例如：外滩，${cityName}`}
                    className="flex-1 rounded-xl border px-3 py-2"
                  />

                  <button
                    type="button"
                    disabled={
                      searching
                    }
                    onClick={
                      handleSearch
                    }
                    className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
                  >
                    {searching
                      ? "搜索中..."
                      : "搜索"}
                  </button>
                </div>

                {searchError && (
                  <p className="mt-2 text-sm text-red-600">
                    {
                      searchError
                    }
                  </p>
                )}
              </div>

              {searchResults.length >
                0 && (
                <div className="overflow-hidden rounded-xl border">
                  {searchResults.map(
                    (
                      result,
                      index
                    ) => (
                      <button
                        key={`${result.latitude}-${result.longitude}-${index}`}
                        type="button"
                        onClick={() =>
                          handleSelectSearchResult(
                            result
                          )
                        }
                        className="block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                      >
                        <p className="font-medium">
                          {
                            result.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            result.display_name
                          }
                        </p>
                      </button>
                    )
                  )}
                </div>
              )}

              {newPlaceName && (
                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="font-medium">
                    {
                      newPlaceName
                    }
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {newLatitude},
                    {" "}
                    {newLongitude}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/*
      =========================
      Visit Fields
      =========================
      */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Day
          </label>

          <input
            type="number"
            min="1"
            value={
              dayNumber
            }
            onChange={(
              event
            ) =>
              setDayNumber(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            顺序
          </label>

          <input
            type="number"
            min="1"
            value={
              orderIndex
            }
            onChange={(
              event
            ) =>
              setOrderIndex(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            花费
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(
              event
            ) =>
              setCost(
                event
                  .target
                  .value
              )
            }
            placeholder="0"
            className="mt-2 w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            花费分类
          </label>

          <select
            value={
              expenseCategory
            }
            onChange={(
              event
            ) =>
              setExpenseCategory(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border px-3 py-2"
          >
            <option value="">
              未分类
            </option>

            <option value="transport">
              交通
            </option>

            <option value="food">
              餐饮
            </option>

            <option value="hotel">
              住宿
            </option>

            <option value="ticket">
              门票
            </option>

            <option value="coffee">
              咖啡
            </option>

            <option value="other">
              其他
            </option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            评分
          </label>

          <select
            value={
              rating
            }
            onChange={(
              event
            ) =>
              setRating(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border px-3 py-2"
          >
            <option value="">
              未评分
            </option>

            <option value="1">
              1
            </option>

            <option value="2">
              2
            </option>

            <option value="3">
              3
            </option>

            <option value="4">
              4
            </option>

            <option value="5">
              5
            </option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            日期
          </label>

          <input
            type="date"
            value={
              visitedAt
            }
            onChange={(
              event
            ) =>
              setVisitedAt(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            停留时间
          </label>

          <input
            value={
              duration
            }
            onChange={(
              event
            ) =>
              setDuration(
                event
                  .target
                  .value
              )
            }
            placeholder="例如：2小时"
            className="mt-2 w-full rounded-xl border px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium">
          备注
        </label>

        <textarea
          value={note}
          onChange={(
            event
          ) =>
            setNote(
              event
                .target
                .value
            )
          }
          rows={4}
          placeholder="记录一下这个地方..."
          className="mt-2 w-full rounded-xl border px-3 py-2"
        />
      </div>

      <label className="mt-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={
            recommended
          }
          onChange={(
            event
          ) =>
            setRecommended(
              event
                .target
                .checked
            )
          }
        />

        <span className="text-sm">
          推荐这个地点
        </span>
      </label>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={
            onCancel
          }
          className="rounded-xl border px-5 py-2.5 hover:bg-gray-50"
        >
          取消
        </button>

        <button
          type="submit"
          disabled={
            submitting
          }
          className="rounded-xl bg-black px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "保存中..."
            : isEdit
              ? "保存修改"
              : "添加记录"}
        </button>
      </div>
    </form>
  );
}