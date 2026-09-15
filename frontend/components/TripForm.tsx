"use client";

import { useEffect, useState } from "react";

import type {
  CreateTripInput,
  Trip,
  UpdateTripInput,
} from "../types/travel";

type TripFormMode =
  | "create"
  | "edit";

type TripFormProps = {
  mode: TripFormMode;

  cityId: number;

  initialTrip?: Trip | null;

  submitting?: boolean;

  onCancel: () => void;

  onCreate?: (
    data: CreateTripInput
  ) => Promise<void> | void;

  onUpdate?: (
    data: UpdateTripInput
  ) => Promise<void> | void;
};

export default function TripForm({
  mode,
  cityId,
  initialTrip = null,
  submitting = false,
  onCancel,
  onCreate,
  onUpdate,
}: TripFormProps) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    budget,
    setBudget,
  ] = useState("");

  const [
    travelStyle,
    setTravelStyle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState<
    string | null
  >(null);

  /*
    当 mode 或 initialTrip 改变时，
    自动初始化表单。
  */
  useEffect(() => {
    if (
      mode === "edit" &&
      initialTrip
    ) {
      setTitle(
        initialTrip.title
      );

      setStartDate(
        initialTrip.start_date ??
          ""
      );

      setEndDate(
        initialTrip.end_date ??
          ""
      );

      setBudget(
        initialTrip.budget !==
          null
          ? String(
              initialTrip.budget
            )
          : ""
      );

      setTravelStyle(
        initialTrip.travel_style ??
          ""
      );

      setDescription(
        initialTrip.description ??
          ""
      );
    } else {
      setTitle("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setTravelStyle("");
      setDescription("");
    }

    setFormError(null);
  }, [
    mode,
    initialTrip,
  ]);

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setFormError(
        "请输入旅行名称"
      );

      return;
    }

    setFormError(null);

    if (
      mode === "create"
    ) {
      if (!onCreate) {
        return;
      }

      const payload:
        CreateTripInput = {
        city_id: cityId,

        title:
          title.trim(),

        start_date:
          startDate || null,

        end_date:
          endDate || null,

        description:
          description.trim() ||
          null,

        budget:
          budget
            ? Number(
                budget
              )
            : null,

        travel_style:
          travelStyle ||
          null,
      };

      await onCreate(
        payload
      );

      return;
    }

    if (!onUpdate) {
      return;
    }

    const payload:
      UpdateTripInput = {
      title:
        title.trim(),

      start_date:
        startDate || null,

      end_date:
        endDate || null,

      description:
        description.trim() ||
        null,

      budget:
        budget
          ? Number(
              budget
            )
          : null,

      travel_style:
        travelStyle ||
        null,
    };

    await onUpdate(
      payload
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div className="mb-6">

        <h2 className="text-xl font-bold">
          {mode === "create"
            ? "创建旅行"
            : "编辑旅行"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {mode === "create"
            ? "添加一条新的旅行记录"
            : "修改当前旅行信息"}
        </p>

      </div>

      {formError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">

        {/* Title */}

        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium">
            旅行名称 *
          </label>

          <input
            type="text"
            value={title}
            onChange={(
              event
            ) =>
              setTitle(
                event.target.value
              )
            }
            required
            placeholder="例如：上海周末游"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
          />

        </div>

        {/* Start Date */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            开始日期
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(
              event
            ) =>
              setStartDate(
                event.target.value
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        {/* End Date */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            结束日期
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(
              event
            ) =>
              setEndDate(
                event.target.value
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        {/* Budget */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            预算
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(
              event
            ) =>
              setBudget(
                event.target.value
              )
            }
            placeholder="500"
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        {/* Travel Style */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            旅行类型
          </label>

          <select
            value={travelStyle}
            onChange={(
              event
            ) =>
              setTravelStyle(
                event.target.value
              )
            }
            className="w-full rounded-xl border bg-white px-4 py-3"
          >

            <option value="">
              请选择
            </option>

            <option value="budget">
              低预算
            </option>

            <option value="citywalk">
              City Walk
            </option>

            <option value="food">
              美食
            </option>

            <option value="photography">
              摄影
            </option>

            <option value="relax">
              休闲
            </option>

          </select>

        </div>

        {/* Description */}

        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium">
            描述
          </label>

          <textarea
            value={description}
            onChange={(
              event
            ) =>
              setDescription(
                event.target.value
              )
            }
            rows={4}
            placeholder="简单介绍一下这次旅行..."
            className="w-full resize-none rounded-xl border px-4 py-3"
          />

        </div>

      </div>

      <div className="mt-6 flex justify-end gap-3">

        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={
            submitting
          }
          className="rounded-xl border px-5 py-2.5 hover:bg-gray-50 disabled:opacity-50"
        >
          取消
        </button>

        <button
          type="submit"
          disabled={
            submitting
          }
          className="rounded-xl bg-black px-5 py-2.5 text-white disabled:opacity-50"
        >
          {submitting
            ? mode ===
              "create"
              ? "创建中..."
              : "保存中..."
            : mode ===
              "create"
              ? "创建旅行"
              : "保存修改"}
        </button>

      </div>

    </form>
  );
}