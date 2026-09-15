"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import type {
  CityTripFilters,
} from "../types/travel";

type SearchFiltersProps = {
  initialFilters:
    CityTripFilters;
};

export default function SearchFilters({
  initialFilters,
}: SearchFiltersProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    query,
    setQuery,
  ] = useState(
    initialFilters.q
  );

  const [
    travelStyle,
    setTravelStyle,
  ] = useState(
    initialFilters
      .travelStyle
  );

  const [
    maxBudget,
    setMaxBudget,
  ] = useState(
    initialFilters
      .maxBudget
      ?.toString() ??
      ""
  );

  const [
    sort,
    setSort,
  ] = useState(
    initialFilters.sort
  );

  /*
  router navigation 后
  server props 会变化。

  同步表单。
  */

  useEffect(() => {
    setQuery(
      initialFilters.q
    );

    setTravelStyle(
      initialFilters
        .travelStyle
    );

    setMaxBudget(
      initialFilters
        .maxBudget
        ?.toString() ??
        ""
    );

    setSort(
      initialFilters.sort
    );
  }, [
    initialFilters,
  ]);

  function applyFilters() {
    const params =
      new URLSearchParams();

    if (
      query.trim()
    ) {
      params.set(
        "q",
        query.trim()
      );
    }

    if (
      travelStyle
    ) {
      params.set(
        "style",
        travelStyle
      );
    }

    if (
      maxBudget
    ) {
      params.set(
        "maxBudget",
        maxBudget
      );
    }

    if (
      sort !==
      "latest"
    ) {
      params.set(
        "sort",
        sort
      );
    }

    const queryString =
      params.toString();

    router.replace(
      queryString
        ? `${pathname}?${queryString}`
        : pathname
    );
  }

  function resetFilters() {
    setQuery("");
    setTravelStyle("");
    setMaxBudget("");
    setSort(
      "latest"
    );

    router.replace(
      pathname
    );
  }

  function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    applyFilters();
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-3xl border bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        {/*
        Search
        */}

        <div>
          <label className="text-xs font-medium text-gray-400">
            搜索
          </label>

          <input
            value={
              query
            }
            onChange={(
              event
            ) =>
              setQuery(
                event
                  .target
                  .value
              )
            }
            placeholder="Trip、地点、咖啡店..."
            className="mt-2 w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-black"
          />
        </div>

        {/*
        Travel Style
        */}

        <div>
          <label className="text-xs font-medium text-gray-400">
            旅行风格
          </label>

          <select
            value={
              travelStyle
            }
            onChange={(
              event
            ) =>
              setTravelStyle(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5"
          >
            <option value="">
              全部
            </option>

            <option value="budget">
              性价比
            </option>

            <option value="food">
              美食
            </option>

            <option value="city_walk">
              City Walk
            </option>

            <option value="relax">
              休闲
            </option>
          </select>
        </div>

        {/*
        Budget
        */}

        <div>
          <label className="text-xs font-medium text-gray-400">
            最高预算
          </label>

          <select
            value={
              maxBudget
            }
            onChange={(
              event
            ) =>
              setMaxBudget(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5"
          >
            <option value="">
              不限
            </option>

            <option value="300">
              ≤ ¥300
            </option>

            <option value="500">
              ≤ ¥500
            </option>

            <option value="1000">
              ≤ ¥1000
            </option>

            <option value="2000">
              ≤ ¥2000
            </option>
          </select>
        </div>

        {/*
        Sort
        */}

        <div>
          <label className="text-xs font-medium text-gray-400">
            排序
          </label>

          <select
            value={
              sort
            }
            onChange={(
              event
            ) =>
              setSort(
                event
                  .target
                  .value as
                  | "latest"
                  | "cost"
                  | "rating"
              )
            }
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5"
          >
            <option value="latest">
              最新
            </option>

            <option value="cost">
              花费最低
            </option>

            <option value="rating">
              评分最高
            </option>
          </select>
        </div>

        {/*
        Actions
        */}

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            搜索
          </button>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={
            resetFilters
          }
          className="text-sm text-gray-400 transition hover:text-black"
        >
          清除筛选
        </button>
      </div>
    </form>
  );
}