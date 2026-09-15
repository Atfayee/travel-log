"use client";

import type {
  TripSummary,
} from "../types/travel";

type BudgetSummaryProps = {
  summary: TripSummary;
};

export default function BudgetSummary({
  summary,
}: BudgetSummaryProps) {
  const budgetPercentage =
    summary.budget &&
    summary.budget > 0
      ? Math.round(
          (
            summary.total_cost /
            summary.budget
          ) * 100
        )
      : 0;

  return (
    <section className="mt-8">
      <h2 className="mb-5 text-2xl font-bold">
        预算概览
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Budget */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            计划预算
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.budget !== null
              ? `¥${summary.budget}`
              : "-"}
          </p>
        </div>

        {/* Total Cost */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            已花费
          </p>

          <p className="mt-2 text-2xl font-bold">
            ¥{summary.total_cost}
          </p>
        </div>

        {/* Remaining */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            剩余预算
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              summary.remaining_budget !==
                null &&
              summary.remaining_budget <
                0
                ? "text-red-600"
                : ""
            }`}
          >
            {summary.remaining_budget !==
            null
              ? `¥${summary.remaining_budget}`
              : "-"}
          </p>
        </div>

        {/* Visit Count */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            地点记录
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.visit_count}
          </p>
        </div>
      </div>

      {/* Progress */}

      {summary.budget !== null && (
        <div className="mt-5 rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              预算使用情况
            </p>

            <p className="text-sm text-gray-500">
              {budgetPercentage}%
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full ${
                budgetPercentage > 100
                  ? "bg-red-500"
                  : "bg-black"
              }`}
              style={{
                width: `${Math.min(
                  budgetPercentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}