export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-maroon-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-saffron-200 border-t-saffron-600" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
