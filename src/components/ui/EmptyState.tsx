export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-3 text-4xl" aria-hidden>🕉️</div>
      <h3 className="text-lg text-maroon-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-maroon-500">{message}</p>}
    </div>
  );
}
