import type {
  City,
} from "../types/travel";

type HomeViewProps = {
  cities: City[];

  onSelectCity: (
    city: City
  ) => void;
};

export default function HomeView({
  cities,
  onSelectCity,
}: HomeViewProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="py-16">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
            Travel Log
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight text-gray-900">
            看朋友真正去过的地方，
            而不是再翻几十篇攻略。
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-500">
            从真实旅行记录中查看城市、
            路线、花费和推荐地点。
          </p>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                城市
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                选择一个城市查看旅行记录。
              </p>
            </div>
          </div>

          {cities.length === 0 ? (
            <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                暂时还没有城市记录。
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map(
                (city) => (
                  <button
                    key={city.id}
                    onClick={() =>
                      onSelectCity(
                        city
                      )
                    }
                    className="rounded-3xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="text-sm text-gray-400">
                      {city.country ??
                        "未知国家"}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                      {city.name}
                    </h3>

                    <p className="mt-6 text-sm font-medium text-gray-600">
                      查看旅行记录 →
                    </p>
                  </button>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}