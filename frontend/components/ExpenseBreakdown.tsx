"use client";

import type {
  ExpenseBreakdown as ExpenseBreakdownType,
} from "../types/travel";

import {
  categoryLabels,
} from "../lib/constants";

type ExpenseBreakdownProps = {
  breakdown:
    ExpenseBreakdownType;
};



export default function ExpenseBreakdown({
  breakdown,
}: ExpenseBreakdownProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-5 text-2xl font-bold">
        花费分类
      </h2>

      {breakdown.categories.length ===
      0 ? (
        <div className="rounded-2xl border bg-white p-6 text-gray-500">
          暂时还没有花费记录
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {breakdown.categories.map(
            (item) => {
              const percentage =
                breakdown.total_cost >
                0
                  ? Math.round(
                      (
                        item.total /
                        breakdown.total_cost
                      ) * 100
                    )
                  : 0;

              return (
                <div
                  key={
                    item.category
                  }
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {categoryLabels[
                        item.category
                      ] ??
                        item.category}
                    </p>

                    <p className="text-lg font-bold">
                      ¥{item.total}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-black"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="w-12 text-right text-sm text-gray-500">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}