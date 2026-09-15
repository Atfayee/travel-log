type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
};

export default function ErrorState({
  title = "出了点问题",
  message,
  onRetry,
  onBack,
}: ErrorStateProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-red-600">
            Error
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            {message}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-xl bg-black px-5 py-2.5 text-white"
              >
                重试
              </button>
            )}

            {onBack && (
              <button
                onClick={onBack}
                className="rounded-xl border px-5 py-2.5 hover:bg-gray-50"
              >
                返回
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}