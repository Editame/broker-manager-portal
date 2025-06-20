import { Skeleton } from '@/components/ui/Skeleton';

interface LoadingSpinnerProps {
  count?: number;
  className?: string;
}

export function LoadingSpinner({ count = 5, className }: LoadingSpinnerProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full mb-2" />
      ))}
    </div>
  );
}
