import type {
  TripOverview,
} from "../types/travel";

type TripOverviewCardsProps = {
  overview: TripOverview;
};

export default function TripOverviewCards({
  overview,
}: TripOverviewCardsProps) {
  const cards = [
    {
      label: "旅行天数",
      value:
        `${overview.day_count} 天`,
      hint: "实际有行程记录的天数",
    },
    {
      label: "地点数量",
      value:
        `${overview.place_count} 个`,
      hint: "本次旅行去过的地点",
    },
    {
      label: "总花费",
      value:
        `¥${overview.total_cost.toFixed(
          2
        )}`,
      hint: "所有已记录花费",
    },
    {
      label: "平均评分",
      value:
        overview.average_rating !==
        null
          ? `${overview.average_rating.toFixed(
              1
            )} / 5`
          : "暂无",
      hint:
        overview.rated_visit_count >
        0
          ? `${overview.rated_visit_count} 个地点有评分`
          : "还没有评分",
    },
    {
      label: "推荐率",
      value:
        overview.recommendation_rate !==
        null
          ? `${overview.recommendation_rate}%`
          : "暂无",
      hint:
        overview.recommendation_rate !==
        null
          ? `${overview.recommended_count} 个地点被推荐`
          : "还没有推荐记录",
    },
  ];

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(
          (card) => (
            <div
              key={
                card.label
              }
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-400">
                {
                  card.label
                }
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  card.value
                }
              </p>

              <p className="mt-2 text-xs leading-5 text-gray-400">
                {
                  card.hint
                }
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}