import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto flex min-h-[500px] max-w-4xl items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">
            404
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            页面不存在
          </h1>

          <p className="mt-4 text-gray-500">
            这个页面可能已经被删除，或者地址有误。
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-black px-5 py-2.5 text-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}