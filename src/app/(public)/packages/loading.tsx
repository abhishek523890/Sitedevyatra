import { CardSkeleton } from '@/components/ui/Skeleton';
export default function Loading() {
  return (
    <div className="container-page py-12">
      <div className="skeleton mb-8 h-8 w-64" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
