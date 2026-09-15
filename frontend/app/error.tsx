"use client";

import { getErrorMessage } from "../lib/getErrorMessage";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };

  retry: () => void;
};

export default function GlobalError({
  error,
  retry,
}: GlobalErrorProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto flex min-h-[500px] max-w-4xl items-center justify-center">
        <div className="max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-red-600">
            Application Error
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            页面暂时无法使用
          </h1>

          <p className="mt-4 text-gray-500">
            {getErrorMessage(error)}
          </p>

          <button
            onClick={retry}
            className="mt-6 rounded-xl bg-black px-5 py-2.5 text-white"
          >
            再试一次
          </button>
        </div>
      </div>
    </main>
  );
}