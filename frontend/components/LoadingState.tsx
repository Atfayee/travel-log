type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({
  message = "加载中...",
}: LoadingStateProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

            <p className="mt-4 text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}