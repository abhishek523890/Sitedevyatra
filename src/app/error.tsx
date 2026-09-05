'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <div className="text-5xl">🙏</div>
      <h1 className="text-2xl text-maroon-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-maroon-500">Please try again. If the problem persists, contact support.</p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
