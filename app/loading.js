export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-800 border-t-cyan-400" />

          <span className="text-xl">
            🤖
          </span>
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          DigitalDost
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Loading your workspace...
        </p>
      </div>
    </main>
  );
}